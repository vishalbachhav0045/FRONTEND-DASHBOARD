/*
  Employee Admin Dashboard (client-only)
  Move the inline <script> logic from index.html into this file.
*/

/***********************
 * mockData.js
 ***********************/
const MOCK_EMPLOYEES = [
  {
    id: "emp_1001",
    name: "Ayesha Khan",
    email: "ayesha.khan@company.com",
    role: "Senior Frontend Developer",
    department: "Engineering",
    joinDate: "2022-03-14",
    status: "Active",
  },
  {
    id: "emp_1002",
    name: "Rafael Santos",
    email: "rafael.santos@company.com",
    role: "Product Analyst",
    department: "Operations",
    joinDate: "2021-09-05",
    status: "Remote",
  },
  {
    id: "emp_1003",
    name: "Mina Park",
    email: "mina.park@company.com",
    role: "UI/UX Designer",
    department: "Design",
    joinDate: "2020-11-21",
    status: "On Leave",
  },
  {
    id: "emp_1004",
    name: "Noah Patel",
    email: "noah.patel@company.com",
    role: "Backend Engineer",
    department: "Engineering",
    joinDate: "2019-06-10",
    status: "Active",
  },
  {
    id: "emp_1005",
    name: "Fatima Ibrahim",
    email: "fatima.ibrahim@company.com",
    role: "HR Coordinator",
    department: "Human Resources",
    joinDate: "2023-01-18",
    status: "Active",
  },
  {
    id: "emp_1006",
    name: "Oliver Fischer",
    email: "oliver.fischer@company.com",
    role: "Customer Support Lead",
    department: "Customer Success",
    joinDate: "2021-02-26",
    status: "Remote",
  },
];

/***********************
 * localStorage keys
 ***********************/
const LS_EMP_KEY = "employee_admin_employees_v1";
const LS_ACT_KEY = "employee_admin_activity_v1";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function initEmployees() {
  const existing = localStorage.getItem(LS_EMP_KEY);
  if (existing) {
    const parsed = safeParse(existing, null);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  }
  localStorage.setItem(LS_EMP_KEY, JSON.stringify(MOCK_EMPLOYEES));
  return structuredClone(MOCK_EMPLOYEES);
}

function initActivity() {
  const existing = localStorage.getItem(LS_ACT_KEY);
  if (existing) {
    const parsed = safeParse(existing, null);
    if (Array.isArray(parsed)) return parsed;
  }
  const seed = [
    { id: "act_1", type: "update", text: "Status updated for Mina Park.", at: "2026-05-30T09:12:00Z" },
    { id: "act_2", type: "create", text: "New remote assignment for Rafael Santos.", at: "2026-05-28T15:45:00Z" },
    { id: "act_3", type: "delete", text: "Employee record archived (demo).", at: "2026-05-25T11:20:00Z" },
  ];
  localStorage.setItem(LS_ACT_KEY, JSON.stringify(seed));
  return seed;
}

/***********************
 * state
 ***********************/
let employees = initEmployees();
let activity = initActivity();

/***********************
 * helpers
 ***********************/
const $ = (id) => document.getElementById(id);

function persist() {
  localStorage.setItem(LS_EMP_KEY, JSON.stringify(employees));
  localStorage.setItem(LS_ACT_KEY, JSON.stringify(activity));
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function statusBadge(status) {
  if (status === "Active") {
    return "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-semibold";
  }
  if (status === "On Leave") {
    return "inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-semibold";
  }
  if (status === "Remote") {
    return "inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-semibold";
  }
  return "inline-flex items-center rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold";
}

function statusDotClass(status) {
  if (status === "Active") return "bg-emerald-500";
  if (status === "On Leave") return "bg-amber-500";
  if (status === "Remote") return "bg-indigo-500";
  return "bg-slate-400";
}

function slugId() {
  return "emp_" + Math.random().toString(16).slice(2, 10);
}

function addActivity({ type, text }) {
  const act = { id: "act_" + Math.random().toString(16).slice(2, 10), type, text, at: new Date().toISOString() };
  activity = [act, ...activity].slice(0, 20);
  persist();
}

/***********************
 * view state & navigation
 ***********************/
const state = { view: "dashboard", editId: null };

function setActiveNav(view) {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    const is = el.getAttribute("data-nav") === view;
    el.className = is
      ? "nav-link flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-medium"
      : "nav-link flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-700 mt-2";

    // mobile overrides
    if (el.closest("#mobileNav")) {
      el.className = is
        ? "nav-link flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-900 font-medium"
        : "nav-link flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700";
    }
  });
}

function showView(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach((sec) => {
    sec.classList.toggle("hidden", sec.id !== `view-${view}`);
  });

  const title = view === "dashboard" ? "Dashboard" : view === "employees" ? "Employee Directory" : "Settings";
  const subtitle =
    view === "dashboard"
      ? "Overview of workforce status"
      : view === "employees"
        ? "Manage employee records"
        : "Local demo controls (no backend).";

  $("pageTitle").textContent = title;
  $("pageSubtitle").textContent = subtitle;
  setActiveNav(view);
}

/***********************
 * rendering
 ***********************/
function computeMetrics(list) {
  const total = list.length;
  const active = list.filter((e) => e.status === "Active").length;
  const leave = list.filter((e) => e.status === "On Leave").length;
  const pending = list.filter((e) => e.status !== "Active").length + Math.min(4, activity.length);
  return { total, active, leave, pending };
}

function renderDashboard(filterText = "") {
  const q = filterText.trim().toLowerCase();
  const filtered = !q
    ? employees
    : employees.filter((e) => [e.name, e.email, e.role, e.department].some((x) => (x || "").toLowerCase().includes(q)));

  const { total, active, leave, pending } = computeMetrics(filtered);
  $("mTotal").textContent = total;
  $("mActive").textContent = active;
  $("mLeave").textContent = leave;
  $("mPending").textContent = pending;

  // Activity feed
  const feed = $("activityFeed");
  feed.innerHTML = "";
  const top = activity.slice(0, 6);

  if (!top.length) {
    feed.innerHTML = "<li class='text-sm text-slate-500'>No activity yet.</li>";
    return;
  }

  const typeToColor = (t) =>
    t === "create" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : t === "update" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-rose-50 text-rose-700 border-rose-200";

  top.forEach((a) => {
    const li = document.createElement("li");
    li.className = "flex items-start gap-3";
    li.innerHTML = `
      <div class="w-10 h-10 rounded-xl border flex items-center justify-center ${typeToColor(a.type)}">
        ${a.type === "create" ? "＋" : a.type === "update" ? "↻" : "−"}
      </div>
      <div class="flex-1">
        <div class="text-sm font-semibold text-slate-800">${a.text}</div>
        <div class="text-xs text-slate-500 mt-1">${new Date(a.at).toLocaleString()}</div>
      </div>
    `;
    feed.appendChild(li);
  });

  // Department bars
  const deptMap = new Map();
  filtered.forEach((e) => deptMap.set(e.department, (deptMap.get(e.department) || 0) + 1));
  const entries = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1]);

  const deptBars = $("deptBars");
  deptBars.innerHTML = "";
  const max = Math.max(1, ...entries.map(([, c]) => c));

  entries.slice(0, 5).forEach(([dept, count]) => {
    const pct = Math.round((count / max) * 100);
    const color = count === max ? "bg-blue-600" : "bg-indigo-500";
    const row = document.createElement("div");
    row.className = "rounded-xl border border-slate-200 p-4";
    row.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold">${dept}</div>
          <div class="text-xs text-slate-500">${count} employees</div>
        </div>
        <div class="text-xs font-semibold text-slate-700">${pct}%</div>
      </div>
      <div class="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div class="h-full ${color}" style="width:${pct}%"></div>
      </div>
    `;
    deptBars.appendChild(row);
  });
}

function renderEmployees(filterText = "") {
  const q = filterText.trim().toLowerCase();
  const list = !q
    ? employees
    : employees.filter((e) => [e.name, e.email, e.role, e.department, e.status].some((x) => (x || "").toLowerCase().includes(q)));

  const body = $("employeeTableBody");
  body.innerHTML = "";

  if (!list.length) {
    $("emptyState").classList.remove("hidden");
    return;
  }
  $("emptyState").classList.add("hidden");

  list.forEach((e) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50";

    const initials = e.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

    tr.innerHTML = `
      <td class="px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center">
            ${initials}
          </div>
          <div>
            <div class="text-sm font-semibold">${e.name}</div>
            <div class="text-xs text-slate-500">${e.email}</div>
          </div>
        </div>
      </td>

      <td class="px-5 py-4 text-sm text-slate-800 font-medium">${e.role}</td>
      <td class="px-5 py-4 text-sm text-slate-700">${e.department}</td>

      <td class="px-5 py-4">
        <span class="${statusBadge(e.status)}">
          <span class="inline-block w-2 h-2 rounded-full ${statusDotClass(e.status)} mr-2"></span>
          ${e.status}
        </span>
      </td>

      <td class="px-5 py-4 text-sm text-slate-700">${formatDate(e.joinDate)}</td>

      <td class="px-5 py-4 text-right">
        <div class="inline-flex items-center gap-2">
          <button class="editBtn px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold" data-id="${e.id}">Edit</button>
          <button class="deleteBtn px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-semibold" data-id="${e.id}">Delete</button>
        </div>
      </td>
    `;

    body.appendChild(tr);
  });

  body.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", () => openModalForEdit(btn.getAttribute("data-id")));
  });
  body.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => deleteEmployee(btn.getAttribute("data-id")));
  });
}

/***********************
 * modal + form
 ***********************/
const overlay = $("modalOverlay");

function openModal({ mode, employee }) {
  state.editId = mode === "edit" ? employee.id : null;

  $("modalTitle").textContent = mode === "edit" ? "Edit Employee" : "Add Employee";
  $("modalSubtitle").textContent =
    mode === "edit" ? "Update employee details and save changes." : "Fill in the employee details below.";

  ["Name", "Email", "Role", "Dept", "JoinDate"].forEach((k) => {
    const id = k === "Name" ? "errName" : k === "Email" ? "errEmail" : k === "Role" ? "errRole" : k === "Dept" ? "errDept" : "errJoinDate";
    $(id).classList.add("hidden");
  });

  $("fId").value = employee?.id || "";
  $("fName").value = employee?.name || "";
  $("fEmail").value = employee?.email || "";
  $("fRole").value = employee?.role || "";
  $("fDept").value = employee?.department || "";
  $("fStatus").value = employee?.status || "Active";
  $("fJoinDate").value = employee?.joinDate || "";

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  setTimeout(() => $("fName").focus(), 50);
}

function closeModal() {
  overlay.classList.add("hidden");
  overlay.classList.remove("flex");
  state.editId = null;
}

function openModalForAdd() {
  openModal({ mode: "add", employee: null });
}

function openModalForEdit(id) {
  const emp = employees.find((x) => x.id === id);
  if (!emp) return;
  openModal({ mode: "edit", employee: emp });
}

function validateForm() {
  const name = $("fName").value.trim();
  const email = $("fEmail").value.trim();
  const role = $("fRole").value.trim();
  const dept = $("fDept").value.trim();
  const joinDate = $("fJoinDate").value;

  let ok = true;
  if (!name) {
    $("errName").classList.remove("hidden");
    ok = false;
  }
  if (!email) {
    $("errEmail").classList.remove("hidden");
    ok = false;
  }
  if (!role) {
    $("errRole").classList.remove("hidden");
    ok = false;
  }
  if (!dept) {
    $("errDept").classList.remove("hidden");
    ok = false;
  }
  if (!joinDate) {
    $("errJoinDate").classList.remove("hidden");
    ok = false;
  }
  return ok;
}

function upsertEmployeeFromForm() {
  if (!validateForm()) return;

  const payload = {
    id: $("fId").value || slugId(),
    name: $("fName").value.trim(),
    email: $("fEmail").value.trim(),
    role: $("fRole").value.trim(),
    department: $("fDept").value.trim(),
    joinDate: $("fJoinDate").value,
    status: $("fStatus").value,
  };

  const idx = employees.findIndex((x) => x.id === payload.id);
  const isEdit = idx !== -1;

  if (isEdit) {
    employees[idx] = payload;
    addActivity({ type: "update", text: `Updated details for ${payload.name}.` });
  } else {
    employees = [payload, ...employees];
    addActivity({ type: "create", text: `Added new employee: ${payload.name}.` });
  }

  persist();
  closeModal();

  renderEmployees($("employeeSearch").value || "");
  renderDashboard($("globalSearch").value || "");
}

function deleteEmployee(id) {
  const emp = employees.find((x) => x.id === id);
  if (!emp) return;

  const ok = confirm(`Delete employee record for ${emp.name}?`);
  if (!ok) return;

  employees = employees.filter((x) => x.id !== id);
  addActivity({ type: "delete", text: `Employee record deleted: ${emp.name}.` });

  persist();
  renderEmployees($("employeeSearch").value || "");
  renderDashboard($("globalSearch").value || "");
}

/***********************
 * wire up events
 ***********************/
// Navigation
document.querySelectorAll("[data-nav]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const view = a.getAttribute("data-nav");
    showView(view);

    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav && mobileNav.style.display !== "none") mobileNav.style.display = "none";

    if (view === "employees") renderEmployees($("employeeSearch").value || "");
    if (view === "dashboard") renderDashboard($("globalSearch").value || "");
  });
});

// Mobile menu
$("mobileNavBtn").addEventListener("click", () => {
  const nav = $("mobileNav");
  nav.style.display = nav.style.display === "none" ? "block" : "none";
});

$("primaryAction").addEventListener("click", openModalForAdd);
$("addEmployeeBtn").addEventListener("click", openModalForAdd);

$("closeModalBtn").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

$("employeeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  upsertEmployeeFromForm();
});

$("employeeSearch").addEventListener("input", (e) => {
  if (state.view === "employees") renderEmployees(e.target.value);
});

$("globalSearch").addEventListener("input", (e) => {
  if (state.view === "dashboard") renderDashboard(e.target.value);
});

$("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(LS_EMP_KEY);
  localStorage.removeItem(LS_ACT_KEY);
  employees = initEmployees();
  activity = initActivity();
  persist();

  $("employeeSearch").value = "";
  $("globalSearch").value = "";

  renderEmployees("");
  renderDashboard("");
  addActivity({ type: "update", text: "Local storage reset to mock defaults." });
});

/***********************
 * initial render
 ***********************/
showView("dashboard");
renderDashboard("");
renderEmployees("");

