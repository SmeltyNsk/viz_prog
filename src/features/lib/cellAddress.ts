export function columnLetterToIndex(letters: string): number {
    let index = 0;
    for (let i = 0; i < letters.length; i++){
        index = index * 26 + (letters.charCodeAt(i) - 64)
    }
    return index - 1;
}

export function columnIndexToLetter(index: number): string {
    let letters = '';
    while (index >= 0){
        letters = String.fromCharCode(index % 26 + 65) + letters;
        index = Math.floor(index / 26) - 1;
    }
    return letters;
}

export function parseCellAddress(address: string): [number, number] {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell address: ${address}`);
    }
    const colLetters = match[1];
    const rowNumber = parseInt(match[2], 10);
    return [rowNumber - 1, columnLetterToIndex(colLetters)];
}

export function formatCellAddress(row: number, col: number): string {
    return `${columnIndexToLetter(col)}${row + 1}`;
}