# Colonial Estates Referral Flyer — Template Map

The supplied one-page PDF is the ground-truth visual reference for the next flyer version. Its composition consists of a deep-navy identity masthead with a lime offer badge, a full-width exterior photograph, a navy community message ribbon, a three-step referral explanation, a large reward block, and a lime closing band with an address and Equal Housing mark.

| Template element | Visible reference content | Implementation status |
|---|---|---|
| Top identity lockup | Colonial Estates Apartment Homes mark and wordmark | **Property variable:** replace with the selected property’s approved identity or a text lockup using that community’s name. |
| Exterior image | Community exterior / monument-sign photo | **Property variable:** use the selected property’s approved photo. |
| Top offer badge | `EARN $200 ON YOUR TENANT LEDGER!` | **Offer variable:** reflect the selected or manager-edited referral amount in the same fixed badge treatment. |
| Community ribbon | `GOOD NEIGHBORS. GREAT COMMUNITY. Stronger Together!` | Fixed template copy. |
| Referral step 1 | `Tell your friends, family, or co-workers about living at Colonial Estates.` | **Property variable:** replace the community name. |
| Referral steps 2–3 | Move-in and reward instructions | Fixed template copy, with the amount reflected in the reward sentence where applicable. |
| Main reward panel | `It Pays to Share! $200 ON YOUR TENANT LEDGER` | **Offer variable:** reflect the referral amount in the fixed panel treatment. |
| Fine print | Credit applies after the referral’s rent is paid in full for one full term; see office for complete details. | Fixed template copy. |
| Closing message | `THANK YOU FOR HELPING US Build a Better Community!` | Fixed template copy. |
| Address line | `1300 Ridgefield Ave, Thibodaux, LA 70301` | **Property variable:** replace with the selected property’s verified address. |
| Equal Housing mark | Equal Housing Opportunity icon and text | Fixed template element. |

> The photo, property identity, property name in the referral copy, property address, and referral amount are therefore dynamic. All other visual and copy elements should remain template-stable unless you provide property-specific brand files or legal copy.

## Current Photo Inventory Constraint

The currently collected Apartment Corp asset library has **one approved exterior image per property** across all 42 communities. The manager-facing picker will therefore be implemented as a visual, per-property photo grid that supports any number of approved images and shows the available image selection immediately. As more approved images are added to a property’s photo set, they will automatically appear as additional picker tiles; no change to the flyer template is required.

## Confirmed Manager Workflow

The manager chooses a building and then uses **Flyer Photo** to reveal only that community’s approved image thumbnails. Selecting a thumbnail applies the image to the hero-photo slot immediately and marks the selected thumbnail with a check. The flyer then renders exactly as it will print.

| Workflow element | Required behavior |
|---|---|
| Property selector | Chooses the active community and refreshes every property-specific field. |
| Flyer Photo picker | Expands a visual grid of the active community’s approved photos only. |
| Property details | Community name, address, and manager phone number auto-fill from verified property data. |
| Referral amount | Remains an editable manager control and updates both visible offer values. |
| QR code | Encodes the active community’s official website or approved leasing destination. |
| Print Flyer | Hides the page chrome and prints only the 8.5 × 11 flyer on one page. |
| Download PNG | Exports the complete current flyer at high resolution. |

The fixed Colonial Estates reference styling must remain stable: the navy and lime offer treatment, `IT'S EASY!` three-step section, `It Pays to Share!` reward panel, disclaimer, `Spread the Word` / community message element, and Equal Housing mark stay consistent across properties.

## Exact Reference Hierarchy

The flyer uses a **deep navy** header with a property-identification lockup at upper left and a **lime reward badge** at upper right. The badge reads `EARN`, the editable reward amount, and `ON YOUR TENANT LEDGER!`. A wide, full-bleed property hero photo sits directly below it. A navy brush-style `GOOD NEIGHBORS. GREAT COMMUNITY. Stronger Together!` band overlaps the lower edge of the photo.

The lower half is split into a left `IT'S EASY!` three-step referral explanation and a right navy, lime-bordered `It Pays to Share!` reward panel. The bottom lime section carries a heart/`Spread the Word` mark, the fixed `THANK YOU FOR HELPING US Build a Better Community!` message, the property’s address in a navy location pill, and a white Equal Housing Opportunity mark at lower right. The disclaimer remains directly below the reward panel. The only pilot-specific elements are the property identification, hero image, address, contact phone/extension, and QR destination; the rest remains fixed across properties.

## Public Property Marketing Asset Hub — Print Property Flyer Module

Source: https://property-marketing-asset-hub.manus.space/arbor-crest

The original module appears on an off-white property page immediately after the Print-Ready QR Code card. It uses a section heading, `Print Property Flyer`, preceded by a slim dark-green vertical rule. A restrained white bordered panel underneath contains this workflow:

1. Introductory copy explains that the referral flyer is an `Earn $200 on your tenant ledger` asset; the property name and contact information are filled automatically; the manager chooses a photo and reward amount; `Print Flyer` produces a hand-out 8.5 × 11 page; and `Download PNG` supports email and digital distribution.
2. A compact `Referral amount:` input uses the default `200`, paired with helper copy that says updates happen instantly and the default is `$200`.
3. A compact outlined trigger is labeled `Flyer Photo: {selected photo label}`. Clicking it fans out the full current-property photo grid directly beneath the trigger. Each image card carries its label; the selected card receives a green outline and checkmark.
4. The output row contains a dark-green `Print Flyer` button and an outlined `Download PNG` button, with the flyer preview immediately below the control panel.

For the standalone pilot, retain this exact module hierarchy and behavior while using the six pilot property records. Do not recreate the surrounding asset hub content.

## Observed Original Flyer Composition

The original Arbor Crest flyer itself is a centered white 8.5 × 11 artifact with a slim lime rule along its top edge. It contains a compact property logo/name lockup at upper left, the selected hero photo below, and a large navy `EARN $200` badge with a lime border overlapping the hero’s upper-right corner. A navy `GOOD NEIGHBORS. GREAT COMMUNITY.` ribbon overlays the hero’s lower edge.

Below the image, the left column is an `IT'S EASY!` three-step sequence with navy numbered circles and lime/green icons. The right column is a navy `It Pays to Share!` panel with lime border and the editable reward amount. The lower section has a circular navy/lime `SPREAD THE WORD. BUILD COMMUNITY.` emblem, the fixed `THANK YOU FOR HELPING US Build a Better Community!` message, a lime address pill, a bottom contact line carrying the property phone number, and a black Equal Housing mark.

The original hub presents the property QR code in the separate `Print-Ready QR Code` card immediately above this module. The flyer preview shown in the original module does **not** visibly place a QR code inside the flyer. Therefore, the standalone flyer should not introduce a QR element into the printed artifact unless the user later requests that change; any QR destination configuration stays outside the flyer preview.
