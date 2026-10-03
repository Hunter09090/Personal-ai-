const KEY="personalOS.v1";
const EMPTY={tasks:[],goals:[],exams:[],finance:[],notes:[],study:[]};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const money=v=>"৳"+Number(v||0).toLocaleString("en-BD");

let state;
try{state={...EMPTY,...JSON.parse(localStorage.getItem(KEY)||"{}")};}
catch{state={...EMPTY};}
for(const k of Object.keys(EMPTY))if(!Array.isArray(state[k]))state[k]=[];

let toastTimer;
function toast(message){
  const el=$("#toast"); if(!el)return;
  el.textContent=message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),1800);
}
function persist(message="Saved"){
  localStorage.setItem(KEY,JSON.stringify(state)); render(); toast(message);
}
function safe(fn){try{fn();}catch(error){console.error(error);toast("Something went wrong");}}
function empty(message){return '<div class="empty-state">'+esc(message)+"</div>";}

const cfg={
 task:["New task",[["title","Task","text",true],["date","Due date","date",false],["priority","Priority","select","medium,high,low"],["category","Category","select","Personal,Study,Work,Finance,Important"],["tags","Tags","text",false],["goalId","Goal ID","text",false],["repeat","Repeat","select","none,daily,weekly,monthly"]]],
 goal:["New goal",[["title","Goal","text",true],["progress","Progress %","number",true]]],
 exam:["New exam",[["name","Exam name","text",true],["subject","Subject","text",true],["date","Date","date",true]]],
 finance:["New finance entry",[["title","Description","text",true],["amount","Amount","number",true],["type","Type","select","income,expense"]]],
 note:["New note",[["title","Title","text",true],["body","Note","textarea",true],["category","Category","select","Personal,Study,Work,Idea,Important"],["tags","Tags","text",false]]],
 study:["New study session",[["subject","Subject","text",true],["topic","Topic / chapter","text",true],["date","Date","date",true],["duration","Minutes","number",true],["type","Type","select","Study,Revision,Practice"]]]
};
let editing=null;

function openForm(type,index=null){
  const c=cfg[type]; if(!c)return;
  editing=index===null?null:{type,index};
  const key={task:"tasks",goal:"goals",exam:"exams",finance:"finance",note:"notes",study:"study"}[type];
  const old=index===null?{}:state[key][index]||{};
  $("#modalTitle").textContent=index===null?c[0]:"Edit "+type;
  $("#form").innerHTML=c[1].map(([name,label,kind,extra])=>{
    const value=old[name]??"";
    if(kind==="select"){
      return '<label>'+label+'<select name="'+name+'">'+String(extra).split(",").map(option=>'<option value="'+option+'" '+(value===option?"selected":"")+'>'+option[0].toUpperCase()+option.slice(1)+"</option>").join("")+"</select></label>";
    }
    if(kind==="textarea")return '<label>'+label+'<textarea name="'+name+'" '+(extra?"required":"")+'>'+esc(value)+"</textarea></label>";
    return '<label>'+label+'<input name="'+name+'" type="'+kind+'" value="'+esc(value)+'" '+(extra?"required":"")+"></label>";
  }).join("")+'<div class="form-actions"><button type="button" id="cancel" class="ghost">Cancel</button><button class="primary">'+(index===null?"Save":"Update")+"</button></div>";
  $("#modal").classList.remove("hidden");
  $("#cancel").onclick=close;
  $("#form").onsubmit=e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.target));
    if(type==="goal")data.progress=Math.max(0,Math.min(100,Number(data.progress)||0));
    if(type==="finance")data.amount=Math.max(0,Number(data.amount)||0);
    if(index===null)state[key].unshift({id:id(),createdAt:Date.now(),...data,...(type==="task"?{done:false}:{})});
    else state[key][index]={...state[key][index],...data};
    persist(index===null?"Created":"Updated"); close();
  };
}
function close(){$("#modal").classList.add("hidden");editing=null;}
function nav(page){
  $$(".page").forEach(el=>el.classList.toggle("active",el.id===page));
  $$(".nav").forEach(el=>el.classList.toggle("active",el.dataset.page===page));
  $("#pageTitle").textContent={home:"Overview",tasks:"Tasks",goals:"Goals",exams:"Exams",finance:"Finance",notes:"Notes",insights:"Insights",calendar:"Calendar",study:"Study Planner",settings:"Settings"}[page]||"Overview";
  $("#sidebar").classList.remove("open");
}
function removeItem(key,index){
  if(!state[key]?.[index])return;
  if(confirm("Delete this item?")){state[key].splice(index,1);persist("Deleted");}
}
function renderInsights(){
  const done=state.tasks.filter(x=>x.done).length, open=state.tasks.filter(x=>!x.done).length, total=state.tasks.length;
  const taskRate=total?Math.round(done/total*100):0;
  const goalRate=state.goals.length?Math.round(state.goals.reduce((sum,x)=>sum+(Number(x.progress)||0),0)/state.goals.length):0;
  const income=state.finance.filter(x=>x.type==="income").reduce((sum,x)=>sum+(Number(x.amount)||0),0);
  const expense=state.finance.filter(x=>x.type==="expense").reduce((sum,x)=>sum+(Number(x.amount)||0),0);
  const set=(id,value)=>{const el=$("#"+id);if(el)el.textContent=value;};
  set("taskRate",taskRate+"%");set("doneCount",done);set("openCount",open);
  set("goalRate",goalRate+"%");set("goalCount",state.goals.length);
  set("flowBalance",money(income-expense));set("insightIncome",money(income));set("insightExpense",money(expense));
  if($("#taskRateBar"))$("#taskRateBar").style.width=taskRate+"%";
  if($("#goalRateBar"))$("#goalRateBar").style.width=goalRate+"%";
  const max=Math.max(income,expense,1);
  if($("#incomeBar"))$("#incomeBar").style.width=Math.round(income/max*100)+"%";
  if($("#expenseBar"))$("#expenseBar").style.width=Math.round(expense/max*100)+"%";
  if($("#healthGrid"))$("#healthGrid").innerHTML=[
    ["Tasks",total?taskRate+"% complete":"No tasks yet",taskRate>=70?"On track":"Needs attention"],
    ["Goals",state.goals.length?goalRate+"% average":"No goals yet",goalRate>=70?"Strong momentum":"Keep moving"],
    ["Exams",state.exams.length+" planned",state.exams.length?"Planned":"Clear"],
    ["Notes",state.notes.length+" saved",state.notes.length?"Captured":"Empty"]
  ].map(([a,b,c])=>'<div class="health-item"><span>'+esc(a)+'</span><b>'+esc(b)+'</b><small>'+esc(c)+"</small></div>").join("");
}
function render(){
  const openTasks=state.tasks.filter(x=>!x.done);
  const avgGoal=state.goals.length?Math.round(state.goals.reduce((sum,x)=>sum+(Number(x.progress)||0),0)/state.goals.length):0;
  const income=state.finance.filter(x=>x.type==="income").reduce((sum,x)=>sum+(Number(x.amount)||0),0);
  const expense=state.finance.filter(x=>x.type==="expense").reduce((sum,x)=>sum+(Number(x.amount)||0),0);
  $("#sTasks").textContent=openTasks.length;$("#sGoals").textContent=avgGoal+"%";$("#sExams").textContent=state.exams.length;$("#sBalance").textContent=money(income-expense);

  $("#homeTasks").innerHTML=openTasks.slice(0,5).map(x=>'<div class="item"><div><b>'+esc(x.title)+'</b><small>'+esc(x.priority||"medium")+(x.date?" · "+esc(x.date):"")+"</small></div></div>").join("")||empty("No open tasks. Nice and clear.");
  const exams=state.exams.slice().sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  $("#homeExams").innerHTML=exams.slice(0,5).map(x=>'<div class="item"><div><b>'+esc(x.subject)+'</b><small>'+esc(x.name)+" · "+esc(x.date)+"</small></div></div>").join("")||empty("No upcoming exams.");

  const query=($("#taskSearch")?.value||"").toLowerCase(), filter=$("#taskFilter")?.value||"all";
  const tasks=state.tasks.filter(x=>(filter==="all"||(filter==="open"&&!x.done)||(filter==="done"&&x.done))&&(x.title||"").toLowerCase().includes(query));
  $("#taskList").innerHTML=tasks.map(x=>{
    const i=state.tasks.indexOf(x);
    return '<div class="row"><input class="check" type="checkbox" data-check="'+i+'" '+(x.done?"checked":"")+'><div class="row-main '+(x.done?"done":"")+'"><b>'+esc(x.title)+'</b><small>'+esc(x.priority||"medium")+(x.date?" · "+esc(x.date):"")+'</small></div><div class="row-actions"><button type="button" data-edit="tasks|'+i+'">Edit</button><button type="button" class="danger" data-del="tasks|'+i+'">Delete</button></div></div>';
  }).join("")||empty("No matching tasks.");

  $("#goalList").innerHTML=state.goals.map((x,i)=>'<article class="goal"><h3>'+esc(x.title)+'</h3><div class="bar"><span style="width:'+Math.min(100,Number(x.progress)||0)+'%"></span></div><div class="goal-meta"><span>Progress</span><b>'+esc(x.progress||0)+'%</b></div><div class="row-actions" style="margin-top:14px"><button type="button" data-edit="goals|'+i+'">Edit</button><button type="button" class="danger" data-del="goals|'+i+'">Delete</button></div></article>').join("")||empty("No goals yet.");

  $("#examList").innerHTML=exams.map(x=>{
    const i=state.exams.indexOf(x);
    return '<div class="row"><div class="row-main"><b>'+esc(x.subject)+'</b><small>'+esc(x.name)+" · "+esc(x.date)+'</small></div><div class="row-actions"><button type="button" data-edit="exams|'+i+'">Edit</button><button type="button" class="danger" data-del="exams|'+i+'">Delete</button></div></div>';
  }).join("")||empty("No exams planned.");

  $("#income").textContent=money(income);$("#expense").textContent=money(expense);$("#balance").textContent=money(income-expense);
  $("#financeList").innerHTML=state.finance.map((x,i)=>'<div class="row"><div class="row-main"><b>'+esc(x.title)+'</b><small>'+esc(x.type)+" · "+money(x.amount)+'</small></div><div class="row-actions"><button type="button" data-edit="finance|'+i+'">Edit</button><button type="button" class="danger" data-del="finance|'+i+'">Delete</button></div></div>').join("")||empty("No finance entries.");

  const noteQuery=($("#noteSearch")?.value||"").toLowerCase();
  const notes=state.notes.filter(x=>(String(x.title)+" "+String(x.body)).toLowerCase().includes(noteQuery));
  $("#noteList").innerHTML=notes.map((x,i)=>{
    const realIndex=state.notes.indexOf(x);
    return '<article class="note"><span class="eyebrow">NOTE</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.body)+'</p><div class="row-actions"><button type="button" data-edit="notes|'+realIndex+'">Edit</button><button type="button" class="danger" data-del="notes|'+realIndex+'">Delete</button></div></article>';
  }).join("")||empty("No notes yet.");
  renderInsights();
}
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="personal-os-backup-"+new Date().toISOString().slice(0,10)+".json";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);toast("Backup exported");
}
function importData(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!data||!["tasks","goals","exams","finance","notes"].every(k=>Array.isArray(data[k])))throw Error("invalid");
      if(!confirm("Restore this backup? Current local data will be replaced."))return;
      state={tasks:data.tasks,goals:data.goals,exams:data.exams,finance:data.finance,notes:data.notes};
      persist("Backup restored");
    }catch{toast("Invalid backup file");}
  };
  reader.onerror=()=>toast("Could not read backup file");
  reader.readAsText(file);
}

$$(".nav").forEach(el=>el.onclick=()=>nav(el.dataset.page));
$$("[data-add]").forEach(el=>el.onclick=()=>openForm(el.dataset.add));
$$("[data-go]").forEach(el=>el.onclick=()=>nav(el.dataset.go));
$("#quickAdd").onclick=()=>openForm("task");
$("#close").onclick=close;
$("#modal").onclick=e=>{if(e.target===$("#modal"))close();};
document.addEventListener("click",e=>{
  const del=e.target.closest("[data-del]"),edit=e.target.closest("[data-edit]");
  if(del){const [key,index]=del.dataset.del.split("|");removeItem(key,Number(index));}
  if(edit){const [key,index]=edit.dataset.edit.split("|");const type={tasks:"task",goals:"goal",exams:"exam",finance:"finance",notes:"note",study:"study"}[key];if(type)openForm(type,Number(index));}
});
document.addEventListener("change",e=>{
  if(e.target.dataset.check===undefined)return;
  const task=state.tasks[Number(e.target.dataset.check)];if(!task)return;
  task.done=e.target.checked;
  if(task.done&&task.repeat&&task.repeat!=="none"){
    const date=new Date(task.date||Date.now());
    if(task.repeat==="daily")date.setDate(date.getDate()+1);
    if(task.repeat==="weekly")date.setDate(date.getDate()+7);
    if(task.repeat==="monthly")date.setMonth(date.getMonth()+1);
    state.tasks.unshift({id:id(),createdAt:Date.now(),title:task.title,date:date.toISOString().slice(0,10),priority:task.priority,repeat:task.repeat,done:false});
    task.repeat="none";
  }
  persist(e.target.checked?"Completed":"Reopened");
});
$("#captureBtn").onclick=()=>{
  const value=$("#capture").value.trim();if(!value){toast("Write something first");$("#capture").focus();return;}
  state.notes.unshift({id:id(),title:"Quick capture",body:value,createdAt:Date.now()});$("#capture").value="";persist("Captured");
};
$("#taskSearch").oninput=render;$("#taskFilter").onchange=render;$("#noteSearch").oninput=render;
$("#menu").onclick=()=>$("#sidebar").classList.toggle("open");
$("#themeBtn").onclick=()=>{const dark=document.body.classList.toggle("dark");localStorage.setItem("personalOS.dark",String(dark));toast(dark?"Dark mode on":"Light mode on");};
$("#backupBtn").onclick=()=>safe(exportData);
$("#importBtn").onclick=()=>$("#importFile").click();
$("#refreshInsights").onclick=renderInsights;
$("#importFile").onchange=e=>{const file=e.target.files?.[0];if(file)importData(file);e.target.value="";};
document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
if(localStorage.getItem("personalOS.dark")==="true")document.body.classList.add("dark");

function tick(){
  const d=new Date();
  $("#clock").textContent=d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true});
  $("#today").textContent=d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  $("#hello").textContent=(d.getHours()<12?"Good morning":d.getHours()<18?"Good afternoon":"Good evening")+" 👋";
}
setInterval(tick,1000);tick();render();

let calendarDate=new Date();
function renderCalendar(){if(!$("#calendarGrid"))return;const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=first.getDay();$("#monthLabel").textContent=new Date(y,m,1).toLocaleDateString("en-US",{month:"long",year:"numeric"});const events={};const add=(date,title,type)=>{if(date)(events[date]??=[]).push({title,type})};state.tasks.forEach(x=>add(x.date,x.title,"task"));state.exams.forEach(x=>add(x.date,x.subject,"exam"));let out="";for(let i=0;i<start;i++)out+='<div class="cal-day muted-day"></div>';for(let d=1;d<=days;d++){const k=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0"),ev=events[k]||[];out+='<div class="cal-day"><b>'+d+"</b>"+ev.slice(0,3).map(e=>'<span class="cal-event '+e.type+'">'+esc(e.title)+"</span>").join("")+"</div>"}$("#calendarGrid").innerHTML=out}
function renderStudy(){if(!$("#studyList"))return;$("#studyList").innerHTML=state.study.map((x,i)=>'<div class="row"><div class="row-main"><b>'+esc(x.subject)+" — "+esc(x.topic)+'</b><small>'+esc(x.type)+" · "+esc(x.date)+" · "+esc(x.duration)+" min</small></div><div class="row-actions"><button type="button" data-edit="study|'+i+'">Edit</button><button type="button" class="danger" data-del="study|'+i+'">Delete</button></div></div>').join("")||empty("No study sessions yet.")}
function updateStorage(){const n=Object.values(state).reduce((s,a)=>s+a.length,0);if($("#storageText"))$("#storageText").textContent=n+" records";if($("#storageBar"))$("#storageBar").style.width=Math.min(100,n*5)+"%"}
const _render=render;render=function(){_render();renderCalendar();renderStudy();updateStorage()};
$("#prevMonth")?.addEventListener("click",()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar()});$("#nextMonth")?.addEventListener("click",()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar()});
$("#settingsExport")?.addEventListener("click",exportData);$("#settingsImport")?.addEventListener("click",()=>$("#importFile").click());$("#settingsTheme")?.addEventListener("click",()=>$("#themeBtn").click());
$("#clearData")?.addEventListener("click",()=>{if(confirm("Clear ALL local Personal OS data? This cannot be undone.")){state={tasks:[],goals:[],exams:[],finance:[],notes:[],study:[]};persist("All data cleared")}});
$("#reminderBtn")?.addEventListener("click",async()=>{if(!("Notification" in window)){toast("Notifications are not supported");return}const p=await Notification.requestPermission();if($("#reminderStatus"))$("#reminderStatus").textContent=p==="granted"?"Reminders enabled":"Not enabled";localStorage.setItem("personalOS.reminders",p);toast(p==="granted"?"Reminders enabled":"Permission not granted")});
$("#globalSearch")?.addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase();if(!q)return;const all=[...state.tasks.map(x=>"Task: "+x.title),...state.goals.map(x=>"Goal: "+x.title),...state.exams.map(x=>"Exam: "+x.subject),...state.notes.map(x=>"Note: "+x.title),...state.study.map(x=>"Study: "+x.topic)];const hit=all.filter(x=>x.toLowerCase().includes(q));toast(hit.length?hit.slice(0,3).join(" • "):"No matches")});
if($("#reminderStatus")&&localStorage.getItem("personalOS.reminders")==="granted")$("#reminderStatus").textContent="Reminders enabled";
renderCalendar();renderStudy();updateStorage();