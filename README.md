# ✨ ProWrite Extension — Chrome Extension MV3

> Botón flotante de mejora de texto con IA en cualquier campo de toda la web.

Extensión de Chrome **Manifest V3** que inyecta un botón flotante en todos los campos de texto del navegador. Un clic abre un selector de tono e idioma; otro mejora el texto con Gemini AI directamente en el campo activo.

**Backend:** [prowrite](https://github.com/IvanReichle/prowrite) — FastAPI + Gemini + PostgreSQL

---

## ✨ Características

- **Botón flotante** que aparece al hacer foco en cualquier `<textarea>`, `<input>` o campo `contenteditable`
- **12 idiomas** y 4 **tonos** (Formal, Directo, Persuasivo, Amigable)
- **Historial** de las últimas 20 mejoras en `chrome.storage.local`
- **Popup de 3 pestañas:** Mejorar, Historial, Configuración
- **Contador de caracteres** en tiempo real (límite: 5.000 para plan Free)
- **Banner de upgrade** que aparece solo cuando se agota el límite diario
- **compatible con React/Vue** — usa native setter + eventos `input`/`change`
- `crypto.randomUUID()` para generación de userId (con fallback)
- Null-safe en todos los `chrome.runtime.sendMessage` callbacks

---

## 🏗️ Estructura

```
prowrite_extension/
├── manifest.json       # MV3 — permisos, service worker, content scripts
├── background.js       # Service worker — proxy de peticiones a la API
├── content.js          # Script inyectado — botón flotante + lógica de mejora
├── content.css         # Estilos del botón, barra de settings y toast
└── popup/
    ├── popup.html      # UI de 3 pestañas
    └── popup.js        # Lógica del popup — uso, historial, settings
```

---

## 🔧 Cómo funciona

```
[Campo de texto] → foco
       ↓
[content.js] crea botón flotante
       ↓
Usuario hace clic → barra tono/idioma
       ↓
"✨ Mejorar ahora" → chrome.runtime.sendMessage
       ↓
[background.js] fetch POST /improve
       ↓
[API Render] Gemini AI → texto mejorado
       ↓
[content.js] setFieldText() → campo actualizado
       ↓
[toast] "✅ Mejorado (7 usos restantes)"
```

---

## 💳 Planes

| Plan | Límite | Caracteres |
|------|--------|------------|
| Free | 10 mejoras/día | 5.000 |
| Pro | Ilimitado | 20.000 |

El upgrade redirige al link de pago Stripe con el `userId` como referencia. El backend activa Pro automáticamente vía webhook.

---

## 📦 Instalación

### Desde el código fuente

1. Clona el repositorio:
```bash
git clone https://github.com/IvanReichle/prowrite-extension.git
```

2. Abre Chrome → `chrome://extensions/`

3. Activa **Modo desarrollador** (esquina superior derecha)

4. Clic en **Cargar sin empaquetar** → selecciona la carpeta `prowrite-extension/`

5. El icono de ProWrite aparecerá en la barra de extensiones

---

## ⚙️ Permisos del manifest

```json
"permissions": ["storage", "tabs"],
"host_permissions": ["https://prowrite-backend-ds5o.onrender.com/*"]
```

- `storage` — guardar userId, preferencias e historial
- `tabs` — abrir el link de upgrade de Stripe
- `host_permissions` — comunicación con la API de producción

---

## 🌍 Idiomas soportados

| Código | Idioma |
|--------|--------|
| `es` | Español |
| `en` | English |
| `fr` | Français |
| `de` | Deutsch |
| `pt` | Português |
| `it` | Italiano |
| `nl` | Dutch |
| `pl` | Polski |
| `ru` | Русский |
| `ja` | 日本語 |
| `zh` | 中文 |
| `ar` | عربي |

---

## 🛠️ Tecnologías

- **Chrome Extension Manifest V3** — service worker, content scripts
- **chrome.storage.sync** — preferencias y userId sincronizados
- **chrome.storage.local** — historial de mejoras (últimas 20)
- **Gemini AI** via API REST — modelos 2.5/2.0/1.5-flash con fallback
- **crypto.randomUUID()** — generación de UUID nativa del navegador
