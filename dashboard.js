import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore,collection,addDoc,deleteDoc,updateDoc,doc,onSnapshot,query,orderBy,serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyCymBHHTJobUogVnBCuSyYJlorMwkZN53E",authDomain:"new-ai-19692.firebaseapp.com",projectId:"new-ai-19692",storageBucket:"new-ai-19692.firebasestorage.app",messagingSenderId:"215456596142",appId:"1:215456596142:web:582e41fc1e7359bba32d3f",measurementId:"G-886M5V7BTD"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);
const state={tasks:[],study:[],exams:[],results:[],attendance:[],finance:[],notes:[]},unsub={};
const names=Object.keys(state);
let modalMode="add",modalType="",modalId="";

function msg(x){$("authMessage").textContent=x||""}
function err(e){
  const map={
    "auth/invalid-email":"সঠিক Email address দিন।","auth/missing-password":"Password দিন।",
    "auth/invalid-credential":"Email অথবা Password সঠিক নয়।","auth/user-not-found":"এই Email দিয়ে কোনো account পাওয়া যায়নি। আগে Create account করুন।",
    "auth/wrong-password":"Password সঠিক নয়।","auth/email-already-in-use":"এই Email দিয়ে account আগে থেকেই আছে। Sign in করুন।",
    "auth/weak-password":"Password কমপক্ষে 6 অক্ষরের হতে হবে।","auth/operation-not-allowed":"Firebase Authentication-এ এই sign-in method চালু করা হয়নি।",
    "auth/unauthorized-domain":"এই website domain Firebase Authentication-এ Firebase Console-এর Authorized domains-এ যোগ করুন।",
    "auth/network-request-failed":"Internet connection সমস্যা হয়েছে। আবার চেষ্টা করুন।"
  };
  return map[e?.code]||e?.message||"কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}
$("emailLoginBtn").onclick=async()=>{msg("");const email=$("email").value.trim(),password=$("password").value;if(!email||!password){msg("Email এবং Password দুটোই দিন।");return}try{await signInWithEmailAndPassword(auth,email,password)}catch(e){msg(err(e))}};
$("registerBtn").onclick=async()=>{const email=$("email").value.trim(),password=$("password").value;if(!email){msg("Email address দিন।");return}if(password.length<6){msg("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");return}try{await createUserWithEmailAndPassword(auth,email,password)}catch(e){msg(err(e))}};
$("logoutBtn").onclick=()=>signOut(auth);

function ref(n){return collection(db,"users",auth.currentUser.uid,n)}
function add(n,d){return addDoc(ref(n),{...d,createdAt:serverTimestamp()})}
function del(n,id){return deleteDoc(doc(db,"users",auth.currentUser.uid,n,id))}
function patch(n,id,d){return updateDoc(doc(db,"users",auth.currentUser.uid,n,id),d)}
function money(n){return "৳"+Number(n||0).toLocaleString("en-BD")}
function date(v){if(!v)return "";const d=new Date(v+"T00:00:00");return isNaN(d)?"":d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]||c))}
function statusClass(v){return "status-"+String(v||"").toLowerCase()}
function priorityClass(v){return "priority-"+String(v||"medium").toLowerCase()}

onAuthStateChanged(auth,u=>{
  if(!u){$("loginPage").classList.remove("hidden");$("dashboardPage").classList.add("hidden");Object.keys(unsub).forEach(k=>unsub[k]?.());return}
  $("loginPage").classList.add("hidden");$("dashboardPage").classList.remove("hidden");
  $("welcomeText").textContent="Good "+(new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening")+", "+(u.displayName||u.email.split("@")[0])+" 👋";
  $("userBadge").textContent=(u.displayName||u.email)[0].toUpperCase();
  names.forEach(sub);
});
function sub(n){
  if(unsub[n])unsub[n]();
  unsub[n]=onSnapshot(query(ref(n),orderBy("createdAt","desc")),s=>{state[n]=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>console.error(n,e));
}

const schema={
 tasks:[["title","Task title","text",1],["date","Date","date"],["time","Time","time"],["priority","Priority","select:low,medium,high"],["category","Category","select:personal,study,work,important"]],
 study:[["subject","Subject","text",1],["target","Goal","text"],["progress","Progress %","number"],["status","Status","select:Active,Paused,Completed"]],
 exams:[["exam","Exam name","text",1],["subject","Subject","text",1],["date","Date","date",1],["time","Time","time"],["status","Status","select:Planned,Preparing,Completed"]],
 results:[["exam","Exam","text"],["subject","Subject","text",1],["marks","Marks","number",1],["total","Total","number",1],["date","Date","date"]],
 attendance:[["date","Date","date",1],["subject","Subject","text"],["status","Status","select:Present,Absent,Leave"]],
 finance:[["title","Description","text",1],["amount","Amount BDT","number",1],["type","Type","select:income,expense"],["category","Category","text"],["date","Date","date"]],
 notes:[["title","Title","text",1],["category","Category","select:Idea,Plan,Work,Study,Personal"],["body","Note","textarea",1]]
};

function validate(type,d){
  for(const f of schema[type])if(f[3]&&!String(d[f[0]]||"").trim())return f[1]+" পূরণ করুন।";
  if(type==="study"&&(Number(d.progress)<0||Number(d.progress)>100))return "Progress 0 থেকে 100-এর মধ্যে দিন।";
  if(type==="results"&&(Number(d.marks)<0||Number(d.total)<=0||Number(d.marks)>Number(d.total)))return "Marks/Total সঠিকভাবে দিন। Marks Total-এর বেশি হতে পারবে না।";
  if(type==="finance"&&Number(d.amount)<0)return "Amount 0 বা তার বেশি হতে হবে।";
  return "";
}
function openForm(type,item=null){
  modalMode=item?"edit":"add";modalType=type;modalId=item?.id||"";
  const labels={tasks:"Task",study:"Study Goal",exams:"Exam",results:"Result",attendance:"Attendance",finance:"Finance Entry",notes:"Note"};
  $("modalTitle").textContent=(item?"Edit ":"Add ")+(labels[type]||"Item");
  $("modalSubtitle").textContent=item?"Update the details and save your changes.":"Fill in the details.";
  let h="";
  schema[type].forEach(f=>{
    const [k,l,t,r]=f,v=item?.[k]??"";
    if(t.startsWith("select:"))h+="<label>"+l+"<select name=\""+k+"\">"+t.slice(7).split(",").map(o=>"<option value=\""+o+"\" "+(String(v)===o?"selected":"")+">"+o+"</option>").join("")+"</select></label>";
    else if(t==="textarea")h+="<label>"+l+"<textarea name=\""+k+"\" "+(r?"required":"")+">"+esc(v)+"</textarea></label>";
    else h+="<label>"+l+"<input name=\""+k+"\" type=\""+t+"\" value=\""+esc(v)+"\" "+(r?"required":"")+"></label>";
  });
  h+="<div class=\"modal-actions\"><button type=\"button\" class=\"secondary-btn\" id=\"modalCancel\">Cancel</button><button class=\"primary-btn\" type=\"submit\">"+(item?"Update":"Save")+"</button></div>";
  $("dynamicForm").innerHTML=h;$("modal").classList.remove("hidden");$("modalCancel").onclick=closeModal;
  $("dynamicForm").onsubmit=async e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries()),problem=validate(type,d);
    if(problem){alert(problem);return}
    if(type==="study")d.progress=Math.max(0,Math.min(100,+d.progress||0));
    if(type==="results"){d.marks=+d.marks;d.total=+d.total}
    if(type==="finance")d.amount=+d.amount;
    try{if(modalMode==="edit")await patch(type,modalId,d);else await add(type,d);closeModal()}catch(x){alert(err(x))}
  };
}
function closeModal(){$("modal").classList.add("hidden");modalMode="add";modalType="";modalId=""}

function renderTasks(){
  const q=($("taskSearch")?.value||"").toLowerCase().trim(),f=$("taskFilter")?.value||"all",p=$("taskPriorityFilter")?.value||"all";
  const list=state.tasks.filter(x=>(!q||[x.title,x.category,x.priority].join(" ").toLowerCase().includes(q))&&(f==="all"||(f==="completed"?x.completed:!x.completed))&&(p==="all"||x.priority===p));
  $("taskList").innerHTML=list.map(x=>"<div class=\"task-row\"><label><input type=\"checkbox\" data-toggle-task=\""+x.id+"\" "+(x.completed?"checked":"")+"><span class=\""+(x.completed?"done":"")+"\">"+esc(x.title)+"</span></label><div><span class=\"badge "+priorityClass(x.priority)+"\">"+esc(x.priority||"medium")+"</span><span class=\"badge\">"+esc(x.category||"personal")+"</span>"+(x.date?"<span class=\"badge\">"+date(x.date)+"</span>":"")+"</div><div><button class=\"row-edit\" data-edit=\"tasks|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"tasks|"+x.id+"\">×</button></div></div>").join("");
  $("emptyTasks").style.display=list.length?"none":"block";
}
function renderStudy(){
  $("studyList").innerHTML=state.study.map(x=>"<article class=\"study-card\"><div class=\"card-top\"><span class=\"badge\">"+esc(x.status||"Active")+"</span><div><button class=\"row-edit\" data-edit=\"study|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"study|"+x.id+"\">×</button></div></div><h3>"+esc(x.subject)+"</h3><p>"+esc(x.target||"No goal added.")+"</p><div class=\"progress-line\"><span style=\"width:"+Math.max(0,Math.min(100,+x.progress||0))+"%\"></span></div><div class=\"progress-label\"><span>Progress</span><strong>"+(+x.progress||0)+"%</strong></div></article>").join("");
  $("emptyStudy").style.display=state.study.length?"none":"block";
}
function renderExams(){
  $("examList").innerHTML=state.exams.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.subject)+"</strong><small>"+esc(x.exam)+" · "+date(x.date)+(x.time?" · "+esc(x.time):"")+"</small></div><span class=\"badge\">"+esc(x.status||"Planned")+"</span><div><button class=\"row-edit\" data-edit=\"exams|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"exams|"+x.id+"\">×</button></div></div>").join("");
  $("emptyExams").style.display=state.exams.length?"none":"block";
}
function renderResults(){
  let marks=0,total=0;state.results.forEach(x=>{marks+=+x.marks||0;total+=+x.total||0});
  const pct=total?Math.round(marks/total*100):0;
  $("resultSummary").innerHTML="<div><small>Total entries</small><strong>"+state.results.length+"</strong></div><div><small>Total marks</small><strong>"+marks+" / "+total+"</strong></div><div><small>Overall percentage</small><strong>"+pct+"%</strong></div>";
  $("resultList").innerHTML=state.results.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.subject)+"</strong><small>"+esc(x.exam||"Result")+" · "+date(x.date)+"</small></div><strong>"+esc(x.marks)+" / "+esc(x.total)+"</strong><div><button class=\"row-edit\" data-edit=\"results|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"results|"+x.id+"\">×</button></div></div>").join("");
  $("emptyResults").style.display=state.results.length?"none":"block";
}
function renderAttendance(){
  const p=state.attendance.filter(x=>x.status==="Present").length,a=state.attendance.filter(x=>x.status==="Absent").length,l=state.attendance.filter(x=>x.status==="Leave").length,n=state.attendance.length;
  $("attendanceSummary").innerHTML="<div><small>Present</small><strong>"+p+"</strong></div><div><small>Absent</small><strong>"+a+"</strong></div><div><small>Attendance rate</small><strong>"+(n?Math.round(p/n*100):0)+"%</strong></div>";
  $("attendanceList").innerHTML=state.attendance.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.subject||"General")+"</strong><small>"+date(x.date)+"</small></div><span class=\"badge "+statusClass(x.status)+"\">"+esc(x.status)+"</span><div><button class=\"row-edit\" data-edit=\"attendance|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"attendance|"+x.id+"\">×</button></div></div>").join("");
  $("emptyAttendance").style.display=state.attendance.length?"none":"block";
}
function renderFinance(){
  let now=new Date(),month=now.getMonth(),year=now.getFullYear(),mi=0,me=0,i=0,e=0;
  state.finance.forEach(x=>{let a=+x.amount||0;if(x.type==="income")i+=a;else e+=a;if(x.date){let d=new Date(x.date+"T00:00:00");if(d.getMonth()===month&&d.getFullYear()===year){if(x.type==="income")mi+=a;else me+=a}}});
  $("financeIncome").textContent=money(i);$("financeExpense").textContent=money(e);$("financeBalance").textContent=money(i-e);$("statBalance").textContent=money(mi-me);
  $("financeList").innerHTML=state.finance.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.title)+"</strong><small>"+esc(x.category||"General")+" · "+date(x.date)+"</small></div><strong>"+(x.type==="expense"?"−":"+")+money(x.amount)+"</strong><div><button class=\"row-edit\" data-edit=\"finance|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"finance|"+x.id+"\">×</button></div></div>").join("");
  $("emptyFinance").style.display=state.finance.length?"none":"block";
}
function renderNotes(){
  $("noteList").innerHTML=state.notes.map(x=>"<article class=\"note-card\"><div class=\"card-top\"><span class=\"badge\">"+esc(x.category||"Note")+"</span><div><button class=\"row-edit\" data-edit=\"notes|"+x.id+"\">Edit</button><button class=\"row-delete\" data-delete=\"notes|"+x.id+"\">×</button></div></div><h3>"+esc(x.title)+"</h3><p>"+esc(x.body)+"</p></article>").join("");
  $("emptyNotes").style.display=state.notes.length?"none":"block";
}
function renderOverview(){
  const today=new Date();today.setHours(0,0,0,0);
  const open=state.tasks.filter(x=>!x.completed),done=state.tasks.filter(x=>x.completed);
  const avg=state.study.length?Math.round(state.study.reduce((s,x)=>s+(+x.progress||0),0)/state.study.length):0;
  $("statTasks").textContent=open.length;$("statCompleted").textContent=done.length;$("statStudy").textContent=avg+"%";
  const a=open.slice(0,5),e=state.exams.filter(x=>x.date&&new Date(x.date+"T00:00:00")>=today).sort((x,y)=>x.date.localeCompare(y.date)).slice(0,5);
  $("overviewTasks").innerHTML=a.length?a.map(x=>"<div class=\"compact-row\"><span class=\"dot\"></span><div><strong>"+esc(x.title)+"</strong><small>"+esc(x.category||"personal")+(x.date?" · "+date(x.date):"")+"</small></div></div>").join(""):"<div class=\"empty-mini\">You are clear. Nice.</div>";
  $("overviewExams").innerHTML=e.length?e.map(x=>"<div class=\"compact-row\"><span class=\"date-box\">"+new Date(x.date+"T00:00:00").getDate()+"</span><div><strong>"+esc(x.subject)+"</strong><small>"+esc(x.exam)+" · "+date(x.date)+"</small></div></div>").join(""):"<div class=\"empty-mini\">No upcoming exams.</div>";
}
function csvEscape(v){return '"'+String(v??"").replace(/"/g,'""')+'"'}
function downloadCSV(type){
  const rows=state[type]||[];if(!rows.length){alert("Export করার মতো কোনো data নেই।");return}
  const fields=Object.keys(rows[0]).filter(k=>k!=="id"&&k!=="createdAt");
  const csv=[fields.map(csvEscape).join(","),...rows.map(r=>fields.map(k=>csvEscape(r[k])).join(","))].join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=type+"-"+new Date().toISOString().slice(0,10)+".csv";a.click();URL.revokeObjectURL(a.href);
}
function printSection(type){
  const labels={tasks:"Tasks Report",study:"Study Center Report",exams:"Exam Planner Report",results:"Results Report",attendance:"Attendance Report",finance:"Finance Report",notes:"Notes & Memory Report"},rows=state[type]||[];
  if(!rows.length){alert("প্রিন্ট করার মতো কোনো data নেই।");return}
  const win=window.open("","_blank");if(!win){alert("Print window blocked. Browser popup allow করুন।");return}
  const fields=Object.keys(rows[0]).filter(k=>k!=="id"&&k!=="createdAt");
  win.document.write("<!doctype html><html><head><title>"+labels[type]+"</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:9px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>"+labels[type]+"</h1><p>Generated "+new Date().toLocaleString()+"</p><table><thead><tr>"+fields.map(f=>"<th>"+esc(f)+"</th>").join("")+"</tr></thead><tbody>"+rows.map(r=>"<tr>"+fields.map(f=>"<td>"+esc(r[f])+"</td>").join("")+"</tr>").join("")+"</tbody></table></body></html>");
  win.document.close();win.focus();setTimeout(()=>win.print(),250);
}
function render(){renderOverview();renderTasks();renderStudy();renderExams();renderResults();renderAttendance();renderFinance();renderNotes()}

document.addEventListener("click",e=>{
  const ex=e.target.closest("[data-export]");if(ex){downloadCSV(ex.dataset.export);return}
  const pr=e.target.closest("[data-print]");if(pr){printSection(pr.dataset.print);return}
  const a=e.target.closest("[data-action]");if(a)openForm(a.dataset.action.replace("add-",""));
  const edit=e.target.closest("[data-edit]");if(edit){const [n,id]=edit.dataset.edit.split("|"),item=state[n].find(x=>x.id===id);if(item)openForm(n,item)}
  const d=e.target.closest("[data-delete]");if(d&&confirm("Delete this item? This cannot be undone.")){const [n,id]=d.dataset.delete.split("|");del(n,id).catch(x=>alert(err(x)))}
});
document.addEventListener("change",e=>{const t=e.target.closest("[data-toggle-task]");if(t)patch("tasks",t.dataset.toggleTask,{completed:t.checked}).catch(x=>{t.checked=!t.checked;alert(err(x))})});
["taskSearch","taskFilter","taskPriorityFilter"].forEach(id=>$(id)?.addEventListener("input",renderTasks));
$("closeModal").onclick=closeModal;$("modal").onclick=e=>{if(e.target===$("modal"))closeModal()};
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{document.querySelectorAll(".section").forEach(s=>s.classList.remove("active-section"));$(b.dataset.section).classList.add("active-section");document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===b));$("sidebar").classList.remove("active")});
document.querySelectorAll("[data-section-link]").forEach(b=>b.onclick=()=>document.querySelector("[data-section=\""+b.dataset.sectionLink+"\"]").click());
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("active");
function clock(){$("clock").textContent=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}setInterval(clock,1000);clock();$("date").textContent=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
