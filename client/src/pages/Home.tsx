/**
 * Public Property Marketing Asset Hub reminder: this is the Print Property Flyer module only.
 * Keep the controls compact and make the 8.5 × 11 referral flyer the primary artifact.
 */
import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, ChevronDown, Download, ImagePlus, Printer } from "lucide-react";
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

export default function Home() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(pilotFlyerProperties[0]?.id ?? "");
  const [selectedPhotoId, setSelectedPhotoId] = useState(pilotFlyerProperties[0]?.photos[0]?.id ?? "");
  const [reward, setReward] = useState("$200");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<Record<string, FlyerPhoto[]>>({});
  const [isExporting, setIsExporting] = useState(false);

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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProperty) return;
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const addedPhotos = files.map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      label: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
    }));
    setLocalPhotos((current) => ({
      ...current,
      [selectedProperty.id]: [...(current[selectedProperty.id] ?? []), ...addedPhotos],
    }));
    setSelectedPhotoId(addedPhotos[0].id);
    setPickerOpen(true);
    event.target.value = "";
    toast.success(`${addedPhotos.length} property photo${addedPhotos.length > 1 ? "s" : ""} added.`);
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
                  <span>Add property photo</span>
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
