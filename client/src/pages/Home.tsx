/**
 * Public Property Marketing Asset Hub reminder: this is the Print Property Flyer module only.
 * Keep the controls compact and make the 8.5 × 11 referral flyer the primary artifact.
 * ZIP imports stay session-only and use the quiet navy/lime control language rather than competing with the flyer.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { Archive, Check, ChevronDown, Download, ImagePlus, Printer, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleFlyerPreview } from "@/components/SimpleFlyerPreview";
import { pilotFlyerProperties, type FlyerPhoto } from "@/data/pilotFlyerProperties";

const SUPPORTED_ZIP_IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i;
const MAX_ZIP_IMAGE_COUNT = 150;
const MAX_ZIP_FILE_BYTES = 150 * 1024 * 1024;
const MAX_ZIP_EXTRACTED_BYTES = 200 * 1024 * 1024;

const photoLabel = (fileName: string) => fileName
  .split("/")
  .pop()
  ?.replace(/\.[^/.]+$/, "")
  .replace(/[-_]+/g, " ")
  .trim() || "Imported photo";

const imageType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" } as Record<string, string>)[extension ?? ""] ?? "image/jpeg";
};

const normalizedFolderName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const propertyIdForArchivePath = (path: string, fallbackPropertyId: string) => {
  const folderNames = path.split("/").slice(0, -1).map(normalizedFolderName);
  return pilotFlyerProperties.find((property) => {
    const propertyNames = [property.id, property.name].map(normalizedFolderName);
    return folderNames.some((folderName) => propertyNames.includes(folderName));
  })?.id ?? fallbackPropertyId;
};

export default function Home() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(pilotFlyerProperties[0]?.id ?? "");
  const [selectedPhotoId, setSelectedPhotoId] = useState(pilotFlyerProperties[0]?.photos[0]?.id ?? "");
  const [reward, setReward] = useState("$200");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<Record<string, FlyerPhoto[]>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isImportingZip, setIsImportingZip] = useState(false);
  const [isZipDropActive, setIsZipDropActive] = useState(false);
  const selectedPropertyIdRef = useRef(selectedPropertyId);

  useEffect(() => {
    selectedPropertyIdRef.current = selectedPropertyId;
  }, [selectedPropertyId]);

  const selectedProperty = useMemo(
    () => pilotFlyerProperties.find((property) => property.id === selectedPropertyId) ?? pilotFlyerProperties[0],
    [selectedPropertyId],
  );

  const availablePhotos = useMemo(
    () => [...(selectedProperty?.photos ?? []), ...(localPhotos[selectedProperty?.id ?? ""] ?? [])],
    [localPhotos, selectedProperty],
  );

  const selectedPhoto = useMemo(
    () => availablePhotos.find((photo) => photo.id === selectedPhotoId) ?? availablePhotos[0],
    [availablePhotos, selectedPhotoId],
  );

  const selectProperty = (propertyId: string) => {
    const next = pilotFlyerProperties.find((property) => property.id === propertyId);
    if (!next) return;
    setSelectedPropertyId(propertyId);
    setSelectedPhotoId(next.photos[0]?.id ?? "");
    setPickerOpen(false);
  };

  const appendLocalPhotos = (propertyId: string, photos: FlyerPhoto[]) => {
    if (!photos.length) return;
    setLocalPhotos((current) => ({
      ...current,
      [propertyId]: [...(current[propertyId] ?? []), ...photos],
    }));
    if (selectedPropertyIdRef.current === propertyId) {
      setSelectedPhotoId(photos[0].id);
      setPickerOpen(true);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProperty) return;
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const addedPhotos = files.filter((file) => file.type.startsWith("image/")).map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      label: photoLabel(file.name),
      url: URL.createObjectURL(file),
    }));
    if (!addedPhotos.length) {
      toast.error("Choose one or more image files to add to the picker.");
      return;
    }
    appendLocalPhotos(selectedProperty.id, addedPhotos);
    event.target.value = "";
    toast.success(`${addedPhotos.length} property photo${addedPhotos.length > 1 ? "s" : ""} added.`);
  };

  const importZipArchive = async (zipFile: File) => {
    const fallbackPropertyId = selectedProperty?.id;
    if (!fallbackPropertyId) return;
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      toast.error("Choose a .zip archive containing property photos.");
      return;
    }
    if (zipFile.size > MAX_ZIP_FILE_BYTES) {
      toast.error("This ZIP is larger than 150 MB. Please split it into smaller archives.");
      return;
    }

    const createdUrls: string[] = [];
    setIsImportingZip(true);
    try {
      const archive = await JSZip.loadAsync(zipFile);
      const imageEntries = Object.values(archive.files).filter(
        (entry) => !entry.dir && !entry.name.startsWith("__MACOSX/") && SUPPORTED_ZIP_IMAGE.test(entry.name),
      );
      if (!imageEntries.length) {
        toast.error("No supported photos were found in that ZIP.");
        return;
      }
      if (imageEntries.length > MAX_ZIP_IMAGE_COUNT) {
        toast.error(`This ZIP contains more than ${MAX_ZIP_IMAGE_COUNT} photos. Please split it into smaller archives.`);
        return;
      }

      const photosByProperty: Record<string, FlyerPhoto[]> = {};
      let extractedBytes = 0;
      for (let index = 0; index < imageEntries.length; index += 1) {
        const entry = imageEntries[index];
        if (!entry) continue;
        const blob = await entry.async("blob");
        extractedBytes += blob.size;
        if (extractedBytes > MAX_ZIP_EXTRACTED_BYTES) {
          throw new Error("ZIP_SIZE_LIMIT");
        }
        const fileName = entry.name.split("/").pop() ?? `imported-photo-${index + 1}.jpg`;
        const file = new File([blob], fileName, { type: blob.type || imageType(fileName) });
        const propertyId = propertyIdForArchivePath(entry.name, fallbackPropertyId);
        const url = URL.createObjectURL(file);
        createdUrls.push(url);
        const addedPhoto: FlyerPhoto = {
          id: `zip-${Date.now()}-${index}`,
          label: photoLabel(entry.name),
          url,
        };
        (photosByProperty[propertyId] ??= []).push(addedPhoto);
      }

      setLocalPhotos((current) => Object.entries(photosByProperty).reduce<Record<string, FlyerPhoto[]>>(
        (next, [propertyId, photos]) => ({
          ...next,
          [propertyId]: [...(next[propertyId] ?? []), ...photos],
        }),
        { ...current },
      ));
      const activePhotos = photosByProperty[selectedPropertyIdRef.current] ?? photosByProperty[fallbackPropertyId];
      if (activePhotos?.[0]) {
        setSelectedPhotoId(activePhotos[0].id);
        setPickerOpen(true);
      }
      const imageCount = imageEntries.length;
      const destinationNames = Object.keys(photosByProperty).map(
        (propertyId) => pilotFlyerProperties.find((property) => property.id === propertyId)?.name ?? "the selected property",
      );
      const destinationLabel = destinationNames.length === 1
        ? `${destinationNames[0]}'s picker`
        : `${destinationNames.length} property pickers`;
      toast.success(`${imageCount} photo${imageCount === 1 ? "" : "s"} added to ${destinationLabel}.`);
    } catch (error) {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
      if (error instanceof Error && error.message === "ZIP_SIZE_LIMIT") {
        toast.error("The extracted photos exceed 200 MB. Please split the ZIP into smaller archives.");
      } else {
        toast.error("The ZIP could not be unpacked. Please use a valid archive of image files.");
      }
    } finally {
      setIsImportingZip(false);
    }
  };

  const handleZipInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void importZipArchive(file);
  };

  const handleZipDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsZipDropActive(false);
    const file = Array.from(event.dataTransfer.files).find((candidate) => candidate.name.toLowerCase().endsWith(".zip"));
    if (!file) {
      toast.error("Drop a .zip archive of property photos here.");
      return;
    }
    void importZipArchive(file);
  };

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!flyerRef.current || !selectedProperty) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(flyerRef.current, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });
      const anchor = document.createElement("a");
      anchor.download = `${selectedProperty.id}-referral-flyer.png`;
      anchor.href = dataUrl;
      anchor.click();
      toast.success("High-resolution PNG flyer downloaded.");
    } catch {
      toast.error("The PNG could not be created. Print / Save as PDF is still available.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedProperty || !selectedPhoto) {
    return <main className="flyer-page"><p>Property data is unavailable.</p></main>;
  }

  return (
    <main className="flyer-page">
      <div className="flyer-shell">
        <header className="tool-header no-print">
          <div className="tool-header__rule" aria-hidden="true" />
          <div>
            <h1>Print Property Flyer</h1>
          </div>
        </header>

        <section className="flyer-controls no-print" aria-labelledby="controls-heading">
          <p id="controls-heading" className="tool-instructions">
            Resident referral flyer — <strong>&ldquo;Earn $200 on your tenant ledger.&rdquo;</strong> The property name and contact info are filled in automatically. Choose the photo and referral amount, then click Print Flyer for a ready-to-hand-out 8.5 × 11 page, or Download PNG for email and digital distribution.
          </p>
          <div className="control-grid">
            <div className="control-field property-control">
              <Label htmlFor="building">Building</Label>
              <Select value={selectedPropertyId} onValueChange={selectProperty}>
                <SelectTrigger id="building"><SelectValue placeholder="Choose a building" /></SelectTrigger>
                <SelectContent>
                  {pilotFlyerProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>{selectedProperty.address}</span>
            </div>
            <div className="control-field reward-control">
              <Label htmlFor="reward">Referral amount</Label>
              <Input id="reward" value={reward} onChange={(event) => setReward(event.target.value)} />
              <span>Updates the flyer instantly — default is $200.</span>
            </div>
          </div>

          <div className="photo-picker-control">
            <div className="photo-picker-heading">
              <div>
                <Label>Flyer photo</Label>
                <p>Select from {selectedProperty.name}&rsquo;s approved images.</p>
              </div>
              <Button type="button" variant="outline" className="photo-picker-toggle" onClick={() => setPickerOpen((open) => !open)} aria-expanded={pickerOpen}>
                <ImagePlus size={15} /> Flyer Photo: {selectedPhoto.label} <ChevronDown size={14} className={pickerOpen ? "chevron-open" : ""} />
              </Button>
            </div>
            <div
              className={`zip-drop-zone ${isZipDropActive ? "is-dragging" : ""} ${isImportingZip ? "is-importing" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setIsZipDropActive(true); }}
              onDragOver={(event) => { event.preventDefault(); setIsZipDropActive(true); }}
              onDragLeave={(event) => { event.preventDefault(); setIsZipDropActive(false); }}
              onDrop={handleZipDrop}
              aria-busy={isImportingZip}
            >
              <Archive className="zip-drop-zone__icon" aria-hidden="true" />
              <div className="zip-drop-zone__copy">
                <strong>{isImportingZip ? "Unpacking your photo ZIP…" : "Drop a ZIP of property photos here"}</strong>
                <span>{isImportingZip ? "Supported images are being added to the picker." : "Nested folders are supported. Property-named folders route automatically; all other photos go to the selected building for this browser session."}</span>
              </div>
              <label
                className="zip-drop-zone__button"
                role="button"
                tabIndex={isImportingZip ? -1 : 0}
                aria-disabled={isImportingZip}
                onKeyDown={(event) => {
                  if (!isImportingZip && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    zipInputRef.current?.click();
                  }
                }}
              >
                <Upload size={14} /> {isImportingZip ? "Importing…" : "Choose ZIP"}
                <input ref={zipInputRef} className="visually-hidden" type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={isImportingZip} onChange={handleZipInput} />
              </label>
            </div>
            {pickerOpen && (
              <div className="photo-picker-grid" aria-label={`${selectedProperty.name} flyer photo picker`}>
                {availablePhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={`photo-choice ${photo.id === selectedPhoto.id ? "is-selected" : ""}`}
                    onClick={() => setSelectedPhotoId(photo.id)}
                    aria-pressed={photo.id === selectedPhoto.id}
                  >
                    <img src={photo.url} alt={`${photo.label} for ${selectedProperty.name}`} />
                    <span>{photo.label}</span>
                    {photo.id === selectedPhoto.id && <i><Check size={13} /></i>}
                  </button>
                ))}
                <button type="button" className="photo-choice photo-choice--upload" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={22} />
                  <span>Add individual photo</span>
                </button>
              </div>
            )}
            <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
          </div>

          <div className="output-row">
            <Button type="button" className="print-flyer-button" onClick={handlePrint}><Printer size={15} /> Print Flyer</Button>
            <Button type="button" variant="outline" className="download-flyer-button" onClick={handleDownload} disabled={isExporting}><Download size={15} /> {isExporting ? "Preparing…" : "Download PNG"}</Button>
            <p>Print gives one 8.5×11 page (or <strong>Save as PDF</strong>). PNG is high-res for email and digital sharing.</p>
          </div>
        </section>

        <section className="flyer-preview-section" aria-labelledby="preview-heading">
          <p id="preview-heading" className="preview-label">FLYER PREVIEW</p>
          <div className="flyer-preview-frame">
            <SimpleFlyerPreview
              ref={flyerRef}
              property={selectedProperty}
              imageUrl={selectedPhoto.url}
              reward={reward || "$0"}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
