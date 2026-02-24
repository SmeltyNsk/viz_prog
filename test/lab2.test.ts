import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs/promises';
import {
  csvToJSON,
  formatCSVFileToJSONFile
} from '../src/lab2';

vi.mock('node:fs/promises');

describe('csvToJSON', () => {
  it('Должен перевести CSV в JSON', () => {
    const input = [
      'p1;p2;p3',
      '1;A;B',
      '2;C;D'
    ];

    const result = csvToJSON(input, ';');

    expect(result).toEqual([
      { p1: '1', p2: 'A', p3: 'B' },
      { p1: '2', p2: 'C', p3: 'D' }
    ]);
  });

  it('Должен выдать ошибку (несовпадение кол-ва столбцов)', () => {
    const input = [
      'p1;p2',
      '1;A;B'
    ];

    expect(() => csvToJSON(input, ';')).toThrow();
  });

  it('Должен выдать ошибку (неправильный ввод)', () => {
    expect(() => csvToJSON([], ';')).toThrow();
  });

  it('Должен выдать ошибку (разделитель пустой)', () => {
    expect(() => csvToJSON(['a;b'], '')).toThrow();
  });
});

describe('Перевод CSV файла в JSON', () => {
  const mockedReadFile = vi.mocked(fs.readFile);
  const mockedWriteFile = vi.mocked(fs.writeFile);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Должен прочитать файл и перевести его в JSON', async () => {
    const fakeCSV =
      'p1;p2\n' +
      '1;A\n' +
      '2;B';

    mockedReadFile.mockResolvedValue(fakeCSV as any);

    await formatCSVFileToJSONFile(
      'input.csv',
      'output.json',
      ';'
    );

    expect(mockedReadFile).toHaveBeenCalledWith(
      'input.csv',
      { encoding: 'utf-8' }
    );

    expect(mockedWriteFile).toHaveBeenCalledWith(
      'output.json',
      JSON.stringify(
        [
          { p1: '1', p2: 'A' },
          { p1: '2', p2: 'B' }
        ],
        null,
        2
      ),
      { encoding: 'utf-8' }
    );
  });

  it('Должен выдать ошибку (неправильные аргументы)', async () => {
    await expect(
      formatCSVFileToJSONFile('', 'out.json', ';')
    ).rejects.toThrow();
  });

  it('Должен выдать ошибку (чтение файла)', async () => {
    mockedReadFile.mockRejectedValue(
      new Error('read error')
    );

    await expect(
      formatCSVFileToJSONFile('a', 'b', ';')
    ).rejects.toThrow('read error');
  });
});