export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(
  key: K,
  value: T[K]
) => Transform<T>;

export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>(
  key: K
) => (data: T[]) => Group<T, K>[];

export type GroupTransform<T, K extends keyof T> = (
  groups: Group<T, K>[]
) => Group<T, K>[];

export type Having<T> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean
) => GroupTransform<T, K>;

type WhereStep<T> = Transform<T>;
type GroupByStep<T> = (data: T[]) => Group<T, keyof T>[];
type HavingStep<T> = GroupTransform<T, keyof T>;
type SortStep<T> = GroupTransform<T, keyof T> | Transform<T>;

export function query<T>(): Transform<T>;
export function query<T>(w1: WhereStep<T>): Transform<T>;
export function query<T>(w1: WhereStep<T>, w2: WhereStep<T>): Transform<T>;
export function query<T>(
  w1: WhereStep<T>,
  w2: WhereStep<T>,
  w3: WhereStep<T>
): Transform<T>;

// Явно запрещаем неправильный порядок - эти перегрузки должны быть после всех правильных
// чтобы TypeScript выбирал их только когда нет подходящей правильной перегрузки
export function query<T>(s1: SortStep<T>): never;
export function query<T>(s1: SortStep<T>, ...rest: any[]): never;
export function query<T>(g1: GroupByStep<T>, ...rest: any[]): never;
export function query<T>(w1: WhereStep<T>, h1: HavingStep<T>, ...rest: any[]): never;
export function query<T>(w1: WhereStep<T>, s1: SortStep<T>, g1: GroupByStep<T>, ...rest: any[]): never;

export function query<T>(w1: WhereStep<T>, s1: SortStep<T>): Transform<T>;
export function query<T>(
  w1: WhereStep<T>,
  s1: SortStep<T>,
  s2: SortStep<T>
): Transform<T>;
export function query<T>(
  w1: WhereStep<T>,
  s1: SortStep<T>,
  s2: SortStep<T>,
  s3: SortStep<T>
): Transform<T>;

export function query<T>(
  w1: WhereStep<T>,
  g1: GroupByStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  w2: WhereStep<T>,
  g1: GroupByStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  g1: GroupByStep<T>,
  h1: HavingStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  w2: WhereStep<T>,
  g1: GroupByStep<T>,
  h1: HavingStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  g1: GroupByStep<T>,
  h1: HavingStep<T>,
  h2: HavingStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  g1: GroupByStep<T>,
  s1: SortStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  g1: GroupByStep<T>,
  h1: HavingStep<T>,
  s1: SortStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  g1: GroupByStep<T>,
  h1: HavingStep<T>,
  s1: SortStep<T>,
  s2: SortStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(
  w1: WhereStep<T>,
  w2: WhereStep<T>,
  g1: GroupByStep<T>,
  h1: HavingStep<T>,
  s1: SortStep<T>
): (data: T[]) => Group<T, keyof T>[];

export function query<T>(...steps: Array<any>): any {
  return (data: T[]) => {
    let result: any = data;

    for (const step of steps) {
      result = step(result);
    }

    return result;
  };
}
