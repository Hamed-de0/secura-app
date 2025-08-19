import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Auto-cleanup between tests so previous renders don't leak into the next one
afterEach(() => cleanup());

// Polyfills (keep these)
Object.assign(navigator, {
  clipboard: {
    writeText: async () => {},
    readText: async () => '',
  },
});

// atob/btoa shims for base64url helpers if missing
// @ts-ignore
globalThis.atob ??= (input: string) => Buffer.from(input, 'base64').toString('binary');
// @ts-ignore
globalThis.btoa ??= (input: string) => Buffer.from(input, 'binary').toString('base64');
