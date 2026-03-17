import { describe, it, expectTypeOf } from 'vitest';
import type { DeepReadonly, PickedByType, EventHandlers } from '../src/lab6';

describe('Lab6: Утилитарные типы', () => {
  describe('DeepReadonly<T>', () => {
    it('примитивы остаются как есть', () => {
      expectTypeOf<DeepReadonly<number>>().toEqualTypeOf<number>();
      expectTypeOf<DeepReadonly<string>>().toEqualTypeOf<string>();
      expectTypeOf<DeepReadonly<boolean>>().toEqualTypeOf<boolean>();
    });

    it('плоский объект становится readonly', () => {
      type Obj = { a: number; b: string };
      type ReadonlyObj = DeepReadonly<Obj>;
      expectTypeOf<ReadonlyObj>().toMatchTypeOf<{ readonly a: number; readonly b: string }>();
    });

    it('вложенные объекты рекурсивно readonly', () => {
      type Nested = { x: { y: number } };
      type ReadonlyNested = DeepReadonly<Nested>;
      expectTypeOf<ReadonlyNested>().toMatchTypeOf<{
        readonly x: { readonly y: number };
      }>();
    });

    it('массивы становятся readonly', () => {
      type Arr = number[];
      type ReadonlyArr = DeepReadonly<Arr>;
      expectTypeOf<ReadonlyArr>().toEqualTypeOf<readonly number[]>();
    });

    it('массив объектов — элементы readonly', () => {
      type ArrOfObj = { id: number }[];
      type R = DeepReadonly<ArrOfObj>;
      expectTypeOf<R>().toEqualTypeOf<readonly { readonly id: number }[]>();
    });
  });

  describe('PickedByType<T, U>', () => {
    it('выбирает только свойства заданного типа', () => {
      type Obj = { a: number; b: string; c: number };
      type Picked = PickedByType<Obj, number>;
      expectTypeOf<Picked>().toEqualTypeOf<{ a: number; c: number }>();
    });

    it('если нет совпадений — пустой объект', () => {
      type Obj = { a: number; b: string };
      type Picked = PickedByType<Obj, boolean>;
      expectTypeOf<Picked>().toEqualTypeOf<{}>();
    });

    it('все совпадают — весь объект', () => {
      type Obj = { a: string; b: string };
      type Picked = PickedByType<Obj, string>;
      expectTypeOf<Picked>().toEqualTypeOf<Obj>();
    });
  });

  describe('EventHandlers<T>', () => {
    it('генерирует onEventName из ключей объекта событий', () => {
      type Events = { click: MouseEvent; focus: FocusEvent };
      type Handlers = EventHandlers<Events>;
      expectTypeOf<Handlers>().toEqualTypeOf<{
        onClick: (event: MouseEvent) => void;
        onFocus: (event: FocusEvent) => void;
      }>();
    });

    it('один ключ — один обработчик', () => {
      type Events = { submit: SubmitEvent };
      type Handlers = EventHandlers<Events>;
      expectTypeOf<Handlers>().toEqualTypeOf<{
        onSubmit: (event: SubmitEvent) => void;
      }>();
    });
  });
});
