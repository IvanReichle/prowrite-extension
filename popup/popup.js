// popup.js

const FREE_LIMIT = 10;
const MAX_CHARS  = 5000;

// ── Tabs ───────────────────────────────────────────────────────────────────

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    if (tab.dataset.tab === "history") renderHistory();
  });
});

// ── Cargar preferencias ────────────────────────────────────────────────────

chrome.storage.sync.get(["tone", "language", "userId"], ({ tone, language, userId }) => {
  if (tone)     document.getElementById("toneSelect").value = tone;
  if (language) document.getElementById("langSelect").value = language;
  if (userId)   document.getElementById("userIdInput").value = userId;
  const uid = userId || generateId();
  if (!userId) chrome.storage.sync.set({ userId: uid });
  loadUsage(uid);
});

document.getElementById("toneSelect").addEventListener("change", e => {
  chrome.storage.sync.set({ tone: e.target.value });
});
document.getElementById("langSelect").addEventListener("change", e => {
  chrome.storage.sync.set({ language: e.target.value });
});

// ── Contador de caracteres ─────────────────────────────────────────────────

const inputText   = document.getElementById("inputText");
const charCounter = document.getElementById("charCounter");

inputText.addEventListener("input", () => {
  const len = inputText.value.length;
  charCounter.textContent = `${len} / ${MAX_CHARS}`;
  charCounter.classList.toggle("warn", len > MAX_CHARS * 0.9);
});

// ── Uso diario ─────────────────────────────────────────────────────────────

function loadUsage(userId) {
  chrome.runtime.sendMessage({ type: "GET_USAGE", userId }, res => {
    if (chrome.runtime.lastError || !res) return;
    if (!res.error) updateUsageBar(res);
  });
}

function updateUsageBar({ remaining, is_pro }) {
  const label  = document.getElementById("usageLabel");
  const fill   = document.getElementById("usageFill");
  const banner = document.getElementById("upgradeBanner");
  const accSt  = document.getElementById("accountStatus");
  const proTag = document.getElementById("proTag");
  const upgBtn = document.getElementById("upgradeBtn");

  if (is_pro) {
    label.textContent    = "PRO — usos ilimitados ✨";
    fill.style.width     = "100%";
    fill.style.background = "#fbbf24";
    accSt.innerHTML      = 'Plan <span class="pro-badge">PRO</span> activo';
    proTag.innerHTML     = '<span class="pro-badge">PRO</span>';
    banner.style.display = "none";
    upgBtn.style.display = "none";
  } else {
    const used = FREE_LIMIT - Math.max(0, remaining);
    const pct  = Math.min((used / FREE_LIMIT) * 100, 100);
    label.textContent    = `${remaining} uso${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""} hoy (Free)`;
    fill.style.width     = `${pct}%`;
    fill.style.background = pct >= 90 ? "#f87171" : "#a5b4fc";
    accSt.textContent    = `Plan Free — ${remaining} mejoras restantes hoy`;
    proTag.innerHTML     = "";

    if (remaining === 0) {
      banner.style.display = "block";
      upgBtn.style.display  = "block";
    } else {
      banner.style.display  = "none";
      upgBtn.style.display  = "none";
    }
  }
}

// ── Mejorar texto ──────────────────────────────────────────────────────────

document.getElementById("improveBtn").addEventListener("click", async () => {
  const text = inputText.value.trim();
  if (!text) return;
  if (text.length > MAX_CHARS) {
    document.getElementById("errorMsg").textContent =
      `⚠️ Texto demasiado largo (máx. ${MAX_CHARS} caracteres)`;
    return;
  }

  const tone     = document.getElementById("toneSelect").value;
  const language = document.getElementById("langSelect").value;
  const { userId } = await chrome.storage.sync.get("userId");
  const uid = userId || generateId();
  if (!userId) chrome.storage.sync.set({ userId: uid });

  const btn = document.getElementById("improveBtn");
  btn.disabled    = true;
  btn.textContent = "⏳ Mejorando…";
  document.getElementById("errorMsg").textContent = "";
  document.getElementById("resultBox").classList.remove("show");
  document.getElementById("resultActions").classList.remove("show");

  chrome.runtime.sendMessage(
    { type: "IMPROVE_TEXT", payload: { userId: uid, text, tone, language } },
    res => {
      btn.disabled    = false;
      btn.textContent = "✨ Mejorar texto";

      if (chrome.runtime.lastError || !res) {
        document.getElementById("errorMsg").textContent =
          "❌ No se pudo conectar con ProWrite. Recarga la extensión.";
        return;
      }
      if (res.error) {
        document.getElementById("errorMsg").textContent = "❌ " + res.error;
        return;
      }

      const box = document.getElementById("resultBox");
      box.textContent = res.improved_text;
      box.classList.add("show");
      document.getElementById("resultActions").classList.add("show");
      loadUsage(uid);

      // Guardar en historial
      addToHistory({ original: text, improved: res.improved_text, tone, lang: language });
    }
  );
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("resultBox").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "✅ Copiado";
    setTimeout(() => { btn.textContent = "📋 Copiar"; }, 1500);
  });
});

document.getElementById("useBtn").addEventListener("click", () => {
  const improved = document.getElementById("resultBox").textContent;
  inputText.value = improved;
  const len = improved.length;
  charCounter.textContent = `${len} / ${MAX_CHARS}`;
  charCounter.classList.toggle("warn", len > MAX_CHARS * 0.9);
  document.getElementById("resultBox").classList.remove("show");
  document.getElementById("resultActions").classList.remove("show");
  inputText.focus();
});

// ── Upgrade banner / botón ─────────────────────────────────────────────────

const STRIPE_URL = "https://buy.stripe.com/5kQ00lgN54ENfxidNQa3u00";

function openStripe() { chrome.tabs.create({ url: STRIPE_URL }); }

document.getElementById("headerProBtn").addEventListener("click", openStripe);
document.getElementById("upgradeBanner").addEventListener("click", openStripe);
document.getElementById("upgradeBtn").addEventListener("click", openStripe);

// ── Historial ──────────────────────────────────────────────────────────────

function addToHistory(entry) {
  chrome.storage.local.get("history", ({ history }) => {
    const h = Array.isArray(history) ? history : [];
    h.unshift({ ...entry, date: new Date().toISOString() });
    chrome.storage.local.set({ history: h.slice(0, 20) });
  });
}

function renderHistory() {
  chrome.storage.local.get("history", ({ history }) => {
    const list = document.getElementById("historyList");
    if (!history || !history.length) {
      list.innerHTML = '<div class="empty">Sin historial aún</div>';
      return;
    }
    list.innerHTML = history.map((h, i) => `
      <div class="history-item" data-idx="${i}">
        <div class="history-meta">${formatDate(h.date)} · ${escHtml(h.tone)} · ${escHtml((h.lang || "es").toUpperCase())}</div>
        <div class="history-orig">▶ ${escHtml(h.original)}</div>
        <div class="history-imp">✨ ${escHtml(h.improved)}</div>
      </div>
    `).join("");

    list.querySelectorAll(".history-item").forEach(el => {
      el.addEventListener("click", () => {
        const idx  = parseInt(el.dataset.idx, 10);
        const item = history[idx];
        inputText.value = item.original;
        charCounter.textContent = `${item.original.length} / ${MAX_CHARS}`;
        const box = document.getElementById("resultBox");
        box.textContent = item.improved;
        box.classList.add("show");
        document.getElementById("resultActions").classList.add("show");
        document.querySelectorAll(".tab")[0].click();
      });
    });
  });
}

document.getElementById("clearHistory").addEventListener("click", () => {
  chrome.storage.local.set({ history: [] }, () => renderHistory());
});

// ── Settings ───────────────────────────────────────────────────────────────

document.getElementById("saveUserId").addEventListener("click", () => {
  const uid = document.getElementById("userIdInput").value.trim();
  if (!uid) return;
  chrome.storage.sync.set({ userId: uid }, () => loadUsage(uid));
  const btn = document.getElementById("saveUserId");
  btn.textContent = "✔ Guardado";
  setTimeout(() => { btn.textContent = "Guardar"; }, 1500);
});

// ── Utils ──────────────────────────────────────────────────────────────────

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "user_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) +
         " " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
