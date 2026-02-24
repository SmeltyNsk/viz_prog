import { readFile, writeFile } from 'node:fs/promises';

//Перевод текста из CSV в JSON
export function csvToJSON(input: string[], delimiter: string): object[] {
  if (!Array.isArray(input) || input.length < 2) {
    throw new Error('Неправильный ввод');
  }

  if (!delimiter) {
    throw new Error('Нужен разделитель');
  }

  const headers = input[0].split(delimiter);

  if (headers.length === 0) {
    throw new Error('No headers found');
  }

  const result: object[] = [];

  for (let i = 1; i < input.length; i++) {
    const values = input[i].split(delimiter);

    if (values.length !== headers.length) {
      throw new Error('Invalid CSV format');
    }

    const row: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }

    result.push(row);
  }

  return result;
}

//Перевод файла из CSV в JSON
export async function formatCSVFileToJSONFile(input: string, output: string, delimiter: string): Promise<void> {
  if (!input || !output || !delimiter) {
    throw new Error('Invalid arguments');
  }

  const fileContent = await readFile(input, { encoding: 'utf-8' });

  const lines = fileContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const json = csvToJSON(lines, delimiter);

  await writeFile(output, JSON.stringify(json, null, 2), {
    encoding: 'utf-8',
  });
}