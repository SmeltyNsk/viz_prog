import { describe, it, expect } from "vitest";
import { csvToJSON } from "../src/csvToJson";

describe("csvToJSON", () => {

  it("parses correct CSV", () => {
    const input = [
      "p1;p2;p3",
      "1;A;b",
      "2;B;c"
    ];

    const result = csvToJSON(input, ";");

    expect(result).toEqual([
      { p1: 1, p2: "A", p3: "b" },
      { p1: 2, p2: "B", p3: "c" }
    ]);
  });

  it("throws on column mismatch", () => {
    const input = [
      "p1;p2",
      "1;A;extra"
    ];

    expect(() => csvToJSON(input, ";"))
      .toThrow("Column number mismatch");
  });

  it("throws on empty input", () => {
    expect(() => csvToJSON([], ";"))
      .toThrow("Input is empty");
  });

});