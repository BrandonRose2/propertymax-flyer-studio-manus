# Saved Photo Removal Verification

The saved-photo library now exposes a **Remove selected saved photo** action whenever the active property contains one or more persisted photos. The action is disabled until a saved photo is selected and opens a confirmation dialog before any persistent record is removed.

The protected removal procedure scopes deletion to the selected property and the authenticated uploader. After confirmation, the active property photo query is invalidated and the flyer falls back to another available photo if the removed image was selected. Router tests verify authenticated, property-scoped removal and rejection of unauthenticated removal. The restarted application rendered without TypeScript or dependency errors at the Arbor Crest deterministic preview.

The managed storage object is intentionally left unreferenced after record removal, consistent with the project storage lifecycle; the photo no longer appears in the property’s saved image library.
