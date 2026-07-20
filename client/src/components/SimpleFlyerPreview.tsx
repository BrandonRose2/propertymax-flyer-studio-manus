/**
 * Colonial Estates reference-template reminder: navy/lime print artifact, not a dashboard card.
 * Only approved property data, selected hero photo, reward amount, and QR destination are dynamic.
 */
import { forwardRef } from "react";
import { Banknote, Home, MapPin, UsersRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { PilotFlyerProperty } from "@/data/pilotFlyerProperties";

type SimpleFlyerPreviewProps = {
  property: PilotFlyerProperty;
  imageUrl: string;
  reward: string;
  qrDestination: string;
};

export const SimpleFlyerPreview = forwardRef<HTMLDivElement, SimpleFlyerPreviewProps>(
  function SimpleFlyerPreview({ property, imageUrl, reward, qrDestination }, ref) {
    const contactLine = `${property.officePhone} • Ext. ${property.extension}`;

    return (
      <article ref={ref} className="referral-flyer" aria-label={`${property.name} referral flyer`}>
        <header className="referral-flyer__top">
          <div className="property-wordmark">
            <span className="property-wordmark__lantern" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M24 52h16M28 52V24h8v28M23 24h18M26 18h12M30 12h4M32 12v6M25 24l3-6h8l3 6M28 31h8M28 40h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 53c7-5 21-5 28 0M15 57c9-6 25-6 34 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <strong>{property.name}</strong>
              <small>APARTMENT HOMES</small>
            </span>
          </div>
          <div className="top-curve" aria-hidden="true" />
          <div className="earn-badge">
            <span>EARN</span>
            <strong>{reward}</strong>
            <i aria-hidden="true" />
            <b>ON YOUR<br />TENANT LEDGER!</b>
          </div>
        </header>

        <section className="referral-flyer__hero">
          <img src={imageUrl} alt={`${property.name} selected exterior`} crossOrigin="anonymous" />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="community-ribbon">
            <UsersRound aria-hidden="true" />
            <span><b>GOOD NEIGHBORS.</b> <em>GREAT COMMUNITY.</em><small>Stronger Together!</small></span>
          </div>
        </section>

        <section className="referral-flyer__body">
          <div className="referral-steps">
            <h2>IT&apos;S EASY!</h2>
            <div className="referral-step">
              <span>1</span>
              <UsersRound aria-hidden="true" />
              <p><b>REFER</b>Tell your friends, family, or co-workers about living at {property.name}.</p>
            </div>
            <div className="referral-step">
              <span>2</span>
              <Home aria-hidden="true" />
              <p><b>THEY MOVE IN</b>Your referral applies and becomes a new resident.</p>
            </div>
            <div className="referral-step">
              <span>3</span>
              <Banknote aria-hidden="true" />
              <p><b>YOU GET PAID!</b>Once your referral pays full rent on time at least twice, we&apos;ll add {reward} to your tenant ledger.</p>
            </div>
          </div>

          <div className="share-offer-wrap">
            <div className="share-offer">
              <span>It Pays to Share!</span>
              <strong>{reward}</strong>
              <b>ON YOUR TENANT LEDGER</b>
              <p>for every person<br />you refer who moves in!</p>
            </div>
            <p className="flyer-disclaimer">* Credit will be added to your account after your referral has paid full rent on time at least twice. See office for complete details.</p>
          </div>
        </section>

        <footer className="referral-flyer__bottom">
          <div className="spread-word-mark" aria-hidden="true">♥</div>
          <div className="thank-you-copy">
            <b>THANK YOU FOR HELPING US</b>
            <strong>Build a Better Community!</strong>
            <span>Call leasing: {contactLine}</span>
          </div>
          <div className="address-pill"><MapPin aria-hidden="true" /> {property.address}</div>
          <div className="flyer-qr" aria-label="Property website QR code">
            <QRCodeSVG value={qrDestination || property.qrDestination} size={40} level="M" includeMargin={false} />
          </div>
          <div className="equal-housing" aria-label="Equal housing opportunity">
            <Home aria-hidden="true" />
            <span>EQUAL HOUSING<br />OPPORTUNITY</span>
          </div>
        </footer>
      </article>
    );
  },
);
