export const PROPERTY_PHOTO_IDS = [
  "arbor-crest",
  "gates-on-manhattan",
  "grace-townhomes",
  "grove-park-terrace",
  "thomasville-church-homes",
  "boca-ciega",
  "opa-locka",
  "macedonia",
  "pelican-bay-apartments",
  "walnut-hill-apartments",
] as const;

export type PropertyPhotoId = (typeof PROPERTY_PHOTO_IDS)[number];

export const isPropertyPhotoId = (value: string): value is PropertyPhotoId =>
  PROPERTY_PHOTO_IDS.includes(value as PropertyPhotoId);
