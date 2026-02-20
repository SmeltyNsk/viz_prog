import {
  it,
  describe,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach
} from "vitest";

// Импортируем функции из исходного файла как обычный модуль
import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirst,
  trimAndFormat,
  getFirstElement,
  findById
} from "../src/lab1";

describe("createUser", () => {
  it("создаёт активного пользователя по умолчанию без email", () => {
    expect(createUser(1, "Егор")).toEqual({
      id: 1,
      name: "Егор",
      isActive: true
    });
  });

  it("добавляет email и уважает isActive", () => {
    expect(createUser(2, "random", "random@example.com", false)).toEqual({
      id: 2,
      name: "random",
      email: "random@example.com",
      isActive: false
    });
  });
});

describe("createBook", () => {
  it("возвращает книгу как есть", () => {
    const book = {
      title: "Demian",
      author: "German Gesse",
      genre: "Roman" as const
    };
    expect(createBook(book)).toBe(book);
  });
});

describe("calculateArea", () => {
  it("считает площадь круга", () => {
    expect(calculateArea("circle", 0)).toBe(0);
    expect(calculateArea("circle", 2)).toBeCloseTo(Math.PI * 4, 10);
  });

  it("считает площадь квадрата", () => {
    expect(calculateArea("square", 4)).toBe(16);
    expect(calculateArea("square", -3)).toBe(9);
  });
});

describe("getStatusColor", () => {
  it("возвращает правильные цвета", () => {
    expect(getStatusColor("active")).toBe("green");
    expect(getStatusColor("inactive")).toBe("gray");
    expect(getStatusColor("new")).toBe("blue");
  });
});

describe("capitalizeFirst", () => {
  it("пустую строку превращает в пустую строку", () => {
    expect(capitalizeFirst("")).toBe("");
  });

  it("делает первую букву заглавной и остальное строчными", () => {
    expect(capitalizeFirst("hELLo")).toBe("Hello");
  });

  it("uppercase=true делает результат верхним регистром", () => {
    expect(capitalizeFirst("hello", true)).toBe("HELLO");
  });

  it("не триммит пробелы (по текущей реализации)", () => {
    expect(capitalizeFirst("  hello")).toBe("  hello");
  });
});

describe("trimAndFormat", () => {
  it("триммит пробелы", () => {
    expect(trimAndFormat("   hello world   ")).toBe("hello world");
  });

  it("uppercase=true делает верхний регистр после trim", () => {
    expect(trimAndFormat("   hello world   ", true)).toBe("HELLO WORLD");
  });
});

describe("getFirstElement", () => {
  it("для пустого массива возвращает undefined", () => {
    expect(getFirstElement([])).toBeUndefined();
  });

  it("для непустого массива возвращает первый элемент", () => {
    expect(getFirstElement([67, 2, 3])).toBe(67);
    expect(getFirstElement(["d", "b", "c"])).toBe("d");
  });
});

describe("findById", () => {
  it("находит элемент по id", () => {
    const items = [
      { id: 1, name: "Alice", isActive: true },
      { id: 2, name: "Bob", isActive: false }
    ];
    const found = findById(items, 2);
    expect(found).toBe(items[1]);
  });

  it("возвращает undefined если не найдено", () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(findById(items, 999)).toBeUndefined();
  });
});


