import { describe, expect, it } from "vitest";
import { pilotFlyerProperties } from "../client/src/data/pilotFlyerProperties";
import { matchingLogoFor } from "../client/src/lib/logoMatch";

const logo = (file: string, id: number) => ({ id, originalFileName: file, label: file.replace(/\.png$/, "") });

describe("building logo matching", () => {
  it("matches each building to its own '<Name> Logo.png' file", () => {
    const logos = pilotFlyerProperties.map((property, index) => logo(`${property.name} Logo.png`, index + 1));
    pilotFlyerProperties.forEach((property, index) => {
      expect(matchingLogoFor(property.name, logos)?.id).toBe(index + 1);
    });
  });

  it("ignores Apartments/Logo wording and falls back to nothing when no logo fits", () => {
    const logos = [logo("Pelican Bay Logo.png", 44), logo("AptCorpShimmer.gif", 43)];
    expect(matchingLogoFor("Pelican Bay Apartments", logos)?.id).toBe(44);
    expect(matchingLogoFor("Oak Hills", logos)).toBeUndefined();
  });
});
