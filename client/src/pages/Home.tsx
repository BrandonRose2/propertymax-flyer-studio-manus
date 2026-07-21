/**
 * Public Property Marketing Asset Hub reminder: this is the Print Property Flyer module only.
 * Uploaded property photos are persisted in the site-wide property library.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { Archive, Check, ChevronDown, Download, ImagePlus, LogIn, Printer, Upload } from "lucide-react";
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
import { useAuth } from "@/_core/hooks/useAuth";
import { SimpleFlyerPreview } from "@/components/SimpleFlyerPreview";
import { startLogin } from "@/const";
import { pilotFlyerProperties, type FlyerPhoto } from "@/data/pilotFlyerProperties";
import { trpc } from "@/lib/trpc";
import type { PropertyPhotoId } from "@shared/propertyPhotoConfig";

const SUPPORTED_ZIP_IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] as const;
const MAX_ZIP_IMAGE_COUNT = 150;
const MAX_ZIP_FILE_BYTES = 150 * 1024 * 1024;
const MAX_ZIP_EXTRACTED_BYTES = 200 * 1024 * 1024;
const MAX_PERSISTED_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PERSISTED_BATCH_BYTES = 20 * 1024 * 1024;

type PersistedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];
type UploadSource = "individual" | "zip";
type UploadCandidate = {
  propertyId: PropertyPhotoId;
  file: File;
  source: UploadSource;
  label: string;
};

const photoLabel = (fileName: string) => fileName
  .split(/[\\/]/)
  .pop()
  ?.replace(/\.[^/.]+$/, "")
  .replace(/[-_]+/g, " ")
  .replace(/\s+/g, " ")
  .trim() || "Imported photo";

const imageType = (fileName: string): PersistedImageType => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ({
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
  } as Record<string, PersistedImageType>)[extension ?? ""] ?? "image/jpeg";
};

const inferredImageType = (file: File): PersistedImageType =>
  SUPPORTED_IMAGE_TYPES.includes(file.type as PersistedImageType)
    ? file.type as PersistedImageType
    : imageType(file.name);

const normalizedFolderName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const propertyIdForArchivePath = (path: string, fallbackPropertyId: PropertyPhotoId): PropertyPhotoId => {
  const folderNames = path.split("/").slice(0, -1).map(normalizedFolderName);
  return (pilotFlyerProperties.find((property) => {
    const propertyNames = [property.id, property.name].map(normalizedFolderName);
    return folderNames.some((folderName) => propertyNames.includes(folderName));
  })?.id ?? fallbackPropertyId) as PropertyPhotoId;
};

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    const separatorIndex = result.indexOf(",");
    if (separatorIndex < 0) {
      reject(new Error("FILE_READ_FAILED"));
      return;
    }
    resolve(result.slice(separatorIndex + 1));
  };
  reader.readAsDataURL(file);
});

function splitUploadBatches(candidates: UploadCandidate[]) {
  const batches: UploadCandidate[][] = [];
  let currentBatch: UploadCandidate[] = [];
  let currentBatchBytes = 0;

  for (const candidate of candidates) {
    if (currentBatch.length && currentBatchBytes + candidate.file.size > MAX_PERSISTED_BATCH_BYTES) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchBytes = 0;
    }
    currentBatch.push(candidate);
    currentBatchBytes += candidate.file.size;
  }
  if (currentBatch.length) batches.push(currentBatch);
  return batches;
}

export default function Home() {
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const flyerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(pilotFlyerProperties[0]?.id ?? "");
  const [selectedPhotoId, setSelectedPhotoId] = useState(pilotFlyerProperties[0]?.photos[0]?.id ?? "");
  const [reward, setReward] = useState("$200");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImportingZip, setIsImportingZip] = useState(false);
  const [isZipDropActive, setIsZipDropActive] = useState(false);
  const selectedPropertyIdRef = useRef(selectedPropertyId);

  const photoLibraryUtils = trpc.useUtils();
  const savedPhotosQuery = trpc.photoLibrary.list.useQuery(
    { propertyId: selectedPropertyId as PropertyPhotoId },
    { enabled: Boolean(selectedPropertyId), staleTime: 30_000 },
  );
  const savePhotosMutation = trpc.photoLibrary.saveMany.useMutation();

  useEffect(() => {
    selectedPropertyIdRef.current = selectedPropertyId;
  }, [selectedPropertyId]);

  const selectedProperty = useMemo(
    () => pilotFlyerProperties.find((property) => property.id === selectedPropertyId) ?? pilotFlyerProperties[0],
    [selectedPropertyId],
  );

  const savedPhotos = useMemo<FlyerPhoto[]>(
    () => (savedPhotosQuery.data ?? []).map((photo) => ({
      id: `saved-${photo.id}`,
      label: photo.label,
      url: photo.url,
    })),
    [savedPhotosQuery.data],
  );

  const availablePhotos = useMemo(
    () => [...(selectedProperty?.photos ?? []), ...savedPhotos],
    [savedPhotos, selectedProperty],
  );

  const selectedPhoto = useMemo(
    () => availablePhotos.find((photo) => photo.id === selectedPhotoId) ?? availablePhotos[0],
    [availablePhotos, selectedPhotoId],
  );

  const isSavingPhotos = isImportingZip || savePhotosMutation.isPending;

  const selectProperty = (propertyId: string) => {
    const next = pilotFlyerProperties.find((property) => property.id === propertyId);
    if (!next) return;
    setSelectedPropertyId(propertyId);
    setSelectedPhotoId("");
    setPickerOpen(false);
  };

  const requireSignInForSave = () => {
    if (isAuthenticated) return true;
    if (isAuthLoading) {
      toast.message("Checking your account. Please try the upload again in a moment.");
      return false;
    }
    toast.message("Sign in to save property photos for future visits.");
    startLogin();
    return false;
  };

  const persistCandidates = async (candidates: UploadCandidate[]) => {
    if (!candidates.length || !requireSignInForSave()) return [];

    const tooLargeCount = candidates.filter((candidate) => candidate.file.size > MAX_PERSISTED_IMAGE_BYTES).length;
    const eligibleCandidates = candidates.filter((candidate) => candidate.file.size > 0 && candidate.file.size <= MAX_PERSISTED_IMAGE_BYTES);
    if (!eligibleCandidates.length) {
      toast.error("Each photo must be 10 MB or smaller before it can be saved.");
      return [];
    }

    const savedRecords: Array<{ id: number; propertyId: string }> = [];
    try {
      for (const batch of splitUploadBatches(eligibleCandidates)) {
        const payload = await Promise.all(batch.map(async (candidate) => ({
          propertyId: candidate.propertyId,
          label: candidate.label,
          originalFileName: candidate.file.name,
          mimeType: inferredImageType(candidate.file),
          source: candidate.source,
          dataBase64: await fileToBase64(candidate.file),
        })));
        const saved = await savePhotosMutation.mutateAsync({ photos: payload });
        savedRecords.push(...saved.map((photo) => ({ id: photo.id, propertyId: photo.propertyId })));
      }

      const destinationIds = Array.from(new Set(savedRecords.map((record) => record.propertyId as PropertyPhotoId)));
      await Promise.all(destinationIds.map((propertyId) => photoLibraryUtils.photoLibrary.list.invalidate({ propertyId })));

      const activeSavedPhoto = savedRecords.find((record) => record.propertyId === selectedPropertyIdRef.current);
      if (activeSavedPhoto) {
        setSelectedPhotoId(`saved-${activeSavedPhoto.id}`);
        setPickerOpen(true);
      }

      const destinationNames = destinationIds.map((propertyId) =>
        pilotFlyerProperties.find((property) => property.id === propertyId)?.name ?? "the selected property",
      );
      const destinationLabel = destinationNames.length === 1
        ? `${destinationNames[0]}'s saved library`
        : `${destinationNames.length} property libraries`;
      const skippedNote = tooLargeCount ? ` ${tooLargeCount} oversized photo${tooLargeCount === 1 ? " was" : "s were"} skipped.` : "";
      toast.success(`${savedRecords.length} photo${savedRecords.length === 1 ? "" : "s"} saved to ${destinationLabel}.${skippedNote}`);
      return savedRecords;
    } catch {
      toast.error("The photos could not be saved. Please try a smaller batch or sign in again.");
      return [];
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const propertyId = selectedProperty?.id as PropertyPhotoId | undefined;
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!propertyId || !files.length) return;

    const candidates = files
      .filter((file) => SUPPORTED_IMAGE_TYPES.includes(file.type as PersistedImageType) || SUPPORTED_ZIP_IMAGE.test(file.name))
      .map((file) => ({
        propertyId,
        file,
        source: "individual" as const,
        label: photoLabel(file.name),
      }));
    if (!candidates.length) {
      toast.error("Choose JPG, PNG, WebP, GIF, or AVIF photos to save.");
      return;
    }
    void persistCandidates(candidates);
  };

  const importZipArchive = async (zipFile: File) => {
    const fallbackPropertyId = selectedProperty?.id as PropertyPhotoId | undefined;
    if (!fallbackPropertyId || !requireSignInForSave()) return;
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      toast.error("Choose a .zip archive containing property photos.");
      return;
    }
    if (zipFile.size > MAX_ZIP_FILE_BYTES) {
      toast.error("This ZIP is larger than 150 MB. Please split it into smaller archives.");
      return;
    }

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

      let extractedBytes = 0;
      const candidates: UploadCandidate[] = [];
      for (let index = 0; index < imageEntries.length; index += 1) {
        const entry = imageEntries[index];
        if (!entry) continue;
        const blob = await entry.async("blob");
        extractedBytes += blob.size;
        if (extractedBytes > MAX_ZIP_EXTRACTED_BYTES) throw new Error("ZIP_SIZE_LIMIT");

        const fileName = entry.name.split("/").pop() ?? `imported-photo-${index + 1}.jpg`;
        const file = new File([blob], fileName, { type: blob.type || imageType(fileName) });
        candidates.push({
          propertyId: propertyIdForArchivePath(entry.name, fallbackPropertyId),
          file,
          source: "zip",
          label: photoLabel(entry.name),
        });
      }
      await persistCandidates(candidates);
    } catch (error) {
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
          <div><h1>Print Property Flyer</h1></div>
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
                <p>
                  Select from {selectedProperty.name}&rsquo;s approved images.
                  {savedPhotosQuery.isLoading ? " Loading saved photos…" : " Uploaded photos are saved to this property library."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isAuthLoading && !isAuthenticated && (
                  <Button type="button" variant="outline" className="photo-login-button" onClick={startLogin}>
                    <LogIn size={14} /> Sign in to save photos
                  </Button>
                )}
                <Button type="button" variant="outline" className="photo-picker-toggle" onClick={() => setPickerOpen((open) => !open)} aria-expanded={pickerOpen}>
                  <ImagePlus size={15} /> Flyer Photo: {selectedPhoto.label} <ChevronDown size={14} className={pickerOpen ? "chevron-open" : ""} />
                </Button>
              </div>
            </div>
            <div
              className={`zip-drop-zone ${isZipDropActive ? "is-dragging" : ""} ${isSavingPhotos ? "is-importing" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setIsZipDropActive(true); }}
              onDragOver={(event) => { event.preventDefault(); setIsZipDropActive(true); }}
              onDragLeave={(event) => { event.preventDefault(); setIsZipDropActive(false); }}
              onDrop={handleZipDrop}
              aria-busy={isSavingPhotos}
            >
              <Archive className="zip-drop-zone__icon" aria-hidden="true" />
              <div className="zip-drop-zone__copy">
                <strong>{isSavingPhotos ? "Saving your property photos…" : "Drop a ZIP of property photos here"}</strong>
                <span>{isSavingPhotos ? "Supported images are being stored in their property libraries." : "Nested folders are supported. Property-named folders route automatically; every saved image remains available after future visits."}</span>
              </div>
              <label
                className="zip-drop-zone__button"
                role="button"
                tabIndex={isSavingPhotos ? -1 : 0}
                aria-disabled={isSavingPhotos}
                onKeyDown={(event) => {
                  if (!isSavingPhotos && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    if (requireSignInForSave()) zipInputRef.current?.click();
                  }
                }}
              >
                <Upload size={14} /> {isSavingPhotos ? "Saving…" : "Choose ZIP"}
                <input
                  ref={zipInputRef}
                  className="file-input-overlay"
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  aria-label="Choose ZIP of property photos"
                  disabled={isSavingPhotos}
                  onChange={handleZipInput}
                />
              </label>
            </div>
            {savedPhotosQuery.isError && <p className="tool-instructions">Saved photos could not be loaded right now. Please refresh and try again.</p>}
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
                <label className="photo-choice photo-choice--upload" aria-busy={isSavingPhotos}>
                  <ImagePlus size={22} />
                  <span>Add &amp; save photo</span>
                  <input
                    ref={fileInputRef}
                    className="file-input-overlay"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    aria-label="Add and save property photos"
                    multiple
                    disabled={isSavingPhotos}
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            )}
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
              imageLabel={selectedPhoto.label}
              reward={reward || "$0"}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
