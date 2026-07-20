/**
 * Reference-led flyer component: a single warm paper 8.5 × 11 artifact.
 * It deliberately carries the visual weight—not the surrounding page chrome.
 */
import { forwardRef } from "react";

type SimpleFlyerPreviewProps = {
  propertyName: string;
  imageUrl: string;
  reward: string;
};

export const SimpleFlyerPreview = forwardRef<HTMLDivElement, SimpleFlyerPreviewProps>(
  function SimpleFlyerPreview({ propertyName, imageUrl, reward }, ref) {
    return (
      <article ref={ref} className="simple-flyer" aria-label={`${propertyName} referral flyer`}>
        <section className="flyer-image-zone">
          <img src={imageUrl} alt={`${propertyName} exterior`} crossOrigin="anonymous" />
          <div className="flyer-image-wash" />
          <div className="flyer-brand-strip">
            <span className="flyer-roundel">P</span>
            <span><b>PROPERTY</b><em>MAX</em></span>
          </div>
          <div className="flyer-property-lockup">
            <span>WELCOME HOME TO</span>
            <h2>{propertyName}</h2>
            <p>GOOD NEIGHBORS. GREAT COMMUNITY.</p>
          </div>
          <div className="flyer-reward-tile flyer-reward-tile-top">
            <span>EARN</span>
            <strong>{reward}</strong>
            <small>WHEN YOU REFER<br />A FRIEND</small>
          </div>
        </section>

        <section className="flyer-body-zone">
          <div className="flyer-steps">
            <h3>IT&apos;S EASY!</h3>
            <div className="flyer-step">
              <span>1</span>
              <p><b>REFER</b><br />Tell your friends, family, or co-workers about living at {propertyName}.</p>
            </div>
            <div className="flyer-step">
              <span>2</span>
              <p><b>THEY MOVE IN</b><br />Your referral applies and becomes a new resident.</p>
            </div>
            <div className="flyer-step">
              <span>3</span>
              <p><b>YOU GET PAID</b><br />After their move-in is complete, your reward is ready.</p>
            </div>
          </div>

          <div className="flyer-reward-tile flyer-reward-tile-body">
            <span>✓ It Pays to Share!</span>
            <strong>{reward}</strong>
            <small>REFERRAL REWARD<br />FOR EVERY PERSON YOU REFER</small>
          </div>
        </section>

        <section className="flyer-bottom-zone">
          <div>
            <span>THANK YOU FOR HELPING US</span>
            <h3>Build a Better Community!</h3>
            <p>Contact the leasing office to refer a friend today.</p>
          </div>
          <div className="flyer-house-mark" aria-hidden="true">⌂</div>
        </section>
        <footer className="flyer-footer">See leasing office for complete referral terms and eligibility.</footer>
      </article>
    );
  },
);
