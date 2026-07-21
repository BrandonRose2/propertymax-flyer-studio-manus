# ZIP Photo Import Specification

The flyer tool must accept a dragged or selected `.zip` archive in the photo-upload area. It will unpack supported image files (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, and `.avif`) directly in the browser and append them to the **currently selected property** photo picker. Nested folders inside the archive are supported, and non-image files are ignored.

Imported images are intentionally browser-session assets in the existing static application: they work immediately in the picker and flyer preview but are not retained after a full page reload. The individual image-upload workflow remains available. Empty archives, archives containing no supported images, and extraction failures must give a clear, non-destructive error message.
