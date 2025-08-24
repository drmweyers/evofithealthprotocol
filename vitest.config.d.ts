/// <reference types="vitest" />

declare namespace Vitest {
  interface Global {
    vi: typeof import('vitest').vi;
  }
}