import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { startMocks } from './mocks';
import App from './App';
import './styles/tokens.css';
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[REACT_ERROR_BOUNDARY_CAUGHT]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#ff6b6b', padding: 24, background: '#111', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Application Render Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#ffd166' }}>
            {this.state.error?.stack || String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function mountApp() {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Start MSW mock service worker if VITE_USE_MOCKS=true.
// Ensure app always mounts even if mock registration encounters issues
startMocks()
  .catch((err) => {
    console.warn('[MSW] startMocks deferred or failed:', err);
  })
  .finally(() => {
    mountApp();
  });

