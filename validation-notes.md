# Six-Community Print-Ready Flyer Pilot — Validation Notes

## Scope

The pilot is limited to **Arbor Crest, Grove Park Terrace, Thomasville Church Homes, Boca Ciega, Opa Locka, and Macedonia**. Each selector option is backed by a verified address and office phone extension from the user-designated Company Contacts Notion source. Each currently has one approved public portfolio hero image; the photo picker supports additional manager-supplied, property-specific images in the active browser session.

## Visual checks

At desktop size, the standalone page keeps a compact control panel above a central 8.5 × 11 flyer. The selected property name, address, office phone and extension, reward amount, photo, and QR destination flow into the live Colonial Estates-style template. The fixed treatment preserves the navy/lime reward badge, three-step referral panel, `It Pays to Share` panel, disclaimer, `Spread the Word` mark, and Equal Housing mark.

At 390 × 844 pixels, the controls stack without horizontal overflow and the flyer remains legible while retaining its letter-page proportion. The `Flyer Photo` control expands to display the property-specific photo grid and marks the selected image.

## Functional checks

TypeScript validation and a production build completed successfully. The app supports property selection, immediate reward/QR/photo preview updates, local image addition, browser print, and high-resolution PNG download. A headless browser print pass produced **one** letter-size page at **612 × 792 points**. After allowing the selected property image to finish loading, the visual PDF inspection confirmed that the printed page contains the flyer and its selected property photo only.

## Known pilot limitation

The currently staged public library has one approved exterior image per pilot property. The photo-picker data model is ready for multiple approved images as they are added, and managers can temporarily add more property photos from their device during a session.
