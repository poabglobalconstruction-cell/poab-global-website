import { describe, it, expect } from "vitest";
import { getNextReference } from "../reference";

describe("Reference Generator", () => {
  it("generates correct reference format with year and prefix", async () => {
    const currentYear = new Date().getFullYear();
    const ref = await getNextReference(null, "POAB-REQ");
    expect(ref).toMatch(new RegExp(`^POAB-REQ-${currentYear}-\\d{4}$`));
  });

  it("generates separate prefix formats correctly", async () => {
    const currentYear = new Date().getFullYear();
    const refSell = await getNextReference(null, "POAB-SELL");
    expect(refSell).toMatch(new RegExp(`^POAB-SELL-${currentYear}-\\d{4}$`));

    const refProp = await getNextReference(null, "POAB-PROP");
    expect(refProp).toMatch(new RegExp(`^POAB-PROP-${currentYear}-\\d{4}$`));
  });
});
