export const STYLES = `
:host { display:block;
  --hz-ink: var(--primary-text-color, #121826);
  --hz-mut: var(--secondary-text-color, #6b7385);
  --hz-line: var(--divider-color, #e6e9f0);
  --hz-card: var(--ha-card-background, var(--card-background-color, #fff));
  --hz-soft: color-mix(in srgb, var(--hz-ink) 4%, transparent);
  --hz-heat: #ff7a45; --hz-ok: #2ec4a6; --hz-warn: #ffb020; --hz-bad: #ff4d6d; --hz-cool: #4f9dff; --hz-vio: #8b7cf6;
  --hz-radius: 24px; --hz-radius-sm: 14px; --hz-shadow: 0 4px 16px rgba(16,24,40,.06); --hz-shadow-lg: 0 8px 32px rgba(16,24,40,.10);
  --hz-gap: 18px;
  --hz-space-1: 4px; --hz-space-2: 6px; --hz-space-3: 8px; --hz-space-4: 12px; --hz-space-5: 16px; --hz-space-6: 18px; --hz-space-7: 24px;
  --hz-text-xs: .72rem; --hz-text-sm: .82rem; --hz-text-md: .9rem; --hz-text-lg: 1.1rem; --hz-text-xl: 1.35rem;
  font-family: var(--ha-font-family-body, Inter, system-ui, sans-serif); color: var(--hz-ink);
}
* { box-sizing: border-box; }
.wrap { display:grid; gap:16px; padding:16px; max-width:1500px; margin:0 auto; }
.head { display:flex; flex-wrap:wrap; align-items:center; gap:10px 14px; }
.head h1 { font-size:1.35rem; margin:0; font-weight:750; letter-spacing:-.01em; }
.head .meta { margin-left:auto; color:var(--hz-mut); font-size:.78rem; display:flex; align-items:center; gap:6px; }
.dot { width:8px; height:8px; border-radius:50%; background:var(--hz-ok); }
.dot.off { background:var(--hz-bad); }
.grid { display:grid; gap:var(--hz-gap); }
.g2 { grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); }
.g3 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.hero { grid-template-columns: minmax(280px, 330px) 1fr; }
.hero2 { display:grid; grid-template-columns: auto 1fr; gap:20px; align-items:center; background:linear-gradient(135deg, color-mix(in srgb, var(--hz-heat) 8%, var(--hz-card)), var(--hz-card)); border:1px solid var(--hz-line); border-radius:var(--hz-radius); padding:20px 24px; box-shadow:var(--hz-shadow); }
.hero2 .score-ring { width:96px; height:96px; flex:none; }
.hero2 .score-val { font-size:2rem; font-weight:800; line-height:1; }
.hero2 .glance { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:12px; }
.hero2 .gl { background:var(--hz-soft); border-radius:var(--hz-radius-sm); padding:10px 12px; }
.hero2 .gl .lbl { font-size:.7rem; color:var(--hz-mut); font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.hero2 .gl .num { font-size:1.4rem; font-weight:800; margin-top:2px; font-variant-numeric:tabular-nums; }
.hero2 .gl .sub { font-size:.72rem; color:var(--hz-mut); margin-top:2px; }
.kpis { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:var(--hz-gap); }
@media (max-width: 520px) { .kpis { grid-template-columns: 1fr 1fr; gap:10px; } .kpis .big { font-size:1.6rem; } }
@media (max-width: 760px) { .hero { grid-template-columns: 1fr; } .hero2 { grid-template-columns: 1fr; } .g2, .g3 { grid-template-columns: 1fr; } .wrap { padding:10px; gap:12px; } .alert { padding:12px 14px; } }
.c { background:var(--hz-card); border:1px solid var(--hz-line); border-radius:var(--hz-radius); padding:20px 22px; min-width:0;
  box-shadow: var(--hz-shadow); transition: box-shadow .2s ease, transform .2s ease; }
.c:hover { box-shadow: var(--hz-shadow-lg); }
.h { display:flex; align-items:center; gap:10px; font-size:.78rem; font-weight:700; color:var(--hz-mut); text-transform:uppercase; letter-spacing:.08em; }
.h .sub { text-transform:none; letter-spacing:0; font-weight:500; }
.q { margin-left:auto; width:20px; height:20px; border-radius:50%; border:1.5px solid var(--hz-line); color:var(--hz-mut); font-size:.7rem;
  display:grid; place-items:center; font-weight:800; cursor:pointer; background:none; padding:0; flex:none; }
.q:hover, .q.on { border-color:var(--hz-heat); color:var(--hz-heat); }
.help { margin:10px 0 2px; padding:10px 12px; border-radius:12px; background:var(--hz-soft); font-size:.84rem; line-height:1.5; color:var(--hz-ink); }
.big { font-size:2.2rem; font-weight:800; letter-spacing:-.03em; margin-top:6px; line-height:1; font-variant-numeric:tabular-nums; }
.big small { font-size:.9rem; color:var(--hz-mut); font-weight:600; margin-left:4px; }
.muted { color:var(--hz-mut); font-size:.82rem; }
.pill { display:inline-flex; align-items:center; gap:6px; font-size:.74rem; font-weight:700; padding:4px 9px; border-radius:999px; white-space:nowrap; }
.tone-ok.pill { background:color-mix(in srgb, var(--hz-ok) 15%, transparent); color:color-mix(in srgb, var(--hz-ok) 75%, var(--hz-ink)); }
.tone-warn.pill { background:color-mix(in srgb, var(--hz-warn) 18%, transparent); color:color-mix(in srgb, var(--hz-warn) 70%, var(--hz-ink)); }
.tone-bad.pill { background:color-mix(in srgb, var(--hz-bad) 15%, transparent); color:color-mix(in srgb, var(--hz-bad) 80%, var(--hz-ink)); }
.tone-mut.pill { background:var(--hz-soft); color:var(--hz-mut); }
.tone-cool.pill { background:color-mix(in srgb, var(--hz-cool) 14%, transparent); color:color-mix(in srgb, var(--hz-cool) 80%, var(--hz-ink)); }
.score { display:flex; gap:18px; align-items:center; margin-top:8px; }
.ring { width:118px; height:118px; flex:none; }
.ringbg { fill:none; stroke:var(--hz-soft); stroke-width:12; }
.ringfg { fill:none; stroke-width:12; stroke-linecap:round; transition: stroke-dasharray .6s ease; }
.ringfg.tone-ok { stroke:var(--hz-ok); } .ringfg.tone-warn { stroke:var(--hz-warn); } .ringfg.tone-bad { stroke:var(--hz-bad); } .ringfg.tone-mut { stroke:var(--hz-mut); }
.ringv { font-size:30px; font-weight:800; fill:var(--hz-ink); }
.lvl { font-weight:800; font-size:1.25rem; }
.spark { width:100%; height:40px; display:block; margin:8px 0 4px; }
.cbox { width:100%; min-width:0; }
.lvgrid { display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap:10px; margin-top:10px; }
.lv { background:var(--hz-soft); border-radius:12px; padding:10px 12px; }
.lv .big { font-size:1.5rem; margin-top:2px; }
.chart { width:100%; height:auto; display:block; margin-top:8px; }
.chart text { font-size:11px; fill:var(--hz-mut); font-family:inherit; }
.chart .unit { font-weight:700; }
.chart .val { fill:var(--hz-ink); font-weight:700; }
.chart .grid { stroke:var(--hz-line); stroke-width:1; }
.chart .ref { stroke:var(--hz-bad); stroke-dasharray:5 4; stroke-width:1.4; }
.chart .mark { stroke:var(--hz-vio); stroke-width:1.5; stroke-dasharray:3 3; }
.chart .markdot { fill:var(--hz-vio); }
.chart .hl { stroke:var(--hz-ink); stroke-width:2; }
.chart .hlt { fill:var(--hz-ink); font-weight:700; font-size:12px; }
.legend { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:.78rem; color:var(--hz-mut); margin-top:6px; }
.legend i { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:5px; vertical-align:-1px; }
.legend i.sw-ok { background:var(--hz-ok); } .legend i.sw-heat { background:var(--hz-heat); } .legend i.sw-cool { background:var(--hz-cool); }
.legend i.sw-vio { background:var(--hz-vio); } .legend i.sw-bad { background:var(--hz-bad); } .legend i.sw-warn { background:var(--hz-warn); }
.alert { display:flex; gap:14px; padding:16px 18px; border-radius:var(--hz-radius-sm); border:1px solid var(--hz-line); background:var(--hz-card); margin-bottom:10px; position:relative; overflow:hidden; }
.alert::before { content:""; position:absolute; left:0; top:0; bottom:0; width:5px; }
.alert.warning::before { background:var(--hz-bad); }
.alert.info::before { background:var(--hz-cool); }
.alert .abody { flex:1; min-width:0; }
.alert .atitle { font-weight:700; font-size:.95rem; display:flex; align-items:center; gap:8px; }
.alert .atitle .aid { color:var(--hz-mut); font-weight:600; font-size:.8rem; }
.alert .adesc { font-size:.85rem; color:var(--hz-mut); margin-top:4px; line-height:1.5; }
.alert .aev { display:inline-flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.alert .aev span { font-size:.72rem; color:var(--hz-mut); background:var(--hz-soft); border-radius:6px; padding:3px 8px; }
.alert .asug { font-size:.84rem; margin-top:8px; line-height:1.5; }
.alert .asug b { color:var(--hz-ink); }
.find { display:flex; gap:12px; padding:12px 0; border-top:1px solid var(--hz-line); }
.find:first-of-type { border-top:0; }
.sev { width:5px; border-radius:4px; flex:none; }
.sev.warning { background:var(--hz-bad); } .sev.info { background:var(--hz-cool); }
.ft { font-weight:700; font-size:.95rem; }
.ft .id { color:var(--hz-mut); font-weight:600; margin-right:6px; }
.fd { font-size:.85rem; color:var(--hz-mut); margin-top:3px; line-height:1.45; }
.fs { font-size:.85rem; margin-top:6px; line-height:1.45; }
.ev { display:inline-flex; flex-wrap:wrap; gap:6px; margin-top:7px; }
.ev span { font-size:.74rem; color:var(--hz-mut); background:var(--hz-soft); border-radius:7px; padding:3px 7px; }
.empty { color:var(--hz-mut); font-size:.88rem; padding:10px 0; line-height:1.5; }
.seg { display:inline-flex; background:var(--hz-soft); border-radius:999px; padding:3px; gap:2px; }
.seg button { border:0; background:none; color:var(--hz-mut); font:inherit; font-size:.76rem; font-weight:700; padding:5px 11px; border-radius:999px; cursor:pointer; }
.seg button.on { background:var(--hz-card); color:var(--hz-ink); box-shadow:0 1px 3px rgba(0,0,0,.12); }
.room { display:grid; grid-template-columns: minmax(110px, 1.2fr) 2fr 64px; gap:10px; align-items:center; padding:9px 0; border-top:1px solid var(--hz-line); font-size:.88rem; }
.room:first-of-type { border-top:0; }
.room .nm { font-weight:650; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.room .nm small { display:block; font-weight:500; color:var(--hz-mut); font-size:.74rem; }
.room b { text-align:right; font-variant-numeric:tabular-nums; }
.dev { position:relative; height:12px; border-radius:7px; background:var(--hz-soft); }
.dev .mid { position:absolute; left:50%; top:-3px; bottom:-3px; width:1.5px; background:var(--hz-line); }
.dev .tol { position:absolute; top:0; bottom:0; background:color-mix(in srgb, var(--hz-ok) 12%, transparent); }
.dev i { position:absolute; top:0; bottom:0; border-radius:7px; }
.dev .p90 { position:absolute; top:3px; bottom:3px; width:2px; background:var(--hz-ink); opacity:.45; }
.room .extra { grid-column: 1 / -1; display:flex; flex-wrap:wrap; gap:6px; margin-top:-2px; }
.cblock { padding:14px 0; border-top:1px solid var(--hz-line); }
.cblock:first-of-type { border-top:0; }
.ct { font-weight:700; margin-bottom:8px; }
.circ { display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:14px; }
.meter { height:10px; border-radius:6px; background:var(--hz-soft); overflow:hidden; margin-top:6px; }
.meter i { display:block; height:100%; border-radius:6px; }
.chg { display:grid; grid-template-columns: 14px 1fr; gap:12px; padding:12px 0; border-top:1px solid var(--hz-line); }
.chg:first-of-type { border-top:0; }
.chg .d { width:12px; height:12px; border-radius:50%; background:var(--hz-vio); margin-top:4px; }
.chg .t { font-weight:700; }
.cmp { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:8px; margin-top:8px; }
.cmp div { background:var(--hz-soft); border-radius:10px; padding:8px 10px; font-size:.78rem; color:var(--hz-mut); }
.cmp b { display:block; color:var(--hz-ink); font-size:.95rem; margin-top:2px; }
form.log { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin-top:12px; }
form.log label { display:grid; gap:4px; font-size:.75rem; color:var(--hz-mut); font-weight:600; }
form.log input { font:inherit; font-size:.9rem; padding:8px 10px; border-radius:10px; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-ink); }
.btn { font:inherit; font-size:.82rem; font-weight:700; border:0; border-radius:999px; padding:8px 14px; cursor:pointer;
  background:color-mix(in srgb, var(--hz-heat) 14%, transparent); color:color-mix(in srgb, var(--hz-heat) 80%, var(--hz-ink)); }
.btn.primary { background:var(--hz-heat); color:#fff; }
.btn.ghost { background:var(--hz-soft); color:var(--hz-ink); }
.row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
table { width:100%; border-collapse:collapse; font-size:.85rem; margin-top:8px; }
th { text-align:left; color:var(--hz-mut); font-weight:600; font-size:.74rem; padding:6px 8px; border-bottom:1px solid var(--hz-line); }
td { padding:7px 8px; border-bottom:1px solid var(--hz-line); vertical-align:top; }
.src { display:flex; justify-content:space-between; gap:10px; padding:7px 0; border-top:1px solid var(--hz-line); font-size:.86rem; }
.src:first-of-type { border-top:0; }
.filters { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:10px; }
.chip { font:inherit; font-size:.74rem; font-weight:700; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-mut);
  border-radius:999px; padding:4px 10px; cursor:pointer; }
.chip.on { background:var(--hz-soft); color:var(--hz-ink); border-color:transparent; }
.search { margin-left:auto; font:inherit; font-size:.82rem; padding:6px 10px; border-radius:999px; border:1px solid var(--hz-line);
  background:var(--hz-card); color:var(--hz-ink); min-width:150px; }
table.kv { margin-top:6px; }
table.kv th { border-bottom:0; width:38%; color:var(--hz-mut); font-weight:600; }
table.kv td { border-bottom:1px solid var(--hz-line); }
.day { font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--hz-mut); margin:14px 0 4px; }
.day:first-of-type { margin-top:8px; }
.log { border-top:1px solid var(--hz-line); }
.log:first-of-type { border-top:0; }
.logrow { display:grid; grid-template-columns: 62px auto 92px 1fr; gap:8px; align-items:baseline; width:100%; text-align:left;
  font:inherit; font-size:.82rem; background:none; border:0; padding:7px 0; cursor:pointer; color:var(--hz-ink); }
.logrow .lt { color:var(--hz-mut); font-variant-numeric:tabular-nums; }
.logrow .cat { color:var(--hz-mut); font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; }
.logrow .msg { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.log.open .logrow .msg { white-space:normal; }
.log .details { padding:6px 10px 10px; background:var(--hz-soft); border-radius:10px; margin-bottom:8px; }
.log pre { margin:6px 0 0; font-size:.74rem; white-space:pre-wrap; word-break:break-word; max-height:260px; overflow:auto; }
.restart { display:flex; align-items:center; gap:8px; color:var(--hz-mut); font-size:.74rem; font-weight:700; margin:8px 0 4px; }
.restart::before, .restart::after { content:""; flex:1; height:1px; background:var(--hz-line); }
@media (max-width: 760px) {
  .logrow { grid-template-columns: 54px auto 1fr; }
  .logrow .cat { display:none; }
  .search { width:100%; margin-left:0; }
}

.srcrow { display:grid; grid-template-columns: minmax(180px, 1fr) 2fr; gap:8px; align-items:center; padding:6px 0; border-top:1px solid var(--hz-line); }
.srcrow:first-of-type { border-top:0; }
.srcrow label { font-size:.78rem; color:var(--hz-mut); font-weight:600; word-break:break-all; }
.srcrow input { font:inherit; font-size:.85rem; padding:6px 10px; border-radius:10px; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-ink); }
.cfggroup { margin-top:10px; }
.cfggroup .h { margin-bottom:6px; }
.cfgjson { width:100%; min-height:160px; font-family:ui-monospace,monospace; font-size:.78rem; padding:10px; border-radius:12px; border:1px solid var(--hz-line); background:var(--hz-soft); color:var(--hz-ink); resize:vertical; }


.schema { display:grid; gap:12px; }
.srow { display:flex; justify-content:center; }
.sbox { background:var(--hz-card); border:1px solid var(--hz-line); border-radius:14px; padding:12px 16px; min-width:150px; text-align:center; box-shadow:0 1px 2px rgba(16,24,40,.04); }
.swp { border-color:var(--hz-heat); }
.spuffer { border-color:var(--hz-cool); }
.scirc { border-color:var(--hz-ok); }
.stitle { font-weight:700; font-size:.9rem; }
.sval { font-size:1.1rem; font-weight:800; margin-top:4px; }
.smut { color:var(--hz-mut); font-size:.74rem; margin-top:2px; }
.sarrow { text-align:center; color:var(--hz-mut); font-size:1.4rem; margin:4px 0; }
.sarrowh { text-align:center; color:var(--hz-mut); font-size:1.4rem; margin:0 8px; align-self:center; }
.scircuits { display:flex; flex-wrap:wrap; gap:16px; justify-content:center; }
.scircuit { display:grid; gap:8px; justify-items:center; }
.srooms { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.sroom { background:var(--hz-soft); border-radius:10px; padding:6px 10px; min-width:90px; text-align:center; font-size:.78rem; }
.sroom .snm { font-weight:700; }
.sroom .sval { font-size:.78rem; font-weight:600; margin-top:2px; }
.sroom .smut { font-size:.7rem; }
.slegend { color:var(--hz-mut); font-size:.78rem; text-align:center; margin-top:8px; }


.nav { display:flex; flex-wrap:wrap; gap:6px; margin:4px 0 8px; }
.navpill { font:inherit; font-size:.78rem; font-weight:700; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-mut); border-radius:999px; padding:6px 12px; cursor:pointer; transition: all .15s ease; }
.navpill:hover { border-color:var(--hz-heat); color:var(--hz-heat); }
.navpill.on { background:color-mix(in srgb, var(--hz-heat) 14%, transparent); border-color:transparent; color:color-mix(in srgb, var(--hz-heat) 80%, var(--hz-ink)); }
.skeleton .sk { background:linear-gradient(90deg, var(--hz-soft) 25%, color-mix(in srgb, var(--hz-ink) 6%, transparent) 50%, var(--hz-soft) 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:8px; height:14px; margin-bottom:10px; }
.skeleton .sk-title { height:24px; width:40%; }
.skeleton .sk-line { width:90%; }
.skeleton .sk-line.short { width:60%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (max-width: 760px) { .nav { flex-wrap:wrap; gap:5px; } .navpill { padding:5px 9px; font-size:.74rem; } }

.flash { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--hz-ink); color:var(--hz-card); padding:9px 16px; border-radius:999px; font-size:.85rem; font-weight:600; z-index:9; }
.mt6 { margin-top:6px; } .mt8 { margin-top:8px; } .mt10 { margin-top:10px; } .mt12 { margin-top:12px; }
.legend.between { justify-content:space-between; margin:6px 0 2px; }
/* --- 0.7.0: gemeinsame Formular- und Tab-Bausteine ------------------------- */
.intro { display:flex; align-items:center; gap:12px; flex-wrap:wrap; color:var(--hz-mut); font-size:.84rem; }
.intro .progress { flex:1; min-width:160px; }
.progress { height:8px; border-radius:999px; background:var(--hz-soft); overflow:hidden; }
.progress span { display:block; height:100%; border-radius:999px; background:var(--hz-ok); transition:width .3s ease; }
.banner { border-radius:var(--hz-radius-sm); padding:10px 14px; font-size:.85rem; font-weight:600; border:1px solid var(--hz-line); }
.banner.tone-ok { background:color-mix(in srgb, var(--hz-ok) 10%, var(--hz-card)); border-color:color-mix(in srgb, var(--hz-ok) 35%, var(--hz-line)); }
.banner.tone-bad { background:color-mix(in srgb, var(--hz-bad) 10%, var(--hz-card)); border-color:color-mix(in srgb, var(--hz-bad) 35%, var(--hz-line)); }
.row.start { justify-content:flex-start; margin-top:10px; }
.span2 { grid-column:1 / -1; }
.field { display:grid; gap:4px; min-width:0; }
.field > label { font-size:.75rem; color:var(--hz-mut); font-weight:600; }
.field .unit { font-weight:500; opacity:.8; }
.field .req { color:var(--hz-bad); }
.field input, .field select, .field textarea, textarea[data-inv-csv] {
  font:inherit; font-size:.9rem; padding:9px 11px; min-height:40px; border-radius:10px;
  border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-ink); width:100%;
}
.field input:focus, .field select:focus, .field textarea:focus, textarea[data-inv-csv]:focus {
  outline:2px solid color-mix(in srgb, var(--hz-heat) 45%, transparent); outline-offset:1px;
}
.field.invalid input, .field.invalid select { border-color:var(--hz-bad); }
.ferr { color:color-mix(in srgb, var(--hz-bad) 85%, var(--hz-ink)); font-size:.76rem; font-weight:600; }
.formhead { font-size:.9rem; margin-bottom:2px; }
.arrcard { border:1px solid var(--hz-line); border-radius:var(--hz-radius-sm); padding:12px 14px; margin-top:10px; background:color-mix(in srgb, var(--hz-soft) 40%, var(--hz-card)); }
.arrhead { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
.detailgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:10px; }
.detail { background:var(--hz-soft); border-radius:10px; padding:8px 10px; display:grid; gap:2px; }
.detail .dl { font-size:.72rem; color:var(--hz-mut); font-weight:700; }
.detail .dv { font-size:.95rem; font-weight:700; font-variant-numeric:tabular-nums; }
.impexp { margin-top:14px; border-top:1px solid var(--hz-line); padding-top:10px; }
.impexp summary { cursor:pointer; font-size:.8rem; font-weight:700; color:var(--hz-mut); }
.impexp textarea { margin:8px 0; font-family:ui-monospace, monospace; font-size:.78rem; min-height:96px; resize:vertical; }
.rowact { display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.btn.danger { color:color-mix(in srgb, var(--hz-bad) 85%, var(--hz-ink)); }
.btn, .navpill { min-height:36px; }
.tablewrap { overflow-x:auto; }
.rtable { min-width:0; }
.rtable th, .rtable td { white-space:nowrap; }
.formfocus { min-height:0; }
@media (max-width: 520px) {
  .btn, .navpill, .q { min-height:44px; }
  .q { width:32px; height:32px; min-height:32px; }
  .rtable thead { display:none; }
  .rtable, .rtable tbody, .rtable tr, .rtable td { display:block; width:100%; }
  .rtable tr { border:1px solid var(--hz-line); border-radius:12px; padding:8px 10px; margin-bottom:8px; }
  .rtable td { border:0; padding:4px 0; white-space:normal; display:flex; justify-content:space-between; gap:12px; }
  .rtable td::before { content:attr(data-label); color:var(--hz-mut); font-size:.72rem; font-weight:700; }
  .rtable td:last-child { justify-content:flex-end; }
  .srcrow { grid-template-columns:1fr; }
}


/* ===================== 0.8: neue Optik ===================== */
:host {
  --hz-radius: 18px; --hz-radius-sm: 12px;
  --hz-shadow: 0 1px 2px rgba(16,24,40,.05); --hz-shadow-lg: 0 6px 24px rgba(16,24,40,.08);
  --hz-band: color-mix(in srgb, var(--hz-ok) 13%, transparent);
  --hz-glass: color-mix(in srgb, var(--hz-card) 82%, transparent);
  --hz-display: "Space Grotesk", var(--ha-font-family-body, Inter, system-ui, sans-serif);
}
.wrap { gap:14px; }
.c { padding:18px 20px; }
.c:hover { box-shadow:var(--hz-shadow); }
.h { gap:8px; font-size:.72rem; letter-spacing:.09em; }
.h .grow { flex:1; }
.h > span:not(.pill):not(.grow) { text-transform:none; letter-spacing:0; font-weight:500; }
.h > span:first-child { text-transform:uppercase; letter-spacing:.09em; font-weight:700; }
.q { margin-left:4px; }
.wide { grid-column:1 / -1; }
.mt14 { margin-top:14px; }

/* Kopf und Tabs */
.top { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.brand { display:flex; align-items:center; gap:10px; font-size:1.05rem; }
.brand b { font-family:var(--hz-display); font-weight:700; letter-spacing:-.01em; }
.logo { width:22px; height:22px; border-radius:7px; background:conic-gradient(from 200deg, var(--hz-cool), var(--hz-ok), var(--hz-warn), var(--hz-heat), var(--hz-cool)); }
.top .meta { margin-left:auto; }
.tabs { display:flex; gap:4px; padding:4px; background:var(--hz-card); border:1px solid var(--hz-line); border-radius:14px; overflow-x:auto; scrollbar-width:none; }
.tabs::-webkit-scrollbar { display:none; }
.tab { flex:none; display:inline-flex; align-items:center; gap:7px; font:inherit; font-size:.8rem; font-weight:650; color:var(--hz-mut);
  background:none; border:0; border-radius:10px; padding:8px 12px; cursor:pointer; min-height:38px; }
.tab svg { width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
.tab:hover { color:var(--hz-ink); background:var(--hz-soft); }
.tab.on { color:var(--hz-ink); background:var(--hz-soft); box-shadow:inset 0 -2px 0 var(--hz-heat); }
.tab:focus-visible { outline:2px solid var(--hz-heat); outline-offset:1px; }

/* Kernsatz */
.say { padding:2px 2px 0; }
.say p { margin:0; font-family:var(--hz-display); font-size:1.05rem; font-weight:500; line-height:1.4; color:var(--hz-ink); text-wrap:balance; }
.say p b { font-weight:700; }
.say span { display:block; color:var(--hz-mut); font-size:.78rem; margin-top:2px; }
em.ok, em.bad { font-style:normal; font-weight:700; }
em.ok { color:color-mix(in srgb, var(--hz-ok) 80%, var(--hz-ink)); }
em.bad { color:color-mix(in srgb, var(--hz-bad) 80%, var(--hz-ink)); }

/* Übersicht */
.grid.ov { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }
.verdict .big-say { margin:10px 0 2px; font-family:var(--hz-display); font-size:1.3rem; font-weight:600; line-height:1.3; letter-spacing:-.01em; text-wrap:balance; }
.chart .band { fill:var(--hz-band); stroke:none; }
.todo { display:grid; gap:8px; margin-top:12px; }
.todo-i { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; background:var(--hz-soft); border-radius:12px; padding:10px 12px; font-size:.86rem; }
.todo-i > i { width:8px; height:8px; border-radius:50%; }
.todo-i > i.tone-ok { background:var(--hz-ok); } .todo-i > i.tone-warn { background:var(--hz-warn); } .todo-i > i.tone-bad { background:var(--hz-bad); }
.todo-i b { display:block; font-weight:650; }
.todo-i small { color:var(--hz-mut); font-size:.75rem; }
.trio, .strip { display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px; margin-top:10px; }
.trio small, .strip small { display:block; color:var(--hz-mut); font-size:.74rem; }
.trio b, .strip b { font-family:var(--hz-display); font-size:1.45rem; font-weight:700; font-variant-numeric:tabular-nums; letter-spacing:-.01em; }
.trio b i, .strip b i, .num i { font-style:normal; font-family:inherit; font-size:.8rem; color:var(--hz-mut); font-weight:600; margin-left:3px; }
.strip > div { background:var(--hz-soft); border-radius:12px; padding:10px 12px; }
.strip span { display:block; color:var(--hz-mut); font-size:.74rem; margin-top:2px; }
.k4 { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:var(--hz-gap); }
.kpi .num { font-family:var(--hz-display); font-size:2rem; font-weight:700; letter-spacing:-.02em; margin-top:8px; font-variant-numeric:tabular-nums; line-height:1; }
.kpi .spark { height:34px; }

/* Betrieb */
.lanes { display:grid; gap:6px; margin-top:12px; font-size:.74rem; }
.lane { display:grid; grid-template-columns:42px 1fr; gap:10px; align-items:center; }
.lane > span { color:var(--hz-mut); font-variant-numeric:tabular-nums; }
.lane .bar { position:relative; height:22px; background:var(--hz-soft); border-radius:6px; overflow:hidden; }
.lane .bar i { position:absolute; top:0; bottom:0; border-radius:3px; }
.lane .bar i.thin { top:30%; bottom:30%; }
.lane.ax > div { display:flex; justify-content:space-between; color:var(--hz-mut); font-size:.68rem; }

/* Räume */
.heat { overflow-x:auto; margin-top:10px; }
.heat table { width:auto; border-collapse:separate; border-spacing:2px; margin:0; }
.heat th { border:0; padding:0 0 3px; text-align:center; font-size:.66rem; font-weight:500; }
.heat td { border:0; padding:0; }
.heat td.n { padding-right:10px; font-weight:650; font-size:.8rem; white-space:nowrap; }
.heat td.v { width:22px; height:22px; border-radius:4px; }
.heat td.m { padding-left:10px; font-variant-numeric:tabular-nums; white-space:nowrap; font-size:.8rem; }
.scale { display:flex; align-items:center; gap:8px; margin-top:10px; font-size:.7rem; color:var(--hz-mut); max-width:320px; }
.scale i { flex:1; height:10px; border-radius:5px; background:linear-gradient(90deg, rgb(58,123,255), rgb(66,198,232) 25%, rgb(46,196,166) 50%, rgb(255,207,74) 67%, rgb(255,138,61) 85%, rgb(255,77,109)); }
.grid.rooms { grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); }
.rcard, .dcard { display:grid; gap:8px; align-content:start; }
.rcard .top, .dcard .top, .grid.g3 > .c .top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.rcard .num { font-family:var(--hz-display); font-size:1.6rem; font-weight:700; font-variant-numeric:tabular-nums; }
.row2 { display:flex; justify-content:space-between; gap:10px; font-size:.8rem; color:var(--hz-mut); }
.row2 span:last-child { color:var(--hz-ink); text-align:right; }
.rcard .meter { height:6px; margin-top:0; }
.rcard .meter i { background:linear-gradient(90deg, var(--hz-warn), var(--hz-heat)); }

/* Hydraulik */
.flowwrap { overflow-x:auto; margin-top:8px; }
svg.flow { min-width:820px; width:100%; height:auto; display:block; }
svg.flow text { font-family:inherit; fill:var(--hz-ink); }
svg.flow .lbl { font-size:11px; font-weight:700; letter-spacing:1px; fill:var(--hz-mut); }
svg.flow .v1 { font-family:var(--hz-display); font-size:30px; font-weight:700; }
svg.flow .v2 { font-family:var(--hz-display); font-size:19px; font-weight:700; }
svg.flow .v2s { font-size:14px; font-weight:700; }
svg.flow .v3 { font-size:11px; fill:var(--hz-mut); }
svg.flow .v3.sm { font-size:10px; }
svg.flow .v3.ok { fill:var(--hz-ok); font-weight:700; }
svg.flow .tv { font-size:10.5px; font-weight:700; text-anchor:middle; }
svg.flow .cv { font-size:10px; font-weight:700; }
svg.flow .node { fill:var(--hz-card); stroke:var(--hz-line); }
svg.flow .tag, svg.flow .glass { fill:var(--hz-glass); }
svg.flow .tank { opacity:.92; }
svg.flow .pipe { fill:none; stroke-width:7; stroke-linecap:round; stroke-linejoin:round; }
svg.flow .pipe.mid { stroke-width:6; }
svg.flow .pipe.thin { stroke-width:5; }
svg.flow .dash { fill:none; stroke:var(--hz-card); stroke-width:2; opacity:0; }
svg.flow .dash.pipe-flow { opacity:.55; stroke-dasharray:6 6; animation:hzflow 1.2s linear infinite; }
svg.flow .valve { fill:var(--hz-card); stroke:var(--hz-heat); stroke-width:2.5; }
svg.flow .pumpc { fill:var(--hz-card); stroke:var(--hz-line); stroke-width:2; }
svg.flow .pump-rot { transform-box:fill-box; transform-origin:center; animation:hzspin 1.6s linear infinite; }
@keyframes hzflow { to { stroke-dashoffset:-24; } }
@keyframes hzspin { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { svg.flow .dash.pipe-flow, svg.flow .pump-rot { animation:none; } }

/* Geräte */
.dcard .md { font-size:.85rem; }
.tscroll { overflow-x:auto; }
table.tbl { margin-top:4px; }
table.tbl td { white-space:nowrap; }

@media (max-width: 1100px) { .k4 { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
@media (max-width: 440px) { .k4 { grid-template-columns:1fr; } .top .meta { margin-left:0; } }
@media (max-width: 760px) {
  .grid.ov { grid-template-columns:1fr; }
  .tab span { display:none; }
  .tab.on span { display:inline; }
  .verdict .big-say { font-size:1.12rem; }
  .kpi .num { font-size:1.6rem; }
}
.dsline { display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; margin-top:10px; font-size:.82rem; color:var(--hz-mut); }
.dsline b { color:var(--hz-ink); font-size:1rem; }
.row2 .dot { display:inline-block; margin-right:6px; vertical-align:middle; }
.dcard a { color:var(--hz-cool); }
`;
