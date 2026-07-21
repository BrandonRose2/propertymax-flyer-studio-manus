/**
 * Gates on Manhattan flyer reference: a dense, navy-and-lime letter-size referral artboard.
 * Only approved property data, selected hero photo, and reward amount are dynamic in the flyer itself.
 */
import { forwardRef } from "react";
import { Banknote, Building2, Check, Home, MapPin, UsersRound } from "lucide-react";
import type { PilotFlyerProperty } from "@/data/pilotFlyerProperties";

type SimpleFlyerPreviewProps = {
  property: PilotFlyerProperty;
  imageUrl: string;
  reward: string;
};

export const SimpleFlyerPreview = forwardRef<HTMLDivElement, SimpleFlyerPreviewProps>(
  function SimpleFlyerPreview({ property, imageUrl, reward }, ref) {
    const contactLine = `${property.officePhone} • Ext. ${property.extension}`;

    return (
      <article ref={ref} className="referral-flyer" aria-label={`${property.name} referral flyer`}>
        <header className="referral-flyer__top">
          <div className="property-wordmark">
            <span className="property-wordmark__crest" aria-hidden="true"><Building2 /></span>
            <span>
              <strong>{property.name}</strong>
              <small>APARTMENT HOMES</small>
            </span>
          </div>
          <div className="wordmark-architecture" aria-hidden="true"><i /><i /><i /></div>
          <div className="header-lime-rule" aria-hidden="true" />
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
              <UsersRound className="referral-step__icon referral-step__icon--refer" aria-hidden="true" />
              <p><b>REFER</b>Tell your friends, family, or co-workers about living at {property.name}.</p>
            </div>
            <div className="referral-step">
              <span>2</span>
              <Home className="referral-step__icon referral-step__icon--move" aria-hidden="true" />
              <p><b>THEY MOVE IN</b>Your referral applies and becomes a new resident.</p>
            </div>
            <div className="referral-step">
              <span>3</span>
              <Banknote className="referral-step__icon referral-step__icon--paid" aria-hidden="true" />
              <p><b>YOU GET PAID!</b>Once your referral pays full rent on time at least twice, we&apos;ll add {reward} to your tenant ledger.</p>
            </div>
          </div>

          <div className="share-offer-wrap">
            <div className="share-offer">
              <span className="share-offer__headline"><Check aria-hidden="true" /> <i>It Pays to Share!</i></span>
              <strong>{reward}</strong>
              <b>ON YOUR TENANT LEDGER</b>
              <p>for every person<br />you refer who moves in!</p>
            </div>
            <p className="flyer-disclaimer">* Credit will be added to your account after your referral has paid full rent on time at least twice. See office for complete details.</p>
          </div>
        </section>

        <footer className="referral-flyer__bottom">
          <div className="spread-word-mark" aria-hidden="true">
            <span>SPREAD THE WORD.</span>
            <small>ENJOY THE REWARDS!</small>
          </div>
          <div className="thank-you-copy">
            <b>THANK YOU FOR HELPING US</b>
            <strong>Build a Better Community! <em>♡</em></strong>
          </div>
          <div className="address-pill"><MapPin aria-hidden="true" /> {property.address}</div>
          <div className="equal-housing" aria-label="Equal housing opportunity">
            <Home aria-hidden="true" />
            <span>EQUAL HOUSING<br />OPPORTUNITY</span>
          </div>
          <p className="flyer-contact-line">Questions? Contact the Leasing Office for details. &nbsp;•&nbsp; {contactLine}</p>
        </footer>
      </article>
    );
  },
);
