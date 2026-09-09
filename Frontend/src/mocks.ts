/**
 * Conditional MSW startup.
 * Import and call `startMocks()` in main.tsx before rendering.
 *
 * TODO (Task 13): DELETE this file and its import in main.tsx once backend-v2 is live.
 */

export async function startMocks(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return;

  const { worker } = await import('../mocks/browser');
  await worker.start({
    onUnhandledRequest: 'warn',   // warn in console if a real request slips through unhandled
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
  console.info('[MSW] Mock service worker started. All API calls are intercepted by mocks/handlers.ts');
}
