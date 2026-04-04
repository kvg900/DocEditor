const rawApiBase = import.meta.env.VITE_API_URL;

if (!rawApiBase) {
  throw new Error('Missing required VITE_API_URL environment variable.');
}

export const API_BASE = rawApiBase;

export const getWsUrl = (apiBase, roomId, clientId) => {
  const url = new URL(apiBase);

  if (url.protocol === 'https:') {
    url.protocol = 'wss:';
  } else if (url.protocol === 'http:') {
    url.protocol = 'ws:';
  }

  return `${url.origin}?roomId=${roomId}&clientId=${clientId}`;
};

export const safeJson = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};