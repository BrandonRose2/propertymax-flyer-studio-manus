# Persistent Property Photo Library

## Purpose

Replace the current browser-session-only image URLs with a durable, property-scoped library. A photo uploaded individually or extracted from a ZIP must remain available after refresh, return visits, and deployment restarts.

## Storage Contract

| Concern | Decision |
| --- | --- |
| File bytes | Store image bytes in managed object storage. |
| Metadata | Store a database record with the property identifier, display label, storage key, URL, MIME type, original filename, and upload timestamp. |
| Scope | Associate every image with one of the six existing property identifiers. ZIP folder names continue to route images to the matching property; unmatched images go to the selected property. |
| Retrieval | Load saved records with the selected property and merge them with the existing approved-photo data. |
| Persistence | Do not rely on object URLs or browser memory for managed photos. |
| Safety | Enforce supported image types and size limits on the server. Only authenticated users may create or manage persisted uploads. |

## User Experience

The existing individual-image and ZIP drag-and-drop controls remain in place. A successful import reports that the images were **saved** to the relevant property library. When the user returns later, those images appear in the same property’s picker and can be selected for the flyer. Existing built-in property images remain unchanged.
