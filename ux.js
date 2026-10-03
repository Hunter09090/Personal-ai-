const UX_KEY="personal-workspace-preferences";
const uxPrefs=JSON.parse(localStorage.getItem(UX_KEY)||"{}");
const ux=sel=>document.querySelector(sel);
function saveUX(){localStorage.setItem(UX_KEY,JSON.stringify(uxPrefs))}
function applyUX(){document.body.classList.toggle("compact-mode",!!uxPrefs.compact);document.body.classList.toggle("focus-mode",!!uxPrefs.focus)}
function setOnline(){const online=navigator.onLine;[ux("#connectionStatus"),ux("#settingsConnection")].forEach(el=>{if(!el)return;el.textContent=online?"Online":"Offline";el.classList.toggle("offline",!online)})}
function openSettings(){ux("#settingsPanel")?.classList.remove("hidden")}
function closeSettings(){ux("#settingsPanel")?.classList.add("hidden")}
function toast(text){const t=ux("#uxToast");if(!t)return;t.textContent=text;t.classList.add("show");clearTimeout(window.__uxToast);window.__uxToast=setTimeout(()=>t.classList.remove("show"),2400)}
let deferredInstall=null;
applyUX();setOnline();
if(!document.querySelector('link[rel="manifest"]')){const l=document.createElement("link");l.rel="manifest";l.href="./manifest.webmanifest";document.head.appendChild(l)}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;ux("#installAppBtn")?.classList.remove("hidden")});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").then(reg=>{reg.update();if(reg.waiting)toast("A new app version is ready. Refresh to update.");reg.addEventListener("updatefound",()=>{const w=reg.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)toast("New version available — refresh when convenient.")})})}).catch(()=>{}))}
window.addEventListener("online",()=>{setOnline();toast("Connection restored")});window.addEventListener("offline",()=>{setOnline();toast("You are offline — existing data may still be visible")});
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeSettings();if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement?.tagName)){e.preventDefault();ux("#globalSearch")?.focus()}if(e.key.toLowerCase()==="n"&&!/input|textarea|select/i.test(document.activeElement?.tagName)){e.preventDefault();ux('[data-action="add-task"]')?.click()}});
document.addEventListener("click",e=>{if(e.target.closest("#settingsBtn"))openSettings();if(e.target.closest("#settingsClose"))closeSettings();if(e.target.id==="settingsPanel")closeSettings();const compact=e.target.closest("#compactToggle");if(compact){uxPrefs.compact=!uxPrefs.compact;saveUX();applyUX();toast(uxPrefs.compact?"Compact mode enabled":"Compact mode disabled")}const focus=e.target.closest("#focusToggle");if(focus){uxPrefs.focus=!uxPrefs.focus;saveUX();applyUX();toast(uxPrefs.focus?"Focus mode enabled":"Focus mode disabled")}const shortcut=e.target.closest("#shortcutHelp");if(shortcut){toast("Shortcuts: / search · N new task · Esc close")}const install=e.target.closest("#installAppBtn");if(install&&deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null;install.classList.add("hidden")})}const show=e.target.closest("#showPassword");if(show){const p=ux("#password");if(p){p.type=p.type==="password"?"text":"password";show.textContent=p.type==="password"?"Show":"Hide"}}});
