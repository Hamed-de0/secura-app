// Vitest setup for DOM + matchers
import '@testing-library/jest-dom';

// Ensure consistent timezone across tests (Europe/Berlin)
try {
  process.env.TZ = 'Europe/Berlin';
} catch {}

// Optional: silence console noise in tests
// const origError = console.error;
// console.error = (...args) => origError.apply(console, args);

