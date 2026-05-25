const SESSION_KEY = 'capivara-session';

function sessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess-' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId()
    },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro de rede' }));
    throw new Error(err.error || 'Erro');
  }
  return res.json();
}

export const api = {
  spin: (bet) => request('/api/spin', { method: 'POST', body: JSON.stringify({ bet }) }),
  balance: () => request('/api/balance'),
  reset: () => request('/api/reset', { method: 'POST' })
};
