// background.js — Service Worker de ProWrite AI
// Gestiona comunicación entre popup, content script y API

// Desarrollo local: "http://localhost:8000"
// Producción: reemplaza con tu URL de Vercel tras el deploy
const API_BASE = "https://prowrite-backend-ds5o.onrender.com";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "IMPROVE_TEXT") {
    handleImprove(msg.payload).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; // async response
  }

  if (msg.type === "GET_USAGE") {
    fetch(`${API_BASE}/usage/${msg.userId}`)
      .then(r => r.json())
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (msg.type === "GET_LANGUAGES") {
    fetch(`${API_BASE}/languages`)
      .then(r => r.json())
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleImprove({ userId, text, tone, language }) {
  const res = await fetch(`${API_BASE}/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, text, tone, language }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}
