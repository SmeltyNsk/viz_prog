export function csvToJSON(
    input: string[],
    delimiter: string
  ): object[] {
    if (!input.length) {
      throw new Error("Input is empty");
    }
  
    const headers = input[0].split(delimiter);
  
    if (headers.some(h => h.trim() === "")) {
      throw new Error("Invalid header");
    }
  
    return input.slice(1).map(line => {
      const values = line.split(delimiter);
  
      if (values.length !== headers.length) {
        throw new Error("Column number mismatch");
      }
  
      const obj: Record<string, any> = {};
  
      headers.forEach((header, index) => {
        const value = values[index];
  
        // попытка привести к number
        const num = Number(value);
        obj[header] = isNaN(num) || value.trim() === ""
          ? value
          : num;
      });
  
      return obj;
    });
  }