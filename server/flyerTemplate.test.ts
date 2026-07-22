import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SimpleFlyerPreview } from "../client/src/components/SimpleFlyerPreview";
import { pilotFlyerProperties } from "../client/src/data/pilotFlyerProperties";

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
    expect(markup).toContain(`Ext. ${property.extension}`);
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
    expect(stylesheet).toContain("font-size: clamp(26px, 6.45vw, 46px)");
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
      expect(markup).toContain(`Ext. ${extension}`);
      expect(markup).toContain(property.photos[0].url);
    }
  });
});
