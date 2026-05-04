export interface CellData {
    value: string;
    formula: string;
}

export interface tableConfig {
    rows: number;
    columns: number;
    defaultCell: Partial<CellData>;
}

export function createTable(config: tableConfig): CellData[][] {
    const { rows, columns, defaultCell } = config;
    const table: CellData[][] = [];

    for (let row = 0; row < rows; row++) { // цикл который создает строки   
        const row: CellData[] = [];
        for (let col = 0; col < columns; col++) { // цикл который создает столбцы
            row.push({
                value: defaultCell.value || '',
                formula: defaultCell.formula || '',
            });
        }
        table.push(row); // добавляем строку
    }
    return table;
}