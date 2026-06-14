# ✨ ProWrite AI — Chrome Extension MV3

> Mejora cualquier texto en la web con IA. Funciona en todos los campos de texto.

Extensión de Chrome **Manifest V3** impulsada por Gemini AI. Aparece en cualquier campo de texto, mejora tu escritura con un clic (o atajo de teclado), y se mantiene disponible como panel lateral persistente mientras trabajas.

**Backend:** [prowrite](https://github.com/IvanReichle/prowrite) — FastAPI + Gemini AI + PostgreSQL · [Producción](https://prowrite-backend-ds5o.onrender.com)

**Política de privacidad:** [ivanreichle.github.io/prowrite-extension/privacy.html](https://ivanreichle.github.io/prowrite-extension/privacy.html)

---

## ✨ Características

- **Botón flotante** en cualquier `<textarea>`, `<input>` o campo `contenteditable`
- **Menú contextual** — selecciona texto, clic derecho → "Mejorar con ProWrite AI"
- **Atajo de teclado** `Ctrl+Shift+P` (Mac: `⌘+Shift+P`) para mejorar sin usar el ratón
- **Side Panel** persistente — abre la extensión en barra lateral mientras escribes
- **12 idiomas** de interfaz y 4 **tonos** (Formal, Directo, Persuasivo, Amigable)
- **i18n completo** — la interfaz se traduce automáticamente al cambiar el idioma
- **Historial** de las últimas 20 mejoras en `chrome.storage.local`
- **Popup de 3 pestañas:** Mejorar, Historial, Configuración
- **Contador de caracteres** en tiempo real
- **Plan Pro** — usos ilimitados vía Stripe

---

## 🏗️ Estructura

```
prowrite_extension/
├── manifest.json           # MV3 — permisos, service worker, commands, side_panel
├── background.js           # Service worker — API proxy, menú contextual, atajo de teclado
├── content.js              # Botón flotante, panel de resultado contextual, toasts
├── content.css             # Estilos del botón, settings bar, toast y panel contextual
├── privacy.html            # Política de privacidad (GitHub Pages)
├── popup/
│   ├── popup.html          # UI de 3 pestañas
│   └── popup.js            # Lógica compartida con el side panel (i18n, uso, historial)
├── sidepanel/
│   └── sidepanel.html      # Panel lateral persistente (reutiliza popup.js)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔧 Flujo de mejora

```
[Campo de texto] → foco
       ↓
[content.js] crea botón flotante
       ↓
Usuario hace clic / Ctrl+Shift+P / clic derecho
       ↓
Barra de tono + idioma → "✨ Mejorar ahora"
       ↓
[background.js] → fetch POST /improve
       ↓
[API Render] Gemini AI → texto mejorado
       ↓
[content.js] setFieldText() → campo actualizado + toast
```

---

## 💳 Planes

| Plan | Límite diario | Caracteres máx. |
|------|--------------|-----------------|
| Free | 10 mejoras   | 5.000           |
| Pro  | Ilimitado    | 20.000          |

El upgrade abre la página de pago de Stripe. El backend activa Pro automáticamente vía webhook de Stripe.

---

## 📦 Instalación en desarrollo

```bash
git clone https://github.com/IvanReichle/prowrite-extension.git
```

1. Abre Chrome/Brave → `chrome://extensions/`
2. Activa **Modo desarrollador**
3. Clic en **Cargar sin empaquetar** → selecciona la carpeta `prowrite-extension/`
4. El icono ✨ aparecerá en la barra de extensiones

**Atajo de teclado:** configurable en `chrome://extensions/shortcuts`

---

## ⚙️ Permisos

| Permiso | Uso |
|---------|-----|
| `storage` | userId, preferencias, historial |
| `activeTab` | Inyectar en la pestaña activa |
| `scripting` | Ejecutar scripts en la página |
| `contextMenus` | Menú de clic derecho |
| `sidePanel` | Panel lateral persistente |

`host_permissions: <all_urls>` — necesario para el botón flotante en cualquier web.

---

## 🌍 Idiomas soportados

`es` · `en` · `fr` · `de` · `pt` · `it` · `nl` · `pl` · `ru` · `ja` · `zh` · `ar`

La interfaz del popup, el side panel y el menú contextual se adaptan al idioma seleccionado.

---

## 🛠️ Tecnologías

- **Chrome Extension Manifest V3** — service worker, content scripts, side panel API
- **Gemini AI** — modelos 2.5/2.0/1.5-flash con fallback automático
- **FastAPI + PostgreSQL** — backend en Render
- **Stripe** — pagos y webhooks para el plan Pro
- **chrome.storage.sync/local** — preferencias e historial sincronizados
