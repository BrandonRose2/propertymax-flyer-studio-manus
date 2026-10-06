import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SimpleFlyerPreview } from "../client/src/components/SimpleFlyerPreview";
import { buildingDropdownProperties, pilotFlyerProperties } from "../client/src/data/pilotFlyerProperties";

describe("Pelican Bay flyer template", () => {
  it("keeps property details and the editable reward in both reference offer treatments", () => {
    const property = pilotFlyerProperties[0];
    if (!property) throw new Error("A pilot property is required for the flyer template test.");

    const markup = renderToStaticMarkup(createElement(SimpleFlyerPreview, {
      property,
      imageUrl: "https://example.com/property.jpg",
      imageLabel: "saved validation photo",
      reward: "$275",
    }));

    expect(markup).toContain(property.name);
    expect(markup).toContain(property.address);
    expect(markup).toContain(property.officePhone);
    expect(markup).not.toContain(`Ext. ${property.extension}`);
    expect(markup).toContain("$275");
    expect((markup.match(/<strong>\$275<\/strong>/g) ?? [])).toHaveLength(2);
    expect(markup).toContain("earn-badge__inner");
    expect(markup).toContain("community-ribbon");
    expect(markup).toContain("spread-word-mark");
    expect(markup).toContain("equal-housing__mark");
    expect(markup).toContain(`${property.name} flyer hero: saved validation photo`);
  });

  it("retains the letter-size print isolation and high-resolution PNG output contracts", () => {
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");
    const homePage = readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

    expect(stylesheet).toContain("@page { size: letter; margin: 0; }");
    expect(stylesheet).toContain(".no-print, .tool-header, .preview-label { display: none !important; }");
    expect(stylesheet).toContain("width: 8.5in; height: 11in");
    expect(homePage).toContain("window.print()");
    expect(homePage).toContain("pixelRatio: 4");
  });

  it("keeps the corrected offer card in an explicit non-clipping grid with its complete reward content", () => {
    const property = pilotFlyerProperties[0];
    if (!property) throw new Error("A pilot property is required for the flyer template test.");

    const markup = renderToStaticMarkup(createElement(SimpleFlyerPreview, {
      property,
      imageUrl: "https://example.com/property.jpg",
      imageLabel: "saved validation photo",
      reward: "$275",
    }));
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect(stylesheet).toContain("grid-template-rows: minmax(0, 70%) auto");
    expect(stylesheet).toContain(".share-offer { display: grid; min-height: 0; height: 100%;");
    expect(stylesheet).toContain(".share-offer strong { display: block; width: max-content; max-width: none;");
    expect(stylesheet).toContain("overflow: visible;");
    expect(stylesheet).toContain(".flyer-contact-line { position: absolute;");
    expect(stylesheet).toContain("bottom: 15%");
    expect(markup).toContain("It Pays to Share!");
    expect(markup).toContain("ON YOUR TENANT LEDGER");
    expect((markup.match(/<strong>\$275<\/strong>/g) ?? [])).toHaveLength(2);
  });

  it("keeps the upper reward badge wide enough to show every digit in $200", () => {
    const property = pilotFlyerProperties.find((candidate) => candidate.id === "walnut-hill-apartments");
    if (!property?.photos[0]) throw new Error("Walnut Hill requires a starter photo for the badge regression test.");

    const markup = renderToStaticMarkup(createElement(SimpleFlyerPreview, {
      property,
      imageUrl: property.photos[0].url,
      imageLabel: property.photos[0].label,
      reward: "$200",
    }));
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect((markup.match(/<strong>\$200<\/strong>/g) ?? [])).toHaveLength(2);
    expect(stylesheet).toContain("justify-items: stretch");
    expect(stylesheet).toContain(".earn-badge strong { display: block; width: 100%; max-width: none;");
    expect(stylesheet).toContain("padding: 0 .09em 0 .02em; overflow: visible;");
    expect(stylesheet).toContain("font-size: calc(clamp(26px, 6.45vw, 46px) * var(--reward-scale, 1))");
  });

  it("extends the header-plate fade upward through the apartment wordmark transition", () => {
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect(stylesheet).toContain(".referral-flyer__top::before");
    expect(stylesheet).toContain("width: 74%; height: 168%");
    expect(stylesheet).toContain("linear-gradient(148deg");
    expect(stylesheet).toContain("rgba(255, 255, 255, .82) 43%");
    expect(stylesheet).toContain("rgba(255, 255, 255, .43) 68%");
    expect(stylesheet).toContain("rgba(255, 255, 255, 0) 100%");
  });

  it("sets the apartment wordmark slightly lower within the title plate", () => {
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect(stylesheet).toContain(".property-wordmark { position: absolute; z-index: 3; top: 31%;");
  });

  it("uses a larger type scale inside the circular spread-the-word badge", () => {
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect(stylesheet).toContain(".spread-word-mark {");
    expect(stylesheet).toContain("font-size: calc(clamp(7px, 1.05vw, 9px) * var(--fs-footer, 1))");
  });

  it("places the user-requested buildings first in the Building dropdown", () => {
    expect(buildingDropdownProperties.slice(0, 6).map((property) => property.id)).toEqual([
      "walnut-hill-apartments",
      "pelican-bay-apartments",
      "grace-townhomes",
      "gates-on-manhattan",
      "arbor-crest",
      "boca-ciega",
    ]);
    expect(buildingDropdownProperties).toHaveLength(pilotFlyerProperties.length);
  });

  it("includes the four requested properties with isolated starter-photo records and dynamic leasing contacts", () => {
    const expectedProperties = [
      ["gates-on-manhattan", "Gates on Manhattan", "1050 Manhattan Blvd, Harvey, LA 70058", "(504) 362-9794", "284"],
      ["grace-townhomes", "Grace Townhomes", "1212 Grace Circle, Ennis, TX 75119", "(972) 878-2040", "227"],
      ["pelican-bay-apartments", "Pelican Bay Apartments", "2121 N Lobdell Blvd, Baton Rouge, LA 70806", "(225) 216-3131", "257"],
      ["walnut-hill-apartments", "Walnut Hill Apartments", "102 Lieutenants Run Drive, Petersburg, VA 23805", "(804) 722-8271", "267"],
    ] as const;

    for (const [id, name, address, officePhone, extension] of expectedProperties) {
      const property = pilotFlyerProperties.find((candidate) => candidate.id === id);
      expect(property).toMatchObject({ id, name, address, officePhone, extension });
      expect(property?.photos).toHaveLength(1);
      expect(property?.photos[0]?.url).toMatch(/^\/manus-storage\//);

      if (!property?.photos[0]) throw new Error(`A starter photo is required for ${name}.`);
      const markup = renderToStaticMarkup(createElement(SimpleFlyerPreview, {
        property,
        imageUrl: property.photos[0].url,
        imageLabel: property.photos[0].label,
        reward: "$200",
      }));
      expect(markup).toContain(name);
      expect(markup).toContain(address);
      expect(markup).toContain(officePhone);
      expect(markup).not.toContain(`Ext. ${extension}`);
      expect(markup).toContain(property.photos[0].url);
    }
  });
});

describe("custom rewards", () => {
  const property = pilotFlyerProperties[0]!;
  const render = (props: Record<string, unknown>) =>
    renderToStaticMarkup(createElement(SimpleFlyerPreview, {
      property,
      imageUrl: "https://example.com/property.jpg",
      imageLabel: "photo",
      reward: "$200",
      ...props,
    }));

  it("shows a non-cash reward without tenant-ledger wording", () => {
    const markup = render({ reward: "Free TV", rewardType: "other" });
    expect((markup.match(/<strong>Free TV<\/strong>/g) ?? [])).toHaveLength(2);
    expect(markup).toContain("FOR EVERY<br/>REFERRAL!");
    expect(markup).toContain("REFERRAL REWARD");
    expect(markup).toContain("you&#x27;ll receive: Free TV");
    expect(markup).not.toContain("TENANT LEDGER");
    expect(markup).toContain("has-text-reward");
  });

  it("keeps the ledger wording for cash credits", () => {
    const markup = render({ rewardType: "ledger" });
    expect(markup).toContain("ON YOUR TENANT LEDGER");
    expect(markup).not.toContain("has-text-reward");
  });

  it("scales the reward text through a CSS variable", () => {
    expect(render({ rewardScale: 0.7 })).toContain("--reward-scale:0.7");
    const stylesheet = readFileSync(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");
    expect(stylesheet).toContain("calc(clamp(26px, 6.45vw, 46px) * var(--reward-scale, 1))");
    expect(stylesheet).toContain("calc(clamp(36px, 5.8vw, 55px) * var(--reward-scale, 1))");
  });
});

describe("full property roster", () => {
  it("lists every active property in the dropdown with a matching photo-library id", async () => {
    const { PROPERTY_PHOTO_IDS } = await import("../shared/propertyPhotoConfig");
    const ids = pilotFlyerProperties.map((property) => property.id);
    expect(ids.length).toBe(42);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...PROPERTY_PHOTO_IDS].sort()).toEqual([...ids].sort());
    expect(buildingDropdownProperties).toHaveLength(ids.length);
    for (const property of pilotFlyerProperties) {
      expect(property.address).toMatch(/, [A-Z]{2} \d{5}$/);
      expect(property.officePhone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
    }
  });
});
