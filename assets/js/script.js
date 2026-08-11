
// Shared JS for frontend-only ExamFlowMaster
const DATA = {
  user: { name: "Amit Kumar", role: "Student", id: "AK2025" },
  dashboard: {
    pendingApplications: 2,
    totalPayments: "₹8,500",
    upcomingExams: 3,
    resultsPublished: 5,
    notices: [
      {title:"Re-Examination Application Deadline Extended", note:"The deadline has been extended to 20th October 2025.", tag:"Important", time:"2 hours ago"}
    ],
  },
  results: {
    totalMarks: "265/400",
    average: "66.25%",
    status: "3/4 Passed",
    subjects: [
      {code:"CS101", name:"Data Structures", internal:18, external:52, total:70, grade:"B+", pass:true},
      {code:"CS102", name:"Database Management", internal:20, external:58, total:78, grade:"A", pass:true},
      {code:"CS103", name:"Operating Systems", internal:15, external:28, total:43, grade:"F", pass:false},
      {code:"CS104", name:"Computer Networks", internal:19, external:55, total:74, grade:"B+", pass:true}
    ]
  },
  payments: {
    pending: [{code:"CS101",name:"Data Structures",fee:1500},{code:"CS102",name:"Database Management",fee:1500}],
    history: [
      {date:"15 Sep 2025",desc:"Re-exam Fee - CS101, CS102",amount:3000,status:"Paid"},
      {date:"10 Sep 2025",desc:"Re-exam Fee - CS103",amount:1200,status:"Paid"},
      {date:"05 Sep 2025",desc:"Re-exam Fee - CS104",amount:1200,status:"Pending"}
    ]
  },
  pyq: [
    {code:"CS101",name:"Data Structures",year:2024,sem:3,size:"2.4 MB"},
    {code:"CS102",name:"Database Management",year:2023,sem:5,size:"1.8 MB"},
    {code:"CS104",name:"Computer Networks",year:2023,sem:5,size:"1.9 MB"},
  ]
};

// --- Login logic using localStorage ---
function isLoggedIn(){ return localStorage.getItem("ef_user") === "true"; }
function doLogin(e){
  e && e.preventDefault();
  // simulate authentication
  const id = document.getElementById("studentId")?.value || "AK2025";
  const pass = document.getElementById("password")?.value || "pass";
  if(id && pass){
    localStorage.setItem("ef_user","true");
    localStorage.setItem("ef_name", DATA.user.name);
    window.location.href = "dashboard.html";
  } else {
    alert("Enter credentials (any values work in this demo).");
  }
}
function doLogout(){
  localStorage.removeItem("ef_user");
  localStorage.removeItem("ef_name");
  window.location.href = "index.html";
}

// Protect pages other than index.html
if(window.location.pathname.endsWith("index.html") || window.location.pathname === "/" ){
  // okay
} else {
  if(!isLoggedIn()){
    window.location.href = "index.html";
  }
}

// --- Render common UI pieces ---
function renderSidebar(){
  const nav = document.querySelectorAll(".nav a");
  nav.forEach(a=>{
    if(window.location.pathname.endsWith(a.getAttribute("data-href"))) a.classList.add("active");
    a.addEventListener("click", (ev)=>{
      ev.preventDefault();
      window.location.href = a.getAttribute("data-href");
    });
  });
  const uname = document.querySelector(".user .name");
  if(uname) uname.textContent = localStorage.getItem("ef_name") || DATA.user.name;
  const avatar = document.querySelector(".avatar");
  if(avatar) avatar.textContent = (DATA.user.name||"U").slice(0,1);
  const logoutBtn = document.querySelector(".logout");
  if(logoutBtn) logoutBtn.addEventListener("click", doLogout);
}

// --- Page specific renders ---
function renderDashboard(){
  if(!document.getElementById("dashboard-root")) return;
  const d = DATA.dashboard;
  document.getElementById("pendingApps").textContent = d.pendingApplications;
  document.getElementById("totalPayments").textContent = d.totalPayments;
  document.getElementById("upcomingExams").textContent = d.upcomingExams;
  document.getElementById("resultsPublished").textContent = d.resultsPublished;
  // notices
  const noticesWrap = document.getElementById("noticesWrap");
  noticesWrap.innerHTML = "";
  d.notices.forEach(n=>{
    const el = document.createElement("div");
    el.className = "card small";
    el.innerHTML = `<strong>${n.title}</strong><div class="small-muted">${n.note}</div><div class="small-muted" style="margin-top:6px">${n.tag} · ${n.time}</div>`;
    noticesWrap.appendChild(el);
  });
}

function renderResults(){
  if(!document.getElementById("results-root")) return;
  const r = DATA.results;
  document.getElementById("totalMarks").textContent = r.totalMarks;
  document.getElementById("average").textContent = r.average;
  document.getElementById("status").textContent = r.status;
  const tbody = document.getElementById("results-table-body");
  tbody.innerHTML = "";
  r.subjects.forEach(s=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${s.code}</td><td>${s.name}</td><td>${s.internal}</td><td>${s.external}</td><td>${s.total}</td><td>${s.grade}</td><td><span class="badge ${s.pass? 'success':'fail'}">${s.pass? 'Pass':'Fail'}</span></td>`;
    tbody.appendChild(tr);
  });
}

function renderApply(){
  if(!document.getElementById("apply-root")) return;
  const wrap = document.getElementById("apply-list");
  wrap.innerHTML = "";
  DATA.results.subjects.forEach(s=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<label style="display:flex;align-items:center;justify-content:space-between"><div><input type="checkbox" data-code="${s.code}" class="rechk"> <strong>${s.code}</strong><div class="small-muted">${s.name}</div></div><div class="small-muted">₹${ (s.code==='CS103' || s.code==='CS104')?1200:1500 }<div style="font-size:12px">3-4 credits</div></div></label>`;
    wrap.appendChild(card);
  });
  document.getElementById("apply-next").addEventListener("click", ()=>{
    // collect selections and store in localStorage as 'application'
    const checked = Array.from(document.querySelectorAll(".rechk:checked")).map(i=>i.getAttribute("data-code"));
    if(checked.length===0){ alert("Select at least one subject"); return; }
    localStorage.setItem("ef_selection", JSON.stringify(checked));
    window.location.href = "applications.html";
  });
}

function renderApplications(){
  if(!document.getElementById("applications-root")) return;
  const sel = JSON.parse(localStorage.getItem("ef_selection")||"[]");
  const wrap = document.getElementById("applications-list");
  wrap.innerHTML = "";
  if(sel.length===0){
    wrap.innerHTML = "<div class='small-muted'>No active applications. Apply for re-exam from Apply page.</div>";
    return;
  }
  sel.forEach(code=>{
    const subj = DATA.results.subjects.find(s=>s.code===code) || {name:"Unknown"};
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML = `<div class="kv"><div><strong>${code} - ${subj.name}</strong><div class="small-muted">Awaiting approval</div></div><div><span class="badge small-muted">₹${(code==='CS103'||code==='CS104')?1200:1500}</span></div></div>`;
    wrap.appendChild(el);
  });
}

function renderPayments(){
  if(!document.getElementById("payments-root")) return;
  const pend = DATA.payments.pending;
  const ph = DATA.payments.history;
  const pendWrap = document.getElementById("pendingPayments");
  pendWrap.innerHTML = "";
  pend.forEach(p=>{
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML = `<div class="kv"><div><strong>${p.code} - ${p.name}</strong><div class="small-muted">Re-examination fee</div></div><div><strong>₹${p.fee}</strong></div></div>`;
    pendWrap.appendChild(el);
  });
  const tbody = document.getElementById("payment-history-body");
  tbody.innerHTML = "";
  ph.forEach(h=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${h.date}</td><td>${h.desc}</td><td>₹${h.amount}</td><td>${h.status}</td><td><button class="btn secondary" onclick="alert('No backend: this would download a receipt in a real app')">Download</button></td>`;
    tbody.appendChild(tr);
  });
}

function renderPYQ(){
  if(!document.getElementById("pyq-root")) return;
  const wrap = document.getElementById("pyq-list");
  wrap.innerHTML = "";
  DATA.pyq.forEach(p=>{
    const card = document.createElement("div");
    card.className="card";
    card.innerHTML = `<div class="kv"><div><strong>${p.name}</strong><div class="small-muted">${p.code} · Semester ${p.sem} · ${p.year}</div></div><div><div class="small-muted">${p.size}</div><div style="margin-top:6px"><button class="btn secondary" onclick="alert('No backend: view/download disabled in demo')">Download</button></div></div></div>`;
    wrap.appendChild(card);
  });
}

function renderNotices(){
  if(!document.getElementById("notices-root")) return;
  const wrap = document.getElementById("notices-list");
  wrap.innerHTML = "";
  DATA.dashboard.notices.forEach(n=>{
    const card = document.createElement("div");
    card.className="card";
    card.innerHTML = `<strong>${n.title}</strong><div class="small-muted" style="margin-top:6px">${n.note}</div><div class="small-muted" style="margin-top:6px">${n.time}</div>`;
    wrap.appendChild(card);
  });
}

// Initialize common
document.addEventListener("DOMContentLoaded", ()=>{
  renderSidebar();
  renderDashboard();
  renderResults();
  renderApply();
  renderApplications();
  renderPayments();
  renderPYQ();
  renderNotices();
  // attach login form if present
  const loginForm = document.getElementById("login-form");
  if(loginForm) loginForm.addEventListener("submit", doLogin);
  // attach logout on any element with data-logout
  document.querySelectorAll("[data-logout]").forEach(el=>el.addEventListener("click", doLogout));
});
