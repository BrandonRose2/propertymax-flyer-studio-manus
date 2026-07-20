/**
 * Reference-led design reminder: this is a simple standalone flyer utility.
 * Keep controls compact and let one 8.5 × 11 property flyer do the visual work.
 */
import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ImagePlus, Printer } from "lucide-react";
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
import propertyAssetManifest from "@/data/property-assets.json";

type PropertyRecord = (typeof propertyAssetManifest.properties)[number];

const properties = propertyAssetManifest.properties as PropertyRecord[];

export default function Home() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id ?? "");
  const [reward, setReward] = useState("$200");
  const [uploadedImage, setUploadedImage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? properties[0],
    [selectedPropertyId],
  );

  const previewImage = uploadedImage || selectedProperty?.assetUrl || "";

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedImage(URL.createObjectURL(file));
    toast.success("Your local flyer image is ready.");
  };

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!flyerRef.current || !selectedProperty) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(flyerRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fffdf8",
      });
      const anchor = document.createElement("a");
      anchor.download = `${selectedProperty.id}-property-flyer.png`;
      anchor.href = dataUrl;
      anchor.click();
      toast.success("PNG flyer downloaded.");
    } catch {
      toast.error("The PNG could not be created. Print / Save as PDF is still available.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedProperty) {
    return <main className="simple-page"><p>Property data is unavailable.</p></main>;
  }

  return (
    <main className="simple-page">
      <div className="simple-shell">
        <header className="simple-header">
          <span className="simple-header-rule" aria-hidden="true" />
          <div>
            <p>PROPERTYMAX MARKETING TOOLS</p>
            <h1>Print Property Flyer</h1>
          </div>
        </header>

        <section className="simple-controls no-print" aria-labelledby="controls-heading">
          <p id="controls-heading" className="simple-instructions">
            Select a building, update the referral reward, then print or download a ready-to-share 8.5 × 11 flyer.
          </p>
          <div className="simple-form-row">
            <div className="simple-field simple-property-field">
              <Label htmlFor="building">Building</Label>
              <Select value={selectedPropertyId} onValueChange={(value) => {
                setSelectedPropertyId(value);
                setUploadedImage("");
              }}>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Choose a building" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="simple-field simple-reward-field">
              <Label htmlFor="reward">Referral amount</Label>
              <Input
                id="reward"
                value={reward}
                onChange={(event) => setReward(event.target.value)}
                aria-describedby="reward-hint"
              />
              <span id="reward-hint">Update the flyer amount.</span>
            </div>
            <div className="simple-field simple-photo-field">
              <Label>Flyer photo</Label>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button type="button" variant="outline" className="photo-button" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus size={15} /> {uploadedImage ? "Local image selected" : "Use a local image"}
              </Button>
            </div>
          </div>
          <div className="simple-output-row">
            <Button type="button" className="print-flyer-button" onClick={handlePrint}>
              <Printer size={15} /> Print Flyer
            </Button>
            <Button type="button" variant="outline" className="download-flyer-button" onClick={handleDownload} disabled={isExporting}>
              <Download size={15} /> {isExporting ? "Preparing…" : "Download PNG"}
            </Button>
            <p>Print opens your browser’s print dialog. PNG is ready for email and digital sharing.</p>
          </div>
        </section>

        <section className="simple-preview-section" aria-labelledby="preview-heading">
          <p id="preview-heading" className="preview-label">FLYER PREVIEW</p>
          <div className="simple-flyer-frame">
            <SimpleFlyerPreview
              ref={flyerRef}
              propertyName={selectedProperty.name}
              imageUrl={previewImage}
              reward={reward || "$0"}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
