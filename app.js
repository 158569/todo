(function () {
  const CONFIG = window.TODO_SUPABASE_CONFIG || {};
  const VIEW_KEY = "todoCloudView";
  const PLACEHOLDER = "写点什么吧 (｡･ω･｡)ﾉ";

  const state = {
    supabase: null,
    user: null,
    data: null,
    view: localStorage.getItem(VIEW_KEY) || "todos",
    showCompleted: true,
    statusTimer: null,
    noteTimer: null,
    saveTimer: null
  };

  const $ = (selector) => document.querySelector(selector);
  const authPanel = $("#authPanel");
  const appPanel = $("#appPanel");
  const emailInput = $("#emailInput");
  const passwordInput = $("#passwordInput");
  const signInButton = $("#signInButton");
  const signUpButton = $("#signUpButton");
  const signOutButton = $("#signOutButton");
  const userLabel = $("#userLabel");
  const content = $("#content");
  const notePanel = $("#notePanel");
  const noteInput = $("#noteInput");
  const commandBar = $("#commandBar");
  const commandInput = $("#commandInput");
  const statusEl = $("#status");
  const dateLabel = $("#dateLabel");
  const exportButton = $("#exportButton");
  const importInput = $("#importInput");

  function emptyData() {
    return {
      dailyImportantReminders: [],
      dailyReminders: [],
      weeklyReminders: [],
      monthlyReminders: [],
      oneTimeReminders: [],
      dateImportantReminders: [],
      days: {},
      noteText: ""
    };
  }

  function normalizeData(data) {
    data = data && typeof data === "object" ? data : emptyData();
    data.days ||= {};
    data.dailyImportantReminders ||= [];
    data.dailyReminders ||= [];
    data.weeklyReminders ||= [];
    data.monthlyReminders ||= [];
    data.oneTimeReminders ||= [];
    data.dateImportantReminders ||= [];
    data.noteText ||= "";
    return data;
  }

  function todayKey() {
    const now = new Date();
    return toDateKey(now);
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function shortDate(dateKey) {
    const parts = dateKey.split("-").map(Number);
    return `${parts[1]}/${parts[2]}`;
  }

  function navDate() {
    const now = new Date();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${now.getMonth() + 1}/${now.getDate()} ${weekdays[now.getDay()]}`;
  }

  function day(dateKey = todayKey()) {
    state.data.days ||= {};
    state.data.days[dateKey] ||= { pending: [], inProgress: [], completed: [], hidden: [] };
    const current = state.data.days[dateKey];
    current.pending ||= [];
    current.inProgress ||= [];
    current.completed ||= [];
    current.hidden ||= [];
    return current;
  }

  function setStatus(message, ok = true) {
    clearTimeout(state.statusTimer);
    statusEl.textContent = message;
    statusEl.classList.toggle("error", !ok);
    state.statusTimer = setTimeout(() => {
      statusEl.textContent = "";
      statusEl.classList.remove("error");
    }, 5000);
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function requireConfig() {
    return Boolean(CONFIG.url && CONFIG.anonKey && window.supabase);
  }

  function initClient() {
    if (!requireConfig()) {
      authPanel.innerHTML = [
        '<div class="setup-box">',
        "<h2>需要配置 Supabase</h2>",
        "<p>复制 <code>config.example.js</code> 为 <code>config.js</code>，填入 Supabase URL 和 anon key。</p>",
        "<p>再执行 <code>supabase-schema.sql</code> 里的建表和权限 SQL。</p>",
        "</div>"
      ].join("");
      appPanel.classList.add("hidden");
      authPanel.classList.remove("hidden");
      return false;
    }
    state.supabase = window.supabase.createClient(CONFIG.url, CONFIG.anonKey);
    return true;
  }

  async function loadUser() {
    const { data, error } = await state.supabase.auth.getUser();
    if (error || !data.user) {
      state.user = null;
      state.data = null;
      showAuth();
      return;
    }
    state.user = data.user;
    await loadCloudData();
    showApp();
  }

  async function loadCloudData() {
    const { data, error } = await state.supabase
      .from("todo_documents")
      .select("data")
      .eq("user_id", state.user.id)
      .maybeSingle();

    if (error) throw error;
    state.data = normalizeData(data ? data.data : emptyData());
    if (!data) await saveNow();
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(saveNow, 350);
  }

  async function saveNow() {
    if (!state.user || !state.data) return;
    const { error } = await state.supabase
      .from("todo_documents")
      .upsert({
        user_id: state.user.id,
        data: state.data,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    if (error) {
      setStatus(`保存失败：${error.message}`, false);
    }
  }

  function showAuth() {
    authPanel.classList.remove("hidden");
    appPanel.classList.add("hidden");
  }

  function showApp() {
    authPanel.classList.add("hidden");
    appPanel.classList.remove("hidden");
    userLabel.textContent = state.user.email || "";
    render();
  }

  function section(title, rows, startIndex = 1) {
    const parts = [`<div class="section-title">${escapeHtml(title)}</div>`];
    if (!rows.length) {
      parts.push('<div class="empty">暂无</div>');
      return parts.join("");
    }
    rows.forEach((row, i) => {
      const index = row.index || startIndex + i;
      const time = row.time ? `<span class="time">${escapeHtml(row.time)}</span> ` : "";
      const action = row.action ? `<button data-action="${row.action}" data-key="${escapeHtml(row.key)}">${row.label || "完成"}</button>` : "";
      parts.push(`<div class="row"><span class="idx">${index}.</span><span>${time}${escapeHtml(row.text)}</span>${action}</div>`);
    });
    return parts.join("");
  }

  function overdueRows() {
    const rows = [];
    const current = todayKey();
    Object.keys(state.data.days).sort().forEach((dateKey) => {
      if (dateKey >= current) return;
      const currentDay = day(dateKey);
      currentDay.pending.forEach((text) => {
        if (!currentDay.completed.includes(text) && !currentDay.hidden.includes(text)) {
          rows.push({ group: "overdue", dateKey, time: shortDate(dateKey), text, key: `${dateKey}|${text}` });
        }
      });
    });
    return rows;
  }

  function dailyReminderRows(includeFuture = false) {
    const current = todayKey();
    const completed = day().completed;
    const rows = [];

    state.data.dailyImportantReminders.forEach((item) => {
      if (!includeFuture && item.startDate && item.startDate > current) return;
      const text = item.text;
      if (!completed.includes(text) && !completed.includes(`今日已完成：${text}`)) {
        rows.push({ group: "reminder", time: "", text, key: text });
      }
    });

    state.data.dailyReminders.forEach((item) => {
      const times = item.times || (item.hours || []).map((hour) => `${String(hour).padStart(2, "0")}:00`);
      times.forEach((time) => {
        const key = `${time}  ${item.text}`;
        if (!completed.includes(key) && !completed.includes(`今日已完成：${key}`)) {
          rows.push({ group: "reminder", time, text: item.text, key });
        }
      });
    });

    return rows.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
  }

  function todoRows() {
    const rows = [];
    const overdue = overdueRows();
    overdue.forEach((row, i) => rows.push({ ...row, index: i + 1, action: "complete", label: "完成" }));

    let index = rows.length + 1;
    const current = day();
    current.inProgress.forEach((text) => rows.push({ group: "ing", index: index++, text, key: text, action: "complete", label: "完成" }));
    current.pending.forEach((text) => rows.push({ group: "todo", index: index++, text, key: text, action: "complete", label: "完成" }));
    dailyReminderRows(false).forEach((row) => rows.push({ ...row, index: index++, action: "complete", label: "完成" }));
    return rows;
  }

  function renderTodos() {
    const rows = todoRows();
    const completed = day().completed;
    let html = "";
    html += section("过期待办：", rows.filter((row) => row.group === "overdue"));
    html += section("进行中：", rows.filter((row) => row.group === "ing"));
    html += section("今日待办：", rows.filter((row) => row.group === "todo" || row.group === "reminder"));
    if (completed.length) {
      html += `<div class="section-title completed-toggle" data-action="toggleCompleted">已完成：${state.showCompleted ? "▼ 点击收起" : "▶ 点击展开"}</div>`;
      if (state.showCompleted) {
        html += completed.map((text, i) => `<div class="row"><span class="idx">${i + 1}.</span><span>${escapeHtml(text)}</span><span></span></div>`).join("");
      }
    }
    content.innerHTML = html;
  }

  function renderReminders() {
    const future = [];
    Object.keys(state.data.days).sort().forEach((dateKey) => {
      if (dateKey <= todayKey()) return;
      day(dateKey).pending.forEach((text) => future.push({ time: shortDate(dateKey), text }));
    });
    state.data.oneTimeReminders.forEach((item) => {
      const [date, time] = item.at.split(" ");
      if (date >= todayKey()) future.push({ time: `${shortDate(date)} ${time}`, text: item.text });
    });
    const weekly = state.data.weeklyReminders.map((item) => ({ time: `${(item.days || []).map(dayName).join("/")} ${item.time}`, text: item.text }));
    const monthly = state.data.monthlyReminders.map((item) => ({ time: `每月${item.day}号`, text: item.text }));
    content.innerHTML =
      section("未来待办：", future) +
      section("每日提醒：", dailyReminderRows(true)) +
      section("每周提醒：", weekly) +
      section("每月提醒：", monthly);
  }

  function dayName(name) {
    return {
      Monday: "周一",
      Tuesday: "周二",
      Wednesday: "周三",
      Thursday: "周四",
      Friday: "周五",
      Saturday: "周六",
      Sunday: "周日"
    }[name] || name;
  }

  function renderHistory() {
    let html = "";
    Object.keys(state.data.days).sort().reverse().forEach((dateKey) => {
      const completed = day(dateKey).completed;
      if (!completed.length) return;
      html += `<div class="section-title">${escapeHtml(dateKey)}</div>`;
      html += completed.map((text, i) => `<div class="row"><span class="idx">${i + 1}.</span><span>${escapeHtml(text)}</span><span></span></div>`).join("");
    });
    content.innerHTML = html || '<div class="empty">暂无</div>';
  }

  function renderNotes() {
    noteInput.value = state.data.noteText || "";
  }

  function render() {
    dateLabel.textContent = navDate();
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.view));
    notePanel.classList.toggle("hidden", state.view !== "notes");
    content.classList.toggle("hidden", state.view === "notes");
    commandBar.classList.toggle("hidden", state.view === "notes");
    localStorage.setItem(VIEW_KEY, state.view);
    if (state.view === "todos") renderTodos();
    if (state.view === "reminders") renderReminders();
    if (state.view === "history") renderHistory();
    if (state.view === "notes") renderNotes();
  }

  function addToday(text) {
    const current = day();
    if (current.pending.includes(text) || current.completed.includes(text)) {
      setStatus("已经有这条待办了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    current.pending.push(text);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addDatedTodo(offset, text) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const current = day(toDateKey(date));
    if (!current.pending.includes(text)) current.pending.push(text);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addDailyReminder(time, text) {
    const exists = state.data.dailyReminders.some((item) => item.text === text && (item.times || []).includes(time));
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.dailyReminders.push({ times: [time], text });
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addMonthlyReminder(dayNumber, text) {
    const exists = state.data.monthlyReminders.some((item) => Number(item.day) === Number(dayNumber) && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.monthlyReminders.push({ day: Number(dayNumber), text });
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function completeRow(row) {
    const current = day();
    if (row.group === "overdue") {
      const [dateKey, text] = row.key.split("|");
      const old = day(dateKey);
      old.pending = old.pending.filter((item) => item !== text);
      old.hidden.push(text);
      current.completed.push(`补完成：${text}（原 ${dateKey}）`);
    } else if (row.group === "reminder") {
      current.completed.push(`今日已完成：${row.time ? `${row.time}  ` : ""}${row.text}`);
    } else {
      current.pending = current.pending.filter((item) => item !== row.key);
      current.inProgress = current.inProgress.filter((item) => item !== row.key);
      current.completed.push(row.key);
    }
    scheduleSave();
    setStatus("已完成记录 (｡･ω･｡)ﾉ");
    render();
  }

  function completeByQuery(query) {
    const rows = todoRows();
    let target = /^\d+$/.test(query) ? rows.find((row) => row.index === Number(query)) : rows.find((row) => row.text.includes(query) || row.key.includes(query));
    if (!target) {
      setStatus("没找到这条待办 (｡•́︿•̀｡)", false);
      return;
    }
    completeRow(target);
  }

  function startByQuery(query) {
    const rows = todoRows();
    const target = /^\d+$/.test(query) ? rows.find((row) => row.index === Number(query)) : rows.find((row) => row.text.includes(query));
    if (!target) {
      setStatus("没找到这条待办 (｡•́︿•̀｡)", false);
      return;
    }
    const current = day();
    current.pending = current.pending.filter((item) => item !== target.key);
    if (!current.inProgress.includes(target.key)) current.inProgress.push(target.key);
    scheduleSave();
    setStatus("已标记进行中 (｡･ω･｡)ﾉ");
    render();
  }

  function parseCommand(raw) {
    const text = raw.trim();
    if (!text) return;
    let match = text.match(/^完成\s*(.+)$/) || text.match(/^(.+?)(?:完成|好了|完事了|ok)$/i);
    if (match) return completeByQuery(match[1].trim());
    match = text.match(/^(.+?)ing$/i);
    if (match) return startByQuery(match[1].trim());
    match = text.match(/^(每天|每日)\s*(\d{1,2})[:：；点](\d{0,2})\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addDailyReminder(`${match[2].padStart(2, "0")}:${(match[3] || "00").padStart(2, "0")}`, match[4].trim());
    match = text.match(/^每月\s*(\d{1,2})\s*(?:号|日)?\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addMonthlyReminder(match[1], match[2].trim());
    match = text.match(/^(明天|后天|大后天)\s*(.+)$/);
    if (match) return addDatedTodo({ 明天: 1, 后天: 2, 大后天: 3 }[match[1]], match[2].trim());
    match = text.match(/^加入\s*(.+)$/);
    if (match) return addToday(match[1].trim());
    return addToday(text);
  }

  async function signIn() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const { error } = await state.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(`登录失败：${error.message}`, false);
      return;
    }
    await loadUser();
  }

  async function signUp() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const { error } = await state.supabase.auth.signUp({ email, password });
    if (error) {
      setStatus(`注册失败：${error.message}`, false);
      return;
    }
    setStatus("注册成功。若 Supabase 开了邮件确认，请先去邮箱确认。");
    await loadUser();
  }

  async function signOut() {
    await state.supabase.auth.signOut();
    state.user = null;
    state.data = null;
    showAuth();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `workday-todos-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        state.data = normalizeData(JSON.parse(reader.result));
        await saveNow();
        render();
        setStatus("导入成功，已保存到当前账号 (｡･ω･｡)ﾉ");
      } catch (error) {
        setStatus(`导入失败：${error.message}`, false);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.view = tab.dataset.view;
      render();
    });
  });

  content.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (action === "toggleCompleted") {
      state.showCompleted = !state.showCompleted;
      render();
    }
    if (action === "complete") {
      const row = todoRows().find((item) => item.key === event.target.dataset.key);
      if (row) completeRow(row);
    }
  });

  commandInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    parseCommand(commandInput.value);
    commandInput.value = "";
    render();
  });

  noteInput.addEventListener("input", () => {
    clearTimeout(state.noteTimer);
    state.noteTimer = setTimeout(() => {
      state.data.noteText = noteInput.value;
      scheduleSave();
      setStatus("便签已自动保存 (｡･ω･｡)ﾉ");
    }, 3000);
  });

  signInButton.addEventListener("click", signIn);
  signUpButton.addEventListener("click", signUp);
  signOutButton.addEventListener("click", signOut);
  exportButton.addEventListener("click", exportData);
  importInput.addEventListener("change", () => {
    if (importInput.files[0]) importData(importInput.files[0]);
    importInput.value = "";
  });

  if (initClient()) {
    state.supabase.auth.onAuthStateChange(() => loadUser());
    loadUser().catch((error) => {
      setStatus(`初始化失败：${error.message}`, false);
      showAuth();
    });
  }
})();
