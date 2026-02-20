import { vi } from "vitest";

// В `src/lab1.ts` есть top-level console.log (демо), чтобы тесты не шумели — глушим.
vi.spyOn(console, "log").mockImplementation(() => {});

