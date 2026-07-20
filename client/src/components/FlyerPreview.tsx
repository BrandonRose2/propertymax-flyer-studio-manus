/**
 * Signal Desk design reminder: the physical 8.5×11 flyer is the product hero.
 * Use warm paper, precise editorial hierarchy, and PropertyMax Signal Green only
 * for high-intent markers, selections, and output cues.
 */
import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export type FlyerTemplate = "residential" | "editorial" | "signal";
export type ImageMode = "property" | "signal" | "upload";

export interface FlyerPreviewProps {
  propertyName: string;
  market: string;
  units: number;
  headline: string;
  offerAmount: string;
  offerDetail: string;
  validity: string;
  ctaUrl: string;
  imageUrl: string;
  template: FlyerTemplate;
  imageMode: ImageMode;
  activeField?: string | null;
}

const BRAND_MARK = "/manus-storage/propertymax-flyer-studio-mark_ea1b4053.png";
const PAPER_TEXTURE = "/manus-storage/propertymax-flyer-paper-texture_d59c1acc.jpg";

function FlyerBrand() {
  return (
    <div className="flyer-brand" aria-label="PropertyMax Flyer Studio">
      <img src={BRAND_MARK} alt="" />
      <span>
        <strong>PROPERTY</strong>
        <em>MAX</em>
      </span>
    </div>
  );
}

export const FlyerPreview = forwardRef<HTMLDivElement, FlyerPreviewProps>(
  function FlyerPreview(
    {
      propertyName,
      market,
      units,
      headline,
      offerAmount,
      offerDetail,
      validity,
      ctaUrl,
      imageUrl,
      template,
      imageMode,
      activeField,
    },
    ref,
  ) {
    return (
      <article
        id="flyer-print"
        ref={ref}
        className={`flyer-canvas flyer-${template}`}
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,.9)), url(${PAPER_TEXTURE})`,
        }}
        aria-label={`Print preview for ${propertyName}`}
      >
        <div className="flyer-crop flyer-crop-top-left" aria-hidden="true" />
        <div className="flyer-crop flyer-crop-top-right" aria-hidden="true" />
        <div className="flyer-crop flyer-crop-bottom-left" aria-hidden="true" />
        <div className="flyer-crop flyer-crop-bottom-right" aria-hidden="true" />

        <header className="flyer-header">
          <FlyerBrand />
          <div className="flyer-header-meta">
            <span>{market}</span>
            <span>{units.toLocaleString()} HOMES</span>
          </div>
        </header>

        <section className="flyer-hero-section">
          <div className="flyer-hero-image-wrap">
            <img
              className={`flyer-hero-image ${imageMode === "signal" ? "flyer-graphic-image" : ""}`}
              src={imageUrl}
              alt={`${propertyName} marketing visual`}
            />
            <div className="flyer-photo-caption">
              <span>PROPERTYMAX / LEASING</span>
              <span>01</span>
            </div>
          </div>
          <div className="flyer-hero-title-block">
            <span className="flyer-kicker">REFERRAL PROGRAM</span>
            <h1 data-active={activeField === "headline"}>{headline}</h1>
          </div>
        </section>

        <section className="flyer-offer-section">
          <div className="flyer-property-lockup">
            <span className="flyer-kicker">AT</span>
            <h2 data-active={activeField === "property"}>{propertyName}</h2>
            <p>{market} · {units.toLocaleString()} HOME COMMUNITY</p>
          </div>

          <div className="flyer-offer-lockup" data-active={activeField === "amount"}>
            <span>REFER A RESIDENT</span>
            <strong>{offerAmount}</strong>
            <span>REWARD</span>
          </div>
        </section>

        <section className="flyer-detail-section">
          <div>
            <span className="flyer-kicker">THE INVITATION</span>
            <p className="flyer-detail-copy" data-active={activeField === "detail"}>
              {offerDetail}
            </p>
          </div>
          <div className="flyer-action-block">
            <div className="flyer-qr-wrap">
              <QRCodeSVG
                value={ctaUrl || "https://propertymax.ai/app"}
                size={88}
                marginSize={0}
                fgColor="#101311"
                bgColor="#F8F5ED"
                level="M"
                includeMargin={false}
              />
            </div>
            <div>
              <span className="flyer-kicker">SCAN TO CONNECT</span>
              <p>Ask the leasing team for eligibility and referral details.</p>
            </div>
          </div>
        </section>

        <footer className="flyer-footer">
          <span data-active={activeField === "validity"}>{validity}</span>
          <span>PROPERTYMAX.AI</span>
        </footer>
      </article>
    );
  },
);

FlyerPreview.displayName = "FlyerPreview";
