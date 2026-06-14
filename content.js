// content.js — Botón flotante que aparece en todos los campos de texto

const TONES = ["Formal", "Direct", "Persuasive", "Friendly"];
const LANG_LABELS = {
  es: "🇪🇸", en: "🇬🇧", fr: "🇫🇷", de: "🇩🇪",
  pt: "🇵🇹", it: "🇮🇹", nl: "🇳🇱", pl: "🇵🇱",
  ru: "🇷🇺", ja: "🇯🇵", zh: "🇨🇳", ar: "🇸🇦",
};

let btn         = null;
let activeField = null;
let lastRect    = null;
let settingsBar = null;
let currentTone = "Formal";
let currentLang = "es";
let isLoading   = false;

// ── Cargar preferencias guardadas y escuchar cambios en tiempo real ────────

chrome.storage.sync.get(["tone", "language"], ({ tone, language }) => {
  if (tone)     currentTone = tone;
  if (language) currentLang = language;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes.tone)     currentTone = changes.tone.newValue;
  if (changes.language) currentLang = changes.language.newValue;
});

// ── userId: generado una vez y persistido en storage ──────────────────────

let _userId = null;

async function getUserId() {
  if (_userId) return _userId;
  const stored = await chrome.storage.sync.get("userId");
  if (stored.userId) {
    _userId = stored.userId;
    return _userId;
  }
  // crypto.randomUUID() disponible en service workers y content scripts modernos
  const uid = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : "user_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await chrome.storage.sync.set({ userId: uid });
  _userId = uid;
  return _userId;
}

// ── Crear botón flotante ───────────────────────────────────────────────────

function createBtn() {
  if (btn) return;
  btn = document.createElement("div");
  btn.id = "prowrite-btn";
  btn.setAttribute("aria-label", "Mejorar texto con ProWrite AI");
  btn.innerHTML = `<span class="pw-icon">✨</span><span class="pw-text">ProWrite</span>`;
  btn.title = "Mejorar texto con IA (ProWrite)";
  document.body.appendChild(btn);

  btn.addEventListener("mousedown", e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) toggleSettings();
  });
}

function removeBtn() {
  if (btn) { btn.remove(); btn = null; }
  removeSettings();
}

function positionBtn(rect) {
  if (!btn) return;
  const scrollX = window.scrollX, scrollY = window.scrollY;
  // Mantener dentro de los límites de la ventana
  const left = Math.min(
    rect.right + scrollX - 110,
    document.documentElement.clientWidth + scrollX - 120
  );
  btn.style.left = `${Math.max(scrollX + 4, left)}px`;
  btn.style.top  = `${rect.bottom + scrollY + 4}px`;
  lastRect = rect;
}

// ── Barra de configuración (tono + idioma) ─────────────────────────────────

function removeSettings() {
  if (settingsBar) { settingsBar.remove(); settingsBar = null; }
}

function toggleSettings() {
  if (settingsBar) { removeSettings(); return; }

  settingsBar = document.createElement("div");
  settingsBar.id = "prowrite-settings";

  // Fila de tono
  const toneRow = document.createElement("div");
  toneRow.className = "pw-row";
  toneRow.innerHTML = `<span class="pw-label">Tono</span>`;
  TONES.forEach(t => {
    const b = document.createElement("button");
    b.className = "pw-chip" + (t === currentTone ? " pw-chip-active" : "");
    b.textContent = t;
    b.setAttribute("type", "button");
    b.addEventListener("mousedown", e => {
      e.preventDefault();
      currentTone = t;
      chrome.storage.sync.set({ tone: t });
      settingsBar.querySelectorAll(".pw-chip:not(.pw-chip-sm)").forEach(x => x.classList.remove("pw-chip-active"));
      b.classList.add("pw-chip-active");
    });
    toneRow.appendChild(b);
  });

  // Fila de idioma
  const langRow = document.createElement("div");
  langRow.className = "pw-row";
  langRow.innerHTML = `<span class="pw-label">Idioma</span>`;
  Object.entries(LANG_LABELS).forEach(([code, flag]) => {
    const b = document.createElement("button");
    b.className = "pw-chip pw-chip-sm" + (code === currentLang ? " pw-chip-active" : "");
    b.textContent = flag;
    b.title = code.toUpperCase();
    b.setAttribute("type", "button");
    b.addEventListener("mousedown", e => {
      e.preventDefault();
      currentLang = code;
      chrome.storage.sync.set({ language: code });
      settingsBar.querySelectorAll(".pw-chip-sm").forEach(x => x.classList.remove("pw-chip-active"));
      b.classList.add("pw-chip-active");
    });
    langRow.appendChild(b);
  });

  // Botón mejorar
  const improveBtn = document.createElement("button");
  improveBtn.className = "pw-improve-btn";
  improveBtn.textContent = "✨ Mejorar ahora";
  improveBtn.setAttribute("type", "button");
  improveBtn.addEventListener("mousedown", e => {
    e.preventDefault();
    removeSettings();
    doImprove();
  });

  settingsBar.appendChild(toneRow);
  settingsBar.appendChild(langRow);
  settingsBar.appendChild(improveBtn);
  document.body.appendChild(settingsBar);

  // Posicionar debajo del botón, ajustando si se sale por la derecha
  const bRect = btn.getBoundingClientRect();
  const sX = window.scrollX, sY = window.scrollY;
  const leftPos = bRect.left + sX;
  const maxLeft = document.documentElement.clientWidth + sX - 280;
  settingsBar.style.left = `${Math.min(leftPos, maxLeft)}px`;
  settingsBar.style.top  = `${bRect.bottom + sY + 4}px`;
}

// ── Mejorar texto ──────────────────────────────────────────────────────────

async function doImprove() {
  if (!activeField || isLoading) return;

  const text = getFieldText(activeField);
  if (!text.trim()) {
    showToast("⚠️ El campo está vacío", "error");
    return;
  }

  if (text.length > 5000) {
    showToast("⚠️ Texto demasiado largo (máx. 5000 caracteres)", "error");
    return;
  }

  isLoading = true;
  setLoading(true);

  const uid = await getUserId();

  chrome.runtime.sendMessage(
    { type: "IMPROVE_TEXT", payload: { userId: uid, text, tone: currentTone, language: currentLang } },
    res => {
      isLoading = false;
      setLoading(false);

      if (chrome.runtime.lastError || !res) {
        showToast("❌ No se pudo conectar con ProWrite. Recarga la página.", "error");
        return;
      }
      if (res.error) {
        showToast("❌ " + res.error, "error");
        return;
      }

      setFieldText(activeField, res.improved_text);
      addToHistory({ original: text, improved: res.improved_text, tone: currentTone, lang: currentLang });

      const rem = res.remaining;
      if (rem === -1) {
        showToast("✅ Mejorado (Pro — ilimitado)", "success");
      } else if (rem === 0) {
        showToast("✅ Mejorado — límite diario alcanzado (abre ProWrite para más)", "success");
      } else {
        showToast(`✅ Mejorado (${rem} uso${rem !== 1 ? "s" : ""} restante${rem !== 1 ? "s" : ""} hoy)`, "success");
      }
    }
  );
}

// ── Helpers de campo ───────────────────────────────────────────────────────

function getFieldText(el) {
  if (el.isContentEditable) return el.innerText || "";
  return el.value || "";
}

function setFieldText(el, text) {
  if (el.isContentEditable) {
    el.innerText = text;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, "value"
    )?.set || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, text);
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event("input",  { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

// ── Historial (últimas 20 mejoras en storage local) ────────────────────────

function addToHistory(entry) {
  chrome.storage.local.get("history", ({ history }) => {
    const h = Array.isArray(history) ? history : [];
    h.unshift({ ...entry, date: new Date().toISOString() });
    chrome.storage.local.set({ history: h.slice(0, 20) });
  });
}

// ── Toast de notificación ──────────────────────────────────────────────────

function showToast(msg, type = "info") {
  // Eliminar toasts previos para no apilar
  document.querySelectorAll(".pw-toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = `pw-toast pw-toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  // Animar entrada
  requestAnimationFrame(() => {
    requestAnimationFrame(() => t.classList.add("pw-toast-show"));
  });
  setTimeout(() => {
    t.classList.remove("pw-toast-show");
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ── Estado de carga ────────────────────────────────────────────────────────

function setLoading(on) {
  if (!btn) return;
  btn.querySelector(".pw-icon").textContent = on ? "⏳" : "✨";
  btn.querySelector(".pw-text").textContent = on ? "Mejorando…" : "ProWrite";
  btn.style.opacity       = on ? "0.7" : "1";
  btn.style.pointerEvents = on ? "none" : "auto";
}

// ── Helpers ───────────────────────────────────────────────────────────────

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Menú contextual ───────────────────────────────────────────────────────

let contextPanel    = null;
let savedField      = null;
let savedSelStart   = null;
let savedSelEnd     = null;
let savedRange      = null;

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "CONTEXT_MENU_LOADING") {
    // Guardar selección antes de que se pierda
    savedField = document.activeElement;
    if (savedField && (savedField.tagName === "TEXTAREA" || savedField.tagName === "INPUT")) {
      savedSelStart = savedField.selectionStart;
      savedSelEnd   = savedField.selectionEnd;
      savedRange    = null;
    } else if (savedField && savedField.isContentEditable) {
      const sel = window.getSelection();
      savedRange    = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      savedSelStart = null;
      savedSelEnd   = null;
    } else {
      savedField = savedSelStart = savedSelEnd = savedRange = null;
    }
    showContextPanel({ loading: true });
  }

  if (msg.type === "CONTEXT_MENU_RESULT") {
    showContextPanel({ improved: msg.improved, remaining: msg.remaining, is_pro: msg.is_pro });
  }

  if (msg.type === "CONTEXT_MENU_ERROR") {
    showContextPanel({ error: msg.error });
  }

  if (msg.type === "KEYBOARD_IMPROVE") {
    if (activeField && isTextField(activeField)) {
      const text = getFieldText(activeField);
      if (text.trim()) {
        doImprove();
      } else {
        showToast("⚠️ El campo de texto está vacío", "error");
      }
    } else {
      showToast("⌨️ Haz clic en un campo de texto primero", "error");
    }
  }
});

function showContextPanel({ loading = false, improved = null, error = null, remaining = null, is_pro = false } = {}) {
  if (contextPanel) { contextPanel.remove(); contextPanel = null; }

  const panel = document.createElement("div");
  panel.id = "prowrite-context-panel";

  let headerExtra = "";
  if (!loading && !error && remaining !== null) {
    const remText = is_pro ? "Pro ∞" : remaining === 0 ? "⚠ Límite" : `${remaining} restantes`;
    headerExtra = `<span class="pwcp-rem">${escHtml(remText)}</span>`;
  }

  const header = `
    <div class="pwcp-header">
      <span class="pwcp-title">✨ ProWrite AI</span>
      ${headerExtra}
      <button class="pwcp-close" aria-label="Cerrar">✕</button>
    </div>`;

  if (loading) {
    panel.innerHTML = header + `<div class="pwcp-loading"><span class="pwcp-spinner">⏳</span> Mejorando texto…</div>`;
  } else if (error) {
    panel.innerHTML = header + `<div class="pwcp-error">❌ ${escHtml(error)}</div>`;
  } else {
    panel.innerHTML = header + `
      <div class="pwcp-result">${escHtml(improved)}</div>
      <div class="pwcp-actions">
        <button class="pwcp-btn pwcp-copy">📋 Copiar</button>
        <button class="pwcp-btn pwcp-insert">↙ Insertar</button>
      </div>`;
  }

  document.body.appendChild(panel);
  contextPanel = panel;

  panel.querySelector(".pwcp-close").addEventListener("click", () => {
    panel.remove();
    contextPanel = null;
  });

  if (!loading && !error && improved) {
    panel.querySelector(".pwcp-copy").addEventListener("click", () => {
      navigator.clipboard.writeText(improved).then(() => {
        const b = panel.querySelector(".pwcp-copy");
        b.textContent = "✅ Copiado";
        setTimeout(() => { b.textContent = "📋 Copiar"; }, 1500);
      });
    });

    panel.querySelector(".pwcp-insert").addEventListener("click", () => {
      const inserted = insertImproved(improved);
      if (inserted) {
        showToast("✅ Texto insertado", "success");
      } else {
        navigator.clipboard.writeText(improved).then(() => {
          showToast("📋 Copiado al portapapeles", "success");
        });
      }
      panel.remove();
      contextPanel = null;
    });
  }
}

function insertImproved(text) {
  if (savedField && (savedField.tagName === "TEXTAREA" || savedField.tagName === "INPUT")
      && savedSelStart !== null) {
    const val    = savedField.value;
    const newVal = val.substring(0, savedSelStart) + text + val.substring(savedSelEnd);
    setFieldText(savedField, newVal);
    try {
      savedField.focus();
      savedField.selectionStart = savedField.selectionEnd = savedSelStart + text.length;
    } catch (_) { /* campo ya no accesible */ }
    return true;
  }
  if (savedField && savedField.isContentEditable && savedRange) {
    try {
      savedField.focus();
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
      savedRange.deleteContents();
      savedRange.insertNode(document.createTextNode(text));
      sel.collapseToEnd();
      savedField.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    } catch (_) { /* DOM cambió */ }
  }
  return false;
}

// ── Detectar foco en campos de texto ──────────────────────────────────────

function isTextField(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName === "INPUT") {
    const t = (el.type || "text").toLowerCase();
    return ["text", "search", "email", "url"].includes(t);
  }
  return false;
}

document.addEventListener("focusin", e => {
  if (isTextField(e.target)) {
    activeField = e.target;
    createBtn();
    positionBtn(e.target.getBoundingClientRect());
  }
}, true);

document.addEventListener("focusout", e => {
  setTimeout(() => {
    const focused = document.activeElement;
    if (btn && (btn.contains(focused) || (settingsBar && settingsBar.contains(focused)))) return;
    if (!isTextField(focused)) {
      removeBtn();
      activeField = null;
    }
  }, 150);
}, true);

// Reposicionar al hacer scroll o resize
window.addEventListener("scroll", () => {
  if (activeField && btn) positionBtn(activeField.getBoundingClientRect());
}, { passive: true });

window.addEventListener("resize", () => {
  if (activeField && btn) positionBtn(activeField.getBoundingClientRect());
}, { passive: true });
