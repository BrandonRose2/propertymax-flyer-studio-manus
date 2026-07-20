# Simplified Flyer Generator — Validation Notes

## Desktop — 1280 × 1100

The page follows the supplied reference’s compact structure: an ivory page ground, a restrained `Print Property Flyer` heading, one small control card, and a single centered 8.5 × 11 flyer. The building selector, reward field, local-image control, print action, and PNG action appear together above the preview. The flyer itself is the visual focus and contains the currently selected property’s approved image and the live referral reward.

## Mobile — 390 × 844

The single-page flow stacks cleanly without horizontal overflow. A manager sees the title, instructions, building selector, reward input, local-image control, print/download actions, and a scaled flyer preview in that order. The preview retains readable hierarchy and the intended letter-page proportions.

## Functional Verification

TypeScript validation and the production build both completed successfully. The completed page has one live building selector backed by the 42-property Apartment Corp asset registry, an immediate referral-reward update, optional local-image replacement for the current browser session, browser print/PDF output, and high-resolution PNG export.
