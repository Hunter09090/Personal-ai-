import { initializeApp,getApps } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore,collection,addDoc,updateDoc,doc,serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Reliability layer: keeps CRUD working even if the main form handler fails.
const config={apiKey:"AIzaSyCymBHHTJobUogVnBCuSyYJlorMwkZN53E",authDomain:"new-ai-19692.firebaseapp.com",projectId:"new-ai-19692",storageBucket:"new-ai-19692.firebasestorage.app",messagingSenderId:"215456596142",appId:"1:215456596142:web:582e41fc1e7359bba32d3f",measurementId:"G-886M5V7BTD"};
const app=getApps().length?getApps()[0]:initializeApp(config),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);
let activeType="",activeId="";
const typeByTitle={Task:"tasks","Study Goal":"study",Exam:"exams",Result:"results",Attendance:"attendance","Finance Entry":"finance",Note:"notes"};
const numeric={study:["progress"],results:["marks","total"],finance:["amount"]};
function typeFromModal(){const title=$("modalTitle")?.textContent||"";const clean=title.replace(/^(Add|Edit)\s+/i,"").trim();return typeByTitle[clean]||activeType}
function toast(text){const t=$("uxToast");if(t){t.textContent=text;t.classList.add("show");clearTimeout(window.__repairToast);window.__repairToast=setTimeout(()=>t.classList.remove("show"),2400)}else alert(text)}
function collectForm(form,type){const d=Object.fromEntries(new FormData(form).entries());(numeric[type]||[]).forEach(k=>{if(d[k]!==undefined)d[k]=Number(d[k])});if(type==="tasks")d.completed=false;return d}
function valid(type,d){const required={tasks:["title"],study:["subject"],exams:["exam","subject","date"],results:["subject"],attendance:["date"],finance:["title","amount"],notes:["title","body"]}[type]||[];for(const k of required)if(!String(d[k]??"").trim())return "Required field পূরণ করুন।";if(type==="study"&&(d.progress<0||d.progress>100))return "Progress 0–100-এর মধ্যে দিন।";if(type==="results"&&(d.marks<0||d.total<=0||d.marks>d.total))return "Marks/Total সঠিকভাবে দিন।";if(type==="finance"&&d.amount<0)return "Amount 0 বা তার বেশি হতে হবে।";return ""}

document.addEventListener("click",e=>{
  const add=e.target.closest("[data-action]");if(add){const raw=add.dataset.action||"";if(raw.startsWith("add-")){activeType=raw.slice(4);activeId=""}}
  const edit=e.target.closest("[data-edit]");if(edit){const [n,id]=(edit.dataset.edit||"").split("|");activeType=n||"";activeId=id||""}
},true);

document.addEventListener("submit",async e=>{
  const form=e.target;if(form.id!=="dynamicForm")return;
  const type=typeFromModal();if(!type||!auth.currentUser)return;
  // Capture phase runs before the original onsubmit handler, preventing duplicate writes.
  e.preventDefault();e.stopImmediatePropagation();
  const d=collectForm(form,type),problem=valid(type,d);if(problem){toast(problem);return}
  const btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent="Saving…"}
  try{
    const base=collection(db,"users",auth.currentUser.uid,type);
    if(activeId)await updateDoc(doc(db,"users",auth.currentUser.uid,type,activeId),d);
    else {if(type!=="tasks")delete d.completed;await addDoc(base,{...d,createdAt:serverTimestamp()})}
    $("modal")?.classList.add("hidden");toast(activeId?"Updated successfully":"Saved successfully");activeId="";
  }catch(err){console.error("CRUD repair",err);toast("Save করা যায়নি। Internet/Firebase connection check করে আবার চেষ্টা করুন।")}
  finally{if(btn){btn.disabled=false;btn.textContent=activeId?"Update":"Save"}}
},true);

window.addEventListener("unhandledrejection",e=>{console.error(e.reason);toast("একটি operation সম্পন্ন হয়নি। আবার চেষ্টা করুন।")});
window.addEventListener("error",e=>console.error("Workspace error",e.error||e.message));
