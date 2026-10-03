import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signInWithPopup,signInWithRedirect,getRedirectResult,GoogleAuthProvider,signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore,collection,addDoc,deleteDoc,updateDoc,doc,onSnapshot,query,orderBy,serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyCymBHHTJobUogVnBCuSyYJlorMwkZN53E",authDomain:"new-ai-19692.firebaseapp.com",projectId:"new-ai-19692",storageBucket:"new-ai-19692.firebasestorage.app",messagingSenderId:"215456596142",appId:"1:215456596142:web:582e41fc1e7359bba32d3f",measurementId:"G-886M5V7BTD"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),googleProvider=new GoogleAuthProvider();
const $=id=>document.getElementById(id), state={tasks:[],study:[],exams:[],results:[],attendance:[],finance:[],notes:[]},unsub={};
const names=Object.keys(state);
function msg(x){$("authMessage").textContent=x||""}
function err(e){
  const code=e?.code||"";
  const map={
    "auth/invalid-email":"সঠিক Email address দিন।",
    "auth/missing-password":"Password দিন।",
    "auth/invalid-credential":"Email অথবা Password সঠিক নয়।",
    "auth/user-not-found":"এই Email দিয়ে কোনো account পাওয়া যায়নি। আগে Create account করুন।",
    "auth/wrong-password":"Password সঠিক নয়।",
    "auth/email-already-in-use":"এই Email দিয়ে account আগে থেকেই আছে। Sign in করুন।",
    "auth/weak-password":"Password কমপক্ষে 6 অক্ষরের হতে হবে।",
    "auth/operation-not-allowed":"Firebase Authentication-এ এই sign-in method চালু করা হয়নি।",
    "auth/popup-closed-by-user":"Google login window বন্ধ হয়ে গেছে। আবার চেষ্টা করুন।",
    "auth/popup-blocked":"Browser popup block করেছে। Google login আবার চাপুন।",
    "auth/unauthorized-domain":"এই website domain Firebase Authentication-এ অনুমোদিত নয়। Firebase Console-এর Authorized domains-এ GitHub Pages domain যোগ করতে হবে।",
    "auth/network-request-failed":"Internet connection সমস্যা হয়েছে। আবার চেষ্টা করুন।"
  };
  return map[code]||e?.message||"Login করা যায়নি। আবার চেষ্টা করুন।";
}
$("emailLoginBtn").onclick=async()=>{
  msg("");
  const email=$("email").value.trim(), password=$("password").value;
  if(!email||!password){msg("Email এবং Password দুটোই দিন।");return}
  try{await signInWithEmailAndPassword(auth,email,password);msg("")}catch(e){msg(err(e))}
};
$("registerBtn").onclick=async()=>{
  const email=$("email").value.trim(), password=$("password").value;
  if(!email){msg("Email address দিন।");return}
  if(password.length<6){msg("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");return}
  try{await createUserWithEmailAndPassword(auth,email,password);msg("")}catch(e){msg(err(e))}
};
$("googleLoginBtn").onclick=async()=>{
  msg("");
  try{
    await signInWithPopup(auth,googleProvider);
  }catch(e){
    if(e?.code==="auth/popup-blocked"){
      try{await signInWithRedirect(auth,googleProvider);return}catch(x){msg(err(x));return}
    }
    msg(err(e));
  }
};
getRedirectResult(auth).catch(e=>{if(e?.code)msg(err(e))});$("logoutBtn").onclick=()=>signOut(auth);
function ref(n){return collection(db,"users",auth.currentUser.uid,n)} function add(n,d){return addDoc(ref(n),{...d,createdAt:serverTimestamp()})} function del(n,id){return deleteDoc(doc(db,"users",auth.currentUser.uid,n,id))} function patch(n,id,d){return updateDoc(doc(db,"users",auth.currentUser.uid,n,id),d)}
onAuthStateChanged(auth,u=>{if(!u){$("loginPage").classList.remove("hidden");$("dashboardPage").classList.add("hidden");return} $("loginPage").classList.add("hidden");$("dashboardPage").classList.remove("hidden");$("welcomeText").textContent="Good "+(new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening")+", "+(u.displayName||u.email.split("@")[0])+" 👋";$("userBadge").textContent=(u.displayName||u.email)[0].toUpperCase();names.forEach(sub);});
function sub(n){if(unsub[n])unsub[n]();unsub[n]=onSnapshot(query(ref(n),orderBy("createdAt","desc")),s=>{state[n]=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>console.error(e))}
function money(n){return "৳"+Number(n||0).toLocaleString("en-BD")} function date(v){if(!v)return "";let d=new Date(v+"T00:00:00");return isNaN(d)?"":d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} function esc(v){return String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'":"&#039;"})[c]||c)}
function render(){renderTasks();renderStudy();renderExams();renderResults();renderAttendance();renderFinance();renderNotes();renderOverview()}
function renderTasks(){let s=($("taskSearch").value||"").toLowerCase(),f=$("taskFilter").value,p=$("taskPriorityFilter").value,a=state.tasks.filter(x=>(x.title||"").toLowerCase().includes(s)&&(f==="all"||(f==="completed"?x.completed:!x.completed))&&(p==="all"||x.priority===p));$("taskList").innerHTML=a.map(x=>"<div class=\"task-row\"><label><input type=\"checkbox\" data-check=\""+x.id+"\" "+(x.completed?"checked":"")+"> <span class=\""+(x.completed?"done":"")+"\">"+esc(x.title)+"</span></label><div><span class=\"badge priority-"+(x.priority||"medium")+"\">"+(x.priority||"medium")+"</span> <span class=\"badge\">"+esc(x.category||"personal")+"</span> "+(x.date?"<span class=\"badge\">"+date(x.date)+"</span> ":"")+"<button class=\"row-delete\" data-delete=\"tasks|"+x.id+"\">×</button></div></div>").join("");$("emptyTasks").style.display=a.length?"none":"block";$("statTasks").textContent=state.tasks.filter(x=>!x.completed).length;$("statCompleted").textContent=state.tasks.filter(x=>x.completed).length;document.querySelectorAll("[data-check]").forEach(b=>b.onchange=()=>patch("tasks",b.dataset.check,{completed:b.checked}))}
$("taskSearch").oninput=renderTasks;$("taskFilter").onchange=renderTasks;$("taskPriorityFilter").onchange=renderTasks;
function renderStudy(){$("studyList").innerHTML=state.study.map(x=>"<div class=\"study-card\"><div class=\"card-top\"><div><h3>"+esc(x.subject)+"</h3><p>"+esc(x.target||"Learning goal")+"</p></div><button class=\"row-delete\" data-delete=\"study|"+x.id+"\">×</button></div><div class=\"progress-line\"><span style=\"width:"+Math.min(100,Math.max(0,Number(x.progress||0)))+"%\"></span></div><div class=\"progress-label\"><span>"+Number(x.progress||0)+"%</span><span>"+esc(x.status||"Active")+"</span></div></div>").join("");$("emptyStudy").style.display=state.study.length?"none":"block";let avg=state.study.length?Math.round(state.study.reduce((a,x)=>a+Number(x.progress||0),0)/state.study.length):0;$("statStudy").textContent=avg+"%"}
function renderExams(){$("examList").innerHTML=state.exams.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.exam)+"</strong><small>"+esc(x.subject)+"</small></div><div><strong>"+date(x.date)+"</strong><small>"+esc(x.time||"")+"</small></div><span class=\"badge\">"+esc(x.status||"Planned")+"</span><button class=\"row-delete\" data-delete=\"exams|"+x.id+"\">×</button></div>").join("");$("emptyExams").style.display=state.exams.length?"none":"block"}
function renderResults(){let total=0,max=0;state.results.forEach(x=>{total+=+x.marks||0;max+=+x.total||0});$("resultSummary").innerHTML=state.results.length?"<div><small>Entries</small><strong>"+state.results.length+"</strong></div><div><small>Total</small><strong>"+total+"/"+max+"</strong></div><div><small>Average</small><strong>"+(max?Math.round(total/max*100):0)+"%</strong></div>":"";$("resultList").innerHTML=state.results.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.subject)+"</strong><small>"+esc(x.exam||"Exam")+"</small></div><strong>"+x.marks+" / "+x.total+"</strong><span>"+date(x.date)+"</span><button class=\"row-delete\" data-delete=\"results|"+x.id+"\">×</button></div>").join("");$("emptyResults").style.display=state.results.length?"none":"block"}
function renderAttendance(){let p=state.attendance.filter(x=>x.status==="Present").length,t=state.attendance.length,r=t?Math.round(p/t*100):0;$("attendanceSummary").innerHTML="<div><small>Rate</small><strong>"+r+"%</strong></div><div><small>Present</small><strong>"+p+"</strong></div><div><small>Other</small><strong>"+(t-p)+"</strong></div>";$("attendanceList").innerHTML=state.attendance.map(x=>"<div class=\"table-row\"><div><strong>"+date(x.date)+"</strong><small>"+esc(x.subject||"General")+"</small></div><span class=\"badge\">"+esc(x.status)+"</span><button class=\"row-delete\" data-delete=\"attendance|"+x.id+"\">×</button></div>").join("");$("emptyAttendance").style.display=state.attendance.length?"none":"block"}
function renderFinance(){let i=0,e=0;state.finance.forEach(x=>x.type==="income"?i+=+x.amount||0:e+=+x.amount||0);$("financeIncome").textContent=money(i);$("financeExpense").textContent=money(e);$("financeBalance").textContent=money(i-e);$("statBalance").textContent=money(i-e);$("financeList").innerHTML=state.finance.map(x=>"<div class=\"table-row\"><div><strong>"+esc(x.title)+"</strong><small>"+esc(x.category||"General")+" · "+date(x.date)+"</small></div><strong>"+(x.type==="expense"?"−":"+")+money(x.amount)+"</strong><button class=\"row-delete\" data-delete=\"finance|"+x.id+"\">×</button></div>").join("");$("emptyFinance").style.display=state.finance.length?"none":"block"}
function renderNotes(){$("noteList").innerHTML=state.notes.map(x=>"<article class=\"note-card\"><div class=\"card-top\"><span class=\"badge\">"+esc(x.category||"Note")+"</span><button class=\"row-delete\" data-delete=\"notes|"+x.id+"\">×</button></div><h3>"+esc(x.title)+"</h3><p>"+esc(x.body)+"</p></article>").join("");$("emptyNotes").style.display=state.notes.length?"none":"block"}
function renderOverview(){let a=state.tasks.filter(x=>!x.completed).slice(0,5),e=state.exams.slice(0,5);$("overviewTasks").innerHTML=a.length?a.map(x=>"<div class=\"compact-row\"><span class=\"dot\"></span><div><strong>"+esc(x.title)+"</strong><small>"+esc(x.category||"personal")+(x.date?" · "+date(x.date):"")+"</small></div></div>").join(""):"<div class=\"empty-mini\">You are clear. Nice.</div>";$("overviewExams").innerHTML=e.length?e.map(x=>"<div class=\"compact-row\"><span class=\"date-box\">"+(x.date?new Date(x.date+"T00:00:00").getDate():"—")+"</span><div><strong>"+esc(x.subject)+"</strong><small>"+esc(x.exam)+" · "+date(x.date)+"</small></div></div>").join(""):"<div class=\"empty-mini\">No upcoming exams.</div>"}
const schema={tasks:[["title","Task title","text",1],["date","Date","date"],["time","Time","time"],["priority","Priority","select:low,medium,high"],["category","Category","select:personal,study,work,important"]],study:[["subject","Subject","text",1],["target","Goal","text"],["progress","Progress %","number"],["status","Status","select:Active,Paused,Completed"]],exams:[["exam","Exam name","text",1],["subject","Subject","text",1],["date","Date","date",1],["time","Time","time"],["status","Status","select:Planned,Preparing,Completed"]],results:[["exam","Exam","text"],["subject","Subject","text",1],["marks","Marks","number",1],["total","Total","number",1],["date","Date","date"]],attendance:[["date","Date","date",1],["subject","Subject","text"],["status","Status","select:Present,Absent,Leave"]],finance:[["title","Description","text",1],["amount","Amount BDT","number",1],["type","Type","select:income,expense"],["category","Category","text"],["date","Date","date"]],notes:[["title","Title","text",1],["category","Category","select:Idea,Plan,Work,Study,Personal"],["body","Note","textarea",1]]};
function openForm(type){$("modalTitle").textContent=type[0].toUpperCase()+type.slice(1);let h="";schema[type].forEach(f=>{let k=f[0],l=f[1],t=f[2],r=f[3]?"required":"";if(t.startsWith("select:")){h+="<label>"+l+"<select name=\""+k+"\">"+t.slice(7).split(",").map(o=>"<option>"+o+"</option>").join("")+"</select></label>"}else if(t==="textarea")h+="<label>"+l+"<textarea name=\""+k+"\"></textarea></label>";else h+="<label>"+l+"<input name=\""+k+"\" type=\""+t+"\" "+r+"></label>"});h+="<div class=\"modal-actions\"><button type=\"button\" class=\"secondary-btn\" id=\"modalCancel\">Cancel</button><button class=\"primary-btn\" type=\"submit\">Save</button></div>";$("dynamicForm").innerHTML=h;$("modal").classList.remove("hidden");$("modalCancel").onclick=()=>$("modal").classList.add("hidden");$("dynamicForm").onsubmit=async e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target).entries());if(type==="study")d.progress=Math.max(0,Math.min(100,+d.progress||0));if(type==="results"){d.marks=+d.marks;d.total=+d.total}if(type==="finance")d.amount=+d.amount;try{await add(type,d);$("modal").classList.add("hidden")}catch(x){alert(x.message)}}}
document.addEventListener("click",e=>{let a=e.target.closest("[data-action]");if(a)openForm(a.dataset.action.replace("add-",""));let d=e.target.closest("[data-delete]");if(d&&confirm("Delete this item?")){let q=d.dataset.delete.split("|");del(q[0],q[1]).catch(x=>alert(x.message))}});
$("closeModal").onclick=()=>$("modal").classList.add("hidden");$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.add("hidden")};
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{document.querySelectorAll(".section").forEach(s=>s.classList.remove("active-section"));$(b.dataset.section).classList.add("active-section");document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===b));$("sidebar").classList.remove("active")});
document.querySelectorAll("[data-section-link]").forEach(b=>b.onclick=()=>document.querySelector("[data-section=\""+b.dataset.sectionLink+"\"]").click());$("menuBtn").onclick=()=>$("sidebar").classList.toggle("active");
function clock(){$("clock").textContent=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}setInterval(clock,1000);clock();$("date").textContent=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});