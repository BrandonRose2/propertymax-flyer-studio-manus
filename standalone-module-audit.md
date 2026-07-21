# Standalone Print-Ready Flyer Module Audit

## Scope and routes

The application exposes one working product route, `/`, with a 404 fallback. It does not expose asset-library, ad-copy, regional-management, or property-specification hub pages. The page is intentionally bounded to one manager-facing, print-ready flyer workflow.

## Observed live workflow

The manager selects a building, confirms its address, edits the referral amount, opens the property-scoped photo picker, optionally adds images individually or through a ZIP, and then uses **Print Flyer** or **Download PNG**. The selected property, amount, and photo update the letter-size artboard immediately. The photo picker reports the active selection, and saved records reload from server-backed storage for the correct property library.

| Module element | Implemented behavior |
|---|---|
| Building picker | Drives property name, address, contact information, approved imagery, and persisted library scope. |
| Referral amount | Editable field updates both offer treatments on the flyer in real time. |
| Flyer photo picker | Shows approved and saved property photos, selected state, and the active hero label. |
| ZIP / individual upload | Saves authenticated uploads, routes recognized property folders, and restores records after a later visit. |
| Print / PNG output | Prints only the letter-size artboard and exports a high-resolution PNG. |
| Responsive shell | Keeps controls usable on mobile while scaling the fixed letter-size print artboard rather than reflowing it. |

## Reference-resolution note

The legacy checklist named a shared task and a public Property Marketing Asset Hub section, but no usable public reference URL was present in the project and an external lookup did not surface the specified resource. Those legacy references have therefore been superseded by the user-provided **Pelican Bay referral flyer**, which is the authoritative visual ground truth for the current printed artboard. The observed module workflow above remains the implementation standard for the standalone portal.
