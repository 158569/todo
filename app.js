(function () {
  const CONFIG = window.TODO_SUPABASE_CONFIG || {};
  const VIEW_KEY = "todoCloudView";
  const LAST_EMAIL_KEY = "todoCloudLastEmail";
  const HISTORY_DATE_KEY = "todoCloudHistoryDate";
  const PLACEHOLDER = "写点什么吧 (｡･ω･｡)ﾉ";

  const state = {
    supabase: null,
    user: null,
    data: null,
    view: localStorage.getItem(VIEW_KEY) || "todos",
    historyDate: localStorage.getItem(HISTORY_DATE_KEY) || todayKey(),
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
      noteText: "",
      versionLog: []
    };
  }

  function normalizeData(data) {
    data = data && typeof data === "object" ? data : emptyData();
    data.days = data.days && typeof data.days === "object" ? data.days : {};
    data.dailyImportantReminders = asArray(data.dailyImportantReminders);
    data.dailyReminders = asArray(data.dailyReminders);
    data.weeklyReminders = asArray(data.weeklyReminders);
    data.monthlyReminders = asArray(data.monthlyReminders);
    data.oneTimeReminders = asArray(data.oneTimeReminders);
    data.dateImportantReminders = asArray(data.dateImportantReminders);
    data.noteText = typeof data.noteText === "string" ? data.noteText : "";
    data.versionLog = asArray(data.versionLog).filter(Boolean);
    Object.keys(data.days).forEach((dateKey) => {
      const current = data.days[dateKey] && typeof data.days[dateKey] === "object" ? data.days[dateKey] : {};
      current.pending = uniqueStrings(current.pending);
      current.inProgress = uniqueStrings(current.inProgress);
      current.completed = uniqueStrings(current.completed);
      current.hidden = uniqueStrings(current.hidden);
      data.days[dateKey] = current;
    });
    dedupeReminders(data);
    return data;
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [value];
  }

  function uniqueStrings(value) {
    return [...new Set(asArray(value).filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()))];
  }

  function dedupeBy(items, keyFn) {
    const seen = new Set();
    return asArray(items).filter((item) => {
      const key = keyFn(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function dedupeReminders(data) {
    data.dailyImportantReminders = dedupeBy(data.dailyImportantReminders, (item) => item.text && `important|${item.startDate || ""}|${item.text}`);
    data.dailyReminders = dedupeBy(data.dailyReminders, (item) => {
      const times = reminderTimes(item).join(",");
      return item.text && times && `daily|${times}|${item.text}`;
    });
    data.weeklyReminders = dedupeBy(data.weeklyReminders, (item) => {
      const days = asArray(item.days).join(",");
      return item.text && item.time && `weekly|${days}|${item.time}|${item.text}`;
    });
    data.monthlyReminders = dedupeBy(data.monthlyReminders, (item) => item.text && item.day && `monthly|${item.day}|${item.text}`);
    data.oneTimeReminders = dedupeBy(data.oneTimeReminders, (item) => item.text && item.at && `once|${item.at}|${item.text}`);
    data.dateImportantReminders = dedupeBy(data.dateImportantReminders, (item) => item.text && item.date && `date|${item.date}|${item.text}`);
  }

  function todayKey() {
    const now = new Date();
    return toDateKey(now);
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function dateWithOffset(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return toDateKey(date);
  }

  function shortDate(dateKey) {
    const parts = dateKey.split("-").map(Number);
    return `${parts[1]}/${parts[2]}`;
  }

  function normalizeTime(hour, minute = "00") {
    return `${String(hour).padStart(2, "0")}:${String(minute || "00").padStart(2, "0")}`;
  }

  function timeMinutes(time) {
    const match = String(time || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return 24 * 60 + 1;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function nowMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  function reminderTimes(item) {
    if (Array.isArray(item.times) && item.times.length) return item.times.map((time) => normalizeTime(...String(time).trim().split(":")));
    if (Array.isArray(item.hours) && item.hours.length) return item.hours.map((hour) => normalizeTime(hour));
    return [];
  }

  function navDate() {
    const now = new Date();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${now.getMonth() + 1}/${now.getDate()} ${weekdays[now.getDay()]}`;
  }

  function nowStamp() {
    const now = new Date();
    return `${toDateKey(now)} ${normalizeTime(now.getHours(), now.getMinutes())}`;
  }

  function logUpdate(action, text) {
    state.data.versionLog ||= [];
    state.data.versionLog.unshift({
      at: nowStamp(),
      action,
      text
    });
    state.data.versionLog = state.data.versionLog.slice(0, 300);
  }

  function logDate(entry) {
    return String(entry.at || "").slice(0, 10);
  }

  function logText(entry) {
    if (typeof entry === "string") return entry;
    return `${entry.action || "更新"} ${entry.text || ""}`.trim();
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

  function escapeAttr(text) {
    return escapeHtml(text).replaceAll('"', "&quot;");
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
    state.supabase = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
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
    if (!emailInput.value) emailInput.value = localStorage.getItem(LAST_EMAIL_KEY) || "";
    authPanel.classList.remove("hidden");
    appPanel.classList.add("hidden");
  }

  function showApp() {
    authPanel.classList.add("hidden");
    appPanel.classList.remove("hidden");
    userLabel.textContent = state.user.email || "";
    if (state.user.email) localStorage.setItem(LAST_EMAIL_KEY, state.user.email);
    render();
  }

  function section(title, rows, startIndex = 1, emptyText = "暂无") {
    const parts = [`<div class="section-title">${escapeHtml(title)}</div>`];
    if (!rows.length) {
      parts.push(`<div class="empty">${escapeHtml(emptyText)}</div>`);
      return parts.join("");
    }
    rows.forEach((row, i) => {
      const index = row.index || startIndex + i;
      const time = row.time ? `<span class="time">${escapeHtml(row.time)}</span> ` : "";
      const action = row.action ? `<button data-action="${row.action}" data-key="${escapeAttr(row.key)}">${row.label || "完成"}</button>` : "";
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
    state.data.oneTimeReminders.forEach((item) => {
      if (!item.at || !item.text) return;
      const [date, time = ""] = item.at.split(" ");
      if (date >= current) return;
      rows.push({ group: "overdueSingle", source: "once", dateKey: date, time: `${shortDate(date)} ${time}`.trim(), text: item.text, key: `${item.at}|${item.text}` });
    });
    state.data.dateImportantReminders.forEach((item) => {
      if (!item.date || !item.text || item.date >= current) return;
      rows.push({ group: "overdueSingle", source: "dateImportant", dateKey: item.date, time: shortDate(item.date), text: item.text, key: `${item.date}|${item.text}` });
    });
    return rows;
  }

  function dailyReminderRows(includeFuture = false) {
    const current = todayKey();
    const completed = includeFuture ? [] : day().completed;
    const rows = [];

    state.data.dailyImportantReminders.forEach((item) => {
      if (!includeFuture && item.startDate && item.startDate > current) return;
      const text = item.text;
      if (!completed.includes(text) && !completed.includes(`今日已完成：${text}`)) {
        rows.push({ group: "reminder", time: "", text, key: text, sortTime: -1 });
      }
    });

    state.data.dailyReminders.forEach((item) => {
      const times = reminderTimes(item);
      times.forEach((time) => {
        const key = `${time}  ${item.text}`;
        if (!completed.includes(key) && !completed.includes(`今日已完成：${key}`)) {
          rows.push({ group: "reminder", time, text: item.text, key, sortTime: timeMinutes(time) });
        }
      });
    });

    return rows.sort((a, b) => a.sortTime - b.sortTime);
  }

  function oneTimeTodayRows() {
    const current = todayKey();
    const completed = day().completed;
    const rows = [];

    state.data.oneTimeReminders.forEach((item) => {
      if (!item.at || !item.text) return;
      const [date, time = ""] = item.at.split(" ");
      if (date !== current) return;
      const key = `${item.at}|${item.text}`;
      const doneText = `${time}  ${item.text}`.trim();
      if (!completed.includes(doneText) && !completed.includes(`今日已完成：${doneText}`)) {
        rows.push({ group: "single", source: "once", dateKey: date, time, text: item.text, key, sortTime: timeMinutes(time) });
      }
    });

    state.data.dateImportantReminders.forEach((item) => {
      if (!item.date || item.date !== current || !item.text) return;
      const key = `${item.date}|${item.text}`;
      if (!completed.includes(item.text) && !completed.includes(`今日已完成：${item.text}`)) {
        rows.push({ group: "single", source: "dateImportant", dateKey: item.date, time: "", text: item.text, key, sortTime: -1 });
      }
    });

    return rows.sort((a, b) => a.sortTime - b.sortTime);
  }

  function todoRows() {
    const rows = [];
    const overdue = overdueRows();
    overdue.forEach((row, i) => rows.push({ ...row, index: i + 1, action: "complete", label: "完成" }));

    let index = rows.length + 1;
    const timedRows = [...dailyReminderRows(false), ...oneTimeTodayRows()];
    const dueRows = timedRows.filter((row) => !row.time || row.sortTime <= nowMinutes());
    const laterRows = timedRows.filter((row) => row.time && row.sortTime > nowMinutes());
    dueRows.forEach((row) => rows.push({ ...row, group: row.group === "single" ? "single" : "reminder", index: index++, action: "complete", label: "完成" }));

    const current = day();
    current.inProgress.forEach((text) => rows.push({ group: "ing", index: index++, text, key: text, action: "complete", label: "完成" }));
    current.pending.forEach((text) => rows.push({ group: "todo", index: index++, text, key: text, action: "complete", label: "完成" }));
    laterRows.forEach((row) => rows.push({ ...row, group: row.group === "single" ? "single" : "reminder", index: index++, action: "complete", label: "完成" }));
    return rows;
  }

  function renderTodos() {
    const rows = todoRows();
    const completed = day().completed;
    let html = "";
    html += section("过期待办：", rows.filter((row) => row.group === "overdue" || row.group === "overdueSingle"), 1, "没有过期待办哦 (｡･ω･｡)ﾉ");
    html += section("进行中：", rows.filter((row) => row.group === "ing"));
    html += section("今日待办：", rows.filter((row) => row.group === "todo" || row.group === "reminder" || row.group === "single"));
    html += `<div class="section-title completed-toggle" data-action="toggleCompleted">已完成：${state.showCompleted ? "▼ 点击收起" : "▶ 点击展开"}</div>`;
    if (state.showCompleted) {
      html += completed.length
        ? completed.map((text, i) => `<div class="row"><span class="idx">${i + 1}.</span><span>${escapeHtml(text)}</span><span></span></div>`).join("")
        : '<div class="empty">暂无</div>';
    }
    content.innerHTML = html;
  }

  function renderReminders() {
    const future = [];
    Object.keys(state.data.days).sort().forEach((dateKey) => {
      if (dateKey <= todayKey()) return;
      day(dateKey).pending.forEach((text) => future.push({ time: shortDate(dateKey), text, sortKey: `${dateKey} 00:00` }));
    });
    state.data.oneTimeReminders.forEach((item) => {
      if (!item.at || !item.text) return;
      const [date, time = ""] = item.at.split(" ");
      if (date > todayKey()) future.push({ time: `${shortDate(date)} ${time}`.trim(), text: item.text, sortKey: item.at });
    });
    state.data.dateImportantReminders.forEach((item) => {
      if (!item.date || !item.text || item.date <= todayKey()) return;
      future.push({ time: shortDate(item.date), text: item.text, sortKey: `${item.date} 00:00` });
    });
    future.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const weekly = state.data.weeklyReminders
      .map((item) => ({ time: `${asArray(item.days).map(dayName).join("/")} ${item.time || ""}`.trim(), text: item.text }))
      .sort((a, b) => a.time.localeCompare(b.time));
    const monthly = state.data.monthlyReminders
      .map((item) => ({ time: `每月${item.day}号`, text: item.text }))
      .sort((a, b) => Number(a.time.match(/\d+/)?.[0] || 99) - Number(b.time.match(/\d+/)?.[0] || 99));
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

  function reminderLogText(item) {
    if (item.at) {
      const [date, time = ""] = item.at.split(" ");
      return `${shortDate(date)} ${time} ${item.text}`.trim();
    }
    if (item.date) return `${shortDate(item.date)} ${item.text}`;
    if (item.day) return `每月${Number(item.day)}号 ${item.text}`;
    if (item.days) return `${asArray(item.days).map(dayName).join("/")} ${item.time || ""} ${item.text}`.trim();
    const times = reminderTimes(item);
    if (times.length) return `${times.join(" / ")} ${item.text}`;
    return `每天 ${item.text}`;
  }

  function renderHistory() {
    const selectedDate = state.historyDate || "";
    let html = [
      '<div class="history-filter">',
      '<span>日期</span>',
      `<input data-action="historyDate" type="date" value="${escapeAttr(selectedDate)}">`,
      '<button data-action="historyToday" type="button">今天</button>',
      '<button data-action="historyAll" type="button">全部</button>',
      "</div>"
    ].join("");

    const completedRows = selectedDate ? completedRowsForDate(selectedDate) : allCompletedRows();
    html += section(selectedDate ? `已完成：${selectedDate}` : "已完成：全部", completedRows, 1, "暂无已完成");

    const logRows = versionLogRows(selectedDate);
    html += section(selectedDate ? `更新记录：${selectedDate}` : "更新记录：全部", logRows, 1, "暂无更新记录");
    content.innerHTML = html;
  }

  function completedRowsForDate(dateKey) {
    return asArray(state.data.days?.[dateKey]?.completed).map((text) => ({ text }));
  }

  function allCompletedRows() {
    const rows = [];
    Object.keys(state.data.days).sort().reverse().forEach((dateKey) => {
      asArray(state.data.days[dateKey].completed).forEach((text) => rows.push({ time: dateKey, text }));
    });
    return rows;
  }

  function versionLogRows(dateKey = "") {
    return asArray(state.data.versionLog)
      .filter((entry) => !dateKey || logDate(entry) === dateKey)
      .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")))
      .map((entry) => ({ time: entry.at || "", text: logText(entry) }));
  }

  function renderNotes() {
    noteInput.value = state.data.noteText || "";
  }

  function render() {
    dateLabel.textContent = navDate();
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.view));
    notePanel.classList.toggle("hidden", state.view !== "notes");
    content.classList.toggle("hidden", state.view === "notes");
    commandBar.classList.toggle("hidden", state.view !== "todos");
    localStorage.setItem(VIEW_KEY, state.view);
    if (state.view === "todos") renderTodos();
    if (state.view === "reminders") renderReminders();
    if (state.view === "history") renderHistory();
    if (state.view === "notes") renderNotes();
  }

  function addToday(text) {
    text = text.trim();
    if (!text) return;
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
    addTodoOnDate(dateWithOffset(offset), text);
  }

  function addTodoOnDate(dateKey, text) {
    text = text.trim();
    if (!text) return;
    const current = day(dateKey);
    if (current.pending.includes(text) || current.completed.includes(text)) {
      setStatus("已经有这条待办了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    current.pending.push(text);
    if (dateKey !== todayKey()) logUpdate("增加", `${shortDate(dateKey)} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addDailyReminder(time, text) {
    text = text.trim();
    if (!text) return;
    const exists = state.data.dailyReminders.some((item) => item.text === text && reminderTimes(item).includes(time));
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.dailyReminders.push({ times: [time], text });
    logUpdate("增加", `${time} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addDailyImportant(text, startDate = dateWithOffset(1)) {
    text = text.trim();
    if (!text) return;
    const exists = state.data.dailyImportantReminders.some((item) => item.text === text && (!item.startDate || item.startDate <= startDate));
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.dailyImportantReminders.push({ startDate, text });
    logUpdate("增加", `每天 ${text}`);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addOneTimeReminder(dateKey, time, text) {
    text = text.trim();
    if (!text) return;
    const at = `${dateKey} ${time}`;
    const exists = state.data.oneTimeReminders.some((item) => item.at === at && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.oneTimeReminders.push({ at, text });
    logUpdate("增加", `${shortDate(dateKey)} ${time} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addWeeklyReminder(dayText, time, text) {
    text = text.trim();
    if (!text) return;
    const day = weekName(dayText);
    const exists = state.data.weeklyReminders.some((item) => asArray(item.days).includes(day) && item.time === time && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.weeklyReminders.push({ days: [day], time, text });
    logUpdate("增加", `${dayName(day)} ${time} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function addMonthlyReminder(dayNumber, text) {
    text = text.trim();
    if (!text) return;
    const exists = state.data.monthlyReminders.some((item) => Number(item.day) === Number(dayNumber) && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ");
      return;
    }
    state.data.monthlyReminders.push({ day: Number(dayNumber), text });
    logUpdate("增加", `每月${Number(dayNumber)}号 ${text}`);
    scheduleSave();
    setStatus("已成功记录 (๑•̀ㅂ•́)و✧");
  }

  function weekName(text) {
    return {
      一: "Monday",
      二: "Tuesday",
      三: "Wednesday",
      四: "Thursday",
      五: "Friday",
      六: "Saturday",
      日: "Sunday",
      天: "Sunday"
    }[text] || text;
  }

  function normalizeDateText(text) {
    const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) return text;
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }

  function completeRow(row) {
    const current = day();
    if (row.group === "overdue") {
      const [dateKey, text] = row.key.split("|");
      const old = day(dateKey);
      old.pending = old.pending.filter((item) => item !== text);
      old.hidden.push(text);
      current.completed.push(`补完成：${text}（原 ${dateKey}）`);
    } else if (row.group === "overdueSingle" || row.group === "single") {
      removeSingleReminder(row);
      current.completed.push(`${row.time ? `${row.time}  ` : ""}${row.text}`.trim());
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

  function removeSingleReminder(row, shouldLog = false) {
    if (row.source === "once") {
      const [at, text] = row.key.split("|");
      state.data.oneTimeReminders = state.data.oneTimeReminders.filter((item) => !(item.at === at && item.text === text));
      if (shouldLog) {
        const [date, time = ""] = at.split(" ");
        logUpdate("删除", `${shortDate(date)} ${time} ${text}`.trim());
      }
    }
    if (row.source === "dateImportant") {
      const [date, text] = row.key.split("|");
      state.data.dateImportantReminders = state.data.dateImportantReminders.filter((item) => !(item.date === date && item.text === text));
      if (shouldLog) logUpdate("删除", `${shortDate(date)} ${text}`);
    }
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
    let text = target.text || target.key;
    if (target.group === "overdue") {
      const [dateKey, oldText] = target.key.split("|");
      const old = day(dateKey);
      old.pending = old.pending.filter((item) => item !== oldText);
      old.hidden.push(oldText);
      text = oldText;
    } else if (target.group === "overdueSingle" || target.group === "single") {
      removeSingleReminder(target);
      text = `${target.time ? `${target.time}  ` : ""}${target.text}`.trim();
    } else if (target.group === "reminder") {
      text = `${target.time ? `${target.time}  ` : ""}${target.text}`.trim();
    } else {
      current.pending = current.pending.filter((item) => item !== target.key);
    }
    if (!current.inProgress.includes(text)) current.inProgress.push(text);
    scheduleSave();
    setStatus("已标记进行中 (｡･ω･｡)ﾉ");
    render();
  }

  function deleteByQuery(query) {
    query = query.trim();
    if (!query) return;
    let removed = 0;

    const visible = /^\d+$/.test(query) ? todoRows().find((row) => row.index === Number(query)) : null;
    if (visible) {
      removed += deleteVisibleRow(visible);
    } else {
      const currentDate = todayKey();
      Object.keys(state.data.days).forEach((dateKey) => {
        if (dateKey < currentDate) return;
        const current = day(dateKey);
        ["pending", "inProgress", "hidden"].forEach((field) => {
          const kept = [];
          current[field].forEach((item) => {
            if (item.includes(query)) {
              removed += 1;
              if (dateKey !== currentDate) logUpdate("删除", `${shortDate(dateKey)} ${item}`);
            } else {
              kept.push(item);
            }
          });
          current[field] = kept;
        });
      });

      removed += removeFromArray("dailyImportantReminders", (item) => item.text && item.text.includes(query), reminderLogText);
      removed += removeFromArray("dailyReminders", (item) => item.text && item.text.includes(query), reminderLogText);
      removed += removeFromArray("weeklyReminders", (item) => item.text && item.text.includes(query), reminderLogText);
      removed += removeFromArray("monthlyReminders", (item) => item.text && item.text.includes(query), reminderLogText);
      removed += removeFromArray("oneTimeReminders", (item) => item.text && item.text.includes(query), reminderLogText);
      removed += removeFromArray("dateImportantReminders", (item) => item.text && item.text.includes(query), reminderLogText);
    }

    if (!removed) {
      setStatus("没找到可删除的内容 (｡•́︿•̀｡)", false);
      return;
    }
    scheduleSave();
    setStatus("已删除记录 (｡･ω･｡)ﾉ");
    render();
  }

  function deleteVisibleRow(row) {
    const current = day();
    if (row.group === "overdue") {
      const [dateKey, text] = row.key.split("|");
      const old = day(dateKey);
      const before = old.pending.length;
      old.pending = old.pending.filter((item) => item !== text);
      old.hidden.push(text);
      return before - old.pending.length;
    }
    if (row.group === "overdueSingle" || row.group === "single") {
      removeSingleReminder(row, true);
      return 1;
    }
    if (row.group === "reminder") {
      return removeDailyReminder(row);
    }
    const before = current.pending.length + current.inProgress.length;
    current.pending = current.pending.filter((item) => item !== row.key);
    current.inProgress = current.inProgress.filter((item) => item !== row.key);
    return before - current.pending.length - current.inProgress.length;
  }

  function removeDailyReminder(row) {
    let removed = 0;
    if (!row.time) {
      removed += removeFromArray("dailyImportantReminders", (item) => item.text === row.text, reminderLogText);
    } else {
      const before = state.data.dailyReminders.length;
      const kept = [];
      state.data.dailyReminders.forEach((item) => {
        if (item.text === row.text && reminderTimes(item).includes(row.time)) {
          logUpdate("删除", reminderLogText(item));
        } else {
          kept.push(item);
        }
      });
      state.data.dailyReminders = kept;
      removed += before - state.data.dailyReminders.length;
    }
    return removed;
  }

  function removeFromArray(field, predicate, logFormatter = null) {
    const before = state.data[field].length;
    const kept = [];
    state.data[field].forEach((item) => {
      if (predicate(item)) {
        if (logFormatter) logUpdate("删除", logFormatter(item));
      } else {
        kept.push(item);
      }
    });
    state.data[field] = kept;
    return before - state.data[field].length;
  }

  function parseCommand(raw) {
    const text = raw.trim();
    if (!text) return;
    let match = text.match(/^删除\s*(.+)$/) || text.match(/^(.+?)\s*删除$/);
    if (match) return deleteByQuery(match[1].trim());
    match = text.match(/^完成\s*(.+)$/) || text.match(/^(.+?)(?:完成|好了|完事了|ok)$/i);
    if (match) return completeByQuery(match[1].trim());
    match = text.match(/^(.+?)ing$/i);
    if (match) return startByQuery(match[1].trim());

    match = text.match(/^每周\s*([一二三四五六日天])\s*(\d{1,2})[:：；点]\s*(\d{0,2})\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addWeeklyReminder(match[1], normalizeTime(match[2], match[3] || "00"), match[4]);
    match = text.match(/^(每天|每日)\s*(\d{1,2})[:：；点]\s*(\d{0,2})\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addDailyReminder(normalizeTime(match[2], match[3] || "00"), match[4].trim());
    match = text.match(/^每月\s*(\d{1,2})\s*(?:号|日)?\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addMonthlyReminder(match[1], match[2].trim());

    match = text.match(/^(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+(\d{1,2})[:：；点]\s*(\d{0,2})\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addOneTimeReminder(normalizeDateText(match[1]), normalizeTime(match[2], match[3] || "00"), match[4]);
    match = text.match(/^(明天|后天|大后天)\s*(\d{1,2})[:：；点]\s*(\d{0,2})\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addOneTimeReminder(dateWithOffset({ 明天: 1, 后天: 2, 大后天: 3 }[match[1]]), normalizeTime(match[2], match[3] || "00"), match[4]);
    match = text.match(/^(每天|每日)\s*(?:提醒我|提醒)?\s*(.+)$/);
    if (match) return addDailyImportant(match[2].trim());

    match = text.match(/^提醒我\s*(明天|后天|大后天)\s*(.+)$/);
    if (match) return addDatedTodo({ 明天: 1, 后天: 2, 大后天: 3 }[match[1]], match[2].trim());
    match = text.match(/^(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+(.+)$/);
    if (match) return addTodoOnDate(normalizeDateText(match[1]), match[2].trim());
    match = text.match(/^(明天|后天|大后天)\s*(.+)$/);
    if (match) return addDatedTodo({ 明天: 1, 后天: 2, 大后天: 3 }[match[1]], match[2].trim());
    match = text.match(/^加入\s*(.+)$/);
    if (match) return addToday(match[1].trim());
    return addToday(text);
  }

  async function signIn() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    setAuthBusy(true);
    setStatus("正在登录...");
    try {
      const { error } = await state.supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus(`登录失败：${error.message}`, false);
        return;
      }
      await loadUser();
    } catch (error) {
      setStatus(`登录失败：${error.message}`, false);
    } finally {
      setAuthBusy(false);
    }
  }

  async function signUp() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    setAuthBusy(true);
    setStatus("正在注册...");
    try {
      const { error } = await state.supabase.auth.signUp({ email, password });
      if (error) {
        setStatus(`注册失败：${error.message}`, false);
        return;
      }
      setStatus("注册成功。若 Supabase 开了邮件确认，请先去邮箱确认。");
      await loadUser();
    } catch (error) {
      setStatus(`注册失败：${error.message}`, false);
    } finally {
      setAuthBusy(false);
    }
  }

  function setAuthBusy(isBusy) {
    signInButton.disabled = isBusy;
    signUpButton.disabled = isBusy;
    signInButton.textContent = isBusy ? "处理中" : "登录";
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
    if (action === "historyToday") {
      state.historyDate = todayKey();
      localStorage.setItem(HISTORY_DATE_KEY, state.historyDate);
      render();
    }
    if (action === "historyAll") {
      state.historyDate = "";
      localStorage.setItem(HISTORY_DATE_KEY, state.historyDate);
      render();
    }
  });

  content.addEventListener("change", (event) => {
    if (event.target.dataset.action !== "historyDate") return;
    state.historyDate = event.target.value || "";
    localStorage.setItem(HISTORY_DATE_KEY, state.historyDate);
    render();
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
    state.supabase.auth.onAuthStateChange(() => {
      loadUser().catch((error) => {
        setStatus(`初始化失败：${error.message}`, false);
        showAuth();
      });
    });
    loadUser().catch((error) => {
      setStatus(`初始化失败：${error.message}`, false);
      showAuth();
    });
  }
})();
