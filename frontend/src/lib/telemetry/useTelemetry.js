export default function useTelemetry(
  enabled = (import.meta?.env?.VITE_TELEMETRY ?? 'false') === 'true'
) {
  function track(event, payload = {}) {
    if (!enabled) return;
    // Keep it simple & dev-only
    // eslint-disable-next-line no-console
    console.debug(`[telemetry] ${event}`, payload);
  }
  return { track };
}
