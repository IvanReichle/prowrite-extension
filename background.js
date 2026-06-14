// background.js — Service Worker de ProWrite AI

const API_BASE = "https://prowrite-backend-ds5o.onrender.com";

const CONTEXT_MENU_TITLES = {
  es: "✨ Mejorar con ProWrite AI",
  en: "✨ Improve with ProWrite AI",
  fr: "✨ Améliorer avec ProWrite AI",
  de: "✨ Mit ProWrite AI verbessern",
  pt: "✨ Melhorar com ProWrite AI",
  it: "✨ Migliora con ProWrite AI",
  nl: "✨ Verbeteren met ProWrite AI",
  pl: "✨ Ulepsz z ProWrite AI",
  ru: "✨ Улучшить с ProWrite AI",
  ja: "✨ ProWrite AIで改善",
  zh: "✨ 用ProWrite AI改进",
  ar: "✨ تحسين مع ProWrite AI",
};

// Create context menu on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("language", ({ language }) => {
    const title = CONTEXT_MENU_TITLES[language] || CONTEXT_MENU_TITLES.es;
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "prowrite-improve",
        title,
        contexts: ["selection"],
      });
    });
  });
});

// Update context menu title when language changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.language) {
    const lang = changes.language.newValue;
    const title = CONTEXT_MENU_TITLES[lang] || CONTEXT_MENU_TITLES.es;
    chrome.contextMenus.update("prowrite-improve", { title });
  }
});

// Context menu click → improve selected text
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "prowrite-improve") return;
  const text = info.selectionText?.trim();
  if (!text) return;

  chrome.tabs.sendMessage(tab.id, { type: "CONTEXT_MENU_LOADING" });

  try {
    const stored = await chrome.storage.sync.get(["userId", "tone", "language"]);
    const uid      = stored.userId   || generateId();
    const tone     = stored.tone     || "Formal";
    const language = stored.language || "es";

    if (!stored.userId) chrome.storage.sync.set({ userId: uid });

    const result = await handleImprove({ userId: uid, text, tone, language });
    chrome.tabs.sendMessage(tab.id, {
      type: "CONTEXT_MENU_RESULT",
      improved:   result.improved_text,
      remaining:  result.remaining,
      is_pro:     result.is_pro,
    });
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, { type: "CONTEXT_MENU_ERROR", error: err.message });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "IMPROVE_TEXT") {
    handleImprove(msg.payload).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true;
  }

  if (msg.type === "GET_USAGE") {
    fetch(`${API_BASE}/usage/${msg.userId}`)
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

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "user_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
