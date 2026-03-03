export type Transform<T> = (data: T[]) => T[]; //1. Transform

export type Where<T> = <K extends keyof T>( //2. Where
  key: K,
  value: T[K]
) => Transform<T>;

export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>; //3. Sort

export type Group<T, K extends keyof T> = { //4. Group
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>( //5. GroupBy
  key: K
) => (data: T[]) => Group<T, K>[];

export type GroupTransform<T, K extends keyof T> = ( //6. GroupTransform
  groups: Group<T, K>[]
) => Group<T, K>[];

export type Having<T> = <K extends keyof T>( //7. Having
  predicate: (group: Group<T, K>) => boolean
) => GroupTransform<T, K>;

export function query<T>( //8. Query
  ...steps: Array<any>
): Transform<T> {
  return (data: T[]) => {
    let result: any = data;
    
    for (const step of steps) {
      result = step(result);
    }
    
    return result;
  };
}

