import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatCSVFileToJSONFile } from "../src/formatCSVFileToJSONFile";
import * as fs from "fs/promises";

vi.mock("fs/promises");

describe("formatCSVFileToJSONFile", () => {

  const mockReadFile = fs.readFile as unknown as ReturnType<typeof vi.fn>;
  const mockWriteFile = fs.writeFile as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls readFile and writeFile correctly", async () => {

    mockReadFile.mockResolvedValue(
      "p1;p2\n1;A\n2;B"
    );

    await formatCSVFileToJSONFile(
      "input.csv",
      "output.json",
      ";"
    );

    expect(mockReadFile).toHaveBeenCalledWith(
      "input.csv",
      "utf-8"
    );

    expect(mockWriteFile).toHaveBeenCalledWith(
      "output.json",
      JSON.stringify([
        { p1: 1, p2: "A" },
        { p1: 2, p2: "B" }
      ], null, 2),
      "utf-8"
    );
  });

});