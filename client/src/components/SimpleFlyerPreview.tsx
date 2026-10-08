/**
 * Pelican Bay reference flyer: the photograph, property identifiers, and reward
 * remain dynamic while the printed letter-size composition stays consistent.
 */
import React, { forwardRef } from "react";
import { Banknote, Check, Home, MapPin, UsersRound } from "lucide-react";
import type { PilotFlyerProperty } from "@/data/pilotFlyerProperties";

export type RewardType = "ledger" | "other";

/** Adjustable text groups on the flyer; each value is a multiplier (1 = default size). */
export const FLYER_TEXT_GROUPS = [
  { id: "name", label: "Property name" },
  { id: "badge", label: "Earn badge words" },
  { id: "ribbon", label: "Good Neighbors banner" },
  { id: "steps", label: "It's Easy steps" },
  { id: "share", label: "It Pays to Share box" },
  { id: "footer", label: "Footer & contact line" },
] as const;
export type FlyerTextGroup = (typeof FLYER_TEXT_GROUPS)[number]["id"];
export type FlyerTextScales = Partial<Record<FlyerTextGroup | "logo" | "cornerLogo" | "rewardArt", number>>;
/** Where prize artwork sits on the photo. */
export type RewardArtPosition = "footer" | "photo";

type SimpleFlyerPreviewProps = {
  property: PilotFlyerProperty;
  imageUrl: string;
  imageLabel: string;
  reward: string;
  /** "ledger" = cash credit on the tenant ledger (e.g. $200); "other" = any prize (e.g. Free TV). */
  rewardType?: RewardType;
  /** Multiplier for the big reward text, e.g. 0.8 = 80%. */
  rewardScale?: number;
  /** Header logo image; null shows the original property crest. */
  logoUrl?: string | null;
  /** Per-group text size multipliers plus "logo" for the header logo. */
  textScales?: FlyerTextScales;
  /** Optional logo shown in the bottom-left corner of the photo; null hides it. */
  cornerLogoUrl?: string | null;
  /** Two photo URLs turn the hero into a side-by-side collage; otherwise imageUrl is used. */
  collageUrls?: string[];
  /** Optional cartoon prize artwork shown on the photo; null hides it. */
  rewardArtUrl?: string | null;
  rewardArtPosition?: RewardArtPosition;
};

export const SimpleFlyerPreview = forwardRef<HTMLDivElement, SimpleFlyerPreviewProps>(
  function SimpleFlyerPreview({ property, imageUrl, imageLabel, reward, rewardType = "ledger", rewardScale = 1, logoUrl = null, textScales = {}, cornerLogoUrl = null, collageUrls = [], rewardArtUrl = null, rewardArtPosition = "footer" }, ref) {
    const contactLine = property.officePhone;
    const isLedger = rewardType === "ledger";
    const flyerStyle = {
      "--reward-scale": String(rewardScale),
      ...Object.fromEntries(FLYER_TEXT_GROUPS.map(({ id }) => [`--fs-${id}`, String(textScales[id] ?? 1)])),
      "--logo-scale": String(textScales.logo ?? 1),
      "--corner-logo-scale": String(textScales.cornerLogo ?? 1),
      "--reward-art-scale": String(textScales.rewardArt ?? 1),
    } as React.CSSProperties;

    return (
      <article
        ref={ref}
        className={`referral-flyer ${isLedger ? "" : "has-text-reward"}`}
        style={flyerStyle}
        aria-label={`${property.name} referral flyer`}
      >
        <header className="referral-flyer__top">
          <div className="property-wordmark">
            {logoUrl
              ? <img className="property-wordmark__logo" src={logoUrl} alt="Logo" crossOrigin="anonymous" />
              : <span className="property-wordmark__crest" aria-hidden="true"><i /></span>}
            <span className="property-wordmark__type">
              <strong>{property.name}</strong>
              <small>APARTMENT HOMES</small>
            </span>
          </div>

          <div className="earn-badge" aria-label={isLedger ? `Earn ${reward} on your tenant ledger` : `Earn ${reward} for every referral`}>
            <div className="earn-badge__inner">
              <span>EARN</span>
              <strong>{reward}</strong>
              <i aria-hidden="true" />
              {isLedger ? <b>ON YOUR<br />TENANT LEDGER!</b> : <b>FOR EVERY<br />REFERRAL!</b>}
            </div>
          </div>
        </header>

        <section className="referral-flyer__hero">
          {collageUrls.length > 1
            ? (
              <div className="hero-collage hero-collage--2">
                {collageUrls.slice(0, 2).map((url, index) => (
                  <img key={`${url}-${index}`} src={url} alt={`${property.name} photo ${index + 1}`} crossOrigin="anonymous" />
                ))}
              </div>
            )
            : <img src={imageUrl} alt={`${property.name} flyer hero: ${imageLabel}`} crossOrigin="anonymous" />}
          <div className="hero-vignette" aria-hidden="true" />
          {cornerLogoUrl && <img className="hero-corner-logo" src={cornerLogoUrl} alt="Property logo" crossOrigin="anonymous" />}
          {rewardArtUrl && rewardArtPosition === "photo" && <img className="hero-reward-art" src={rewardArtUrl} alt="" aria-hidden="true" crossOrigin="anonymous" />}
          <div className="community-ribbon">
            <span className="community-ribbon__headline">
              <b>GOOD NEIGHBORS.</b>
              <em>GREAT COMMUNITY.</em>
            </span>
            <small>Stronger Together!</small>
          </div>
        </section>

        <section className="referral-flyer__body">
          <div className="referral-steps">
            <h2>IT&apos;S EASY!</h2>
            <div className="referral-step">
              <span className="referral-step__number">1</span>
              <UsersRound className="referral-step__icon referral-step__icon--refer" aria-hidden="true" />
              <p><b>REFER</b>Tell friends, family, or co-workers about living at {property.name}.</p>
            </div>
            <div className="referral-step">
              <span className="referral-step__number">2</span>
              <Home className="referral-step__icon referral-step__icon--move" aria-hidden="true" />
              <p><b>THEY MOVE IN</b>Your referral applies and becomes a new resident.</p>
            </div>
            <div className="referral-step">
              <span className="referral-step__number">3</span>
              <Banknote className="referral-step__icon referral-step__icon--paid" aria-hidden="true" />
              {isLedger
                ? <p><b>YOU GET PAID!</b>After your referral pays full rent on time at least twice, we&apos;ll add {reward} to your tenant ledger.</p>
                : <p><b>YOU GET REWARDED!</b>After your referral pays full rent on time at least twice, you&apos;ll receive: {reward}.</p>}
            </div>
          </div>

          <div className="share-offer-wrap">
            <div className="share-offer">
              <span className="share-offer__headline"><Check aria-hidden="true" /> <i>It Pays to Share!</i></span>
              <strong>{reward}</strong>
              <b>{isLedger ? "ON YOUR TENANT LEDGER" : "REFERRAL REWARD"}</b>
              <p>for every person<br />you refer who moves in!</p>
            </div>
            <p className="flyer-disclaimer">
              {isLedger
                ? "* Credit will be added after your referral has paid full rent on time at least twice. See office for complete details."
                : "* Reward will be given after your referral has paid full rent on time at least twice. See office for complete details."}
            </p>
          </div>
        </section>

        <footer className="referral-flyer__bottom">
          <div className="flyer-footer__main">
            <div className="spread-word-mark" aria-hidden="true">
              <span>SPREAD<br />THE WORD.</span>
              <small>ENJOY THE<br />REWARDS!</small>
            </div>
            <div className="thank-you-copy">
              <b>THANK YOU FOR HELPING US</b>
              <strong>Build a Better Community! <em>♡</em></strong>
              <div className="address-pill"><MapPin aria-hidden="true" /> {property.address}</div>
            </div>
            <div className="equal-housing" aria-label="Equal housing opportunity">
              <span className="equal-housing__mark" aria-hidden="true">
                <i className="equal-housing__roof" />
                <i className="equal-housing__home" />
                <i className="equal-housing__equals" />
              </span>
              <span className="equal-housing__copy">EQUAL HOUSING<br />OPPORTUNITY</span>
            </div>
          </div>
          <p className="flyer-contact-line">
            <span>Questions? Contact the Leasing Office for details.</span>
            <strong>{contactLine}</strong>
          </p>
        </footer>
        {rewardArtUrl && rewardArtPosition === "footer" && <img className="footer-reward-art" src={rewardArtUrl} alt="" aria-hidden="true" crossOrigin="anonymous" />}
      </article>
    );
  },
);
