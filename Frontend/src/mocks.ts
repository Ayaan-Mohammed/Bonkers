/**
 * Conditional MSW startup.
 * Import and call `startMocks()` in main.tsx before rendering.
 *
 * TODO (Task 13): DELETE this file and its import in main.tsx once backend-v2 is live.
 */

export async function startMocks(): Promise<void> {
  const isVercel =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('bonkers') ||
      window.location.hostname.includes('netlify'));

  const shouldMock = import.meta.env.VITE_USE_MOCKS === 'true' || isVercel;
  if (!shouldMock) return;

  try {
    const { worker } = await import('../mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.info('[MSW] Mock service worker active. Intercepting API calls for preview/demo.');
  } catch (err) {
    console.warn('[MSW] Service worker registration deferred:', err);
  }
}

