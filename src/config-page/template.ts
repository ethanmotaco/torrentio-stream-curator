export const CONFIG_PAGE_HTML = `<!DOCTYPE html>
<html lang="en" data-density="compact">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Torrentio Stream Curator — for Stremio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/icon.svg">
<script>
  (function() {
    var saved = null;
    try { saved = localStorage.getItem("tsc.theme"); } catch(e) {}
    var t = saved ?? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", t);
  })();
</script>
<style>
:root {
  --bg: oklch(0.985 0.006 75);
  --bg-elev: oklch(0.995 0.005 80);
  --surface: #ffffff;
  --surface-2: oklch(0.975 0.007 75);
  --border: oklch(0.91 0.008 75);
  --border-strong: oklch(0.85 0.01 75);
  --text: oklch(0.22 0.012 50);
  --text-muted: oklch(0.48 0.013 55);
  --text-faint: oklch(0.62 0.012 60);
  --accent: #E8C547;
  --accent-ink: #181512;
  --accent-soft: color-mix(in oklab, var(--accent) 14%, var(--bg));
  --accent-tint: color-mix(in oklab, var(--accent) 8%, var(--surface));
  --accent-line: color-mix(in oklab, var(--accent) 35%, var(--border));
  --good: oklch(0.66 0.13 155);
  --warn: oklch(0.78 0.14 80);
  --danger: oklch(0.62 0.18 25);
  --d: 1;
  --gap-xs: calc(6px * var(--d));
  --gap-sm: calc(10px * var(--d));
  --gap-md: calc(16px * var(--d));
  --gap-lg: calc(24px * var(--d));
  --gap-xl: calc(40px * var(--d));
  --gap-2xl: calc(64px * var(--d));
  --pad-card: calc(28px * var(--d));
  --radius-sm: 6px; --radius: 10px; --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(40,30,20,0.04), 0 1px 1px rgba(40,30,20,0.03);
  --shadow: 0 1px 2px rgba(40,30,20,0.05), 0 6px 18px -8px rgba(40,30,20,0.08);
  --shadow-lg: 0 1px 2px rgba(40,30,20,0.06), 0 24px 48px -16px rgba(40,30,20,0.16);
  --font: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
[data-density="compact"] { --d: 0.78; }
[data-density="spacious"] { --d: 1.18; }
[data-theme="dark"] {
  --bg: oklch(0.18 0.008 60);
  --bg-elev: oklch(0.215 0.009 60);
  --surface: oklch(0.235 0.01 60);
  --surface-2: oklch(0.215 0.01 60);
  --border: oklch(0.32 0.01 60);
  --border-strong: oklch(0.4 0.012 60);
  --text: oklch(0.96 0.008 80);
  --text-muted: oklch(0.72 0.012 70);
  --text-faint: oklch(0.55 0.012 65);
  --accent-tint: color-mix(in oklab, var(--accent) 12%, var(--surface));
  --accent-soft: color-mix(in oklab, var(--accent) 18%, var(--bg));
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.25);
  --shadow: 0 2px 6px rgba(0,0,0,0.28), 0 12px 32px -10px rgba(0,0,0,0.35);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.35), 0 24px 64px -16px rgba(0,0,0,0.5);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font: 15px/1.5 var(--font); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; font-feature-settings: "ss01","cv11"; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }
button { font: inherit; cursor: pointer; }

.shell { max-width: 880px; margin: 0 auto; padding: 0 24px; width: 100%; }
.shell-wide { max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }

.topbar { position: sticky; top: 0; z-index: 30; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: color-mix(in oklab, var(--bg) 80%, transparent); border-bottom: 1px solid var(--border); }
.topbar-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 16px; }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 600; letter-spacing: -0.01em; color: var(--text); text-decoration: none; }
.brand:hover { text-decoration: none; }
.brand-mark { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 50%, #d83a00)); display: grid; place-items: center; color: var(--accent-ink); box-shadow: 0 2px 8px -2px color-mix(in oklab, var(--accent) 50%, transparent); }
.brand-name { font-size: 14.5px; display: flex; flex-direction: column; line-height: 1.15; }
.brand-tag { color: var(--text-faint); font-weight: 400; font-size: 11.5px; font-family: var(--font-mono); letter-spacing: 0.02em; }
@media (max-width: 520px) { .brand-name { font-size: 13px; } .brand-tag { display: none; } }
.topbar-actions { display: flex; align-items: center; gap: 6px; position: relative; }
.icon-btn { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px; border: 1px solid transparent; background: transparent; color: var(--text-muted); transition: 80ms ease; }
.icon-btn:hover { background: var(--surface-2); color: var(--text); }
.icon-btn.active { background: var(--surface-2); border-color: var(--border); color: var(--text); }

.hero { padding: var(--gap-2xl) 0 var(--gap-lg); max-width: 660px; margin: 0 auto; text-align: center; }
.hero-kicker { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-faint); margin-bottom: var(--gap-md); display: inline-flex; align-items: center; gap: 10px; }
.hero-kicker::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--good); box-shadow: 0 0 0 3px color-mix(in oklab, var(--good) 20%, transparent); }
.hero h1 { font-family: var(--font); font-weight: 600; font-size: clamp(30px, 3.6vw, 42px); line-height: 1.12; letter-spacing: -0.024em; margin: 0 0 var(--gap-sm); color: var(--text); text-wrap: balance; }
.hero-sub { font-size: 16px; color: var(--text-muted); max-width: 58ch; margin: 0 auto; text-wrap: pretty; line-height: 1.55; }

.stats { display: flex; align-items: stretch; justify-content: center; gap: var(--gap-lg); padding: var(--gap-md) 0 var(--gap-xl); margin-bottom: var(--gap-md); }
.stat { display: flex; flex-direction: column; gap: 4px; }
.stat-num { font-family: var(--font); font-feature-settings: "ss01","tnum"; font-size: clamp(22px, 2.4vw, 28px); font-weight: 600; letter-spacing: -0.02em; color: var(--text); line-height: 1; }
.stat-label { font-size: 12.5px; color: var(--text-muted); font-family: var(--font-mono); letter-spacing: 0.01em; }
.stat-sep { width: 1px; background: var(--border); align-self: stretch; margin: 4px 0; }
@media (max-width: 560px) { .stats { gap: var(--gap-md); } .stat-num { font-size: 20px; } }

.section { padding: var(--gap-xl) 0; scroll-margin-top: 80px; }
.section + .section { border-top: 1px solid var(--border); }
.section-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: var(--gap-md); }
.section-num { font-family: var(--font-mono); font-size: 12px; color: var(--text-faint); letter-spacing: 0.04em; }
.section h2 { font-size: 22px; font-weight: 600; letter-spacing: -0.015em; margin: 0; color: var(--text); }
.section-lede { color: var(--text-muted); font-size: 15px; max-width: 60ch; margin: 0 0 var(--gap-lg); text-wrap: pretty; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.card-pad { padding: var(--pad-card); }
.card-row { padding: calc(var(--gap-md) + 2px) var(--pad-card); }
.card-row + .card-row { border-top: 1px solid var(--border); }

.presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
@media (max-width: 880px) { .presets { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .presets { grid-template-columns: 1fr; } }

.preset { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 22px 20px 20px; text-align: left; transition: 120ms ease; display: flex; flex-direction: column; gap: 8px; min-height: 200px; cursor: pointer; font: inherit; color: inherit; }
.preset:hover { border-color: var(--border-strong); transform: translateY(-1px); box-shadow: var(--shadow); }
.preset.selected { border-color: var(--accent); background: var(--accent-tint); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent); }
.preset-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); display: grid; place-items: center; margin-bottom: 6px; color: var(--text); }
.preset.selected .preset-icon { background: var(--accent); color: var(--accent-ink); border-color: transparent; }
.preset-name { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; color: var(--text); }
.preset-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.45; flex: 1; text-wrap: pretty; }
.preset-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.ptag { font-size: 11px; font-family: var(--font-mono); letter-spacing: 0.02em; padding: 3px 7px; border-radius: 999px; background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
.preset.selected .ptag { background: rgba(255,255,255,0.6); border-color: transparent; }
[data-theme="dark"] .preset.selected .ptag { background: rgba(255,255,255,0.08); }
.preset-check { position: absolute; top: 14px; right: 14px; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; opacity: 0; transition: 100ms ease; }
.preset.selected .preset-check { opacity: 1; }

.label { display: block; font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.label-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.label-hint { font-size: 12px; color: var(--text-faint); font-weight: 400; }

.input, .select { width: 100%; background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; color: var(--text); font: inherit; font-size: 14px; transition: border-color 100ms, box-shadow 100ms; }
.input:focus, .select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent); }
.input.invalid, .select.invalid { border-color: var(--danger); box-shadow: 0 0 0 3px color-mix(in oklab, var(--danger) 18%, transparent); }
.input.invalid:focus, .select.invalid:focus { border-color: var(--danger); box-shadow: 0 0 0 3px color-mix(in oklab, var(--danger) 25%, transparent); }
.field-error { color: var(--danger); font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 6px; line-height: 1.4; animation: shake 320ms cubic-bezier(.36,.07,.19,.97); }
@keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-3px); } 40%, 60% { transform: translateX(3px); } }
.input.mono { font-family: var(--font-mono); font-size: 13px; }
.input.long { letter-spacing: -0.01em; }
.input::placeholder { color: var(--text-faint); }
.select { appearance: none; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'><path d='M3 4.5L6 7.5L9 4.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }

.field-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 560px) { .field-pair { grid-template-columns: 1fr; } }

.help { font-size: 13px; color: var(--text-muted); margin-top: 8px; line-height: 1.5; }
.help.tip { padding: 10px 12px; background: var(--surface-2); border-radius: var(--radius); border-left: 2px solid var(--accent-line); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; border-radius: var(--radius); font-weight: 500; font-size: 14px; border: 1px solid transparent; transition: 100ms ease; letter-spacing: -0.005em; }
.btn-primary { background: var(--accent); color: var(--accent-ink); box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 12px -4px color-mix(in oklab, var(--accent) 60%, transparent); }
.btn-primary:hover { background: color-mix(in oklab, var(--accent) 88%, #000); }
.btn-primary:active { transform: translateY(1px); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary.big { padding: 14px 22px; font-size: 15px; width: 100%; }
.btn-ghost { background: var(--surface); border-color: var(--border); color: var(--text); }
.btn-ghost:hover { background: var(--surface-2); border-color: var(--border-strong); }
.btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }

.pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 13px; font-weight: 500; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; color: var(--text-muted); transition: 80ms; }
.pill:hover { border-color: var(--border-strong); color: var(--text); }
.pill.active { background: var(--text); color: var(--bg-elev); border-color: var(--text); }
[data-theme="dark"] .pill.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.pill .check { width: 12px; height: 12px; display: inline-grid; place-items: center; }
.pill:not(.active) .check { opacity: 0.3; }

.switch-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; }
.switch-row + .switch-row { border-top: 1px solid var(--border); }
.toggle { position: relative; flex: none; width: 38px; height: 22px; border-radius: 999px; background: var(--border-strong); border: none; padding: 0; cursor: pointer; transition: background 120ms; margin-top: 1px; }
.toggle::after { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 140ms cubic-bezier(.5,1.6,.5,1); }
.toggle.on { background: var(--accent); }
.toggle.on::after { transform: translateX(16px); }
.switch-content { flex: 1; min-width: 0; }
.switch-title { font-size: 14px; font-weight: 500; color: var(--text); display: flex; align-items: center; gap: 8px; }
.switch-desc { font-size: 13px; color: var(--text-muted); margin-top: 3px; line-height: 1.45; }
.switch-meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); padding: 1px 6px; background: var(--surface-2); border-radius: 4px; }

.ranking { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.rank-item { display: grid; grid-template-columns: 24px 28px 1fr auto; gap: 12px; align-items: center; padding: 12px 14px 12px 8px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); transition: 80ms ease; }
.rank-item.dragging { opacity: 0.4; }
.rank-item.over { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent); }
.rank-item:hover { border-color: var(--border-strong); }
.rank-item.off { opacity: 0.55; background: transparent; }
.rank-grip { color: var(--text-faint); cursor: grab; display: grid; place-items: center; height: 32px; }
.rank-grip:active { cursor: grabbing; }
.rank-pos { font-family: var(--font-mono); font-size: 12px; color: var(--text-faint); text-align: center; }
.rank-body { min-width: 0; }
.rank-title { font-size: 14px; font-weight: 500; color: var(--text); }
.rank-desc { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }

.install-card { background: linear-gradient(180deg, var(--accent-tint), var(--surface)); border: 1px solid var(--accent-line); border-radius: var(--radius-lg); padding: var(--pad-card); box-shadow: var(--shadow); }
.install-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: var(--gap-md); }
.install-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; flex: none; box-shadow: 0 6px 16px -6px color-mix(in oklab, var(--accent) 60%, transparent); }
.install-title { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
.install-sub { font-size: 13.5px; color: var(--text-muted); margin-top: 2px; }
.install-actions { display: flex; flex-direction: row; gap: 10px; flex-wrap: wrap; }
.install-actions .btn { flex: 1; min-width: 180px; }

.url-collapse { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--bg-elev); }
.url-collapse-head { display: flex; width: 100%; align-items: center; justify-content: space-between; padding: 11px 14px; background: transparent; border: none; color: var(--text); font-size: 13px; font-weight: 500; }
.url-collapse-head:hover { background: var(--surface-2); }
.url-collapse-head .caret { transition: transform 160ms; color: var(--text-faint); }
.url-collapse[data-open="true"] .url-collapse-head .caret { transform: rotate(90deg); }
.url-collapse-body { display: none; padding: 0 14px 14px; }
.url-collapse[data-open="true"] .url-collapse-body { display: block; }
.url-text { font-family: var(--font-mono); font-size: 11.5px; line-height: 1.55; color: var(--text-muted); word-break: break-all; user-select: all; background: var(--surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border); max-height: 110px; overflow: auto; }

.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(12px); background: var(--text); color: var(--bg); padding: 10px 18px; border-radius: 999px; font-size: 13.5px; font-weight: 500; box-shadow: var(--shadow-lg); z-index: 100; transition: transform 200ms ease, opacity 200ms ease; pointer-events: none; opacity: 0; visibility: hidden; }
.toast.show { transform: translateX(-50%) translateY(0); opacity: 1; visibility: visible; }

.foot { margin-top: var(--gap-2xl); padding: var(--gap-xl) 0; border-top: 1px solid var(--border); color: var(--text-faint); font-size: 13px; text-align: center; }
.foot a { color: var(--text-muted); }

.input-affix { position: relative; }
.input-affix .input { padding-right: 56px; }
.input-affix .suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-family: var(--font-mono); color: var(--text-faint); pointer-events: none; }

.tag-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 8px; background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius); align-items: center; min-height: 42px; position: relative; }
.tag-input:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent); }
.tag-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 4px 4px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; font-size: 12.5px; font-weight: 500; color: var(--text); }
.tag-chip button { width: 18px; height: 18px; border: none; background: transparent; color: var(--text-faint); display: grid; place-items: center; border-radius: 999px; }
.tag-chip button:hover { background: var(--surface-2); color: var(--text); }
.tag-input input { border: none; background: transparent; outline: none; font: inherit; font-size: 13px; color: var(--text); flex: 1; min-width: 100px; padding: 4px 6px; }
.autocomplete { position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 220px; overflow-y: auto; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); z-index: 5; display: none; }
.autocomplete.show { display: block; }
.autocomplete .opt { padding: 0.55em 0.9em; cursor: pointer; font-size: 13px; display: flex; justify-content: space-between; gap: 8px; }
.autocomplete .opt:hover, .autocomplete .opt.hover { background: var(--surface-2); }
.autocomplete .opt small { color: var(--text-faint); font-family: var(--font-mono); font-size: 11px; }

</style>
</head>
<body>

<header class="topbar">
  <div class="shell-wide topbar-inner">
    <a class="brand" href="#" id="brandLink">
      <div class="brand-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="12" y2="10"/><line x1="3" y1="12" x2="12" y2="12"/><line x1="3" y1="18" x2="12" y2="14"/>
          <path d="M12 7 L21 12 L12 17 Z" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <span class="brand-name">Torrentio Stream Curator<span class="brand-tag">for Stremio</span></span>
    </a>
    <div class="topbar-actions">
      <a class="icon-btn" href="https://github.com/ethanmotaco/torrentio-stream-curator" target="_blank" rel="noopener" title="Source" aria-label="GitHub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.95-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.95 10.95 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.26 5.65.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
        </svg>
      </a>
      <button class="icon-btn" id="themeToggle" title="Toggle theme" aria-label="Toggle theme">
        <svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg>
      </button>
    </div>
  </div>
</header>

<main>
<div class="shell" id="top">
  <section class="hero">
    <h1>Stop scrolling through 20 files. Just press play.</h1>
    <p class="hero-sub">Torrentio gives you every stream you filtered. This addon picks the best one based on the preferences you set below.</p>
  </section>
  <section class="stats">
    <div class="stat"><div class="stat-num" id="installsCount">—</div><div class="stat-label">active configurations</div></div>
    <div class="stat-sep" aria-hidden="true"></div>
    <div class="stat"><div class="stat-num" id="picksCount">—</div><div class="stat-label">streams curated</div></div>
  </section>
</div>

<div class="shell">

<section class="section" id="connect">
  <div class="section-head"><span class="section-num">01 ·</span><h2>Bring your Torrentio link</h2></div>
  <p class="section-lede">Open Torrentio's configure page, copy the manifest URL it gives you, and paste it below. We'll layer your taste on top.</p>
  <div class="card card-pad">
    <label class="label" for="torrentioUrl">Torrentio manifest URL</label>
    <input id="torrentioUrl" class="input mono long" placeholder="https://torrentio.strem.fun/...manifest.json" spellcheck="false" autocomplete="off">
    <div class="field-error" id="urlError" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span id="urlErrorText">Torrentio install URL is required.</span></div>
    <div class="help tip">
      New here? Visit <a href="https://torrentio.strem.fun/configure" target="_blank" rel="noopener">torrentio.strem.fun/configure</a>, pick your providers and Real Debrid key, then copy the manifest URL it generates. Your Real Debrid token stays in that URL; Stream Curator never sees it directly.
    </div>
  </div>
</section>

<section class="section" id="profile">
  <div class="section-head"><span class="section-num">02 ·</span><h2>Pick a starting point</h2></div>
  <p class="section-lede">Most people pick one and move on. You can still tweak everything below if you want to.</p>
  <div class="presets" id="presetGrid">
    <button type="button" class="preset" data-profile="4k-hdr">
      <div class="preset-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="preset-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10v4M10 10v4M6 12h4M14 10v4h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2z"/></svg></div>
      <div class="preset-name">Maximum</div>
      <div class="preset-desc">4K, Dolby Vision, lossless audio. The best stream available, file size be damned.</div>
      <div class="preset-tags"><span class="ptag">2160p</span><span class="ptag">DV / HDR10</span><span class="ptag">Atmos</span></div>
    </button>
    <button type="button" class="preset" data-profile="best-audio">
      <div class="preset-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="preset-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
      <div class="preset-name">Audiophile</div>
      <div class="preset-desc">Atmos and lossless first. For anyone with speakers worth listening to.</div>
      <div class="preset-tags"><span class="ptag">Atmos</span><span class="ptag">DTS-HD</span><span class="ptag">1080p+</span></div>
    </button>
    <button type="button" class="preset" data-profile="1080p-balanced">
      <div class="preset-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="preset-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg></div>
      <div class="preset-name">1080p balanced</div>
      <div class="preset-desc">Sensible defaults. 1080p, cached on Real Debrid, smaller files when there's a tie.</div>
      <div class="preset-tags"><span class="ptag">1080p</span><span class="ptag">RD cached</span><span class="ptag">Small files</span></div>
    </button>
    <button type="button" class="preset" data-profile="smallest-cached">
      <div class="preset-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="preset-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
      <div class="preset-name">Lean &amp; Cached</div>
      <div class="preset-desc">Small, fast, already on Real Debrid. Lights up instantly on slow connections.</div>
      <div class="preset-tags"><span class="ptag">≤4 GB</span><span class="ptag">RD cached</span><span class="ptag">Up to 1080p</span></div>
    </button>
    <button type="button" class="preset" data-profile="custom" style="display:none">
      <div class="preset-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="preset-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></div>
      <div class="preset-name">Custom</div>
      <div class="preset-desc">Your manual settings. Pick a preset to start over.</div>
      <div class="preset-tags"><span class="ptag">Manual</span></div>
    </button>
  </div>
</section>

<section class="section" id="filters">
  <div class="section-head"><span class="section-num">03 ·</span><h2>What to keep, what to skip</h2></div>
  <p class="section-lede">Streams that fail any of these get hidden. Be picky here so the next step has less to rank.</p>
  <div class="card">
    <div class="card-row">
      <div class="label-row"><label class="label">Resolution range</label><span class="label-hint">Inclusive on both ends</span></div>
      <div class="field-pair">
        <select class="select" name="minResolution">
          <option value="any">Min — any</option><option value="480p">Min — 480p</option><option value="720p">Min — 720p</option><option value="1080p">Min — 1080p</option><option value="2160p">Min — 2160p (4K)</option>
        </select>
        <select class="select" name="maxResolution">
          <option value="any">Max — any</option><option value="720p">Max — 720p</option><option value="1080p">Max — 1080p</option><option value="2160p">Max — 2160p (4K)</option>
        </select>
      </div>
    </div>
    <div class="card-row">
      <div class="switch-row">
        <button class="toggle" type="button" data-toggle="requireCached" aria-label="Require cached"></button>
        <div class="switch-content"><div class="switch-title"><span>Require Real Debrid cached</span></div><div class="switch-desc">Instant playback. Disable to include uncached torrents as fallback.</div></div>
      </div>
      <div class="switch-row">
        <button class="toggle" type="button" data-toggle="requireHDR" aria-label="Require HDR"></button>
        <div class="switch-content"><div class="switch-title"><span>Require HDR / Dolby Vision</span> <span class="switch-meta">needs HDR display</span></div><div class="switch-desc">Drops SDR releases. Falls back gracefully if no HDR release exists.</div></div>
      </div>
      <div class="switch-row">
        <button class="toggle" type="button" data-toggle="excludeHDR" aria-label="Exclude HDR"></button>
        <div class="switch-content"><div class="switch-title"><span>Exclude HDR / Dolby Vision</span></div><div class="switch-desc">Drops HDR releases. Useful for displays that handle SDR better.</div></div>
      </div>
    </div>
    <div class="card-row">
      <div class="label-row"><label class="label">Accepted audio codecs</label><span class="label-hint">Any selected = pass; none = no requirement</span></div>
      <div class="pill-group" id="audioPills">
        <button type="button" class="pill" data-value="Atmos"><span class="check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>Atmos</button>
        <button type="button" class="pill" data-value="TrueHD"><span class="check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>TrueHD</button>
        <button type="button" class="pill" data-value="DTS-HD"><span class="check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>DTS-HD</button>
        <button type="button" class="pill" data-value="DTS"><span class="check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>DTS</button>
        <button type="button" class="pill" data-value="AC3"><span class="check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>AC3</button>
        <button type="button" class="pill" data-value="AAC"><span class="check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>AAC</button>
      </div>
    </div>
    <div class="card-row">
      <div class="label-row"><label class="label">Languages</label><span class="label-hint">Audio language; falls back to any release with subs</span></div>
      <div class="tag-input" id="langInput">
        <input type="text" placeholder="Type a language…" autocomplete="off">
        <div class="autocomplete" id="langAutocomplete"></div>
      </div>
      <p class="help">ISO codes (eng, ita, fre…) and "dual" map automatically. If no release matches your language, Stream Curator falls through to any working stream. Pair with the OpenSubtitles addon for translated subs.</p>
    </div>
    <div class="card-row">
      <div class="field-pair">
        <div>
          <label class="label">Max file size</label>
          <div class="input-affix"><input id="maxSizeGB" type="number" min="0" step="0.1" class="input" placeholder="No cap"><span class="suffix">GB</span></div>
          <div class="help">Blank means no limit.</div>
        </div>
        <div>
          <label class="label">Min seeders</label>
          <div class="input-affix"><input id="minSeeders" type="number" min="0" step="1" class="input" placeholder="No floor"><span class="suffix">peers</span></div>
          <div class="help">Only applied to uncached torrents.</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="ranking">
  <div class="section-head"><span class="section-num">04 ·</span><h2>What matters most</h2></div>
  <p class="section-lede">After filtering, surviving streams are sorted by this list. Top item wins ties first. Drag to reorder, toggle off what you don't care about.</p>
  <div class="card card-pad"><ul class="ranking" id="tierList"></ul></div>
  <div class="card card-pad" style="margin-top: var(--gap-md)">
    <label class="label">Preferred release groups</label>
    <div class="tag-input" id="groupsInput"><input type="text" placeholder="QxR, FraMeSToR, RARBG…" autocomplete="off"></div>
    <div class="help">Used as tiebreaker when <i>Preferred release group</i> is enabled above. Order doesn't matter.</div>
  </div>
</section>

<section class="section" id="consistency">
  <div class="section-head"><span class="section-num">05 ·</span><h2>Keep series consistent</h2></div>
  <p class="section-lede">Once an episode picks a release group, lock to it. Prevents codec and audio mix changes mid-binge. Falls back if the chosen group is missing for an episode.</p>
  <div class="card card-pad">
    <div class="switch-row" style="padding-top: 0">
      <button class="toggle" type="button" data-toggle="stickyEnabled" aria-label="Sticky group"></button>
      <div class="switch-content"><div class="switch-title"><span>Stick to one release group per show</span></div><div class="switch-desc">When earlier episodes resolved to a specific group, prefer that group for the next ones too.</div></div>
    </div>
    <div style="margin-top: var(--gap-md)">
      <label class="label">Lock scope</label>
      <select class="select" id="stickyScope">
        <option value="series">Per series — same group across all seasons</option>
        <option value="season">Per season — fresh choice each new season</option>
      </select>
    </div>
  </div>
</section>

<section class="section" id="install">
  <div class="section-head"><span class="section-num">06 ·</span><h2>Install it</h2></div>
  <p class="section-lede">Generate the install link, then open it in Stremio on this device or scan the QR with your phone.</p>
  <button type="button" class="btn btn-primary big" id="generateBtn">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
    Generate my install link
  </button>
  <div class="install-card" id="installBox" style="display:none; margin-top: var(--gap-md)">
    <div class="install-head">
      <div class="install-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div><div class="install-title">Your install link is ready</div><div class="install-sub">Open it in Stremio to add Torrentio Stream Curator as an addon.</div></div>
    </div>
    <div class="install-actions">
      <a class="btn btn-primary" id="openLink" href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Open in Stremio</a>
      <button type="button" class="btn btn-ghost" id="copyBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy install URL</button>
    </div>
    <div style="margin-top: 14px">
      <div class="url-collapse" id="urlCollapse" data-open="false">
        <button class="url-collapse-head" id="urlToggle"><span>Show the raw URL</span><span class="caret"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg></span></button>
        <div class="url-collapse-body"><div class="url-text" id="installUrl"></div></div>
      </div>
    </div>
    <p class="help tip" style="margin-top: 14px"><b>Tip.</b> In Stremio's <i>Settings → Addons</i>, drag <b>Torrentio Stream Curator</b> above Torrentio so the curated stream surfaces first. Or uninstall Torrentio entirely — Stream Curator wraps it.</p>
  </div>
</section>

</div>
</div>

<footer class="foot"><div class="shell">Built for the Stremio community · <a href="https://github.com/ethanmotaco/torrentio-stream-curator" target="_blank" rel="noopener">Source</a> · <a href="#" id="privacyLink">Privacy</a></div></footer>
<div id="privacyModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:200; align-items:center; justify-content:center; padding:1em;">
  <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); max-width:560px; padding:var(--pad-card); max-height:80vh; overflow:auto;">
    <h2 style="margin:0 0 var(--gap-md); font-size:20px; font-weight:600; letter-spacing:-0.015em;">Privacy</h2>
    <p style="color:var(--text-muted); font-size:14px; line-height:1.6; margin:0 0 var(--gap-md);">
      Stream Curator runs no database and tracks no users. Your install URL contains your Torrentio URL — which contains your Real Debrid token. Here's exactly what happens with that data on the public deploy:
    </p>
    <ul style="color:var(--text-muted); font-size:13.5px; line-height:1.6; padding-left:1.2em; margin:0 0 var(--gap-md);">
      <li><b>Server access logs</b> strip the config segment from every URL before printing. The token never appears in stdout or in whatever log retention the host uses.</li>
      <li><b>Your Torrentio URL</b> is decoded in memory, used to fetch streams, then discarded.</li>
      <li><b>In-memory caches</b> hold your last hour of stream picks (LRU, keyed by a SHA-256 hash of your config — never the raw token). Wiped on every server restart.</li>
      <li><b>Two anonymous counters</b> ping a public increment service (<a href="https://abacus.jasoncameron.dev" target="_blank" rel="noopener">abacus.jasoncameron.dev</a>) — install seen, stream picked. No payload, just an increment.</li>
      <li><b>localStorage</b> stores a single preference: your chosen theme.</li>
    </ul>
    <p style="color:var(--text); font-size:14px; line-height:1.6; margin:0 0 var(--gap-md);">
      <b>Want full control?</b> Self-host. The whole stack is one Node process and one Docker image:
    </p>
    <pre style="background:var(--bg-elev); border:1px solid var(--border); border-radius:var(--radius); padding:12px; font-family:var(--font-mono); font-size:12px; color:var(--text-muted); overflow:auto; margin:0 0 var(--gap-lg);">git clone https://github.com/ethanmotaco/torrentio-stream-curator
cd torrentio-stream-curator
npm install &amp;&amp; npm run build
PORT=7000 node dist/index.js</pre>
    <button type="button" class="btn btn-ghost" id="privacyClose" style="width:100%;">Close</button>
  </div>
</div>
</main>

<div class="toast" id="toast">Copied to clipboard</div>

<script>
// ===== Constants =====

const TIEBREAKER_META = {
  cached_first: { name: "Real Debrid cached first", desc: "Instant-playback streams before uncached." },
  resolution_desc: { name: "Higher resolution first", desc: "2160p → 1080p → 720p → 480p." },
  audio_quality_desc: { name: "Better audio first", desc: "Atmos → TrueHD → DTS-HD → DTS → AC3 → AAC." },
  hdr_pref: { name: "Prefer HDR / Dolby Vision", desc: "HDR releases ahead of SDR." },
  size_smaller: { name: "Smaller files first", desc: "Prefer compact encodes; saves bandwidth." },
  size_larger: { name: "Larger files first", desc: "Prefer higher bitrate / remux." },
  seeders_desc: { name: "More seeders first", desc: "Mostly matters when uncached." },
  group_pref: { name: "Preferred release group", desc: "Uses the group list below." },
  language_pref: { name: "Language preference", desc: "Earlier languages in your list win ties." },
};
const ALL_TIEBREAKERS = Object.keys(TIEBREAKER_META);

const ALL_LANGUAGES = [
  { value: "english", label: "English" }, { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" }, { value: "german", label: "German" },
  { value: "italian", label: "Italian" }, { value: "portuguese", label: "Portuguese" },
  { value: "russian", label: "Russian" }, { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" }, { value: "chinese", label: "Chinese" },
  { value: "mandarin", label: "Mandarin" }, { value: "dutch", label: "Dutch" },
  { value: "swedish", label: "Swedish" }, { value: "norwegian", label: "Norwegian" },
  { value: "danish", label: "Danish" }, { value: "finnish", label: "Finnish" },
  { value: "polish", label: "Polish" }, { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" }, { value: "turkish", label: "Turkish" },
  { value: "hebrew", label: "Hebrew" }, { value: "greek", label: "Greek" },
  { value: "czech", label: "Czech" }, { value: "hungarian", label: "Hungarian" },
  { value: "romanian", label: "Romanian" }, { value: "thai", label: "Thai" },
  { value: "vietnamese", label: "Vietnamese" }, { value: "indonesian", label: "Indonesian" },
];

const PROFILES = {
  "4k-hdr": {
    maxResolution: "2160p", minResolution: "2160p",
    requireCached: true, maxSizeGB: "", minSeeders: "",
    requireHDR: true, excludeHDR: false,
    requireAudio: [], languages: ["english"],
    tiebreakers: ["resolution_desc", "hdr_pref", "audio_quality_desc", "size_smaller", "cached_first"],
  },
  "best-audio": {
    maxResolution: "2160p", minResolution: "1080p",
    requireCached: true, maxSizeGB: "", minSeeders: "",
    requireHDR: false, excludeHDR: false,
    requireAudio: ["Atmos", "TrueHD", "DTS-HD"], languages: ["english"],
    tiebreakers: ["audio_quality_desc", "resolution_desc", "size_larger", "cached_first"],
  },
  "1080p-balanced": {
    maxResolution: "1080p", minResolution: "1080p",
    requireCached: true, maxSizeGB: "", minSeeders: "",
    requireHDR: false, excludeHDR: false,
    requireAudio: [], languages: ["english"],
    tiebreakers: ["audio_quality_desc", "size_smaller", "group_pref", "cached_first"],
  },
  "smallest-cached": {
    maxResolution: "1080p", minResolution: "any",
    requireCached: true, maxSizeGB: "4", minSeeders: "",
    requireHDR: false, excludeHDR: false,
    requireAudio: [], languages: ["english"],
    tiebreakers: ["size_smaller", "resolution_desc", "audio_quality_desc", "cached_first"],
  },
};

const state = {
  profile: "4k-hdr",
  toggles: { requireCached: false, requireHDR: false, excludeHDR: false, stickyEnabled: true },
  audio: new Set(),
  languages: [],
  groups: [],
  tiebreakerOrder: [],
  tiebreakerEnabled: {},
  applying: false,
};

function $(s, r = document) { return r.querySelector(s); }
function $all(s, r = document) { return [...r.querySelectorAll(s)]; }

// ===== Theme toggle (system default unless user overrides) =====
const SUN_PATH = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
const MOON_PATH = '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>';
function paintThemeIcon() {
  const t = document.documentElement.getAttribute("data-theme");
  $("#themeIcon").innerHTML = t === "dark" ? SUN_PATH : MOON_PATH;
}
function setTheme(t, persist) {
  document.documentElement.setAttribute("data-theme", t);
  paintThemeIcon();
  if (persist) { try { localStorage.setItem("tsc.theme", t); } catch(e) {} }
}
paintThemeIcon();
$("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(next, true);
});
// Follow system changes until user overrides
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", e => {
    let userSaved = null;
    try { userSaved = localStorage.getItem("tsc.theme"); } catch(err) {}
    if (!userSaved) setTheme(e.matches ? "dark" : "light", false);
  });
}

// ===== Preset selection =====
$all(".preset[data-profile]").forEach(card => card.addEventListener("click", () => selectPreset(card.dataset.profile)));
function selectPreset(name) {
  state.profile = name;
  $all(".preset[data-profile]").forEach(c => c.classList.toggle("selected", c.dataset.profile === name));
  $('.preset[data-profile="custom"]').style.display = name === "custom" ? "" : "none";
  if (name !== "custom") applyProfile(name);
}
function applyProfile(name) {
  const p = PROFILES[name]; if (!p) return;
  state.applying = true;
  $('select[name=maxResolution]').value = p.maxResolution;
  $('select[name=minResolution]').value = p.minResolution;
  setToggle("requireCached", p.requireCached);
  setToggle("requireHDR", p.requireHDR);
  setToggle("excludeHDR", p.excludeHDR);
  $('#maxSizeGB').value = p.maxSizeGB;
  $('#minSeeders').value = p.minSeeders;
  state.audio = new Set(p.requireAudio); renderAudioPills();
  state.languages = [...p.languages]; renderLanguages();
  state.groups = []; renderGroups();
  const enabled = new Set(p.tiebreakers);
  state.tiebreakerOrder = [...p.tiebreakers, ...ALL_TIEBREAKERS.filter(k => !enabled.has(k))];
  state.tiebreakerEnabled = {};
  ALL_TIEBREAKERS.forEach(k => state.tiebreakerEnabled[k] = enabled.has(k));
  renderTierList();
  state.applying = false;
}
function markCustom() {
  if (state.applying) return;
  state.profile = "custom";
  $all(".preset[data-profile]").forEach(c => c.classList.toggle("selected", c.dataset.profile === "custom"));
  $('.preset[data-profile="custom"]').style.display = "";
}

// ===== Toggles =====
function setToggle(name, on) {
  state.toggles[name] = !!on;
  const btn = $('[data-toggle="' + name + '"]');
  if (btn) btn.classList.toggle("on", !!on);
}
$all('[data-toggle]').forEach(btn => btn.addEventListener("click", () => {
  setToggle(btn.dataset.toggle, !state.toggles[btn.dataset.toggle]);
  markCustom();
}));

// ===== Audio pills =====
function renderAudioPills() {
  $all("#audioPills .pill").forEach(p => p.classList.toggle("active", state.audio.has(p.dataset.value)));
}
$all("#audioPills .pill").forEach(p => p.addEventListener("click", () => {
  state.audio.has(p.dataset.value) ? state.audio.delete(p.dataset.value) : state.audio.add(p.dataset.value);
  renderAudioPills(); markCustom();
}));

// ===== Languages tag input =====
const langBox = $("#langInput"), langField = langBox.querySelector("input"), langAuto = $("#langAutocomplete");
let acHover = -1;
function renderLanguages() {
  $all(".tag-chip", langBox).forEach(t => t.remove());
  state.languages.forEach((lang, i) => {
    const display = (ALL_LANGUAGES.find(l => l.value === lang.toLowerCase())?.label) ?? lang;
    const tag = document.createElement("span");
    tag.className = "tag-chip";
    tag.innerHTML = display + ' <button type="button" aria-label="Remove">×</button>';
    tag.querySelector("button").addEventListener("click", () => { state.languages.splice(i, 1); renderLanguages(); markCustom(); });
    langBox.insertBefore(tag, langField);
  });
}
function showLangAutocomplete() {
  const q = langField.value.trim().toLowerCase();
  const matches = ALL_LANGUAGES.filter(l => !state.languages.includes(l.value) && (q === "" || l.value.startsWith(q) || l.label.toLowerCase().startsWith(q))).slice(0, 8);
  if (matches.length === 0) { langAuto.classList.remove("show"); return; }
  langAuto.innerHTML = matches.map((l, i) => '<div class="opt' + (i === acHover ? " hover" : "") + '" data-value="' + l.value + '"><span>' + l.label + '</span><small>' + l.value + '</small></div>').join("");
  langAuto.classList.add("show");
  $all(".opt", langAuto).forEach(opt => opt.addEventListener("mousedown", e => { e.preventDefault(); addLanguage(opt.dataset.value); }));
}
function addLanguage(v) {
  const val = v.trim().toLowerCase();
  if (val && !state.languages.includes(val)) state.languages.push(val);
  langField.value = ""; acHover = -1; langAuto.classList.remove("show");
  renderLanguages(); markCustom();
}
langField.addEventListener("focus", () => { acHover = -1; showLangAutocomplete(); });
langField.addEventListener("input", () => { acHover = -1; showLangAutocomplete(); });
langField.addEventListener("blur", () => setTimeout(() => langAuto.classList.remove("show"), 150));
langField.addEventListener("keydown", e => {
  const opts = $all(".opt", langAuto);
  if (e.key === "ArrowDown") { e.preventDefault(); acHover = Math.min(opts.length - 1, acHover + 1); showLangAutocomplete(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); acHover = Math.max(-1, acHover - 1); showLangAutocomplete(); }
  else if (e.key === "Enter") {
    e.preventDefault();
    if (acHover >= 0 && opts[acHover]) addLanguage(opts[acHover].dataset.value);
    else if (langField.value.trim()) addLanguage(langField.value);
  } else if (e.key === ",") { e.preventDefault(); if (langField.value.trim()) addLanguage(langField.value); }
  else if (e.key === "Backspace" && langField.value === "" && state.languages.length > 0) { state.languages.pop(); renderLanguages(); markCustom(); }
});

// ===== Groups tag input =====
const groupsBox = $("#groupsInput"), groupsField = groupsBox.querySelector("input");
function renderGroups() {
  $all(".tag-chip", groupsBox).forEach(t => t.remove());
  state.groups.forEach((g, i) => {
    const tag = document.createElement("span");
    tag.className = "tag-chip";
    tag.innerHTML = g + ' <button type="button" aria-label="Remove">×</button>';
    tag.querySelector("button").addEventListener("click", () => { state.groups.splice(i, 1); renderGroups(); markCustom(); });
    groupsBox.insertBefore(tag, groupsField);
  });
}
function addGroup(raw) {
  raw.split(",").map(s => s.trim()).filter(Boolean).forEach(g => { if (!state.groups.includes(g)) state.groups.push(g); });
  groupsField.value = ""; renderGroups(); markCustom();
}
groupsField.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addGroup(groupsField.value); }
  else if (e.key === "Backspace" && groupsField.value === "" && state.groups.length > 0) { state.groups.pop(); renderGroups(); markCustom(); }
});
groupsField.addEventListener("blur", () => { if (groupsField.value) addGroup(groupsField.value); });

// ===== Tier list =====
function renderTierList() {
  const list = $("#tierList"); list.innerHTML = "";
  state.tiebreakerOrder.forEach((key, i) => {
    const meta = TIEBREAKER_META[key], on = state.tiebreakerEnabled[key];
    const item = document.createElement("li");
    item.className = "rank-item" + (on ? "" : " off");
    item.draggable = true; item.dataset.key = key;
    item.innerHTML =
      '<div class="rank-grip" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg></div>' +
      '<div class="rank-pos">' + String(i + 1).padStart(2, "0") + '</div>' +
      '<div class="rank-body"><div class="rank-title">' + meta.name + '</div><div class="rank-desc">' + meta.desc + '</div></div>' +
      '<button class="toggle' + (on ? " on" : "") + '" type="button" data-rank="' + key + '" aria-label="Enable"></button>';
    item.addEventListener("dragstart", e => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", key); item.classList.add("dragging"); });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    item.addEventListener("dragover", e => { e.preventDefault(); item.classList.add("over"); });
    item.addEventListener("dragleave", () => item.classList.remove("over"));
    item.addEventListener("drop", e => {
      e.preventDefault(); item.classList.remove("over");
      const from = e.dataTransfer.getData("text/plain"); if (from === key) return;
      const fromIdx = state.tiebreakerOrder.indexOf(from), toIdx = state.tiebreakerOrder.indexOf(key);
      state.tiebreakerOrder.splice(fromIdx, 1);
      state.tiebreakerOrder.splice(toIdx, 0, from);
      renderTierList(); markCustom();
    });
    item.querySelector("[data-rank]").addEventListener("click", () => {
      state.tiebreakerEnabled[key] = !state.tiebreakerEnabled[key];
      item.classList.toggle("off", !state.tiebreakerEnabled[key]);
      item.querySelector("[data-rank]").classList.toggle("on", state.tiebreakerEnabled[key]);
      markCustom();
    });
    list.appendChild(item);
  });
}

// ===== Form change listeners =====
$('select[name=maxResolution]').addEventListener("change", markCustom);
$('select[name=minResolution]').addEventListener("change", markCustom);
$("#stickyScope").addEventListener("change", markCustom);
["maxSizeGB", "minSeeders"].forEach(id => $("#" + id).addEventListener("input", markCustom));

// ===== Build install URL =====
function b64url(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, ""); }
function numOrNull(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : null; }
function intOrNull(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }

function showUrlError(msg) {
  const err = $("#urlError");
  $("#urlErrorText").textContent = msg;
  err.hidden = false;
  // Retrigger shake animation
  err.style.animation = "none"; void err.offsetWidth; err.style.animation = "";
  $("#torrentioUrl").classList.add("invalid");
  $("#torrentioUrl").focus();
  $("#torrentioUrl").scrollIntoView({ behavior: "smooth", block: "center" });
}
$("#torrentioUrl").addEventListener("input", () => {
  $("#torrentioUrl").classList.remove("invalid");
  $("#urlError").hidden = true;
});

$("#generateBtn").addEventListener("click", () => {
  const tt = $("#torrentioUrl").value.trim();
  if (!tt) { showUrlError("Torrentio install URL is required."); return; }
  const cfg = {
    torrentioUrl: tt,
    profile: state.profile,
    hardFilters: {
      maxResolution: $('select[name=maxResolution]').value,
      minResolution: $('select[name=minResolution]').value,
      requireCached: state.toggles.requireCached,
      maxSizeGB: numOrNull($("#maxSizeGB").value),
      minSeeders: intOrNull($("#minSeeders").value),
      requireHDR: state.toggles.requireHDR,
      excludeHDR: state.toggles.excludeHDR,
      requireAudio: state.audio.size ? [...state.audio] : null,
      languages: state.languages.length ? state.languages : null,
      excludeRdBlocked: false,
    },
    tiebreakers: state.tiebreakerOrder.filter(k => state.tiebreakerEnabled[k]),
    preferredGroups: state.groups,
    sticky: { enabled: state.toggles.stickyEnabled, scope: $("#stickyScope").value },
  };
  const enc = b64url(JSON.stringify(cfg));
  const host = window.location.host, proto = window.location.protocol;
  const url = proto + "//" + host + "/" + enc + "/manifest.json";
  const stremioUrl = "stremio://" + host + "/" + enc + "/manifest.json";
  $("#installUrl").textContent = url;
  $("#openLink").href = stremioUrl;
  $("#installBox").style.display = "block";
  $("#installBox").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("#copyBtn").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#installUrl").textContent); showToast("Copied to clipboard"); }
  catch(e) { showToast("Couldn't copy. Select the URL"); }
});
$("#urlToggle").addEventListener("click", () => {
  const c = $("#urlCollapse"); c.dataset.open = c.dataset.open === "true" ? "false" : "true";
});
function showToast(text) {
  const t = $("#toast"); t.textContent = text; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

// ===== Live stats =====
function fmt(n) { return n.toLocaleString("en-US"); }
fetch("/stats.json").then(r => r.json()).then(s => {
  $("#picksCount").textContent = fmt(s.picks ?? 0);
  $("#installsCount").textContent = fmt(s.installs ?? 0);
}).catch(() => {});

// ===== Brand link: scroll to top =====
$("#brandLink").addEventListener("click", e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Privacy modal =====
$("#privacyLink").addEventListener("click", e => {
  e.preventDefault();
  $("#privacyModal").style.display = "flex";
});
$("#privacyClose").addEventListener("click", () => { $("#privacyModal").style.display = "none"; });
$("#privacyModal").addEventListener("click", e => { if (e.target.id === "privacyModal") e.target.style.display = "none"; });

// ===== Hydrate form from URL config segment if /<cfg>/configure =====
function b64urlDecode(s) {
  try {
    const norm = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(s.length + (4 - s.length % 4) % 4, "=");
    return decodeURIComponent(escape(atob(norm)));
  } catch (e) { return null; }
}
function hydrateFromUrl() {
  const m = window.location.pathname.match(/^\/([A-Za-z0-9_-]{40,})\/configure\/?$/);
  if (!m) return false;
  const json = b64urlDecode(m[1]);
  if (!json) return false;
  let cfg;
  try { cfg = JSON.parse(json); } catch (e) { return false; }
  if (!cfg || typeof cfg !== "object") return false;

  state.applying = true;
  $("#torrentioUrl").value = cfg.torrentioUrl || "";
  const f = cfg.hardFilters || {};
  if (f.maxResolution) $('select[name=maxResolution]').value = f.maxResolution;
  if (f.minResolution) $('select[name=minResolution]').value = f.minResolution;
  setToggle("requireCached", !!f.requireCached);
  setToggle("requireHDR", !!f.requireHDR);
  setToggle("excludeHDR", !!f.excludeHDR);
  $("#maxSizeGB").value = f.maxSizeGB ?? "";
  $("#minSeeders").value = f.minSeeders ?? "";
  state.audio = new Set(Array.isArray(f.requireAudio) ? f.requireAudio : []);
  renderAudioPills();
  state.languages = Array.isArray(f.languages) ? [...f.languages] : [];
  renderLanguages();
  state.groups = Array.isArray(cfg.preferredGroups) ? [...cfg.preferredGroups] : [];
  renderGroups();
  const tiebreakers = Array.isArray(cfg.tiebreakers) ? cfg.tiebreakers : [];
  const enabled = new Set(tiebreakers);
  state.tiebreakerOrder = [...tiebreakers, ...ALL_TIEBREAKERS.filter(k => !enabled.has(k))];
  state.tiebreakerEnabled = {};
  ALL_TIEBREAKERS.forEach(k => state.tiebreakerEnabled[k] = enabled.has(k));
  renderTierList();
  setToggle("stickyEnabled", cfg.sticky?.enabled ?? true);
  if (cfg.sticky?.scope) $("#stickyScope").value = cfg.sticky.scope;
  state.profile = cfg.profile || "custom";
  $all(".preset[data-profile]").forEach(c => c.classList.toggle("selected", c.dataset.profile === state.profile));
  $('.preset[data-profile="custom"]').style.display = state.profile === "custom" ? "" : "none";
  state.applying = false;
  return true;
}

// ===== Init =====
if (!hydrateFromUrl()) selectPreset("4k-hdr");
</script>

</body>
</html>`;
