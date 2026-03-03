import { describe, it, expect } from 'vitest';
import type {
  Transform,
  Where,
  Sort,
  Group,
  GroupBy,
  GroupTransform,
  Having,
} from '../src/lab4';
import { query } from '../src/lab4';

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

describe('Типы и функции для трансформации данных', () => {
  describe('Where<T>', () => {
    it('должен фильтровать данные по ключу и значению', () => {
      const where: Where<User> = (key, value) => (data) =>
        data.filter((item) => item[key] === value);

      const result = where('name', 'Alice')(users);

      expect(result).toEqual([
        { id: 1, name: 'Alice', surname: 'Smith', age: 34, city: 'NY' },
        { id: 2, name: 'Alice', surname: 'Smith', age: 33, city: 'NY' },
        { id: 3, name: 'Alice', surname: 'Smith', age: 35, city: 'LA' },
      ]);
    });
  });

  describe('Sort<T>', () => {
    it('должен сортировать данные по ключу', () => {
      const sort: Sort<User> = (key) => (data) =>
        [...data].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return -1;
          if (av > bv) return 1;
          return 0;
        });

      const result = sort('age')(users);

      expect(result).toEqual([
        { id: 2, name: 'Alice', surname: 'Smith', age: 33, city: 'NY' },
        { id: 1, name: 'Alice', surname: 'Smith', age: 34, city: 'NY' },
        { id: 3, name: 'Alice', surname: 'Smith', age: 35, city: 'LA' },
        { id: 4, name: 'Bob', surname: 'Smith', age: 35, city: 'LA' },
      ]);
    });
  });

  describe('GroupBy<T>', () => {
    it('должен группировать данные по ключу', () => {
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

      const result = groupBy('city')(users);

      expect(result).toHaveLength(2);
      expect(result.find((g) => g.key === 'NY')?.items).toHaveLength(2);
      expect(result.find((g) => g.key === 'LA')?.items).toHaveLength(2);
    });
  });

  describe('Having<T>', () => {
    it('должен фильтровать группы по предикату', () => {
      const having: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);

      const groups: Group<User, 'city'>[] = [
        { key: 'NY', items: [users[0], users[1]] },
        { key: 'LA', items: [users[2]] },
      ];

      const result = having((group) => group.items.length > 1)(groups);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('NY');
    });
  });

  describe('query функция', () => {
    it('должен комбинировать where и sort', () => {
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

      const search = query<User>(
        where('name', 'Alice'),
        where('surname', 'Smith'),
        sort('age')
      );

      const result = search(users);

      expect(result).toEqual([
        { id: 2, name: 'Alice', surname: 'Smith', age: 33, city: 'NY' },
        { id: 1, name: 'Alice', surname: 'Smith', age: 34, city: 'NY' },
        { id: 3, name: 'Alice', surname: 'Smith', age: 35, city: 'LA' },
      ]);
    });

    it('должен комбинировать groupBy и having', () => {
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

      const havingCity: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);
      
      const groupAndFilter = query<User>(
        groupBy('city'),
        havingCity((group) => group.items.length > 1) as any
      );

      const grouped = groupAndFilter(users) as unknown as Group<User, 'city'>[];

      expect(grouped).toHaveLength(2);
      expect(grouped.every((g) => g.items.length > 1)).toBe(true);
    });

    it('должен комбинировать where, groupBy и having', () => {
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

      const havingCity: Having<User> = (predicate) => (groups) =>
        groups.filter(predicate);
      
      const pipeline = query<User>(
        where('surname', 'Smith'),
        groupBy('city'),
        havingCity((group) => group.items.some((u) => u.age > 34)) as any
      );

      const res = pipeline(users) as unknown as Group<User, 'city'>[];

      expect(res).toBeDefined();
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBeGreaterThan(0);
      expect(res[0]).toHaveProperty('key');
      expect(res[0]).toHaveProperty('items');
    });
  });
});

