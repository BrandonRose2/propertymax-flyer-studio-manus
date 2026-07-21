# Added Property Roster Sources

The four properties below were added to the flyer selector using current internal contact-directory records. Their starter hero images were uploaded as managed web assets before being referenced in the application.

Each added property inherits the portal’s editable **$200** referral default. The starter image may be replaced at any time through that property’s signed-in photo library.

## Intentional fallbacks and image status

| Property | Flyer destination | Treatment |
|---|---|---|
| Gates on Manhattan | `https://apartmentcorp.com/portfolio` | Intentional portfolio fallback because no property-specific destination was supplied in the current workspace. |
| Grace Townhomes | `https://apartmentcorp.com/portfolio` | Intentional portfolio fallback because no property-specific destination was supplied in the current workspace. |
| Pelican Bay Apartments | `https://www.pelicanbayapts.com/` | Official community destination. |
| Walnut Hill Apartments | `https://apartmentcorp.com/portfolio` | Intentional portfolio fallback because no property-specific destination was supplied in the current workspace. |

All four records intentionally use the same editable **$200** referral default; it is not a property-specific promise and can be changed by the manager per flyer. The initial hero assets are public-listing exterior images uploaded only as replaceable starter photos. They should be replaced through the signed-in property library with staff-approved marketing imagery before external distribution if a different approved image is required.

## Essential validation

The automated roster test renders every added property through the flyer template and verifies its name, address, leasing phone, extension, and starter-hero URL. The photo-library router test confirms that Gates on Manhattan, Grace Townhomes, Pelican Bay Apartments, and Walnut Hill Apartments are each accepted as an independent persistent storage scope using the `property-photos/{property-id}/` key namespace. The focused suite passed **11 tests** after the server allowlist was extended.

The final production build completed successfully after the property-ID allowlist and regression updates.

| Property | Flyer address | Leasing contact | Starter image basis |
|---|---|---|---|
| Gates on Manhattan | 1050 Manhattan Blvd, Harvey, LA 70058 | (504) 362-9794, Ext. 284 | Exterior image from the community listing for the verified address. |
| Grace Townhomes | 1212 Grace Circle, Ennis, TX 75119 | (972) 878-2040, Ext. 227 | Exterior image from the community listing for the verified address. |
| Pelican Bay Apartments | 2121 N Lobdell Blvd, Baton Rouge, LA 70806 | (225) 216-3131, Ext. 257 | Exterior image from the official Pelican Bay community site. |
| Walnut Hill Apartments | 102 Lieutenants Run Drive, Petersburg, VA 23805 | (804) 722-8271, Ext. 267 | Exterior image from the community listing for the verified address. |
