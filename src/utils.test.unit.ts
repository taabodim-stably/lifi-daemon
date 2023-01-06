import { getTokenDecimal } from "./utils";

describe("Test getTokenDecimal()", () => {
  it("Valid case", () => {
    const decimal = getTokenDecimal("USDS");
    expect(decimal).toEqual(6);
  });

  it("Invalid case", () => {
    try {
      getTokenDecimal("BTCS");
      expect(true).toBe(false);
    } catch (error) {
      expect((error as Error)?.message).toEqual(
        "Not support assetTicker: BTCS"
      );
    }
  });
});
