/** "Pelican Bay Apartments" and "Pelican Bay Logo.png" both reduce to "pelicanbay". */
export const logoMatchKey = (value: string) => value
  .toLowerCase()
  .replace(/\.[a-z0-9]+$/, "")
  .replace(/\b(apartments?|apts|logo)\b/g, "")
  .replace(/[^a-z0-9]/g, "");
export const matchingLogoFor = <T extends { label: string; originalFileName: string }>(propertyName: string, logos: T[]) => {
  const key = logoMatchKey(propertyName);
  if (!key) return undefined;
  return logos.find((logo) => logoMatchKey(logo.originalFileName) === key || logoMatchKey(logo.label) === key);
};

