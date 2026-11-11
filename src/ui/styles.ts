//
//  styles.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

/**
 * The one stylesheet every portal shares. It reads theme tokens only (themes.ts); the
 * active theme's values arrive separately in /_ui/theme.css, so changing the theme in Ops
 * never changes this file or its cache.
 */
export const BASE_CSS = `
@font-face{font-family:"Anek Latin";src:url(/fonts/anek-latin.woff2) format("woff2");font-weight:100 800;font-stretch:75% 125%;font-display:swap}
@font-face{font-family:"Hind";src:url(/fonts/hind-400.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"Hind";src:url(/fonts/hind-500.woff2) format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:"Hind";src:url(/fonts/hind-600.woff2) format("woff2");font-weight:600 700;font-display:swap}
@font-face{font-family:"Inter";src:url(/fonts/inter.woff2) format("woff2");font-weight:100 900;font-display:swap}
*,*::before,*::after{box-sizing:border-box}
html{color-scheme:var(--scheme,light);-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 1rem/1.55 var(--font-body);-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--font-display);font-weight:var(--display-weight);line-height:1.15;margin:0;text-wrap:balance;letter-spacing:-.01em}
h1{font-size:clamp(1.6rem,1.2rem + 1.2vw,2.1rem)}h2{font-size:1.25rem}h3{font-size:1.05rem}
p{margin:0}
a{color:var(--accent);text-underline-offset:.2em;text-decoration-thickness:1px}
a:hover{text-decoration-thickness:2px}
::selection{background:var(--accent);color:var(--accent-ink)}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px;border-radius:4px}
html{scrollbar-color:var(--line) transparent}
img{max-width:100%;height:auto}
code{font:500 .85em/1 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:.15em .4em}
.num,table{font-variant-numeric:tabular-nums}
.muted{color:var(--ink-2)}
.small{font-size:.875rem}
.skip{position:absolute;left:.75rem;top:-4rem;z-index:60;background:var(--surface);color:var(--ink);padding:.6rem .9rem;border-radius:var(--radius);box-shadow:var(--shadow)}.skip:focus{top:.75rem}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.stack{display:grid;gap:var(--gap,1rem)}
.cluster{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
form.cluster:has(.field){align-items:flex-end}
.split{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between}
svg.i{width:1.15em;height:1.15em;flex:none;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;vertical-align:-.2em}

/* Shell: a rail and a work area. On phones the rail becomes a top bar with a menu. */
.app{display:grid;grid-template-columns:16rem minmax(0,1fr);min-height:100vh}
.rail{background:var(--rail-image),var(--rail-bg);color:var(--rail-ink);padding:1.25rem .9rem;display:flex;flex-direction:column;gap:1.25rem;position:sticky;top:0;height:100vh;overflow-y:auto;border-right:1px solid color-mix(in srgb,var(--rail-ink) 12%,transparent)}
.brand{display:flex;align-items:center;gap:.6rem;color:inherit;text-decoration:none;font:var(--display-weight) 1.3rem/1 var(--font-display);letter-spacing:-.01em}
.brand svg{width:2rem;height:2rem;flex:none}
.rail-org{border-top:1px solid color-mix(in srgb,var(--rail-ink) 18%,transparent);padding-top:1rem;font-size:.85rem;color:var(--rail-muted)}
.rail-org strong{display:block;color:var(--rail-ink);font:600 1rem/1.25 var(--font-display)}
.rail nav{display:grid;gap:1rem}
.rail nav h2{font:600 .7rem/1 var(--font-display);letter-spacing:.09em;text-transform:uppercase;color:var(--rail-muted);margin:0 .7rem .35rem}
.rail nav a{display:flex;align-items:center;gap:.65rem;padding:.55rem .7rem;border-radius:var(--radius);color:var(--rail-ink);text-decoration:none;font-weight:500}
.rail nav a:hover{background:color-mix(in srgb,var(--rail-ink) 10%,transparent)}
.rail nav a[aria-current=page]{background:var(--rail-active-bg);color:var(--rail-active-ink);font-weight:600}
.rail-foot{margin-top:auto;display:grid;gap:.5rem;font-size:.85rem;color:var(--rail-muted)}
.rail-foot strong{color:var(--rail-ink);font-weight:600;display:block}
.rail-foot button{all:unset;cursor:pointer;color:var(--rail-ink);display:inline-flex;gap:.5rem;align-items:center;padding:.35rem 0}
.rail-foot button:hover{text-decoration:underline}
.menu{display:none}
.work{padding:clamp(1rem,.6rem + 1.6vw,2rem);display:grid;gap:1.4rem;align-content:start;min-width:0}
@media (max-width:860px){
  .app{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr}
  .rail{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;padding:.75rem 1rem;gap:.75rem}
  .rail-org{border:0;padding:0;font-size:.8rem}.rail-org span{display:none}
  .menu{display:block;margin-left:auto}
  .menu>summary{list-style:none;cursor:pointer;display:inline-flex;gap:.4rem;align-items:center;color:var(--rail-ink);padding:.5rem .8rem;border-radius:var(--radius);border:1px solid color-mix(in srgb,var(--rail-ink) 30%,transparent);font-weight:600}
  .menu>summary::-webkit-details-marker{display:none}
  .rail>nav,.rail>.rail-foot{display:none}
  .menu[open]~nav,.menu[open]~.rail-foot{display:grid;flex-basis:100%}
}

/* The find bar at the top of the work area. */
.find{display:flex;align-items:center;gap:.6rem;background:var(--surface);border:1.5px solid color-mix(in srgb,var(--ink) 18%,var(--line));border-radius:var(--radius);padding:0 .9rem;color:var(--ink-2);box-shadow:var(--shadow)}
.find:focus-within{outline:3px solid var(--focus);outline-offset:1px;border-color:var(--accent)}
.find input{border:0;background:transparent;padding:.75rem 0;min-height:3rem;font-size:1rem}
.find input:focus-visible{outline:0}

/* Page heading and sections. */
/* Where a page sits: breadcrumbs, then the module's tabs. */
.crumbs ol{display:flex;flex-wrap:wrap;gap:.35rem;list-style:none;margin:0 0 .6rem;padding:0;font-size:.85rem;color:var(--ink-2)}
.crumbs li+li::before{content:"/";margin-right:.35rem;color:var(--line)}
.crumbs a{color:var(--ink-2);text-decoration:none}.crumbs a:hover{color:var(--accent);text-decoration:underline}
.crumbs [aria-current]{color:var(--ink);font-weight:600}
.tabs{display:flex;gap:.25rem;overflow-x:auto;border-bottom:1px solid var(--line);margin:0 0 1.25rem;scrollbar-width:none}
.tabs a{flex:none;padding:.6rem .85rem;color:var(--ink-2);text-decoration:none;font-weight:500;border-bottom:2px solid transparent;margin-bottom:-1px}
.tabs a:hover{color:var(--ink)}
.tabs a[aria-current=page]{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}
.tabs a:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
/* Modals: one short task at a time. */
.modal{border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);color:var(--ink);box-shadow:var(--shadow);padding:1.25rem;width:min(32rem,calc(100vw - 2rem));max-height:calc(100vh - 2rem)}
.modal:target:not([open]){display:block;position:fixed;inset:0;margin:auto;height:fit-content;z-index:50}
.modal::backdrop{background:color-mix(in srgb,var(--ink) 45%,transparent)}
.modal>header{display:flex;gap:1rem;align-items:flex-start;justify-content:space-between;margin-bottom:1rem}
.modal>header h2,.modal h2{font-size:1.15rem}
.modal>header p{color:var(--ink-2);font-size:.9rem;margin-top:.25rem}
.modal .modal-actions{justify-content:flex-end;margin-top:.5rem}
@media (prefers-reduced-motion:no-preference){.modal[open]{animation:modal-in .16s ease-out}}
@keyframes modal-in{from{opacity:0;transform:translateY(6px)}}
.page-head{display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-end;justify-content:space-between}
.page-head p{color:var(--ink-2);margin-top:.35rem;max-width:62ch}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);box-shadow:var(--shadow);min-width:0}
.panel>header{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between;padding:1rem 1.15rem .8rem}
.panel>header p{color:var(--ink-2);font-size:.9rem;margin-top:.15rem}
.panel>.body{padding:0 1.15rem 1.15rem}
.panel>.flush{overflow-x:auto;position:relative}
.grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))}
.grid-main{display:grid;gap:1.25rem;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);align-items:start}
@media (max-width:1100px){.grid-main{grid-template-columns:1fr}}

/* Live figures: plain statements on the page ground, number first, then its words. */
.figures{list-style:none;margin:0;padding:.25rem 0;display:flex;flex-wrap:wrap;gap:.6rem 2.25rem;align-items:baseline}
.figures li{display:flex;flex-wrap:wrap;align-items:baseline;gap:.15rem .45rem;font-size:1.02rem;color:var(--ink-2)}
.figures strong{font:var(--display-weight) 1.7rem/1.1 var(--font-display);color:var(--ink);font-variant-numeric:tabular-nums}
.figures strong.due{color:var(--due)}
.figures .note{flex-basis:100%;font-size:.85rem}
.figures a{font-size:.9rem;font-weight:600}
.figures a.stat{font-size:inherit;font-weight:inherit;color:inherit;text-decoration:none;display:inline-flex;align-items:baseline;gap:.45rem}
.figures a.stat:hover strong{text-decoration:underline;text-underline-offset:.2em}

/* Registers. */
table{width:100%;border-collapse:collapse}
th{font:600 .72rem/1.2 var(--font-display);letter-spacing:.07em;text-transform:uppercase;color:var(--ink-2);text-align:left;padding:.7rem 1.15rem;border-bottom:1px solid var(--line);background:var(--surface-2);white-space:nowrap}
td{padding:.75rem 1.15rem;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);vertical-align:middle}
tr:last-child td{border-bottom:0}
tbody tr:hover td{background:color-mix(in srgb,var(--surface-2) 70%,transparent)}
th.r,td.r{text-align:right}
td .sub{display:block;font-size:.82rem;color:var(--ink-2)}
td a{font-weight:600}
td form{margin:0}

@media (max-width:640px){
  .panel>.flush{overflow-x:visible}
  .flush table,.flush tbody,.flush tr{display:block}
  .flush thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .flush tr{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem .9rem;padding:.8rem 1.15rem;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
  .flush tr:last-child{border-bottom:0}
  .flush td{display:block;padding:0;border:0;text-align:left!important}
  .flush td:first-child{flex-basis:100%}
  .flush td:empty{display:none}
  .flush td.r[data-label]::before{content:attr(data-label) " ";color:var(--ink-2);font-weight:400}
}

/* Status marks: one line, a tint of the tone, the theme decides dot, case and corners. */
.mark{--tone:var(--info);display:inline-flex;align-items:center;gap:.4rem;font:600 var(--mark-size)/1.25 var(--font-body);letter-spacing:.01em;text-transform:var(--mark-case);color:var(--mark-ink);border:var(--mark-border) solid color-mix(in srgb,var(--tone) 40%,transparent);border-radius:var(--mark-radius);background:color-mix(in srgb,var(--tone) var(--mark-fill),var(--surface));box-shadow:var(--mark-ring);transform:rotate(var(--mark-rotate));padding:var(--mark-pad);min-width:var(--mark-min);aspect-ratio:var(--mark-aspect);white-space:nowrap}
.mark::before{content:"";display:var(--mark-dot);width:.5rem;height:.5rem;border-radius:50%;background:var(--tone);flex:none}
.mark small{font-size:1em;font-weight:500}
.mark small::before{content:"· "}
.mark.paid{--tone:var(--paid)}.mark.due{--tone:var(--due)}.mark.sent{--tone:var(--sent)}.mark.info{--tone:var(--info)}

/* Forms. */
form{margin:0}
.form{display:grid;gap:1rem}
.fields{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));align-items:start}
.field{display:grid;gap:.35rem;min-width:0}
.field label,.legend{font-weight:600;font-size:.92rem}
.field .hint{font-size:.82rem;color:var(--ink-2)}
input,select,textarea{font:inherit;color:var(--ink);background:var(--surface);border:1.5px solid color-mix(in srgb,var(--ink) 22%,var(--line));border-radius:var(--radius);padding:.62rem .8rem;width:100%;min-height:2.75rem}
input:hover,select:hover,textarea:hover{border-color:color-mix(in srgb,var(--ink) 40%,var(--line))}
input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--focus);outline-offset:1px;border-color:var(--accent)}
input[type=checkbox],input[type=radio]{width:1.15rem;height:1.15rem;min-height:0;accent-color:var(--accent);padding:0}
input[type=file]{padding:.4rem;cursor:pointer;color:var(--ink-2)}
input[type=file]::file-selector-button{font:600 .9rem/1 var(--font-body);color:var(--accent);background:transparent;border:1.5px solid var(--accent);border-radius:calc(var(--radius) - 2px);padding:.5rem .85rem;margin-right:.75rem;cursor:pointer}
input[type=file]::file-selector-button:hover{background:color-mix(in srgb,var(--accent) 8%,transparent)}
input:disabled,select:disabled,textarea:disabled{opacity:.6;cursor:not-allowed}
fieldset{border:0;padding:0;margin:0;min-width:0}
.checks{display:flex;flex-wrap:wrap;gap:.4rem 1.1rem}
.checks label{display:inline-flex;gap:.45rem;align-items:center;font-weight:500}
.btn,button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font:600 .95rem/1 var(--font-body);min-height:2.75rem;padding:.7rem 1.15rem;border-radius:var(--radius);border:1.5px solid var(--accent);background:var(--accent-image),var(--accent);color:var(--accent-ink);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color .15s ease-out,transform .15s ease-out}
.btn:hover,button:hover{background:var(--accent-hover);border-color:var(--accent-hover)}
.btn:active,button:active{transform:translateY(1px)}
.btn.quiet,button.quiet{background:transparent;color:var(--accent)}
.btn.quiet:hover,button.quiet:hover{background:color-mix(in srgb,var(--accent) 8%,transparent)}
.btn.danger,button.danger{background:transparent;color:var(--ink);border-color:color-mix(in srgb,var(--ink) 35%,transparent)}
.btn.danger:hover,button.danger:hover{background:color-mix(in srgb,var(--ink) 7%,transparent)}
.btn.sm,button.sm{min-height:2.25rem;padding:.45rem .8rem;font-size:.875rem}
button:disabled{opacity:.55;cursor:not-allowed}
details>summary{cursor:pointer;font-weight:600;color:var(--accent);list-style:none;display:inline-flex;align-items:center;gap:.5rem}
details>summary::-webkit-details-marker{display:none}
details>summary::before{content:"";width:.45rem;height:.45rem;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg);transition:transform .15s ease-out;flex:none}
details[open]>summary::before{transform:rotate(45deg)}
.menu>summary::before{display:none}

/* Read-only facts, on the same grid as fields. */
.facts{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));margin:0}
.facts dt{font-size:.85rem;color:var(--ink-2)}.facts dd{margin:0}
/* A one-field form inside a register cell. */
.inline-form{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.inline-form input{width:auto;flex:1 1 9rem;min-height:2.25rem;padding:.4rem .65rem}

/* Messages and empty states. Errors are ink with an alert icon: red stays for money. */
.error-text{color:var(--ink);font-weight:600;font-size:.875rem}
.banner{display:flex;gap:.7rem;align-items:flex-start;padding:.85rem 1rem;border-radius:var(--radius);border:1px solid var(--line);background:var(--surface)}
.banner.good{border-color:color-mix(in srgb,var(--paid) 40%,transparent);background:color-mix(in srgb,var(--paid) 8%,var(--surface))}
.banner.bad{border-color:var(--ink);border-width:1.5px;background:var(--surface);font-weight:500}
.banner.warn{border-color:color-mix(in srgb,var(--sent) 45%,transparent);background:color-mix(in srgb,var(--sent) 9%,var(--surface))}
.banner svg{margin-top:.15rem;color:var(--ink-2)}.banner.bad svg{color:var(--ink)}.banner.good svg{color:var(--paid)}
.empty{padding:2rem 1.15rem;text-align:center;display:grid;gap:.5rem;justify-items:center;color:var(--ink-2)}
.empty strong{color:var(--ink);font:600 1.05rem var(--font-display)}

/* A line of stops: onboarding, a term, any sequence that has a "you are here". */
.stops{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr))}
.stops li{position:relative;padding-top:1.6rem;font-size:.85rem;color:var(--ink-2);padding-right:.5rem}
.stops li::before{content:"";position:absolute;top:.35rem;left:0;width:.9rem;height:.9rem;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--surface)}
.stops li::after{content:"";position:absolute;top:.7rem;left:.9rem;right:0;height:3px;background:var(--accent)}
.stops li:last-child::after{display:none}
.stops li.todo::before{background:var(--surface);border:3px solid color-mix(in srgb,var(--ink) 25%,transparent)}
.stops li.todo::after{background:color-mix(in srgb,var(--ink) 15%,transparent)}
.stops li.here::before{background:var(--surface);border:3px solid var(--accent)}
.stops li strong{display:block;color:var(--ink);font-weight:600}
.stops a{font-weight:600}
@media (max-width:640px){.stops{grid-template-columns:1fr;gap:.9rem}.stops li{padding:0 0 0 1.8rem}.stops li::before{top:.2rem}.stops li::after{left:.4rem;top:1.1rem;width:3px;height:calc(100% + .4rem);right:auto}}

/* Module list on a home: rows with a mark, never icon tiles. */
.modules{list-style:none;margin:0;padding:0;display:grid}
.modules li{display:flex;gap:1rem;align-items:center;justify-content:space-between;padding:.8rem 1.15rem;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
.modules li:first-child{border-top:0}
.modules .what{display:grid;gap:.1rem}
.modules .what span{font-size:.85rem;color:var(--ink-2)}
.modules li.locked .what strong{color:var(--ink-2)}
.later{padding:.9rem 1.15rem;border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent);display:grid;gap:.35rem;font-size:.9rem}
.later strong{font-weight:600}

/* Sign-in: the organisation on one side, the form on the other. */
.auth{min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,32rem)}
.auth-side{background:var(--rail-image),var(--rail-bg);color:var(--rail-ink);padding:clamp(1.5rem,4vw,3.5rem);display:flex;flex-direction:column;justify-content:space-between;gap:2rem;position:relative;overflow:hidden}
.auth-side h1{font-size:clamp(2rem,1.4rem + 2.4vw,3.4rem);max-width:14ch;color:var(--rail-ink)}
.auth-side p{color:var(--rail-muted);max-width:40ch;margin-top:.8rem}
.auth-side .seal{position:absolute;right:-4rem;bottom:-4rem;width:22rem;height:22rem;opacity:.16;color:var(--rail-ink)}
.auth-main{padding:clamp(1.5rem,4vw,3.5rem);display:grid;align-content:center;gap:1.25rem;background:var(--surface)}
.auth-main h2{font-size:1.6rem}
.auth-logo{max-height:4rem;width:auto}
@media (max-width:860px){.auth{grid-template-columns:1fr}.auth-side{padding-bottom:2rem}.auth-side .seal{width:12rem;height:12rem;right:-2rem;bottom:-3rem}}

/* Theme previews in Ops settings. */
.theme-pick{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr))}
.theme-card{border:2px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface);color:var(--ink);font-family:var(--font-body);display:grid}
.theme-card.on{border-color:var(--accent)}
.theme-card .demo{background:var(--bg);color:var(--ink);font-family:var(--font-body);display:grid;grid-template-columns:4.5rem 1fr;min-height:9.5rem}
.theme-card .demo .r{background:var(--rail-image),var(--rail-bg);padding:.6rem .5rem;display:grid;gap:.35rem;align-content:start}
.theme-card .demo .r i{display:block;height:.45rem;border-radius:3px;background:color-mix(in srgb,var(--rail-ink) 35%,transparent)}
.theme-card .demo .r i.on{background:var(--rail-active-bg)}
.theme-card .demo .w{padding:.7rem;display:grid;gap:.5rem;align-content:start}
.theme-card .demo .w b{font:var(--display-weight) 1rem var(--font-display)}
.theme-card .demo .row{display:flex;gap:.5rem;align-items:center;justify-content:space-between;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:.4rem .5rem;font-size:.8rem}
.theme-card .demo .mark{font-size:.7rem}
.demo-screen .figures strong{font-size:1.35rem}
.theme-card .about{padding:.9rem 1rem;display:grid;gap:.5rem;border-top:1px solid var(--line)}

/* Marketing site. */
.site-head{display:flex;align-items:center;gap:1.5rem;justify-content:space-between;padding:1rem clamp(1rem,4vw,3rem);background:var(--rail-bg);color:var(--rail-ink)}
.site-head nav{display:flex;gap:1.25rem;flex-wrap:wrap}
.site-head nav a{color:var(--rail-ink);text-decoration:none;font-weight:500}
.site-head nav a:hover{text-decoration:underline}
.hero{background:var(--rail-image),var(--rail-bg);color:var(--rail-ink);padding:clamp(2rem,6vw,5rem) clamp(1rem,4vw,3rem) clamp(2rem,5vw,4rem)}
.hero-slide{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:clamp(2rem,4vw,4rem);align-items:center}
.hero .eyebrow{display:inline-block;font-size:.85rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--rail-muted);margin-bottom:.9rem}
.hero .hero-title{font-size:clamp(2.3rem,1.5rem + 3.4vw,4.6rem);line-height:1.02;letter-spacing:-.025em;color:var(--rail-ink);max-width:13ch}
.hero p{color:var(--rail-muted);font-size:1.15rem;max-width:46ch;margin-top:1.1rem}
.hero .cluster{margin-top:1.75rem}
.hero .btn{background:var(--rail-active-bg);color:var(--rail-active-ink);border-color:var(--rail-active-bg)}
.hero .btn.quiet{background:transparent;color:var(--rail-ink);border-color:color-mix(in srgb,var(--rail-ink) 40%,transparent)}
.demo-screen{background:var(--bg);border-radius:var(--radius-lg);box-shadow:0 30px 60px -30px rgb(0 0 0 / .55);overflow:hidden;color:var(--ink);transform:rotate(-1.2deg)}
.demo-screen .bar{display:flex;gap:.4rem;padding:.6rem .8rem;background:var(--surface-2);border-bottom:1px solid var(--line);font-size:.78rem;color:var(--ink-2);align-items:center}
.demo-screen .bar i{width:.6rem;height:.6rem;border-radius:50%;background:var(--line)}
.demo-screen .inner{padding:1rem;display:grid;gap:.9rem}
.demo-screen .label{font-size:.75rem;color:var(--ink-2)}
@media (max-width:960px){.hero-slide{grid-template-columns:1fr}.demo-screen{transform:none}}
/* Marketing: the screen slideshow, the core grid and the add-on strip. */
.slides{display:grid;gap:.9rem;min-width:0}
.slides-track{display:grid;grid-auto-flow:column;grid-auto-columns:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:var(--radius-lg)}
.slides-track::-webkit-scrollbar{display:none}
.slides-track:focus-visible{outline:2px solid var(--focus);outline-offset:4px}
.slide{scroll-snap-align:start;margin:0;padding:.25rem .25rem 1.5rem}
.slides-controls{display:flex;gap:1rem;align-items:center}
.slides-step{min-height:0;width:2.4rem;height:2.4rem;padding:0;border-radius:50%;background:transparent;color:var(--rail-ink);border:1px solid color-mix(in srgb,var(--rail-ink) 40%,transparent);font-size:1.1rem;cursor:pointer}
.slides-step:hover{background:color-mix(in srgb,var(--rail-ink) 12%,transparent)}
.slides-dots{display:flex;gap:.5rem}
.slides-dots button{width:.65rem;height:.65rem;min-height:0;padding:0;border-radius:50%;border:0;background:color-mix(in srgb,var(--rail-ink) 35%,transparent);cursor:pointer}
.slides-dots button[aria-current]{background:var(--rail-ink);width:1.6rem;border-radius:1rem}
@media (prefers-reduced-motion:no-preference){.slides-dots button{transition:width .2s ease}}
.core{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))}
.core article{background:var(--bg);border:1px solid var(--line);border-radius:var(--radius-lg);padding:1.1rem;display:grid;gap:.35rem;align-content:start}
.core h3{font-size:1rem}.core p{color:var(--ink-2);font-size:.92rem}
.plan-price{font-size:.95rem;color:var(--ink-2)}.plan-price strong{font:var(--display-weight) 1.6rem/1.1 var(--font-display);color:var(--ink);letter-spacing:-.01em;margin-right:.25rem}
.cycle-switch{position:relative;display:inline-flex;gap:.25rem;padding:.25rem;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);justify-self:start}
.cycle-switch input{position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none}
.cycle-switch label{padding:.45rem .9rem;border-radius:calc(var(--radius) - 2px);cursor:pointer;font-weight:600;color:var(--ink-2)}
.cycle-switch label span{font-weight:500;font-size:.8rem;color:var(--paid);margin-left:.3rem}
.cycle-switch input:checked+label{background:var(--accent);color:var(--accent-ink)}
.cycle-switch input:checked+label span{color:inherit;opacity:.85}
.cycle-switch input:focus-visible+label{outline:2px solid var(--focus);outline-offset:2px}
.band:has(#cy-monthly:checked) .p-y,.band:has(#cy-yearly:checked) .p-m{display:none}
.plan-package{font-size:.9rem;color:var(--ink-2);margin-top:.35rem;padding-top:.45rem;border-top:1px dashed var(--line)}.plan-package strong{color:var(--ink)}
/* A printable invoice: a sheet on screen, the sheet alone on paper. */
.invoice-page{max-width:52rem;margin:0 auto;padding:clamp(1rem,3vw,2rem)}
.invoice-bar{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin-bottom:1rem}
.invoice{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);box-shadow:var(--shadow);padding:clamp(1.25rem,4vw,2.5rem);display:grid;gap:1.5rem;color:var(--ink)}
.invoice h1{font-size:1.6rem}.invoice h2{font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-2);margin-bottom:.35rem}
.invoice-head{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;border-bottom:2px solid var(--ink);padding-bottom:1rem}
.invoice-parties{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))}
.invoice-lines{width:100%;border-collapse:collapse}.invoice-lines th,.invoice-lines td{padding:.55rem .25rem;border-bottom:1px solid var(--line);text-align:left}
.invoice-lines .r{text-align:right;font-variant-numeric:tabular-nums}.invoice-lines tfoot th{font-weight:500;color:var(--ink-2)}
.invoice-lines tr.total th,.invoice-lines tr.total td{font-weight:700;color:var(--ink);border-bottom:2px solid var(--ink)}
@media print{.no-print{display:none!important}.invoice-page{max-width:none;padding:0}.invoice{border:0;box-shadow:none;padding:0}body{background:#fff}}
.tt-wrap{overflow-x:auto}.tt{border-collapse:collapse;width:100%;min-width:36rem}.tt th,.tt td{border:1px solid var(--line);padding:.45rem .55rem;text-align:left;vertical-align:top;font-size:.9rem}.tt thead th{background:var(--surface-2)}.tt .sub{display:block;color:var(--ink-2);font-size:.8rem}.tt select{width:100%;min-width:7rem}
.notice h3{font-size:1.05rem}.notice>p{margin:0}
.idcards-page{max-width:60rem}.idcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(85.6mm,1fr));gap:6mm}
.idcard{width:85.6mm;min-height:54mm;border:1px solid var(--line);border-radius:3mm;background:var(--surface);color:var(--ink);overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;break-inside:avoid;font-size:8.5pt}
.idcard header{display:flex;gap:2mm;align-items:center;background:var(--accent);color:var(--accent-ink);padding:2mm 3mm}.idcard header img{width:8mm;height:8mm;object-fit:contain;background:#fff;border-radius:1mm}
.idcard header span{display:block;font-size:7pt;opacity:.85}.idcard-body{display:flex;gap:3mm;padding:2.5mm 3mm}.idcard-body span{display:block}
.idphoto{width:20mm;height:25mm;object-fit:cover;border:1px solid var(--line);border-radius:1mm;flex:none;display:block}.idname{display:block;font-size:10.5pt;margin-bottom:1mm}
.idcard footer{font-size:7pt;padding:1mm 3mm;border-top:1px solid var(--line);color:var(--ink-2)}
.certificate{max-width:170mm;margin:0 auto;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:14mm;display:grid;gap:7mm;break-inside:avoid}
.certificate header{display:flex;gap:4mm;align-items:center;border-bottom:1px solid var(--line);padding-bottom:5mm}.certificate header img{width:12mm;height:12mm;object-fit:contain}
.certificate header strong{display:block;font-size:13pt}.certificate header span{display:block;font-size:8.5pt;color:var(--ink-2)}
.certificate h1{margin:0;text-align:center;font-size:13pt;letter-spacing:.09em;text-transform:uppercase}
.certificate.on-template{border:none;background-size:cover;background-position:center;background-repeat:no-repeat;min-height:265mm;padding:40mm 24mm 24mm}
.certificate.on-template>header{display:none}
.certificate-no{display:flex;justify-content:space-between;margin:0;font-size:8.5pt;color:var(--ink-2)}
.certificate-body{margin:0;font-size:11.5pt;line-height:2.1;text-align:justify}
.certificate footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:10mm;font-size:9pt;color:var(--ink-2)}.certificate footer .sign{border-top:1px solid var(--line);padding-top:2mm;min-width:45mm;text-align:center;color:var(--ink)}
@media print{.idcards-page{max-width:none}.idcard header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.slips-page{max-width:60rem}.slips{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,88mm),1fr))}
.slip{border:1px dashed var(--ink-2);background:var(--surface);color:var(--ink);padding:4mm 5mm;min-height:66mm;display:grid;gap:2mm;align-content:start;break-inside:avoid;font-size:9pt}
.slip header{display:flex;gap:2mm;align-items:center}.slip header img{width:9mm;height:9mm;object-fit:contain}.slip header strong{display:block;font-size:10.5pt}.slip header span{display:block;font-size:7.5pt;color:var(--ink-2)}
.slip dl{display:grid;grid-template-columns:auto 1fr;gap:1mm 3mm;margin:0}.slip dt{color:var(--ink-2)}.slip dd{margin:0;font-weight:600;overflow-wrap:anywhere}
.slip .slip-pin{font:700 17pt/1.1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.18em}
.slip ol{margin:0;padding-left:4.5mm;font-size:8pt;color:var(--ink-2)}
.signin-email{margin-top:1.5rem;border-top:1px solid var(--line);padding-top:1rem}.signin-email summary{cursor:pointer;color:var(--accent);font-weight:600;min-height:2.75rem;display:flex;align-items:center}
@media print{.slips-page{max-width:none}.slips{grid-template-columns:1fr 1fr}.slip{min-height:0;height:68mm;overflow:hidden}}
.cal{border-collapse:collapse;width:100%;min-width:36rem;table-layout:fixed}.cal th{font-size:.8rem;color:var(--ink-2);text-align:left;padding:.3rem .4rem}
.cal td{border:1px solid var(--line);vertical-align:top;height:4.2rem;padding:.3rem .4rem;font-size:.8rem}.cal .cal-n{display:block;font-weight:600;margin-bottom:.2rem}
.cal .cal-weekly,.cal .cal-holiday{background:var(--surface-2)}.cal .cal-off{color:var(--ink-2)}.cal .cal-blank{border:0}.cal .cal-today{outline:2px solid var(--accent);outline-offset:-2px}
.school-logo{width:2.25rem;height:2.25rem;object-fit:contain;flex:none;background:#fff;border-radius:.45rem;padding:.15rem}
.school-initial{width:2.25rem;height:2.25rem;flex:none;display:grid;place-items:center;border-radius:.45rem;background:color-mix(in srgb,currentColor 16%,transparent);font:700 1.1rem/1 var(--font-display)}
.powered{margin:0;font-size:.75rem;opacity:.8}.powered a{color:inherit;font-weight:600}
.soon{display:inline-block;font-size:.72rem;font-weight:600;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line);border-radius:999px;padding:0 .45rem;margin-left:.2rem;vertical-align:1px;white-space:nowrap}
.plan-layers{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))}
.plan-layers ul{margin:.35rem 0 0;padding-left:1.1rem;display:grid;gap:.2rem}
.addons{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:baseline;padding:1rem 1.25rem;border:1px dashed var(--line);border-radius:var(--radius-lg)}
.addons span{color:var(--ink-2)}
.band{padding:clamp(2.5rem,6vw,5rem) clamp(1rem,4vw,3rem);display:grid;gap:2rem}
.band>header{max-width:46rem;display:grid;gap:.75rem}
.band>header h2{font-size:clamp(1.7rem,1.3rem + 1.6vw,2.6rem)}
.band>header p{color:var(--ink-2);font-size:1.1rem}
.band.alt{background:var(--surface)}
.roles{display:grid;gap:0;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface)}
.roles article{padding:1.25rem;border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:grid;gap:.5rem;align-content:start}
.roles h3{font-size:1.1rem}
.roles ul{margin:0;padding-left:1.1rem;color:var(--ink-2);display:grid;gap:.25rem}
@media (max-width:900px){.roles{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:560px){.roles{grid-template-columns:1fr}}
.plans{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))}
.plan{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);padding:1.4rem;display:grid;gap:.8rem;align-content:start}
.plan.lead{border:2px solid var(--accent)}
.plan ul{margin:0;padding-left:1.1rem;display:grid;gap:.3rem}
.site-foot{padding:2rem clamp(1rem,4vw,3rem);background:var(--rail-image),var(--rail-bg);color:var(--rail-muted);display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;font-size:.9rem}
.site-foot a{color:var(--rail-ink)}
/* Older screen markup, mapped onto the same tokens until each screen is recomposed. */
.work>h2,.work>h3,.panel h3{margin-top:.4rem}
.work>form:not(.stack):not(.find),.work>details{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);padding:1.15rem;display:grid;gap:1rem;box-shadow:var(--shadow)}
.work>form>label,.work>form>fieldset>label{font-weight:600;font-size:.92rem}
.row{display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-end}.row>div{flex:1 1 12rem;display:grid;gap:.35rem}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);padding:1rem 1.15rem;box-shadow:var(--shadow);display:grid;gap:.6rem}
button.secondary,.btn.secondary{background:transparent;color:var(--accent)}
p.banner{display:block}
legend{font-weight:600;font-size:.92rem;margin-bottom:.35rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}.demo-screen{transform:none}}
@media print{.rail,.menu,.page-head .cluster,button{display:none!important}.app{display:block}.panel{box-shadow:none}}
`;
