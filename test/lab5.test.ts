import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Transform,
  Where,
  Sort,
  Group,
  GroupBy,
  GroupTransform,
  Having,
} from '../src/lab5';
import { query } from '../src/lab5';

// Тип User для тестов
type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const users: User[] = [
  { id: 1, name: 'Alice', surname: 'Smith', age: 34, city: 'NY' },
  { id: 2, name: 'Alice', surname: 'Smith', age: 33, city: 'NY' },
  { id: 3, name: 'Alice', surname: 'Smith', age: 35, city: 'LA' },
  { id: 4, name: 'Bob', surname: 'Smith', age: 35, city: 'LA' },
];

describe('Lab5: Строгий порядок операций', () => {
  describe('Проверка типов для правильного порядка', () => {
    it('должен компилироваться: where', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const result = query<User>(where('name', 'Alice'));

      expectTypeOf(result).toEqualTypeOf<Transform<User>>();
      expect(result(users)).toHaveLength(3);
    });

    it('должен компилироваться: where -> where', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const result = query<User>(
        where('name', 'Alice'),
        where('surname', 'Smith')
      );

      expectTypeOf(result).toEqualTypeOf<Transform<User>>();
    });

    it('должен компилироваться: where -> sort', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const sort: Sort<User> = (key) => (data) =>
        [...data].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -1;
          if (av > bv) return 1;
          return 0;
        });

      const result = query<User>(where('name', 'Alice'), sort('age'));

      expectTypeOf(result).toEqualTypeOf<Transform<User>>();
    });

    it('должен компилироваться: where -> groupBy', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const groupBy: GroupBy<User> = (key) => (data) => {
        const acc = {} as Record<string, Group<User, typeof key>>;
        for (const item of data) {
          const k = String(item[key]);
          if (!acc[k]) {
            acc[k] = { key: item[key], items: [] };
          }
          acc[k].items.push(item);
        }
        return Object.values(acc);
      };

      const result = query<User>(where('name', 'Alice'), groupBy('city'));

      expect(typeof result).toBe('function');
      const grouped = (result as any)(users);
      expect(Array.isArray(grouped)).toBe(true);
    });

    it('должен компилироваться: where -> groupBy -> having', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const groupBy: GroupBy<User> = (key) => (data) => {
        const acc = {} as Record<string, Group<User, typeof key>>;
        for (const item of data) {
          const k = String(item[key]);
          if (!acc[k]) {
            acc[k] = { key: item[key], items: [] };
          }
          acc[k].items.push(item);
        }
        return Object.values(acc);
      };

      const having: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);

      const result = query<User>(
        where('surname', 'Smith'),
        groupBy('city'),
        having((group) => group.items.length > 1) as any
      );

      // Проверяем, что результат - функция
      expect(typeof result).toBe('function');
      const grouped = (result as any)(users);
      expect(Array.isArray(grouped)).toBe(true);
    });

    it('должен компилироваться: where -> groupBy -> having -> sort', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const groupBy: GroupBy<User> = (key) => (data) => {
        const acc = {} as Record<string, Group<User, typeof key>>;
        for (const item of data) {
          const k = String(item[key]);
          if (!acc[k]) {
            acc[k] = { key: item[key], items: [] };
          }
          acc[k].items.push(item);
        }
        return Object.values(acc);
      };

      const having: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);

      const sort: Sort<User> = (key) => (data) =>
        [...data].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -1;
          if (av > bv) return 1;
          return 0;
        });

      const result = query<User>(
        where('surname', 'Smith'),
        groupBy('city'),
        having((group) => group.items.length > 1) as any,
        sort('age') as any
      );

      // Проверяем, что результат - функция
      expect(typeof result).toBe('function');
      const grouped = (result as any)(users);
      expect(Array.isArray(grouped)).toBe(true);
    });
  });

  describe('Проверка типов для неправильного порядка (должны не компилироваться)', () => {
    it('НЕ должен компилироваться: sort без where', () => {
      const sort: Sort<User> = (key) => (data) =>
        [...data].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -1;
          if (av > bv) return 1;
          return 0;
        });

      const _result = query<User>(sort('age'));
      
    });

    it('НЕ должен компилироваться: groupBy после sort', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const sort: Sort<User> = (key) => (data) =>
        [...data].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -1;
          if (av > bv) return 1;
          return 0;
        });

      const groupBy: GroupBy<User> = (key) => (data) => {
        const acc = {} as Record<string, Group<User, typeof key>>;
        for (const item of data) {
          const k = String(item[key]);
          if (!acc[k]) {
            acc[k] = { key: item[key], items: [] };
          }
          acc[k].items.push(item);
        }
        return Object.values(acc);
      };

      const _result = query<User>(where('name', 'Alice'), sort('age'), groupBy('city'));
    });

    it('НЕ должен компилироваться: having без groupBy', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const having: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);
    
      const _result = query<User>(
        where('name', 'Alice'),
        having((group) => group.items.length > 1) as any
      );
      
    });

    it('НЕ должен компилироваться: where после groupBy', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const groupBy: GroupBy<User> = (key) => (data) => {
        const acc = {} as Record<string, Group<User, typeof key>>;
        for (const item of data) {
          const k = String(item[key]);
          if (!acc[k]) {
            acc[k] = { key: item[key], items: [] };
          }
          acc[k].items.push(item);
        }
        return Object.values(acc);
      };

      const _result = query<User>(
        groupBy('city'),
        where('name', 'Alice')
      );
      
    });
  });

  describe('Функциональные тесты', () => {
    it('должен работать: where -> sort', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const sort: Sort<User> = (key) => (data) =>
        [...data].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -1;
          if (av > bv) return 1;
          return 0;
        });

      const search = query<User>(where('name', 'Alice'), sort('age'));

      const result = search(users);

      expect(result).toEqual([
        { id: 2, name: 'Alice', surname: 'Smith', age: 33, city: 'NY' },
        { id: 1, name: 'Alice', surname: 'Smith', age: 34, city: 'NY' },
        { id: 3, name: 'Alice', surname: 'Smith', age: 35, city: 'LA' },
      ]);
    });

    it('должен работать: where -> groupBy -> having', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const groupBy: GroupBy<User> = (key) => (data) => {
        const acc = {} as Record<string, Group<User, typeof key>>;
        for (const item of data) {
          const k = String(item[key]);
          if (!acc[k]) {
            acc[k] = { key: item[key], items: [] };
          }
          acc[k].items.push(item);
        }
        return Object.values(acc);
      };

      const having: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);

      const groupAndFilter = query<User>(
        where('surname', 'Smith'),
        groupBy('city'),
        having((group) => group.items.length > 1) as any
      );

      const grouped = (groupAndFilter as any)(users) as unknown as Group<User, 'city'>[];

      expect(grouped).toHaveLength(2);
      expect(grouped.every((g) => g.items.length > 1)).toBe(true);
    });
  });
});

