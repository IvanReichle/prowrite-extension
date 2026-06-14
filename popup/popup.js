// popup.js

const FREE_LIMIT = 10;
const MAX_CHARS  = 5000;
const STRIPE_URL = "https://buy.stripe.com/5kQ00lgN54ENfxidNQa3u00";

// ── i18n ───────────────────────────────────────────────────────────────────

const I18N = {
  es: {
    tabImprove: "✨ Mejorar", tabHistory: "🕘 Historial", tabConfig: "⚙️ Config",
    labelTone: "Tono", labelLang: "Idioma",
    placeholder: "Escribe o pega el texto a mejorar…",
    btnImprove: "✨ Mejorar texto", btnLoading: "⏳ Mejorando…",
    btnCopy: "📋 Copiar", btnCopied: "✅ Copiado",
    btnUse: "↙ Usar como entrada",
    emptyHistory: "Sin historial aún",
    labelUserId: "User ID", labelAccount: "Estado de cuenta", labelClearHistory: "Limpiar historial",
    btnSave: "Guardar", btnSaved: "✔ Guardado",
    btnClearHistory: "🗑 Borrar historial",
    btnUpgrade: "⚡ Obtener Pro — Usos ilimitados",
    upgradeBanner: "⚡ Límite alcanzado — Haz clic para conseguir Pro ilimitado",
    headerPro: "⚡ Pro",
    usageLoading: "Cargando uso…",
    usageFree: r => `${r} uso${r !== 1 ? "s" : ""} restante${r !== 1 ? "s" : ""} hoy (Free)`,
    usagePro: "PRO — usos ilimitados ✨",
    accountFree: r => `Plan Free — ${r} mejoras restantes hoy`,
    accountPro: "Plan PRO activo",
    tones: { Formal: "Formal", Direct: "Directo", Persuasive: "Persuasivo", Friendly: "Amigable" },
    errTooLong: m => `⚠️ Texto demasiado largo (máx. ${m} caracteres)`,
    errConnect: "❌ No se pudo conectar con ProWrite. Recarga la extensión.",
    errUnexpected: "Respuesta inesperada del servidor. Inténtalo de nuevo.",
  },
  en: {
    tabImprove: "✨ Improve", tabHistory: "🕘 History", tabConfig: "⚙️ Settings",
    labelTone: "Tone", labelLang: "Language",
    placeholder: "Write or paste the text to improve…",
    btnImprove: "✨ Improve text", btnLoading: "⏳ Improving…",
    btnCopy: "📋 Copy", btnCopied: "✅ Copied",
    btnUse: "↙ Use as input",
    emptyHistory: "No history yet",
    labelUserId: "User ID", labelAccount: "Account status", labelClearHistory: "Clear history",
    btnSave: "Save", btnSaved: "✔ Saved",
    btnClearHistory: "🗑 Clear history",
    btnUpgrade: "⚡ Get Pro — Unlimited",
    upgradeBanner: "⚡ Limit reached — Click to get unlimited Pro",
    headerPro: "⚡ Pro",
    usageLoading: "Loading…",
    usageFree: r => `${r} use${r !== 1 ? "s" : ""} left today (Free)`,
    usagePro: "PRO — unlimited ✨",
    accountFree: r => `Free plan — ${r} improvements left today`,
    accountPro: "PRO plan active",
    tones: { Formal: "Formal", Direct: "Direct", Persuasive: "Persuasive", Friendly: "Friendly" },
    errTooLong: m => `⚠️ Text too long (max ${m} characters)`,
    errConnect: "❌ Could not connect to ProWrite. Reload the extension.",
    errUnexpected: "Unexpected server response. Please try again.",
  },
  fr: {
    tabImprove: "✨ Améliorer", tabHistory: "🕘 Historique", tabConfig: "⚙️ Config",
    labelTone: "Ton", labelLang: "Langue",
    placeholder: "Écrivez ou collez le texte à améliorer…",
    btnImprove: "✨ Améliorer le texte", btnLoading: "⏳ Amélioration…",
    btnCopy: "📋 Copier", btnCopied: "✅ Copié",
    btnUse: "↙ Utiliser comme entrée",
    emptyHistory: "Aucun historique",
    labelUserId: "User ID", labelAccount: "Statut du compte", labelClearHistory: "Effacer l'historique",
    btnSave: "Sauvegarder", btnSaved: "✔ Sauvegardé",
    btnClearHistory: "🗑 Effacer",
    btnUpgrade: "⚡ Obtenir Pro — Illimité",
    upgradeBanner: "⚡ Limite atteinte — Cliquez pour Pro illimité",
    headerPro: "⚡ Pro",
    usageLoading: "Chargement…",
    usageFree: r => `${r} utilisation${r !== 1 ? "s" : ""} restante${r !== 1 ? "s" : ""} (Free)`,
    usagePro: "PRO — illimité ✨",
    accountFree: r => `Plan Free — ${r} améliorations restantes`,
    accountPro: "Plan PRO actif",
    tones: { Formal: "Formel", Direct: "Direct", Persuasive: "Persuasif", Friendly: "Amical" },
    errTooLong: m => `⚠️ Texte trop long (max ${m} caractères)`,
    errConnect: "❌ Impossible de se connecter à ProWrite.",
    errUnexpected: "Réponse inattendue du serveur.",
  },
  de: {
    tabImprove: "✨ Verbessern", tabHistory: "🕘 Verlauf", tabConfig: "⚙️ Einstellungen",
    labelTone: "Ton", labelLang: "Sprache",
    placeholder: "Text zum Verbessern eingeben oder einfügen…",
    btnImprove: "✨ Text verbessern", btnLoading: "⏳ Wird verbessert…",
    btnCopy: "📋 Kopieren", btnCopied: "✅ Kopiert",
    btnUse: "↙ Als Eingabe verwenden",
    emptyHistory: "Noch kein Verlauf",
    labelUserId: "User ID", labelAccount: "Kontostatus", labelClearHistory: "Verlauf löschen",
    btnSave: "Speichern", btnSaved: "✔ Gespeichert",
    btnClearHistory: "🗑 Löschen",
    btnUpgrade: "⚡ Pro holen — Unbegrenzt",
    upgradeBanner: "⚡ Limit erreicht — Klicken für unbegrenztes Pro",
    headerPro: "⚡ Pro",
    usageLoading: "Laden…",
    usageFree: r => `${r} Verwendung${r !== 1 ? "en" : ""} übrig (Free)`,
    usagePro: "PRO — unbegrenzt ✨",
    accountFree: r => `Free-Plan — noch ${r} Verbesserungen`,
    accountPro: "PRO-Plan aktiv",
    tones: { Formal: "Formell", Direct: "Direkt", Persuasive: "Überzeugend", Friendly: "Freundlich" },
    errTooLong: m => `⚠️ Text zu lang (max. ${m} Zeichen)`,
    errConnect: "❌ Verbindung zu ProWrite fehlgeschlagen.",
    errUnexpected: "Unerwartete Serverantwort.",
  },
  pt: {
    tabImprove: "✨ Melhorar", tabHistory: "🕘 Histórico", tabConfig: "⚙️ Config",
    labelTone: "Tom", labelLang: "Idioma",
    placeholder: "Escreva ou cole o texto a melhorar…",
    btnImprove: "✨ Melhorar texto", btnLoading: "⏳ Melhorando…",
    btnCopy: "📋 Copiar", btnCopied: "✅ Copiado",
    btnUse: "↙ Usar como entrada",
    emptyHistory: "Sem histórico ainda",
    labelUserId: "User ID", labelAccount: "Estado da conta", labelClearHistory: "Limpar histórico",
    btnSave: "Salvar", btnSaved: "✔ Salvo",
    btnClearHistory: "🗑 Apagar histórico",
    btnUpgrade: "⚡ Obter Pro — Ilimitado",
    upgradeBanner: "⚡ Limite atingido — Clique para Pro ilimitado",
    headerPro: "⚡ Pro",
    usageLoading: "Carregando…",
    usageFree: r => `${r} uso${r !== 1 ? "s" : ""} restante${r !== 1 ? "s" : ""} hoje (Free)`,
    usagePro: "PRO — ilimitado ✨",
    accountFree: r => `Plano Free — ${r} melhorias restantes`,
    accountPro: "Plano PRO ativo",
    tones: { Formal: "Formal", Direct: "Direto", Persuasive: "Persuasivo", Friendly: "Amigável" },
    errTooLong: m => `⚠️ Texto muito longo (máx. ${m} caracteres)`,
    errConnect: "❌ Não foi possível conectar ao ProWrite.",
    errUnexpected: "Resposta inesperada do servidor.",
  },
  it: {
    tabImprove: "✨ Migliorare", tabHistory: "🕘 Cronologia", tabConfig: "⚙️ Config",
    labelTone: "Tono", labelLang: "Lingua",
    placeholder: "Scrivi o incolla il testo da migliorare…",
    btnImprove: "✨ Migliora testo", btnLoading: "⏳ Migliorando…",
    btnCopy: "📋 Copia", btnCopied: "✅ Copiato",
    btnUse: "↙ Usa come input",
    emptyHistory: "Nessuna cronologia",
    labelUserId: "User ID", labelAccount: "Stato account", labelClearHistory: "Cancella cronologia",
    btnSave: "Salva", btnSaved: "✔ Salvato",
    btnClearHistory: "🗑 Cancella",
    btnUpgrade: "⚡ Ottieni Pro — Illimitato",
    upgradeBanner: "⚡ Limite raggiunto — Clicca per Pro illimitato",
    headerPro: "⚡ Pro",
    usageLoading: "Caricamento…",
    usageFree: r => `${r} uso${r !== 1 ? "i" : ""} rimanente${r !== 1 ? "i" : ""} (Free)`,
    usagePro: "PRO — illimitato ✨",
    accountFree: r => `Piano Free — ${r} miglioramenti rimasti`,
    accountPro: "Piano PRO attivo",
    tones: { Formal: "Formale", Direct: "Diretto", Persuasive: "Persuasivo", Friendly: "Amichevole" },
    errTooLong: m => `⚠️ Testo troppo lungo (max ${m} caratteri)`,
    errConnect: "❌ Impossibile connettersi a ProWrite.",
    errUnexpected: "Risposta inaspettata dal server.",
  },
  nl: {
    tabImprove: "✨ Verbeteren", tabHistory: "🕘 Geschiedenis", tabConfig: "⚙️ Instellingen",
    labelTone: "Toon", labelLang: "Taal",
    placeholder: "Schrijf of plak de tekst om te verbeteren…",
    btnImprove: "✨ Tekst verbeteren", btnLoading: "⏳ Bezig…",
    btnCopy: "📋 Kopiëren", btnCopied: "✅ Gekopieerd",
    btnUse: "↙ Gebruik als invoer",
    emptyHistory: "Nog geen geschiedenis",
    labelUserId: "User ID", labelAccount: "Accountstatus", labelClearHistory: "Geschiedenis wissen",
    btnSave: "Opslaan", btnSaved: "✔ Opgeslagen",
    btnClearHistory: "🗑 Wissen",
    btnUpgrade: "⚡ Pro halen — Onbeperkt",
    upgradeBanner: "⚡ Limiet bereikt — Klik voor onbeperkt Pro",
    headerPro: "⚡ Pro",
    usageLoading: "Laden…",
    usageFree: r => `${r} gebruik${r !== 1 ? "en" : ""} over (Free)`,
    usagePro: "PRO — onbeperkt ✨",
    accountFree: r => `Gratis plan — ${r} verbeteringen over`,
    accountPro: "PRO plan actief",
    tones: { Formal: "Formeel", Direct: "Direct", Persuasive: "Overtuigend", Friendly: "Vriendelijk" },
    errTooLong: m => `⚠️ Tekst te lang (max ${m} tekens)`,
    errConnect: "❌ Kan geen verbinding maken met ProWrite.",
    errUnexpected: "Onverwacht serverantwoord.",
  },
  pl: {
    tabImprove: "✨ Ulepszyć", tabHistory: "🕘 Historia", tabConfig: "⚙️ Ustawienia",
    labelTone: "Ton", labelLang: "Język",
    placeholder: "Wpisz lub wklej tekst do ulepszenia…",
    btnImprove: "✨ Ulepsz tekst", btnLoading: "⏳ Ulepszanie…",
    btnCopy: "📋 Kopiuj", btnCopied: "✅ Skopiowano",
    btnUse: "↙ Użyj jako wejście",
    emptyHistory: "Brak historii",
    labelUserId: "User ID", labelAccount: "Status konta", labelClearHistory: "Wyczyść historię",
    btnSave: "Zapisz", btnSaved: "✔ Zapisano",
    btnClearHistory: "🗑 Wyczyść",
    btnUpgrade: "⚡ Kup Pro — Bez limitu",
    upgradeBanner: "⚡ Limit osiągnięty — Kliknij dla Pro bez limitu",
    headerPro: "⚡ Pro",
    usageLoading: "Ładowanie…",
    usageFree: r => `${r} użyć pozostało (Free)`,
    usagePro: "PRO — bez limitu ✨",
    accountFree: r => `Plan Free — ${r} ulepszeń pozostało`,
    accountPro: "Plan PRO aktywny",
    tones: { Formal: "Formalny", Direct: "Bezpośredni", Persuasive: "Przekonujący", Friendly: "Przyjazny" },
    errTooLong: m => `⚠️ Tekst za długi (maks. ${m} znaków)`,
    errConnect: "❌ Nie można połączyć z ProWrite.",
    errUnexpected: "Nieoczekiwana odpowiedź serwera.",
  },
  ru: {
    tabImprove: "✨ Улучшить", tabHistory: "🕘 История", tabConfig: "⚙️ Настройки",
    labelTone: "Тон", labelLang: "Язык",
    placeholder: "Введите или вставьте текст для улучшения…",
    btnImprove: "✨ Улучшить текст", btnLoading: "⏳ Улучшаем…",
    btnCopy: "📋 Копировать", btnCopied: "✅ Скопировано",
    btnUse: "↙ Использовать как ввод",
    emptyHistory: "История пуста",
    labelUserId: "User ID", labelAccount: "Статус аккаунта", labelClearHistory: "Очистить историю",
    btnSave: "Сохранить", btnSaved: "✔ Сохранено",
    btnClearHistory: "🗑 Очистить",
    btnUpgrade: "⚡ Получить Pro — Без ограничений",
    upgradeBanner: "⚡ Лимит достигнут — Нажмите для Pro без ограничений",
    headerPro: "⚡ Pro",
    usageLoading: "Загрузка…",
    usageFree: r => `${r} использований осталось (Free)`,
    usagePro: "PRO — без ограничений ✨",
    accountFree: r => `Бесплатный план — ${r} улучшений осталось`,
    accountPro: "PRO план активен",
    tones: { Formal: "Формальный", Direct: "Прямой", Persuasive: "Убедительный", Friendly: "Дружелюбный" },
    errTooLong: m => `⚠️ Текст слишком длинный (макс. ${m} символов)`,
    errConnect: "❌ Не удалось подключиться к ProWrite.",
    errUnexpected: "Неожиданный ответ сервера.",
  },
  ja: {
    tabImprove: "✨ 改善", tabHistory: "🕘 履歴", tabConfig: "⚙️ 設定",
    labelTone: "トーン", labelLang: "言語",
    placeholder: "改善するテキストを入力または貼り付け…",
    btnImprove: "✨ テキストを改善", btnLoading: "⏳ 改善中…",
    btnCopy: "📋 コピー", btnCopied: "✅ コピー済み",
    btnUse: "↙ 入力として使用",
    emptyHistory: "履歴なし",
    labelUserId: "ユーザーID", labelAccount: "アカウント状態", labelClearHistory: "履歴を消去",
    btnSave: "保存", btnSaved: "✔ 保存済み",
    btnClearHistory: "🗑 消去",
    btnUpgrade: "⚡ Proを取得 — 無制限",
    upgradeBanner: "⚡ 制限に達しました — Proをクリック",
    headerPro: "⚡ Pro",
    usageLoading: "読込中…",
    usageFree: r => `今日あと${r}回 (Free)`,
    usagePro: "PRO — 無制限 ✨",
    accountFree: r => `無料プラン — あと${r}回`,
    accountPro: "PROプラン有効",
    tones: { Formal: "フォーマル", Direct: "ダイレクト", Persuasive: "説得力", Friendly: "フレンドリー" },
    errTooLong: m => `⚠️ テキストが長すぎます（最大${m}文字）`,
    errConnect: "❌ ProWriteに接続できません。",
    errUnexpected: "予期しないサーバー応答。",
  },
  zh: {
    tabImprove: "✨ 改进", tabHistory: "🕘 历史", tabConfig: "⚙️ 设置",
    labelTone: "语气", labelLang: "语言",
    placeholder: "输入或粘贴要改进的文本…",
    btnImprove: "✨ 改进文本", btnLoading: "⏳ 改进中…",
    btnCopy: "📋 复制", btnCopied: "✅ 已复制",
    btnUse: "↙ 用作输入",
    emptyHistory: "暂无历史",
    labelUserId: "用户ID", labelAccount: "账户状态", labelClearHistory: "清除历史",
    btnSave: "保存", btnSaved: "✔ 已保存",
    btnClearHistory: "🗑 清除",
    btnUpgrade: "⚡ 获取Pro — 无限制",
    upgradeBanner: "⚡ 已达上限 — 点击获取Pro无限制",
    headerPro: "⚡ Pro",
    usageLoading: "加载中…",
    usageFree: r => `今天剩余${r}次 (Free)`,
    usagePro: "PRO — 无限制 ✨",
    accountFree: r => `免费计划 — 今天剩余${r}次`,
    accountPro: "PRO计划有效",
    tones: { Formal: "正式", Direct: "直接", Persuasive: "有说服力", Friendly: "友好" },
    errTooLong: m => `⚠️ 文本太长（最多${m}个字符）`,
    errConnect: "❌ 无法连接到ProWrite。",
    errUnexpected: "服务器响应异常。",
  },
  ar: {
    tabImprove: "✨ تحسين", tabHistory: "🕘 السجل", tabConfig: "⚙️ الإعدادات",
    labelTone: "النبرة", labelLang: "اللغة",
    placeholder: "اكتب أو الصق النص للتحسين…",
    btnImprove: "✨ تحسين النص", btnLoading: "⏳ جارٍ التحسين…",
    btnCopy: "📋 نسخ", btnCopied: "✅ تم النسخ",
    btnUse: "↙ استخدام كمدخل",
    emptyHistory: "لا يوجد سجل بعد",
    labelUserId: "معرف المستخدم", labelAccount: "حالة الحساب", labelClearHistory: "مسح السجل",
    btnSave: "حفظ", btnSaved: "✔ تم الحفظ",
    btnClearHistory: "🗑 مسح السجل",
    btnUpgrade: "⚡ احصل على Pro — غير محدود",
    upgradeBanner: "⚡ تم الوصول للحد — انقر للحصول على Pro غير محدود",
    headerPro: "⚡ Pro",
    usageLoading: "جارٍ التحميل…",
    usageFree: r => `${r} استخدام متبقٍ اليوم (مجاني)`,
    usagePro: "PRO — غير محدود ✨",
    accountFree: r => `الخطة المجانية — ${r} تحسينات متبقية`,
    accountPro: "خطة PRO نشطة",
    tones: { Formal: "رسمي", Direct: "مباشر", Persuasive: "مقنع", Friendly: "ودي" },
    errTooLong: m => `⚠️ النص طويل جداً (الحد الأقصى ${m} حرف)`,
    errConnect: "❌ تعذر الاتصال بـ ProWrite.",
    errUnexpected: "استجابة غير متوقعة من الخادم.",
  },
};

let uiLang = "es";
function t(key, ...args) {
  const d = I18N[uiLang] || I18N.es;
  const v = d[key] ?? I18N.es[key];
  return typeof v === "function" ? v(...args) : (v ?? key);
}

function applyI18n() {
  document.querySelector('[data-tab="improve"]').textContent  = t("tabImprove");
  document.querySelector('[data-tab="history"]').textContent  = t("tabHistory");
  document.querySelector('[data-tab="settings"]').textContent = t("tabConfig");

  document.getElementById("labelTone").textContent         = t("labelTone");
  document.getElementById("labelLang").textContent         = t("labelLang");
  document.getElementById("inputText").placeholder         = t("placeholder");
  document.getElementById("improveBtn").textContent        = t("btnImprove");
  document.getElementById("copyBtn").textContent           = t("btnCopy");
  document.getElementById("useBtn").textContent            = t("btnUse");
  document.getElementById("labelUserId").firstChild.textContent = t("labelUserId") + " ";
  document.getElementById("labelAccount").textContent      = t("labelAccount");
  document.getElementById("labelClearHistory").textContent = t("labelClearHistory");
  document.getElementById("saveUserId").textContent        = t("btnSave");
  document.getElementById("clearHistory").textContent      = t("btnClearHistory");
  document.getElementById("upgradeBtn").textContent        = t("btnUpgrade");
  document.getElementById("upgradeBanner").textContent     = t("upgradeBanner");
  document.getElementById("headerProBtn").textContent      = t("headerPro");

  const tones = t("tones");
  Object.entries(tones).forEach(([val, label]) => {
    const opt = document.querySelector(`#toneSelect option[value="${val}"]`);
    if (opt) opt.textContent = label;
  });

  document.body.dir = uiLang === "ar" ? "rtl" : "ltr";
}

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
  if (language) {
    document.getElementById("langSelect").value = language;
    uiLang = language;
  }
  if (userId) document.getElementById("userIdInput").value = userId;

  applyI18n();

  const uid = userId || generateId();
  if (!userId) chrome.storage.sync.set({ userId: uid });
  loadUsage(uid);
});

document.getElementById("toneSelect").addEventListener("change", e => {
  chrome.storage.sync.set({ tone: e.target.value });
});

document.getElementById("langSelect").addEventListener("change", e => {
  uiLang = e.target.value;
  chrome.storage.sync.set({ language: e.target.value });
  applyI18n();
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
    label.textContent    = t("usagePro");
    fill.style.width     = "100%";
    fill.style.background = "#fbbf24";
    accSt.innerHTML      = `Plan <span class="pro-badge">PRO</span> activo`;
    proTag.innerHTML     = `<span class="pro-badge">PRO</span>`;
    banner.style.display = "none";
    upgBtn.style.display = "none";
  } else {
    const rem = typeof remaining === "number" ? remaining : FREE_LIMIT;
    const used = FREE_LIMIT - rem;
    const pct  = Math.min((used / FREE_LIMIT) * 100, 100);
    label.textContent    = t("usageFree", rem);
    fill.style.width     = `${pct}%`;
    fill.style.background = pct >= 90 ? "#f87171" : "#a5b4fc";
    accSt.textContent    = t("accountFree", rem);
    proTag.innerHTML     = "";
    banner.style.display = rem === 0 ? "block" : "none";
    upgBtn.style.display = rem === 0 ? "block" : "none";
  }
}

// ── Mejorar texto ──────────────────────────────────────────────────────────

document.getElementById("improveBtn").addEventListener("click", async () => {
  const text = inputText.value.trim();
  if (!text) return;
  if (text.length > MAX_CHARS) {
    document.getElementById("errorMsg").textContent = t("errTooLong", MAX_CHARS);
    return;
  }

  const tone     = document.getElementById("toneSelect").value;
  const language = document.getElementById("langSelect").value;
  const { userId } = await chrome.storage.sync.get("userId");
  const uid = userId || generateId();
  if (!userId) chrome.storage.sync.set({ userId: uid });

  const btn = document.getElementById("improveBtn");
  btn.disabled    = true;
  btn.textContent = t("btnLoading");
  document.getElementById("errorMsg").textContent = "";
  document.getElementById("resultBox").classList.remove("show");
  document.getElementById("resultActions").classList.remove("show");

  chrome.runtime.sendMessage(
    { type: "IMPROVE_TEXT", payload: { userId: uid, text, tone, language } },
    res => {
      btn.disabled    = false;
      btn.textContent = t("btnImprove");

      if (chrome.runtime.lastError || !res) {
        document.getElementById("errorMsg").textContent = t("errConnect");
        return;
      }
      if (res.error) {
        document.getElementById("errorMsg").textContent = "❌ " + res.error;
        return;
      }
      if (!res.improved_text) {
        document.getElementById("errorMsg").textContent = t("errUnexpected");
        return;
      }

      const box = document.getElementById("resultBox");
      box.textContent = res.improved_text;
      box.classList.add("show");
      document.getElementById("resultActions").classList.add("show");
      loadUsage(uid);
      addToHistory({ original: text, improved: res.improved_text, tone, lang: language });
    }
  );
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("resultBox").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = t("btnCopied");
    setTimeout(() => { btn.textContent = t("btnCopy"); }, 1500);
  });
});

document.getElementById("useBtn").addEventListener("click", () => {
  const improved = document.getElementById("resultBox").textContent;
  inputText.value = improved;
  charCounter.textContent = `${improved.length} / ${MAX_CHARS}`;
  charCounter.classList.toggle("warn", improved.length > MAX_CHARS * 0.9);
  document.getElementById("resultBox").classList.remove("show");
  document.getElementById("resultActions").classList.remove("show");
  inputText.focus();
});

// ── Upgrade ────────────────────────────────────────────────────────────────

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
      list.innerHTML = `<div class="empty">${t("emptyHistory")}</div>`;
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
        const item = history[parseInt(el.dataset.idx, 10)];
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
  btn.textContent = t("btnSaved");
  setTimeout(() => { btn.textContent = t("btnSave"); }, 1500);
});

// ── Utils ──────────────────────────────────────────────────────────────────

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "user_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) +
         " " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
