/**
 * Pelican Bay reference flyer: the photograph, property identifiers, and reward
 * remain dynamic while the printed letter-size composition stays consistent.
 */
import React, { forwardRef } from "react";
import { Banknote, Check, Home, MapPin, UsersRound } from "lucide-react";
import type { PilotFlyerProperty } from "@/data/pilotFlyerProperties";

type SimpleFlyerPreviewProps = {
  property: PilotFlyerProperty;
  imageUrl: string;
  imageLabel: string;
  reward: string;
};

export const SimpleFlyerPreview = forwardRef<HTMLDivElement, SimpleFlyerPreviewProps>(
  function SimpleFlyerPreview({ property, imageUrl, imageLabel, reward }, ref) {
    const contactLine = `${property.officePhone} • Ext. ${property.extension}`;

    return (
      <article ref={ref} className="referral-flyer" aria-label={`${property.name} referral flyer`}>
        <header className="referral-flyer__top">
          <div className="property-wordmark">
            <span className="property-wordmark__crest" aria-hidden="true"><i /></span>
            <span className="property-wordmark__type">
              <strong>{property.name}</strong>
              <small>APARTMENT HOMES</small>
            </span>
          </div>

          <div className="earn-badge" aria-label={`Earn ${reward} on your tenant ledger`}>
            <div className="earn-badge__inner">
              <span>EARN</span>
              <strong>{reward}</strong>
              <i aria-hidden="true" />
              <b>ON YOUR<br />TENANT LEDGER!</b>
            </div>
          </div>
        </header>

        <section className="referral-flyer__hero">
          <img src={imageUrl} alt={`${property.name} flyer hero: ${imageLabel}`} crossOrigin="anonymous" />
          <div className="hero-vignette" aria-hidden="true" />
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
              <p><b>YOU GET PAID!</b>After your referral pays full rent on time at least twice, we&apos;ll add {reward} to your tenant ledger.</p>
            </div>
          </div>

          <div className="share-offer-wrap">
            <div className="share-offer">
              <span className="share-offer__headline"><Check aria-hidden="true" /> <i>It Pays to Share!</i></span>
              <strong>{reward}</strong>
              <b>ON YOUR TENANT LEDGER</b>
              <p>for every person<br />you refer who moves in!</p>
            </div>
            <p className="flyer-disclaimer">* Credit will be added after your referral has paid full rent on time at least twice. See office for complete details.</p>
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
          <p className="flyer-contact-line">Questions? Contact the Leasing Office for details. &nbsp;•&nbsp; {contactLine}</p>
        </footer>
      </article>
    );
  },
);
