
import { promises as fs } from "fs";
import { csvToJSON } from "./csvToJson";

export async function formatCSVFileToJSONFile(
  input: string,
  output: string,
  delimiter: string
): Promise<void> {

  const fileContent = await fs.readFile(input, "utf-8");

  const lines = fileContent
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const json = csvToJSON(lines, delimiter);

  await fs.writeFile(output, JSON.stringify(json, null, 2), "utf-8");
}