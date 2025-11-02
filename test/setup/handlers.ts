import { http, HttpResponse } from 'msw';

// Handlers are intentionally minimal; tests can extend per scenario.
export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true }))
];
