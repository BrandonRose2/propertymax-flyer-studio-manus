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
});
