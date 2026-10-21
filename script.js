const DEMO_EMAIL="demo@sahpra.ai", DEMO_PASSWORD="RegulaDemo2026!";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let currentUser={name:"Demo User",email:DEMO_EMAIL}, currentPlan="Starter", briefs=[], tasks=[
{id:1,name:"Confirm applicable product category",priority:"High",done:false},
{id:2,name:"Gather supporting documentation",priority:"Medium",done:false},
{id:3,name:"Verify current official guidance",priority:"High",done:false}
], activity=[], activeFilter="all", slide=0;
const slideData=[
{title:"SAHPRA<br>REGULA <span>AI</span>",subtitle:"Your AI-Powered Partner for<br>Health Product Regulation in South Africa",text:"Explore regulatory information, organise compliance work, review documents and coordinate specialist AI workflows in one workspace.",image:"https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=2200&q=90"},
{title:"REGULATORY<br><span>RESEARCH</span>",subtitle:"Turn complex questions into organised research briefs",text:"Search illustrative regulatory topics, collect research notes and keep source verification at the centre of your work.",image:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2200&q=90"},
{title:"COMPLIANCE,<br><span>SIMPLIFIED</span>",subtitle:"Coordinate tasks, documents and teams in one place",text:"Build a structured work plan with the Workflow and Orchestrator agents, then review every step with a human expert.",image:"https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=2200&q=90"}
];
// Local browser persistence keeps this front-end demo useful without a server.
function persistDemoState(){try{localStorage.setItem("regulaAiDemoState",JSON.stringify({tasks,briefs,currentPlan,activity,localNotifications:typeof localNotifications!=="undefined"?localNotifications:[]}))}catch(e){}}
function restoreDemoState(){try{const saved=JSON.parse(localStorage.getItem("regulaAiDemoState")||"null");if(saved){if(Array.isArray(saved.tasks))tasks=saved.tasks;if(Array.isArray(saved.briefs))briefs=saved.briefs;if(typeof saved.currentPlan==="string")currentPlan=saved.currentPlan;if(Array.isArray(saved.activity))activity=saved.activity;window.__savedNotifications=saved.localNotifications||[]}}catch(e){}}
restoreDemoState();
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2800)}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function modal(title,html){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=html;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
$("#closeModal").onclick=closeModal;$("#modalOk").onclick=closeModal;$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
function setAuthTab(tab){$("#loginPanel").classList.toggle("hidden",tab!=="login");$("#registerPanel").classList.toggle("hidden",tab!=="register");$$(".auth-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$("#authMessage").textContent=""}
$$("[data-tab]").forEach(b=>b.addEventListener("click",()=>setAuthTab(b.dataset.tab)));
$$("[data-auth]").forEach(b=>b.addEventListener("click",()=>{showPublic();setAuthTab(b.dataset.auth);$("#authCard").scrollIntoView({behavior:"smooth",block:"center"})}));
$("#revealPassword").onclick=()=>$("#password").type=$("#password").type==="password"?"text":"password";
$$("[data-copy]").forEach(b=>b.addEventListener("click",()=>{const value=b.dataset.copy;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(()=>toast("Copied to clipboard")).catch(()=>{prompt("Copy this demo credential:",value)})}else{prompt("Copy this demo credential:",value)}}));
$("#fillDemo").addEventListener("click",()=>{$("#email").value=DEMO_EMAIL;$("#password").value=DEMO_PASSWORD;setAuthTab("login");$("#authMessage").textContent="Demo credentials filled. Click Sign In to open the dashboard.";});

async function apiRequest(){throw new Error("This is a front-end-only demo. Use the sample demo credentials to sign in.")}
let backendMode=false;
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const email=$("#email").value.trim().toLowerCase(),password=$("#password").value;
 $("#authMessage").textContent="Signing in…";
 try {
  const data=await apiRequest("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});
  backendMode=true;currentUser={name:data.user.name,email:data.user.email,role:data.user.role,plan:data.user.plan,id:data.user.id};
  currentPlan=data.user.plan||"Starter";openDashboard();logActivity("Signed in securely to the workspace");await refreshServerData();
  toast("Signed in successfully");
 } catch(err) {
  // Preserve the original front-end demo login when the optional server is not running.
  if(email===DEMO_EMAIL&&password===DEMO_PASSWORD || email==="admin@sahpra.ai"&&password==="AdminRegula2026!") {
   backendMode=false;currentUser={name:email==="admin@sahpra.ai"?"Platform Admin":"Demo User",email,role:email==="admin@sahpra.ai"?"admin":"user"};
   currentPlan=email==="admin@sahpra.ai"?"Team":"Starter";openDashboard();logActivity("Signed in to offline demo workspace");
   toast("Signed in to the browser-only demo. Changes are not securely stored.");
  } else {
   $("#authMessage").textContent=err.message;
   toast("Could not sign in");
  }
 }
});
$("#registerForm").addEventListener("submit",e=>{
 e.preventDefault();
 const name=$("#regName").value.trim(),email=$("#regEmail").value.trim(),password=$("#regPassword").value;
 if(!name||!email||password.length<6){$("#authMessage").textContent="Enter your name, a valid email and a password of at least 6 characters.";return}
 currentUser={name,email,role:"user"};backendMode=false;openDashboard();logActivity("Opened local demo profile");toast("Local demo profile created for this session only");
});
$("#forgot").onclick=()=>modal("Password reset",`<p>This front-end-only prototype does not send emails. Use the demo account:</p><p><b>${DEMO_EMAIL}</b><br><b>${DEMO_PASSWORD}</b></p>`);
$$("[data-provider]").forEach(b=>b.onclick=()=>modal(`${b.dataset.provider} sign-in`, `<p>${b.dataset.provider} authentication is a visual placeholder. External sign-in is not available in this front-end-only demo.</p>`));
$("#searchBtn").onclick=()=>{const q=prompt("Search demo topics: medicines, devices, clinical trials, compliance");if(q?.trim())modal("Demo search results",`<p>Example topics matching <b>${safe(q)}</b>:</p><ul><li>Regulatory overview and requirements checklist</li><li>Supporting documents and evidence</li><li>Source verification and human review</li></ul><p>These are illustrative results, not verified regulatory guidance.</p>`)};
function showPublic(){$("#publicSite").classList.remove("hidden");$("#dashboard").classList.add("hidden");$("#footer").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function openDashboard(){$("#publicSite").classList.add("hidden");$("#dashboard").classList.remove("hidden");$("#footer").classList.add("hidden");$("#adminNav").classList.toggle("hidden",currentUser.role!=="admin");$("#userName").textContent=currentUser.name;$("#userEmail").textContent=currentUser.email;$("#welcomeName").textContent=currentUser.name.split(" ")[0]||"there";$("#avatar").textContent=(currentUser.name[0]||"U").toUpperCase();$("#settingsName").value=currentUser.name;$("#settingsEmail").value=currentUser.email;renderTasks();renderMetrics();showPage("overview");renderNotificationList();renderAnalytics();window.scrollTo(0,0)}
function showPage(page){$$(".dash-page").forEach(p=>p.classList.add("hidden"));const target=$("#page-"+page);if(target)target.classList.remove("hidden");$$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#crumb").textContent=({overview:"Overview",agentstudio:"AI Agent Studio",research:"Research Agent",workflow:"Workflow Agent",orchestrator:"Orchestrator Agent",documents:"Document Review",subscription:"Plan & Subscription",settings:"Settings",analytics:"Reports & Analytics",notifications:"Notifications",collaboration:"Agent Collaboration",admin:"Admin Dashboard"})[page]||"Overview";if(page==="research")renderBriefs();if(page==="workflow")renderTasks();if(page==="analytics")renderAnalytics();if(page==="notifications")renderNotifications();if(page==="admin")renderAdmin()}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$$("[data-page-jump]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageJump)));
function logActivity(message){activity.unshift({message,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});activity=activity.slice(0,8);persistDemoState();$("#activityList").innerHTML=activity.map(a=>`<div class="activity-item">${safe(a.message)}<small>${a.time}</small></div>`).join("");}
function renderMetrics(){$("#briefCount").textContent=briefs.length;$("#taskCount").textContent=tasks.filter(t=>!t.done).length;$("#docCount").textContent=activity.filter(a=>a.message.includes("checklist")).length;$("#currentPlan").textContent=currentPlan}
const kb=[
{title:"Medicines registration overview",category:"Medicines",keywords:"medicine pharmaceutical registration drug",body:"Identify the product category, check current official SAHPRA guidance, prepare the applicable dossier and confirm submission requirements with the current source."},
{title:"Medical device preparation checklist",category:"Medical devices",keywords:"medical device equipment class risk",body:"Confirm device classification, intended purpose, evidence requirements, applicable establishment requirements and the latest official guidance before proceeding."},
{title:"Clinical trial planning overview",category:"Clinical trials",keywords:"clinical trial research ethics protocol",body:"Review the current clinical-trial application guidance, protocol documentation, ethics review requirements and supporting evidence with the relevant qualified team."},
{title:"Complementary medicines overview",category:"Complementary medicines",keywords:"complementary traditional herbal medicine",body:"Determine the applicable product pathway, review current requirements for ingredients and claims, and validate the checklist against official publications."},
{title:"General compliance and source verification",category:"All areas",keywords:"compliance guideline source regulations audit",body:"Record the source title, publication date and version; confirm that it remains current; document open questions and arrange qualified human review."}
];
$("#researchForm").addEventListener("submit",e=>{e.preventDefault();const q=$("#researchQuery").value.trim(),cat=$("#researchCategory").value,words=q.toLowerCase().split(/\W+/).filter(Boolean);let matches=kb.filter(k=>(cat==="All areas"||k.category===cat)&&(k.keywords+" "+k.title+" "+k.body).toLowerCase().includes(words.find(w=>w.length>2)||q.toLowerCase()));if(!matches.length)matches=kb.filter(k=>cat==="All areas"||k.category===cat).slice(0,2);$("#researchResults").classList.remove("empty");$("#researchResults").innerHTML=`<p><b>Illustrative research brief for:</b> ${safe(q)}</p><p class="muted">Demo-only results. Verify each item against current official publications.</p>`+matches.map(k=>`<div class="result-card"><h4>${safe(k.title)}</h4><p>${safe(k.body)}</p><span class="source">Category: ${safe(k.category)} · Source status: requires official verification</span></div>`).join("")+`<button class="btn primary" id="saveBrief">Save research brief</button>`;$("#saveBrief").onclick=async()=>{const item={query:q,category:cat,results:matches.map(m=>m.title),date:new Date().toLocaleDateString()};if(backendMode){try{await apiRequest("/api/research",{method:"POST",body:JSON.stringify(item)});await refreshServerData()}catch(err){toast(err.message);return}}else{briefs.unshift(item);renderBriefs();renderMetrics()}logActivity("Saved research brief: "+q);addLocalNotification("Research brief saved",`Saved research topic: ${q}`);toast(backendMode?"Research brief saved to database":"Research brief saved in this session")};logActivity("Ran demo research: "+q)});
function renderBriefs(){persistDemoState();$("#savedBriefs").innerHTML=briefs.length?briefs.map((b,i)=>`<div class="saved-item"><b>${safe(b.query)}</b><p>${safe(b.category)} · ${safe(b.date)} · ${b.results.length} demo result(s)</p><button class="link" data-open-brief="${i}">View brief</button></div>`).join(""):'<p class="empty">No briefs saved yet.</p>';$$("[data-open-brief]").forEach(b=>b.onclick=()=>{const x=briefs[+b.dataset.openBrief];modal("Saved research brief",`<p><b>Topic:</b> ${safe(x.query)}</p><p><b>Category:</b> ${safe(x.category)}</p><ul>${x.results.map(r=>`<li>${safe(r)}</li>`).join("")}</ul><p>Verify current official sources before relying on these illustrative results.</p>`)})}
$("#exportBriefs").onclick=()=>{if(!briefs.length){toast("No research briefs to export yet");return}downloadText("research-briefs.txt",briefs.map(b=>`${b.query}\nCategory: ${b.category}\nDate: ${b.date}\nResults:\n- ${b.results.join("\n- ")}\n\nDisclaimer: Demo content; verify official sources.\n`).join("\n"))};
function downloadText(name,text){const a=document.createElement("a"),url=URL.createObjectURL(new Blob([text],{type:"text/plain"}));a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
$("#taskForm").addEventListener("submit",async e=>{e.preventDefault();const name=$("#taskName").value.trim(),priority=$("#taskPriority").value;if(backendMode){try{await apiRequest("/api/tasks",{method:"POST",body:JSON.stringify({title:name,priority})});await refreshServerData()}catch(err){toast(err.message);return}}else tasks.push({id:Date.now(),name,priority,done:false});$("#taskName").value="";renderTasks();renderMetrics();logActivity("Added workflow task");addLocalNotification("Workflow task created",name);toast("Task added")});
function renderTasks(){persistDemoState();const filtered=tasks.filter(t=>activeFilter==="all"||(activeFilter==="open"&&!t.done)||(activeFilter==="done"&&t.done));$("#taskList").innerHTML=filtered.length?filtered.map(t=>`<div class="task-row"><input type="checkbox" data-task-check="${t.id}" ${t.done?"checked":""} aria-label="Complete task"><div><b style="${t.done?"text-decoration:line-through;color:#8291a3":""}">${safe(t.name)}</b><small>Workflow checklist · ${t.done?"Completed":"Open"}</small></div><span class="priority ${t.priority}">${t.priority}</span><button class="delete-task" data-task-delete="${t.id}" aria-label="Delete task">×</button></div>`).join(""):'<p class="empty">No tasks in this view.</p>';$$("[data-task-check]").forEach(c=>c.onchange=()=>{const t=tasks.find(t=>t.id===+c.dataset.taskCheck);t.done=c.checked;if(backendMode)apiRequest("/api/tasks/"+t.id,{method:"PATCH",body:JSON.stringify({done:t.done})}).then(()=>refreshServerData()).catch(err=>toast(err.message));renderTasks();renderMetrics();logActivity((t.done?"Completed":"Reopened")+" task: "+t.name)});$$("[data-task-delete]").forEach(b=>b.onclick=()=>{const id=+b.dataset.taskDelete;if(backendMode)apiRequest("/api/tasks/"+id,{method:"DELETE",body:"{}"}).then(()=>refreshServerData()).catch(err=>toast(err.message));tasks=tasks.filter(t=>t.id!==id);renderTasks();renderMetrics();logActivity("Deleted a workflow task")});}
$$("[data-filter]").forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;$$("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));renderTasks()});
$("#orchestratorForm").addEventListener("submit",e=>{e.preventDefault();const request=$("#orchestratorRequest").value.trim();const steps=[["1. Research Agent","Identify the product area and search relevant demo knowledge topics."],["2. Document Review","Use the document checklist to identify missing evidence and review steps."],["3. Workflow Agent","Create tasks for source verification, document collection and expert sign-off."],["4. Human review","Verify current requirements against official SAHPRA sources before decisions."]];$("#orchestratorOutput").classList.remove("empty");$("#orchestratorOutput").innerHTML=`<p><b>Coordinated plan for:</b> ${safe(request)}</p>`+steps.map(s=>`<div class="result-card"><h4>${s[0]}</h4><p>${s[1]}</p></div>`).join("")+`<button class="btn primary" id="createPlanTasks">Add plan tasks to workflow</button>`;$("#createPlanTasks").onclick=()=>{steps.forEach((s,i)=>{const task={id:Date.now()+i,name:s[0].replace(/^\d+\.\s*/,"")+": "+s[1],priority:i===3?"High":"Medium",done:false};tasks.push(task);if(backendMode)apiRequest("/api/tasks",{method:"POST",body:JSON.stringify({title:task.name,priority:task.priority})}).catch(err=>toast(err.message))});renderTasks();renderMetrics();logActivity("Created orchestrated work plan");toast("Plan tasks added to workflow")};logActivity("Generated coordinated plan");});
$("#documentFile").addEventListener("change",async()=>{
 const file=$("#documentFile").files[0];if(!file)return;
 const out=$("#documentAnalysis");out.classList.remove("hidden");$("#documentStatus").textContent=`Selected: ${file.name} (${Math.round(file.size/1024)} KB)`;
 try {
  if(backendMode) {
   const form=new FormData();form.append("document",file);
   const response=await fetch("/api/documents",{method:"POST",body:form,credentials:"same-origin"});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Upload failed");
   const a=data.analysis;out.innerHTML=`<b>Preliminary document analysis: ${safe(data.filename)}</b><p>${a.wordCount} words · ${a.characterCount} characters extracted</p>`+a.checks.map(c=>`<div class="analysis-check ${c.passed?"pass":"needs"}"><span>${c.passed?"✓":"!"}</span>${safe(c.name)}: ${c.passed?"Possible match found":"Not detected in extracted text"}</div>`).join("")+`<p class="muted">${safe(a.notice)}</p>`;
   logActivity("Uploaded and analysed document: "+file.name);await refreshServerData();toast("Document analysis complete");
  } else if(/\.(txt|md)$/i.test(file.name)) {
   const text=await file.text(),checks=[
    ["Product or device details",/product|device|medicine|ingredient|model|name/i.test(text)],
    ["Regulatory or intended-use context",/regulat|intended use|indication|classification|guideline/i.test(text)],
    ["Evidence or supporting documents",/evidence|study|report|certificate|attachment|supporting/i.test(text)],
    ["Version or date information",/version|date|revision|updated/i.test(text)],
    ["Review or approval reference",/review|approved|approval|signature|sign-off/i.test(text)]
   ];
   out.innerHTML=`<b>Preliminary document analysis: ${safe(file.name)}</b><p>${text.trim()?text.trim().split(/\s+/).length:0} words detected</p>`+checks.map(c=>`<div class="analysis-check ${c[1]?"pass":"needs"}"><span>${c[1]?"✓":"!"}</span>${safe(c[0])}: ${c[1]?"Possible match found":"Not detected in text"}</div>`).join("")+`<p class="muted">Local text matching only. Not regulatory advice or an approval.</p>`;
   logActivity("Analysed local text document: "+file.name);toast("Text document analysed locally");
  } else {
   out.innerHTML=`<b>${safe(file.name)}</b><p>This front-end-only version can analyse TXT and MD files locally. PDF and DOCX text extraction is not included; use the document checklist below.</p>`;
  }
 }catch(err){out.innerHTML=`<p class="muted">${safe(err.message)}</p>`;toast("Document analysis could not complete")}
});
$("#completeReview").onclick=()=>{const checks=$$("#documentChecklist input:checked").length;renderMetrics();logActivity("Completed document checklist ("+checks+"/5 checked)");modal("Checklist review summary",`<p>You checked <b>${checks} of 5</b> preparation items.</p><p>${checks===5?"All demo checklist items are marked complete.":"Some checklist items remain unchecked."}</p><p>This is not regulatory approval. A qualified person must review the actual documents and current official requirements.</p>`)};
$$("[data-plan]").forEach(b=>b.addEventListener("click",()=>{currentPlan=b.dataset.plan;persistDemoState();renderMetrics();logActivity("Selected demo plan: "+currentPlan);if(backendMode)apiRequest("/api/account/plan",{method:"PATCH",body:JSON.stringify({plan:currentPlan})}).then(()=>refreshServerData()).catch(err=>toast(err.message));toast(currentPlan+" plan selected for demo");if($("#dashboard").classList.contains("hidden"))modal("Plan selected",`<p>You selected the <b>${currentPlan}</b> demo plan.</p><p>Sign in or create a demo profile to see this plan in your workspace. No payment is taken.</p><button class="btn primary" id="planSignIn">Continue to sign in</button>`);else modal("Subscription updated (demo)",`<p>Your demo workspace now displays the <b>${currentPlan}</b> plan.</p><p>No payment, invoice or real subscription has been created.</p>`);setTimeout(()=>{const b=$("#planSignIn");if(b)b.onclick=()=>{closeModal();showPublic();setAuthTab("login");$("#authCard").scrollIntoView({behavior:"smooth",block:"center"})}},0)}));
$("#settingsForm").addEventListener("submit",e=>{e.preventDefault();currentUser.name=$("#settingsName").value.trim();currentUser.email=$("#settingsEmail").value.trim();$("#userName").textContent=currentUser.name;$("#userEmail").textContent=currentUser.email;$("#welcomeName").textContent=currentUser.name.split(" ")[0]||"there";$("#avatar").textContent=(currentUser.name[0]||"U").toUpperCase();logActivity("Updated local profile settings");toast("Profile updated in this session")});
async function logout(){if(backendMode){try{await apiRequest("/api/auth/logout",{method:"POST",body:"{}"})}catch{}}backendMode=false;showPublic();$("#email").value=currentUser.email;$("#password").value="";toast("Signed out of the demo workspace")}
$("#logout").onclick=logout;$("#dashLogout").onclick=logout;
$("#mobileMenu").onclick=()=>$("#nav").classList.toggle("nav-open");$$("nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("nav-open"));
$("#dashMenu").onclick=()=>$(".sidebar").classList.toggle("mobile-open");
function changeSlide(n){slide=(n+slideData.length)%slideData.length;const d=slideData[slide];$("#heroTitle").innerHTML=d.title;$("#heroSubtitle").innerHTML=d.subtitle;$("#heroText").textContent=d.text;$(".hero").style.backgroundImage=`url("${d.image}")`;$$(".dots button").forEach((b,i)=>b.classList.toggle("active",i===slide))}
$("#prevSlide").onclick=()=>changeSlide(slide-1);$("#nextSlide").onclick=()=>changeSlide(slide+1);$$(".dots button").forEach((b,i)=>b.onclick=()=>changeSlide(i));


// Notifications, chatbot, collaboration, analytics, admin and server-backed refresh
let localNotifications=[
 {id:"n1",title:"Verify official sources",message:"Check publication dates and current versions before relying on guidance.",isRead:false},
 {id:"n2",title:"Workflow reminder",message:"Review open submission-preparation tasks in the Workflow Agent.",isRead:false},
 {id:"n3",title:"Welcome to Regula AI",message:"Explore the specialist AI agent toolkit.",isRead:false}
];
if(Array.isArray(window.__savedNotifications)&&window.__savedNotifications.length)localNotifications=window.__savedNotifications;
function renderNotifications(){
 const list=$("#notificationsList");if(!list)return;
 if(backendMode){apiRequest("/api/notifications").then(d=>{localNotifications=d.items.map(n=>({...n,id:n.id,isRead:!!n.isRead}));renderNotificationList()}).catch(()=>renderNotificationList())}
 else renderNotificationList();
}
function renderNotificationList(){
 const list=$("#notificationsList");if(!list)return;
 const unread=localNotifications.filter(n=>!n.isRead).length;
 $("#notificationCount").textContent=unread;$("#notificationCount").classList.toggle("hidden",!unread);$("#bellDot").classList.toggle("hidden",!unread);
 list.innerHTML=localNotifications.length?localNotifications.map(n=>`<div class="notification-item ${n.isRead?"read":""}"><span class="notification-icon">${n.isRead?"✓":"♢"}</span><div><b>${safe(n.title)}</b><p>${safe(n.message)}</p><small>${n.createdAt?safe(n.createdAt):"Workspace update"}</small></div>${n.isRead?"":`<button class="link" data-read-notice="${safe(n.id)}">Mark read</button>`}</div>`).join(""):'<p class="empty">You are all caught up.</p>';
 $$("[data-read-notice]").forEach(b=>b.onclick=()=>{const n=localNotifications.find(n=>String(n.id)===String(b.dataset.readNotice));if(n)n.isRead=true;if(backendMode)apiRequest("/api/notifications/read-all",{method:"POST",body:"{}"}).catch(()=>{});renderNotificationList();renderAnalytics()});
 renderAnalytics();
}
$("#markAllRead").onclick=()=>{localNotifications.forEach(n=>n.isRead=true);if(backendMode)apiRequest("/api/notifications/read-all",{method:"POST",body:"{}"}).catch(()=>{});renderNotificationList();toast("Notifications marked as read")};
$("#notificationBell").onclick=()=>showPage("notifications");
function addLocalNotification(title,message){localNotifications.unshift({id:"local-"+Date.now(),title,message,isRead:false});persistDemoState();renderNotificationList()}
function renderAnalytics(){
 if(!$("#analyticsBriefs"))return;
 const done=tasks.filter(t=>t.done).length,open=tasks.filter(t=>!t.done).length,completion=tasks.length?Math.round(done/tasks.length*100):0;
 $("#analyticsBriefs").textContent=briefs.length;$("#analyticsDone").textContent=done;$("#analyticsOpen").textContent=open;$("#analyticsNotifications").textContent=localNotifications.filter(n=>!n.isRead).length;
 $("#completionBar").style.height=completion+"%";$("#briefBar").style.height=Math.min(100,briefs.length*20)+"%";$("#reviewBar").style.height=Math.min(100,activity.filter(a=>a.message.toLowerCase().includes("document")||a.message.toLowerCase().includes("checklist")).length*20)+"%";
 $("#analyticsActivity").innerHTML=activity.length?activity.slice(0,8).map(a=>`<div class="activity-item">${safe(a.message)}<small>${safe(a.time)}</small></div>`).join(""):'<p class="empty">No activity to report yet.</p>';
}
$("#exportAnalytics").onclick=()=>downloadText("regula-ai-analytics.txt",`SAHPRA Regula AI demo report\nResearch briefs: ${briefs.length}\nCompleted tasks: ${tasks.filter(t=>t.done).length}\nOpen tasks: ${tasks.filter(t=>!t.done).length}\nUnread notifications: ${localNotifications.filter(n=>!n.isRead).length}\nPlan: ${currentPlan}\n\nThis is demo data, not an official compliance report.\n`);
$("#collabForm").addEventListener("submit",e=>{
 e.preventDefault();const request=$("#collabRequest").value.trim(),selected=[];
 if($("#collabResearch").checked)selected.push(["Research Agent","Find relevant topics and create a source-verification brief."]);
 if($("#collabDocs").checked)selected.push(["Document Review","Check document completeness and identify items requiring human review."]);
 if($("#collabWorkflow").checked)selected.push(["Workflow Agent","Turn findings into prioritised tasks with clear next steps."]);
 if(!selected.length){toast("Select at least one agent");return}
 const combined=[...selected,["Orchestrator summary","Consolidate outputs, flag gaps and request qualified human sign-off."]];
 $("#collabOutput").classList.remove("empty");$("#collabOutput").innerHTML=`<p><b>Coordinated request:</b> ${safe(request)}</p>`+combined.map((s,i)=>`<div class="result-card"><h4>${i+1}. ${safe(s[0])}</h4><p>${safe(s[1])}</p><span class="source">Status: Demo step prepared</span></div>`).join("")+`<button class="btn primary" id="collabCreateTasks">Create tasks from collaboration plan</button>`;
 $("#collabCreateTasks").onclick=()=>{combined.forEach((s,i)=>{const task={id:Date.now()+i,name:s[0]+": "+s[1],priority:i===combined.length-1?"High":"Medium",done:false};tasks.push(task);if(backendMode)apiRequest("/api/tasks",{method:"POST",body:JSON.stringify({title:task.name,priority:task.priority})}).catch(err=>toast(err.message))});renderTasks();renderMetrics();logActivity("Completed multi-agent collaboration plan");addLocalNotification("Agent collaboration complete","A coordinated demo plan was generated.");renderAnalytics();toast("Collaborative tasks added")};
 logActivity("Ran agent collaboration");addLocalNotification("Agent collaboration started","Research, document review and workflow agents prepared a coordinated demo plan.");renderAnalytics();
});
function renderAdmin(){
 if(!currentUser||currentUser.role!=="admin"){ $("#adminStatus").textContent="Administrator role required. Sign in with the administrator demo account.";return}
 $("#adminNav").classList.remove("hidden");$("#adminUsers").textContent=backendMode?"Loading…":"Demo";$("#adminTasks").textContent=tasks.length;$("#adminBriefs").textContent=briefs.length;$("#adminPlan").textContent=currentPlan;
 if(backendMode)apiRequest("/api/admin/overview").then(d=>{$("#adminUsers").textContent=d.users;$("#adminTasks").textContent=d.tasks;$("#adminBriefs").textContent=d.briefs;$("#adminStatus").innerHTML=`<b>Database connected.</b><p>${d.documents} documents stored · ${d.latestUsers.length} recent accounts listed by the admin API.</p>`}).catch(err=>{$("#adminStatus").textContent=err.message});
}
$("#adminNoticeForm").addEventListener("submit",async e=>{e.preventDefault();if(currentUser.role!=="admin"){toast("Admin account required");return}const title=$("#adminNoticeTitle").value.trim(),message=$("#adminNoticeMessage").value.trim();if(backendMode){try{const d=await apiRequest("/api/admin/notice",{method:"POST",body:JSON.stringify({title,message})});$("#adminStatus").textContent=`Notice published to ${d.recipients} account(s).`;toast("Notice published");}catch(err){toast(err.message)}}else{addLocalNotification(title,message);$("#adminStatus").textContent="Notice published locally for this browser session.";toast("Demo notice published")}$("#adminNoticeTitle").value="";$("#adminNoticeMessage").value="";});
$("#fillAdmin")?.addEventListener("click",()=>{$("#email").value="admin@sahpra.ai";$("#password").value="AdminRegula2026!";setAuthTab("login");$("#authMessage").textContent="Administrator test credentials filled. Click Sign In.";});
$("#fillDemo")?.addEventListener("click",()=>{$("#email").value=DEMO_EMAIL;$("#password").value=DEMO_PASSWORD;setAuthTab("login");$("#authMessage").textContent="Demo credentials filled. Click Sign In.";});
const chatLauncher=$("#chatLauncher"),chatWidget=$("#chatWidget");
chatLauncher.onclick=()=>chatWidget.classList.toggle("hidden");$("#chatClose").onclick=()=>chatWidget.classList.add("hidden");
function appendChat(text,kind){const el=document.createElement("div");el.className="chat-bubble "+kind;el.textContent=text;$("#chatMessages").appendChild(el);$("#chatMessages").scrollTop=$("#chatMessages").scrollHeight}
$("#chatForm").addEventListener("submit",async e=>{
 e.preventDefault();const input=$("#chatInput"),message=input.value.trim();if(!message)return;appendChat(message,"user");input.value="";
 const loading=document.createElement("div");loading.className="chat-bubble bot";loading.textContent="Thinking…";$("#chatMessages").appendChild(loading);
 try{const d=await apiRequest("/api/chat",{method:"POST",body:JSON.stringify({message})});loading.textContent=d.reply}
 catch{loading.textContent=localChatReply(message)}
 $("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;
});
const studioAgentGuides={
 research:{title:"Research Agent",steps:["Turn the request into specific research questions","Search current official sources independently","Record source title, date and relevant section","Separate verified facts from open questions","Save a dated brief for expert review"]},
 workflow:{title:"Workflow Agent",steps:["Break the request into actionable work items","Assign priorities, owners and target dates","Identify dependencies and approval gates","Track completion and evidence links","Escalate blockers for human decisions"]},
 orchestrator:{title:"Orchestrator Agent",steps:["Scope the request and define success criteria","Route research questions to the Research Agent","Use document review to identify evidence gaps","Create tasks and milestones in Workflow","Consolidate gaps and request human sign-off"]}
};
let lastStudioDraft="",lastStudioSteps=[];
$("#agentStudioForm")?.addEventListener("submit",e=>{e.preventDefault();const key=$("#studioAgent").value,guide=studioAgentGuides[key]||studioAgentGuides.compliance,area=$("#studioArea").value,request=$("#studioRequest").value.trim();lastStudioSteps=guide.steps;lastStudioDraft=`${guide.title}\nProduct area: ${area}\nRequest: ${request}\n\nSuggested working checklist:\n${guide.steps.map((x,i)=>`${i+1}. ${x}`).join("\n")}\n\nIMPORTANT: Illustrative draft only. Verify current official SAHPRA guidance and obtain qualified human review.`;$("#studioOutput").classList.remove("empty");$("#studioOutput").innerHTML=`<div class="result-card"><span class="tag">WORKING DRAFT · ${safe(area.toUpperCase())}</span><h3>${safe(guide.title)}</h3><p><b>Project:</b> ${safe(request)}</p><p>This checklist is a structured starting point, not a finding of compliance or a statement of current regulatory requirements.</p></div>`+guide.steps.map((step,i)=>`<label class="analysis-check"><input type="checkbox"><span>${i+1}</span><b>${safe(step)}</b></label>`).join("")+`<div class="notice-box">Human review required: validate each step against current official sources, product-specific requirements and your quality procedures.</div>`;$("#studioSaveTask").disabled=false;$("#studioExport").disabled=false;logActivity("Generated "+guide.title+" working draft");addLocalNotification("Agent draft ready",guide.title+" prepared a checklist for review.");persistDemoState();toast("Working draft generated")});
$("#studioSaveTask")?.addEventListener("click",()=>{if(!lastStudioSteps.length)return;lastStudioSteps.forEach((name,i)=>tasks.push({id:Date.now()+i+Math.floor(Math.random()*1000),name,priority:i===0?"High":"Medium",done:false}));renderTasks();renderMetrics();persistDemoState();logActivity("Added agent recommendations to workflow tasks");toast("Recommended actions added to tasks")});
$("#studioExport")?.addEventListener("click",()=>{if(lastStudioDraft)downloadText("regula-ai-agent-working-draft.txt",lastStudioDraft)});
$$("[data-agent]").forEach(b=>{const key=b.dataset.agent;b.addEventListener("click",()=>{if(!studioAgentGuides[key])return;modal("Try "+studioAgentGuides[key].title,`<p>Open the Agent Studio to create a structured working draft with this specialist tool.</p><p>Outputs are illustrative and require qualified human review.</p><button class="btn primary" id="openStudioAgent">Open Agent Studio</button>`);$("#openStudioAgent").onclick=()=>{closeModal();if($("#dashboard").classList.contains("hidden")){setAuthTab("login");$("#authCard").scrollIntoView({behavior:"smooth",block:"center"})}else{showPage("agentstudio");$("#studioAgent").value=key}}})});
function localChatReply(message){const q=message.toLowerCase();if(/medical device|device/.test(q))return"Start by identifying the intended purpose and product classification, then verify current requirements in official SAHPRA guidance. This demo cannot confirm classification.";if(/clinical trial|ethics/.test(q))return"Gather the protocol and ethics review information, then check current official clinical-trial guidance and consult a qualified regulatory professional.";if(/medicine|drug|pharma/.test(q))return"Identify the medicine category and intended indication, then review the latest official SAHPRA registration guidance. This is not verified regulatory advice.";if(/workflow|task|plan/.test(q))return"Suggested workflow: define the product, research official guidance, collect supporting documents, track gaps as tasks, and obtain qualified human review.";return"I can help structure a regulatory research question, suggest a document checklist, or plan a workflow. Are you working with medicines, medical devices, clinical trials or complementary medicines? Verify all answers with official SAHPRA sources."}
async function refreshServerData(){
 if(!backendMode)return;
 try{
  const [taskData,briefData,notificationData,analytics]=await Promise.all([apiRequest("/api/tasks"),apiRequest("/api/research"),apiRequest("/api/notifications"),apiRequest("/api/analytics")]);
  tasks=taskData.items.map(t=>({id:t.id,name:t.title,priority:t.priority,done:!!t.done}));
  briefs=briefData.items.map(b=>({id:b.id,query:b.query,category:b.category,results:b.results,date:b.createdAt}));
  localNotifications=notificationData.items.map(n=>({...n,isRead:!!n.isRead}));
  currentPlan=analytics.plan||currentPlan;renderTasks();renderBriefs();renderMetrics();renderNotificationList();renderAnalytics();
 }catch(err){console.warn("Could not refresh server data:",err.message)}
}
