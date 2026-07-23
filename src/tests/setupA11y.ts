import { expect } from 'vitest';
import type { AxeMatchers } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
}

expect.extend(matchers);
