const rawApiBase = "http://localhost:1234";

if (!rawApiBase) {
  throw new Error("Missing required VITE_API_URL environment variable.");
}

export const API_BASE = rawApiBase;

export const getWsUrl = (apiBase, roomId, clientId) => {
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const urlParams = new URL(apiBase);
  const wsUrl = `${wsProtocol}://${urlParams.host}?roomId=${roomId}&clientId=${clientId}`;
  console.log("FINAL WS URL:", wsUrl);
  return wsUrl;
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
