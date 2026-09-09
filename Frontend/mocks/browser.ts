/**
 * MSW browser worker setup.
 * TODO (Task 13): DELETE this file along with the rest of mocks/ when backend-v2 is live.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
