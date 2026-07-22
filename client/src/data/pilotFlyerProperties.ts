/**
 * Colonial Estates flyer pilot data.
 * Design reminder: every property uses the same navy/lime referral template;
 * only approved property data, photo choice, reward amount, and QR destination may vary.
 * Addresses and office phone extensions were verified against the Company Contacts Notion source.
 */

export type FlyerPhoto = {
  id: string;
  label: string;
  url: string;
};

export type PilotFlyerProperty = {
  id: string;
  name: string;
  address: string;
  officePhone: string;
  extension: string;
  qrDestination: string;
  photos: FlyerPhoto[];
};

export const pilotFlyerProperties: PilotFlyerProperty[] = [
  {
    id: "arbor-crest",
    name: "Arbor Crest",
    address: "64 N Cleveland Street, Quincy, FL 32351",
    officePhone: "(850) 629-0605",
    extension: "261",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "arbor-crest-hero", label: "Exterior", url: "/manus-storage/arbor-crest-hero_bb59ee9e.png" }],
  },
  {
    id: "gates-on-manhattan",
    name: "Gates on Manhattan",
    address: "1050 Manhattan Blvd, Harvey, LA 70058",
    officePhone: "(504) 362-9794",
    extension: "284",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "gates-on-manhattan-hero", label: "Exterior", url: "/manus-storage/gates-on-manhattan-hero_fbf3d5a9.jpg" }],
  },
  {
    id: "grace-townhomes",
    name: "Grace Townhomes",
    address: "1212 Grace Circle, Ennis, TX 75119",
    officePhone: "(972) 878-2040",
    extension: "227",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "grace-townhomes-hero", label: "Exterior", url: "/manus-storage/grace-townhomes-hero_5d7584ca.webp" }],
  },
  {
    id: "grove-park-terrace",
    name: "Grove Park Terrace",
    address: "400 Peters Street, Waxahachie, TX 75165",
    officePhone: "(972) 937-5414",
    extension: "265",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "grove-park-terrace-hero", label: "Exterior", url: "/manus-storage/grove-park-terrace-hero_81fb8928.png" }],
  },
  {
    id: "thomasville-church-homes",
    name: "Thomasville Church Homes",
    address: "904 Doak Street, Thomasville, NC 27360",
    officePhone: "(336) 475-2817",
    extension: "295",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "thomasville-church-homes-hero", label: "Exterior", url: "/manus-storage/thomasville-church-homes-hero_d2e97276.png" }],
  },
  {
    id: "boca-ciega",
    name: "Boca Ciega",
    address: "3401 37th Street South, St. Petersburg, FL 33711",
    officePhone: "(727) 865-1649",
    extension: "216",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "boca-ciega-hero", label: "Exterior", url: "/manus-storage/boca-ciega-hero_c6fb7b8f.png" }],
  },
  {
    id: "opa-locka",
    name: "Opa Locka",
    address: "2860 NW 135th Street, Opa Locka, FL 33054",
    officePhone: "(305) 681-0711",
    extension: "221",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "opa-locka-hero", label: "Exterior", url: "/manus-storage/opa-locka-hero_e963ea41.png" }],
  },
  {
    id: "macedonia",
    name: "Macedonia",
    address: "1722 W 17th Street, Panama City, FL 32405",
    officePhone: "(850) 785-9912",
    extension: "222",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "macedonia-hero", label: "Exterior", url: "/manus-storage/macedonia-hero_a1de77c1.png" }],
  },
  {
    id: "pelican-bay-apartments",
    name: "Pelican Bay Apartments",
    address: "2121 N Lobdell Blvd, Baton Rouge, LA 70806",
    officePhone: "(225) 216-3131",
    extension: "257",
    qrDestination: "https://www.pelicanbayapts.com/",
    photos: [{ id: "pelican-bay-apartments-hero", label: "Exterior", url: "/manus-storage/pelican-bay-hero_a4d30a2c.jpg" }],
  },
  {
    id: "walnut-hill-apartments",
    name: "Walnut Hill Apartments",
    address: "102 Lieutenants Run Drive, Petersburg, VA 23805",
    officePhone: "(804) 722-8271",
    extension: "267",
    qrDestination: "https://apartmentcorp.com/portfolio",
    photos: [{ id: "walnut-hill-apartments-hero", label: "Exterior", url: "/manus-storage/walnut-hill-apartments-hero_6183d4e5.jpg" }],
  },
];

const priorityBuildingIds = [
  "walnut-hill-apartments",
  "pelican-bay-apartments",
  "grace-townhomes",
  "gates-on-manhattan",
  "arbor-crest",
  "boca-ciega",
] as const;

const priorityBuildingIdSet = new Set<string>(priorityBuildingIds);

export const buildingDropdownProperties: PilotFlyerProperty[] = [
  ...priorityBuildingIds
    .map((id) => pilotFlyerProperties.find((property) => property.id === id))
    .filter((property): property is PilotFlyerProperty => Boolean(property)),
  ...pilotFlyerProperties.filter((property) => !priorityBuildingIdSet.has(property.id)),
];
