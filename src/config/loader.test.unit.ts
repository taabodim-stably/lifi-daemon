import path from "path";

import { loadConfig } from "./loader";

interface TestingTomlInterface {
  readonly Part1: {
    readonly field1: number;
    readonly field2: string;
  };
  readonly AnotherPart: {
    readonly myField: number;
    readonly testField: string;
  };
}

describe("Test loadConfig()", () => {
  it("Valid file path", async () => {
    const currentDir = path.dirname(module.filename);
    const data = loadConfig<TestingTomlInterface>(`${currentDir}/testing.toml`);

    expect(data).toBeDefined();

    expect(data.Part1.field1).toEqual(1234);
    expect(data.Part1.field2).toEqual("abc");
    expect(data.AnotherPart.myField).toBeCloseTo(12.4444, 4);
    expect(data.AnotherPart.testField).toEqual("dsdsadsadsa");
  });
});
