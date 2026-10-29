const STORAGE_KEY = "spendwise-expenses-v1";
const categoryColors = {Food:"#e9a23b",Transport:"#4b91dc",Shopping:"#9a76df",Bills:"#e2757b",Education:"#31a78b",Health:"#e18a52",Entertainment:"#6677d8",Other:"#8a94a8"};
const $ = id => document.getElementById(id);
const form = $("expenseForm");
const titleInput = $("expenseTitle");
const amountInput = $("expenseAmount");
const categoryInput = $("expenseCategory");
const dateInput = $("expenseDate");
const notesInput = $("expenseNotes");
const idInput = $("expenseId");
const saveButton = $("saveButton");
const cancelEdit = $("cancelEdit");
const formHeading = $("formHeading");
const formMessage = $("formMessage");
const tableBody = $("expenseTableBody");
const emptyTransactions = $("emptyTransactions");
const categoryBreakdown = $("categoryBreakdown");
const emptyBreakdown = $("emptyBreakdown");
const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const dateFrom = $("dateFrom");
const dateTo = $("dateTo");
const sortFilter = $("sortFilter");
const toast = $("toast");
let expenses = loadExpenses();
let toastTimeout;

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === "string" && typeof item.title === "string" && Number.isFinite(Number(item.amount)) && typeof item.date === "string") : [];
  } catch {
    return [];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch {
    showToast("Could not save data. Check your browser storage.");
    return false;
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value)||0);
}

function readableDate(value) {
  if (!value) return "—";
  const [year,month,day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year,month-1,day).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"),2800);
}

function getFilteredExpenses() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const from = dateFrom.value;
  const to = dateTo.value;
  const filtered = expenses.filter(expense => {
    const matchesQuery = `${expense.title} ${expense.category} ${expense.notes||""}`.toLowerCase().includes(query);
    return matchesQuery && (category==="all" || expense.category===category) && (!from || expense.date>=from) && (!to || expense.date<=to);
  });
  const sort = sortFilter.value;
  filtered.sort((a,b) => {
    if (sort==="oldest") return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
    if (sort==="high") return Number(b.amount)-Number(a.amount);
    if (sort==="low") return Number(a.amount)-Number(b.amount);
    return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
  });
  return filtered;
}

function renderSummary() {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const total = expenses.reduce((sum,item) => sum+Number(item.amount),0);
  const monthly = expenses.filter(item => item.date.startsWith(monthPrefix)).reduce((sum,item) => sum+Number(item.amount),0);
  $("totalAmount").textContent = money(total);
  $("monthAmount").textContent = money(monthly);
  $("transactionCount").textContent = String(expenses.length);
  $("monthLabel").textContent = now.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  $("todayLabel").textContent = now.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
}

function makeCell(className, content) {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  if (content instanceof Node) cell.append(content);
  else cell.textContent = content;
  return cell;
}

function renderTransactions() {
  const filtered = getFilteredExpenses();
  tableBody.replaceChildren();
  $("filteredTotal").textContent = money(filtered.reduce((sum,item) => sum+Number(item.amount),0));
  $("resultCount").textContent = `Showing ${filtered.length} of ${expenses.length} transaction${expenses.length===1?"":"s"}`;
  emptyTransactions.classList.toggle("hidden",filtered.length>0);
  filtered.forEach(expense => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const title = document.createElement("span");
    title.className = "expense-title";
    title.textContent = expense.title;
    titleCell.append(title);
    if (expense.notes) {
      const note = document.createElement("span");
      note.className = "expense-note";
      note.textContent = expense.notes;
      titleCell.append(note);
    }
    const pill = document.createElement("span");
    pill.className = "category-pill";
    const color = categoryColors[expense.category] || categoryColors.Other;
    pill.style.backgroundColor = `${color}18`;
    pill.style.color = color;
    pill.textContent = expense.category;
    row.append(titleCell,makeCell("",pill),makeCell("",readableDate(expense.date)),makeCell("amount-cell",money(expense.amount)));
    const actionCell = makeCell("right","");
    const actions = document.createElement("div");
    actions.className = "row-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "action-btn";
    edit.textContent = "✎";
    edit.title = "Edit expense";
    edit.setAttribute("aria-label",`Edit ${expense.title}`);
    edit.addEventListener("click",() => startEditing(expense.id));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "action-btn delete";
    remove.textContent = "×";
    remove.title = "Delete expense";
    remove.setAttribute("aria-label",`Delete ${expense.title}`);
    remove.addEventListener("click",() => deleteExpense(expense.id));
    actions.append(edit,remove);
    actionCell.append(actions);
    row.append(actionCell);
    tableBody.append(row);
  });
}

function renderBreakdown() {
  const totals = {};
  expenses.forEach(item => totals[item.category] = (totals[item.category]||0)+Number(item.amount));
  const entries = Object.entries(totals).sort((a,b) => b[1]-a[1]);
  categoryBreakdown.replaceChildren();
  categoryBreakdown.classList.toggle("hidden",entries.length===0);
  emptyBreakdown.classList.toggle("hidden",entries.length>0);
  const maxAmount = entries.length ? entries[0][1] : 0;
  entries.forEach(([category,amount]) => {
    const row = document.createElement("div");
    const top = document.createElement("div");
    top.className = "category-row-top";
    const name = document.createElement("span");
    name.className = "category-name";
    const dot = document.createElement("span");
    dot.className = "category-dot";
    dot.style.backgroundColor = categoryColors[category] || categoryColors.Other;
    name.append(dot,document.createTextNode(category));
    const amountLabel = document.createElement("span");
    amountLabel.className = "category-amount";
    amountLabel.textContent = money(amount);
    top.append(name,amountLabel);
    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.backgroundColor = categoryColors[category] || categoryColors.Other;
    fill.style.width = `${maxAmount ? amount/maxAmount*100 : 0}%`;
    track.append(fill);
    row.append(top,track);
    categoryBreakdown.append(row);
  });
}

function render() {
  renderSummary();
  renderTransactions();
  renderBreakdown();
}

function resetForm() {
  form.reset();
  idInput.value = "";
  dateInput.value = localDateString();
  formHeading.textContent = "Add an expense";
  saveButton.textContent = "＋ Save expense";
  cancelEdit.classList.add("hidden");
  formMessage.textContent = "";
}

function startEditing(id) {
  const expense = expenses.find(item => item.id===id);
  if (!expense) return;
  idInput.value = expense.id;
  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;
  notesInput.value = expense.notes || "";
  formHeading.textContent = "Edit expense";
  saveButton.textContent = "Update expense";
  cancelEdit.classList.remove("hidden");
  formMessage.textContent = "";
  document.querySelector(".form-panel").scrollIntoView({behavior:"smooth",block:"start"});
  titleInput.focus({preventScroll:true});
}

function deleteExpense(id) {
  const expense = expenses.find(item => item.id===id);
  if (!expense || !window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;
  expenses = expenses.filter(item => item.id!==id);
  saveExpenses();
  if (idInput.value===id) resetForm();
  render();
  showToast("Expense deleted.");
}

form.addEventListener("submit",event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;
  const notes = notesInput.value.trim();
  if (title.length<2) {
    formMessage.textContent = "Please enter an expense name with at least 2 characters.";
    titleInput.focus();
    return;
  }
  if (!Number.isFinite(amount) || amount<=0) {
    formMessage.textContent = "Enter an amount greater than zero.";
    amountInput.focus();
    return;
  }
  if (!date) {
    formMessage.textContent = "Please select a date.";
    dateInput.focus();
    return;
  }
  const editingId = idInput.value;
  const expense = {id:editingId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,title,amount:Math.round(amount*100)/100,category,date,notes};
  expenses = editingId ? expenses.map(item => item.id===editingId ? expense : item) : [...expenses,expense];
  saveExpenses();
  resetForm();
  render();
  showToast(editingId ? "Expense updated successfully." : "Expense saved successfully.");
});

cancelEdit.addEventListener("click",resetForm);
[searchInput,categoryFilter,dateFrom,dateTo,sortFilter].forEach(control => {
  control.addEventListener("input",renderTransactions);
  control.addEventListener("change",renderTransactions);
});
$("clearFilters").addEventListener("click",() => {
  searchInput.value = "";
  categoryFilter.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
  sortFilter.value = "newest";
  renderTransactions();
  showToast("Filters reset.");
});
dateInput.value = localDateString();
render();
