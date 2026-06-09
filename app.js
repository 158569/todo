(function () {
  const CONFIG = window.TODO_SUPABASE_CONFIG || {};
  const VIEW_KEY = "todoCloudView";
  const LOCAL_DATA_KEY = "todoCloudLocalData";
  const LAST_EMAIL_KEY = "todoCloudLastEmail";
  const HISTORY_DATE_KEY = "todoCloudHistoryDate";
  const DIARY_DATE_KEY = "todoCloudDiaryDate";
  const NOTE_ID_KEY = "todoCloudActiveNoteId";
  const NOTE_LIST_COLLAPSED_KEY = "todoCloudNoteListCollapsed";
  const WELCOME_DATE_KEY = "todoCloudWelcomeDate";
  const PWA_WINDOW_SIZE_KEY = "todoCloudPwaWindowSize";
  const DEFAULT_WELCOME_TITLE = "美好的一天开始啦 (｡･ᴗ･｡)";
  const DEFAULT_WELCOME_TEXT = "今天也从todo开始";
  const OLD_WELCOME_TITLE = "待办提醒 顽张って！";
  const OLD_WELCOME_TEXT = "今天也从待办开始。";
  const PLACEHOLDER = "写点什么吧 ( ・・)✎__";
  const DEFAULT_LEDGER_CATEGORIES = ["吃饭", "购物", "交通", "办公", "工资", "报销", "其他"];
  const DEFAULT_SETTINGS = {
    bgColor: "#fffefa",
    topColor: "#fff7ef",
    accentColor: "#62a68e",
    markColor: "#fff1c6",
    welcomeEnabled: true,
    welcomeTitle: DEFAULT_WELCOME_TITLE,
    welcomeText: DEFAULT_WELCOME_TEXT,
    notificationsEnabled: true,
    language: "zh",
    showNotes: true,
    showDiary: true,
    showLedger: true,
    ledgerLastCategory: "",
    diaryPinEnabled: false,
    diaryPin: ""
  };
  const TEXT = {
    zh: {
      appTitle: "memo",
      authHint: "不登录也能本地使用；登录后可在电脑和手机之间同步。",
      email: "邮箱",
      password: "密码",
      passwordPlaceholder: "至少 6 位",
      login: "登录",
      register: "注册",
      localUse: "先本地使用",
      tabTodos: "待办",
      tabReminders: "提醒",
      tabNotes: "便签",
      tabDiary: "日记",
      tabLedger: "记账",
      tabHistory: "历史",
      tabSettings: "设置",
      export: "导出",
      import: "导入",
      signOut: "退出",
      sync: "同步",
      fullScreen: "全屏",
      exitFullScreen: "还原",
      fullScreenUnsupported: "当前浏览器不支持网页内全屏。",
      synced: "已同步",
      localMode: "本地模式：未登录",
      placeholder: PLACEHOLDER,
      noteMeta: "便签每 3 秒自动保存",
      notePlaceholder: "写点什么吧 ( ・・)✎__",
      noteTitlePlaceholder: "便签标题",
      noteDefaultTitle: "便签",
      noteAdd: "新建便签",
      noteDelete: "删除",
      noteDeleted: "便签已删除 (｡･ω･)ﾉﾞ",
      noteCleared: "便签已清空 (｡･ω･)ﾉﾞ",
      noteCollapse: "收起",
      noteExpand: "展开便签列表",
      diaryMeta: "日记每 3 秒自动保存",
      diaryPlaceholder: "今天想记录点什么 ( ・・)✎__",
      enterTodos: "进入待办",
      alarmBadge: "到点了",
      alarmTitle: "待办提醒",
      alarmDone: "今日完成",
      alarmClose: "知道了",
      overdueTitle: "过期待办：",
      inProgressTitle: "进行中：",
      todosTitle: "今日待办：",
      completedTitle: "已完成：",
      collapse: "▼ 点击收起",
      expand: "▶ 点击展开",
      none: "暂无",
      noOverdue: "没有过期待办哦 (｡•ᴗ•｡)",
      complete: "完成",
      completeIcon: "完",
      delete: "删除",
      futureTodos: "未来待办：",
      dailyReminders: "每日提醒：",
      weeklyReminders: "每周提醒：",
      monthlyReminders: "每月提醒：",
      date: "日期",
      today: "今天",
      all: "全部",
      completedAll: "已完成：全部",
      updateAll: "更新记录：全部",
      noCompleted: "暂无已完成",
      noUpdate: "暂无更新记录",
      income: "收入",
      expense: "支出",
      balance: "结余",
      amount: "金额",
      note: "备注",
      addLedger: "记一笔 (๑•̀᎑<๑)و",
      ledgerRecords: "记录：",
      noLedger: "暂无记账",
      periodDay: "日",
      periodWeek: "周",
      periodMonth: "月",
      periodYear: "年",
      ledgerDate: "选择日期",
      uiLanguage: "语言",
      languageZh: "中文",
      languageJa: "日本語",
      languageEn: "English",
      colorSection: "界面颜色：",
      resetSettings: "恢复默认设置",
      welcomeSection: "欢迎界面：",
      welcomeEnabled: "每天首次打开显示欢迎界面",
      welcomeTitle: "欢迎标题",
      welcomeText: "欢迎内容",
      alarmSection: "提醒弹窗：",
      notifyUnsupported: "当前浏览器不支持系统通知",
      notifyAllowed: "系统通知已允许",
      notifyDenied: "系统通知已被浏览器阻止",
      notifyEnable: "点击开启系统通知",
      notifyNote: "网页 App 打开时，到点会弹出站内强提醒；允许系统通知后，会额外发系统通知。App 完全关闭或被系统冻结时，网页不能保证后台常驻。",
      bgColor: "背景色",
      topColor: "顶部色",
      accentColor: "强调色",
      markColor: "标题底色",
      settingsResetDone: "默认设置已恢复 (｡•̀ᴗ-)و",
      tutorialSection: "使用说明：",
      openTutorial: "打开使用说明",
      helpTitle: "待办使用说明",
      helpClose: "知道了",
      reminderInputPlaceholder: "写提醒，例如：每天17:00提醒我xx",
      editPlaceholder: "修改内容",
      editDone: "已修改待办 (｡•̀ᴗ-)و",
      editDuplicate: "已经有这条了，不能改成重复内容。",
      category: "分类",
      noCategory: "不分类",
      addCategory: "添加分类",
      newCategoryPlaceholder: "新增分类",
      categoryAdded: "分类已添加 (｡•̀ᴗ-)و",
      categoryExists: "已经有这个分类了。",
      categoryDeleted: "分类已删除。",
      categoryInUse: "这个分类已经有记录，先保留。",
      ledgerEmptyCategory: "分类不能为空。",
      dailyPopupSection: "每日弹窗：",
      dailyPopupEnabled: "每天首次打开显示自定义弹窗",
      featureSection: "功能显示：",
      showNotes: "显示便签",
      showDiary: "显示日记",
      showLedger: "显示记账",
      diaryLockSection: "日记密码：",
      diaryPinEnabled: "开启四位数字密码",
      diaryPin: "四位数字密码",
      diaryPinPlaceholder: "",
      diaryOldPinPrompt: "修改或关闭日记密码前，请先输入原密码。",
      diaryPinRequired: "请输入 4 位数字密码。",
      diaryPinUpdated: "日记密码已更新 (｡•̀ᴗ-)و",
      diaryPinDisabled: "日记密码已关闭。",
      localMerged: "已合并本地旧数据并同步到当前账号。",
      diaryLockedTitle: "日记已锁定",
      diaryLockedHint: "请输入四位数字密码。",
      unlock: "解锁",
      wrongPin: "密码不对 (｡>﹏<｡)",
      timerNone: "中途提醒：无",
      timer1h: "中途提醒：1小时",
      timer2h: "中途提醒：2小时",
      timer4h: "中途提醒：4小时",
      timer8h: "中途提醒：8小时",
      halfway: "中段",
      timerAlarmPrefix: "中途提醒",
      timerSet: "已添加待办，并设置中段提醒 (๑•̀᎑<๑)و"
    },
    ja: {
      appTitle: "memo",
      authHint: "ログインしなくてもローカルで使えます。ログインするとPCとスマホで同期できます。",
      email: "メール",
      password: "パスワード",
      passwordPlaceholder: "6文字以上",
      login: "ログイン",
      register: "登録",
      localUse: "まずはローカルで使う",
      tabTodos: "ToDo",
      tabReminders: "リマインダー",
      tabNotes: "メモ",
      tabDiary: "日記",
      tabLedger: "記帳",
      tabHistory: "履歴",
      tabSettings: "設定",
      export: "書き出し",
      import: "読み込み",
      signOut: "ログアウト",
      sync: "同期",
      fullScreen: "全画面",
      exitFullScreen: "戻す",
      fullScreenUnsupported: "このブラウザは全画面表示に対応していません。",
      synced: "同期済み",
      localMode: "ローカル：未ログイン",
      placeholder: "書いてみる ( ・・)✎__",
      noteMeta: "メモは3秒ごとに自動保存",
      notePlaceholder: "メモを書いてみる ( ・・)✎__",
      noteTitlePlaceholder: "メモのタイトル",
      noteDefaultTitle: "メモ",
      noteAdd: "メモを追加",
      noteDelete: "削除",
      noteDeleted: "メモを削除しました (｡･ω･)ﾉﾞ",
      noteCleared: "メモを空にしました (｡･ω･)ﾉﾞ",
      noteCollapse: "閉じる",
      noteExpand: "メモ一覧を開く",
      diaryMeta: "日記は3秒ごとに自動保存",
      diaryPlaceholder: "今日のことを書いてね ( ・・)✎__",
      enterTodos: "始める",
      alarmBadge: "時間です",
      alarmTitle: "memoリマインダー",
      alarmDone: "今日完了にする",
      alarmClose: "OK",
      overdueTitle: "期限切れ：",
      inProgressTitle: "進行中：",
      todosTitle: "今日のToDo：",
      completedTitle: "完了：",
      collapse: "▼ 閉じる",
      expand: "▶ 開く",
      none: "なし",
      noOverdue: "期限切れはありません (｡•ᴗ•｡)",
      complete: "完了",
      completeIcon: "済",
      delete: "削除",
      futureTodos: "これからのToDo：",
      dailyReminders: "毎日のリマインダー：",
      weeklyReminders: "毎週のリマインダー：",
      monthlyReminders: "毎月のリマインダー：",
      date: "日付",
      today: "今日",
      all: "全部",
      completedAll: "完了：すべて",
      updateAll: "更新履歴：すべて",
      noCompleted: "完了した項目はありません",
      noUpdate: "更新履歴はありません",
      income: "収入",
      expense: "支出",
      balance: "残高",
      amount: "金額",
      note: "備考",
      addLedger: "記録する (๑•̀᎑<๑)و",
      ledgerRecords: "記録：",
      noLedger: "記録なし",
      periodDay: "日",
      periodWeek: "週",
      periodMonth: "月",
      periodYear: "年",
      ledgerDate: "日付を選択",
      uiLanguage: "表示言語",
      languageZh: "中文",
      languageJa: "日本語",
      languageEn: "English",
      colorSection: "画面カラー：",
      resetSettings: "初期設定に戻す",
      welcomeSection: "ウェルカム画面：",
      welcomeEnabled: "毎日初回だけ表示",
      welcomeTitle: "タイトル",
      welcomeText: "本文",
      alarmSection: "リマインダー通知：",
      notifyUnsupported: "このブラウザは通知に対応していません",
      notifyAllowed: "通知は許可済み",
      notifyDenied: "通知はブラウザでブロックされています",
      notifyEnable: "通知を有効にする",
      notifyNote: "Web Appを開いている間は、時間になると画面内に強めのポップアップを表示します。システム通知を許可すると、ブラウザ通知も届きます。アプリを完全に閉じた場合やOSに停止された場合、Web Appでは常駐を保証できません。",
      bgColor: "背景色",
      topColor: "上部色",
      accentColor: "強調色",
      markColor: "見出し色",
      settingsResetDone: "初期設定に戻しました (｡•̀ᴗ-)و",
      tutorialSection: "使い方：",
      openTutorial: "使い方を開く",
      helpTitle: "ToDoの使い方",
      helpClose: "OK",
      reminderInputPlaceholder: "リマインダーを書く：毎日17:00にxx",
      editPlaceholder: "内容を編集",
      editDone: "ToDoを編集しました (｡•̀ᴗ-)و",
      editDuplicate: "同じ内容がすでにあります。",
      category: "カテゴリ",
      noCategory: "カテゴリなし",
      addCategory: "追加",
      newCategoryPlaceholder: "新しいカテゴリ",
      categoryAdded: "カテゴリを追加しました (｡•̀ᴗ-)و",
      categoryExists: "このカテゴリはすでにあります。",
      categoryDeleted: "カテゴリを削除しました。",
      categoryInUse: "このカテゴリには記録があります。",
      ledgerEmptyCategory: "カテゴリを入力してください。",
      dailyPopupSection: "毎日のポップアップ：",
      dailyPopupEnabled: "毎日初回だけカスタム表示",
      featureSection: "表示する機能：",
      showNotes: "メモを表示",
      showDiary: "日記を表示",
      showLedger: "記帳を表示",
      diaryLockSection: "日記ロック：",
      diaryPinEnabled: "4桁パスコードを有効にする",
      diaryPin: "新しい4桁パスコード",
      diaryPinPlaceholder: "",
      diaryOldPinPrompt: "日記パスコードを変更または無効化する前に、現在のパスコードを入力してください。",
      diaryPinRequired: "4桁の数字を入力してください。",
      diaryPinUpdated: "日記パスコードを更新しました (｡•̀ᴗ-)و",
      diaryPinDisabled: "日記パスコードを無効にしました。",
      localMerged: "ローカルの旧データを統合して同期しました。",
      diaryLockedTitle: "日記はロックされています",
      diaryLockedHint: "4桁のパスコードを入力してください。",
      unlock: "ロック解除",
      wrongPin: "パスコードが違います (｡>﹏<｡)",
      timerNone: "途中リマインダー：なし",
      timer1h: "途中リマインダー：1時間",
      timer2h: "途中リマインダー：2時間",
      timer4h: "途中リマインダー：4時間",
      timer8h: "途中リマインダー：8時間",
      halfway: "中間",
      timerAlarmPrefix: "途中リマインダー",
      timerSet: "ToDoを追加し、中間リマインダーを設定しました (๑•̀᎑<๑)و"
    },
    en: {
      appTitle: "memo",
      authHint: "Use it locally without signing in. Sign in to sync between desktop and mobile.",
      email: "Email",
      password: "Password",
      passwordPlaceholder: "At least 6 characters",
      login: "Sign in",
      register: "Sign up",
      localUse: "Use locally",
      tabTodos: "Todo",
      tabReminders: "Alerts",
      tabNotes: "Notes",
      tabDiary: "Diary",
      tabLedger: "Ledger",
      tabHistory: "History",
      tabSettings: "Settings",
      export: "Export",
      import: "Import",
      signOut: "Sign out",
      sync: "Sync",
      fullScreen: "Full",
      exitFullScreen: "Restore",
      fullScreenUnsupported: "This browser does not support in-app fullscreen.",
      synced: "Synced",
      localMode: "Local mode: not signed in",
      placeholder: "Write something ( ・・)✎__",
      noteMeta: "Notes auto-save every 3 seconds",
      notePlaceholder: "Write a note ( ・・)✎__",
      noteTitlePlaceholder: "Note title",
      noteDefaultTitle: "Note",
      noteAdd: "New note",
      noteDelete: "Delete",
      noteDeleted: "Note deleted (｡･ω･)ﾉﾞ",
      noteCleared: "Note cleared (｡･ω･)ﾉﾞ",
      noteCollapse: "Collapse",
      noteExpand: "Open note list",
      diaryMeta: "Diary auto-saves every 3 seconds",
      diaryPlaceholder: "Write today's diary ( ・・)✎__",
      enterTodos: "Enter todo",
      alarmBadge: "Due now",
      alarmTitle: "Todo reminder",
      alarmDone: "Done today",
      alarmClose: "OK",
      overdueTitle: "Overdue:",
      inProgressTitle: "In progress:",
      todosTitle: "Today:",
      completedTitle: "Done:",
      collapse: "▼ Collapse",
      expand: "▶ Expand",
      none: "None",
      noOverdue: "No overdue todos (｡•ᴗ•｡)",
      complete: "Done",
      completeIcon: "Done",
      delete: "Delete",
      futureTodos: "Future todos:",
      dailyReminders: "Daily reminders:",
      weeklyReminders: "Weekly reminders:",
      monthlyReminders: "Monthly reminders:",
      date: "Date",
      today: "Today",
      all: "All",
      completedAll: "Done: all",
      updateAll: "Update log: all",
      noCompleted: "No completed items",
      noUpdate: "No updates",
      income: "Income",
      expense: "Expense",
      balance: "Balance",
      amount: "Amount",
      note: "Note",
      addLedger: "Add entry (๑•̀᎑<๑)و",
      ledgerRecords: "Records:",
      noLedger: "No ledger entries",
      periodDay: "Day",
      periodWeek: "Week",
      periodMonth: "Month",
      periodYear: "Year",
      ledgerDate: "Pick date",
      uiLanguage: "Language",
      languageZh: "中文",
      languageJa: "日本語",
      languageEn: "English",
      colorSection: "Colors:",
      resetSettings: "Restore defaults",
      welcomeSection: "Welcome:",
      welcomeEnabled: "Show welcome once per day",
      welcomeTitle: "Welcome title",
      welcomeText: "Welcome text",
      alarmSection: "Reminder popups:",
      notifyUnsupported: "This browser does not support notifications",
      notifyAllowed: "System notifications allowed",
      notifyDenied: "System notifications blocked by browser",
      notifyEnable: "Enable notifications",
      notifyNote: "When the Web App is open, due reminders show an in-app popup. If system notifications are allowed, it also sends a browser notification. If the app is fully closed or frozen by the OS, a web app cannot guarantee background running.",
      bgColor: "Background",
      topColor: "Top bar",
      accentColor: "Accent",
      markColor: "Highlight",
      settingsResetDone: "Default settings restored (｡•̀ᴗ-)و",
      tutorialSection: "Guide:",
      openTutorial: "Open guide",
      helpTitle: "Todo guide",
      helpClose: "Got it",
      reminderInputPlaceholder: "Write a reminder: daily 17:00 xx",
      editPlaceholder: "Edit text",
      editDone: "Todo updated (｡•̀ᴗ-)و",
      editDuplicate: "That item already exists.",
      category: "Category",
      noCategory: "No category",
      addCategory: "Add category",
      newCategoryPlaceholder: "New category",
      categoryAdded: "Category added (｡•̀ᴗ-)و",
      categoryExists: "This category already exists.",
      categoryDeleted: "Category deleted.",
      categoryInUse: "This category has records, keeping it.",
      ledgerEmptyCategory: "Category cannot be empty.",
      dailyPopupSection: "Daily popup:",
      dailyPopupEnabled: "Show custom popup once per day",
      featureSection: "Feature visibility:",
      showNotes: "Show notes",
      showDiary: "Show diary",
      showLedger: "Show ledger",
      diaryLockSection: "Diary PIN:",
      diaryPinEnabled: "Enable 4-digit PIN",
      diaryPin: "New 4-digit PIN",
      diaryPinPlaceholder: "",
      diaryOldPinPrompt: "Enter the current diary PIN before changing or disabling it.",
      diaryPinRequired: "Enter a 4-digit PIN.",
      diaryPinUpdated: "Diary PIN updated (｡•̀ᴗ-)و",
      diaryPinDisabled: "Diary PIN disabled.",
      localMerged: "Merged local old data and synced it to this account.",
      diaryLockedTitle: "Diary locked",
      diaryLockedHint: "Enter the 4-digit PIN.",
      unlock: "Unlock",
      wrongPin: "Wrong PIN (｡>﹏<｡)",
      timerNone: "Midpoint reminder: off",
      timer1h: "Midpoint reminder: 1h",
      timer2h: "Midpoint reminder: 2h",
      timer4h: "Midpoint reminder: 4h",
      timer8h: "Midpoint reminder: 8h",
      halfway: "Midpoint",
      timerAlarmPrefix: "Midpoint reminder",
      timerSet: "Todo added with midpoint reminder (๑•̀᎑<๑)و"
    }
  };

  const state = {
    supabase: null,
    user: null,
    data: null,
    localReady: false,
    view: "todos",
    historyDate: localStorage.getItem(HISTORY_DATE_KEY) || todayKey(),
    diaryDate: localStorage.getItem(DIARY_DATE_KEY) || todayKey(),
    activeNoteId: localStorage.getItem(NOTE_ID_KEY) || "",
    noteListCollapsed: localStorage.getItem(NOTE_LIST_COLLAPSED_KEY) === "1",
    ledgerPeriod: "day",
    ledgerAnchorDate: todayKey(),
    ledgerCategory: null,
    categorySwipe: null,
    ledgerSwipe: null,
    ignoreCategoryClick: false,
    showCompleted: true,
    alarmTimer: null,
    activeAlarm: null,
    firedAlarmKeys: new Set(),
    diaryUnlocked: false,
    statusTimer: null,
    noteTimer: null,
    diaryTimer: null,
    windowSizeTimer: null,
    saveTimer: null
  };

  const $ = (selector) => document.querySelector(selector);
  const authPanel = $("#authPanel");
  const appPanel = $("#appPanel");
  const emailInput = $("#emailInput");
  const passwordInput = $("#passwordInput");
  const signInButton = $("#signInButton");
  const signUpButton = $("#signUpButton");
  const localUseButton = $("#localUseButton");
  const fullscreenButton = $("#fullscreenButton");
  const signOutButton = $("#signOutButton");
  const userLabel = $("#userLabel");
  const content = $("#content");
  const notePanel = $("#notePanel");
  const noteTitleInput = $("#noteTitleInput");
  const noteInput = $("#noteInput");
  const noteSidebar = $("#noteSidebar");
  const noteList = $("#noteList");
  const noteAddButton = $("#noteAddButton");
  const noteDeleteButton = $("#noteDeleteButton");
  const noteToggleButton = $("#noteToggleButton");
  const noteExpandButton = $("#noteExpandButton");
  const diaryPanel = $("#diaryPanel");
  const diaryInput = $("#diaryInput");
  const diaryDateInput = $("#diaryDateInput");
  const commandBar = $("#commandBar");
  const commandForm = $("#commandForm");
  const commandInput = $("#commandInput");
  const commandTimerSelect = $("#commandTimerSelect");
  const statusEl = $("#status");
  const dateLabel = $("#dateLabel");
  const exportButton = $("#exportButton");
  const importInput = $("#importInput");
  const welcomeModal = $("#welcomeModal");
  const welcomeTitle = $("#welcomeTitle");
  const welcomeText = $("#welcomeText");
  const welcomeCloseButton = $("#welcomeCloseButton");
  const alarmModal = $("#alarmModal");
  const alarmText = $("#alarmText");
  const alarmDoneButton = $("#alarmDoneButton");
  const alarmCloseButton = $("#alarmCloseButton");
  const helpModal = $("#helpModal");
  const helpTitle = $("#helpTitle");
  const helpBody = $("#helpBody");
  const helpCloseButton = $("#helpCloseButton");

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
      notes: [],
      diaries: {},
      versionLog: [],
      ledger: [],
      ledgerCategories: [...DEFAULT_LEDGER_CATEGORIES],
      settings: { ...DEFAULT_SETTINGS }
    };
  }

  function defaultNoteTitle(index = 1) {
    return `便签${index}`;
  }

  function normalizeNotes(value, fallbackText = "") {
    let notes = [];
    if (Array.isArray(value)) {
      if (value.some((item) => item && typeof item === "object")) {
        notes = value.map((item, index) => ({
          id: String(item.id || `note-${index + 1}`),
          title: String(item.title || defaultNoteTitle(index + 1)).trim() || defaultNoteTitle(index + 1),
          text: typeof item.text === "string" ? item.text : ""
        }));
      } else {
        const text = value.filter(Boolean).join("\n");
        if (text) notes = [{ id: "note-1", title: defaultNoteTitle(1), text }];
      }
    }
    if (!notes.length) {
      notes = [{ id: "note-1", title: defaultNoteTitle(1), text: fallbackText || "" }];
    }
    const seen = new Set();
    return notes.map((note, index) => {
      let id = note.id || `note-${index + 1}`;
      while (seen.has(id)) id = `${id}-${index + 1}`;
      seen.add(id);
      return {
        id,
        title: note.title || defaultNoteTitle(index + 1),
        text: typeof note.text === "string" ? note.text : ""
      };
    });
  }

  function normalizeData(data) {
    data = data && typeof data === "object" ? data : emptyData();
    data.days = data.days && typeof data.days === "object" ? data.days : {};
    data.dailyImportantReminders = asArray(data.dailyImportantReminders);
    if (Array.isArray(data.dailyTodos)) {
      data.dailyImportantReminders = [
        ...data.dailyImportantReminders,
        ...data.dailyTodos.map((text) => ({ text: String(text || "").trim() })).filter((item) => item.text)
      ];
    }
    data.dailyReminders = asArray(data.dailyReminders);
    data.weeklyReminders = asArray(data.weeklyReminders);
    data.monthlyReminders = asArray(data.monthlyReminders);
    data.oneTimeReminders = asArray(data.oneTimeReminders);
    data.dateImportantReminders = asArray(data.dateImportantReminders);
    data.noteText = typeof data.noteText === "string" ? data.noteText : "";
    data.notes = normalizeNotes(data.notes, data.noteText);
    data.noteText = data.notes[0]?.text || "";
    data.diaries = data.diaries && typeof data.diaries === "object" ? data.diaries : {};
    Object.keys(data.diaries).forEach((dateKey) => {
      data.diaries[dateKey] = typeof data.diaries[dateKey] === "string" ? data.diaries[dateKey] : "";
    });
    data.versionLog = asArray(data.versionLog).filter(Boolean);
    data.ledger = asArray(data.ledger)
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: String(item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        date: normalizeDateText(item.date || todayKey()),
        type: item.type === "income" ? "income" : "expense",
        amount: Number(item.amount || 0),
        category: String(item.category || "").trim(),
        note: String(item.note || "").trim()
      }));
    data.ledgerCategories = Array.isArray(data.ledgerCategories)
      ? uniqueStrings(data.ledgerCategories)
      : [...DEFAULT_LEDGER_CATEGORIES];
    data.settings = { ...DEFAULT_SETTINGS, ...(data.settings && typeof data.settings === "object" ? data.settings : {}) };
    if (data.settings.welcomeTitle === OLD_WELCOME_TITLE) data.settings.welcomeTitle = DEFAULT_WELCOME_TITLE;
    if (data.settings.welcomeText === OLD_WELCOME_TEXT) data.settings.welcomeText = DEFAULT_WELCOME_TEXT;
    if (data.settings.notesPin && !data.settings.diaryPin) data.settings.diaryPin = data.settings.notesPin;
    if (data.settings.notesPinEnabled && data.settings.diaryPinEnabled === DEFAULT_SETTINGS.diaryPinEnabled) data.settings.diaryPinEnabled = true;
    if (!TEXT[data.settings.language]) data.settings.language = DEFAULT_SETTINGS.language;
    data.settings.diaryPin = String(data.settings.diaryPin || "").replace(/\D/g, "").slice(0, 4);
    data.settings.ledgerLastCategory = data.ledgerCategories.includes(data.settings.ledgerLastCategory) ? data.settings.ledgerLastCategory : "";
    Object.keys(data.days).forEach((dateKey) => {
      const current = data.days[dateKey] && typeof data.days[dateKey] === "object" ? data.days[dateKey] : {};
      current.pending = uniqueStrings(current.pending);
      current.inProgress = uniqueStrings(current.inProgress);
      current.completed = uniqueStrings(current.completed);
      current.hidden = uniqueStrings(current.hidden);
      current.timers = current.timers && typeof current.timers === "object" ? current.timers : {};
      Object.keys(current.timers).forEach((text) => {
        const timer = current.timers[text];
        if (!timer || typeof timer !== "object" || !timer.remindAt) delete current.timers[text];
      });
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

  function normalizeLedgerPeriod(value) {
    return ["day", "week", "month", "year"].includes(value) ? value : "day";
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

  function dateFromKey(dateKey) {
    const [year, month, day] = String(dateKey || todayKey()).split("-").map(Number);
    if (!year || !month || !day) return new Date();
    return new Date(year, month - 1, day);
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
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
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${now.getMonth() + 1}/${now.getDate()} ${weekdays[now.getDay()]}`;
  }

  function nowStamp() {
    const now = new Date();
    return `${toDateKey(now)} ${normalizeTime(now.getHours(), now.getMinutes())}`;
  }

  function clockFromIso(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return normalizeTime(date.getHours(), date.getMinutes());
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
    state.data.days[dateKey] ||= { pending: [], inProgress: [], completed: [], hidden: [], timers: {} };
    const current = state.data.days[dateKey];
    current.pending ||= [];
    current.inProgress ||= [];
    current.completed ||= [];
    current.hidden ||= [];
    current.timers ||= {};
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
      loadLocalData();
      showApp();
      setStatus("当前是本地模式。配置 Supabase 后可同步。");
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

  function localData() {
    try {
      return normalizeData(JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || "null"));
    } catch {
      return emptyData();
    }
  }

  function loadLocalData() {
    state.data = localData();
    state.localReady = true;
    return state.data;
  }

  function saveLocalData() {
    if (!state.data) return;
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(state.data));
  }

  function mergeData(primary, secondary) {
    const merged = normalizeData(structuredCloneSafe(primary));
    const extra = normalizeData(structuredCloneSafe(secondary));
    merged.dailyImportantReminders = dedupeBy([...merged.dailyImportantReminders, ...extra.dailyImportantReminders], (item) => item.text && `important|${item.startDate || ""}|${item.text}`);
    merged.dailyReminders = dedupeBy([...merged.dailyReminders, ...extra.dailyReminders], (item) => item.text && `${reminderTimes(item).join(",")}|${item.text}`);
    merged.weeklyReminders = dedupeBy([...merged.weeklyReminders, ...extra.weeklyReminders], (item) => item.text && `${asArray(item.days).join(",")}|${item.time}|${item.text}`);
    merged.monthlyReminders = dedupeBy([...merged.monthlyReminders, ...extra.monthlyReminders], (item) => item.text && `${item.day}|${item.text}`);
    merged.oneTimeReminders = dedupeBy([...merged.oneTimeReminders, ...extra.oneTimeReminders], (item) => item.text && `${item.at}|${item.text}`);
    merged.dateImportantReminders = dedupeBy([...merged.dateImportantReminders, ...extra.dateImportantReminders], (item) => item.text && `${item.date}|${item.text}`);
    merged.versionLog = dedupeBy([...merged.versionLog, ...extra.versionLog], (item) => `${item.at || ""}|${item.action || ""}|${item.text || item}`);
    merged.ledger = dedupeBy([...merged.ledger, ...extra.ledger], (item) => `${item.id || ""}|${item.date || ""}|${item.type || ""}|${item.amount || ""}|${item.note || ""}`);
    merged.ledgerCategories = uniqueStrings([...extra.ledgerCategories, ...merged.ledgerCategories]);
    merged.notes = dedupeBy([...extra.notes, ...merged.notes], (item) => item.id || `${item.title}|${item.text}`);
    merged.noteText = merged.notes[0]?.text || merged.noteText || extra.noteText;
    merged.diaries = { ...extra.diaries, ...merged.diaries };
    merged.settings = { ...DEFAULT_SETTINGS, ...extra.settings, ...merged.settings };

    Object.keys(extra.days).forEach((dateKey) => {
      merged.days[dateKey] ||= { pending: [], inProgress: [], completed: [], hidden: [], timers: {} };
      ["pending", "inProgress", "completed", "hidden"].forEach((field) => {
        merged.days[dateKey][field] = uniqueStrings([...(merged.days[dateKey][field] || []), ...(extra.days[dateKey][field] || [])]);
      });
      merged.days[dateKey].timers = { ...(extra.days[dateKey].timers || {}), ...(merged.days[dateKey].timers || {}) };
    });
    return normalizeData(merged);
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value || emptyData()));
  }

  async function loadUser() {
    const { data, error } = await state.supabase.auth.getUser();
    if (error || !data.user) {
      state.user = null;
      loadLocalData();
      showApp();
      return;
    }
    state.user = data.user;
    await loadCloudData();
    showApp();
  }

  async function loadCloudData() {
    const local = localData();
    const { data, error } = await state.supabase
      .from("todo_documents")
      .select("data")
      .eq("user_id", state.user.id)
      .maybeSingle();

    if (error) throw error;
    state.data = mergeData(data ? data.data : emptyData(), local);
    state.localReady = true;
    await saveNow();
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(saveNow, 350);
  }

  async function saveNow() {
    if (!state.data) return;
    saveLocalData();
    if (!state.user) return;
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
    applyLanguage();
    authPanel.classList.remove("hidden");
    appPanel.classList.add("hidden");
  }

  function showApp() {
    authPanel.classList.add("hidden");
    appPanel.classList.remove("hidden");
    applySettings();
    applyLanguage();
    if (state.user?.email) localStorage.setItem(LAST_EMAIL_KEY, state.user.email);
    render();
    restorePwaWindowSize();
    showWelcomeIfNeeded();
    startAlarmLoop();
  }

  function showWelcomeIfNeeded() {
    const current = settings();
    if (!current.welcomeEnabled) return;
    if (localStorage.getItem(WELCOME_DATE_KEY) === todayKey()) return;
    welcomeTitle.textContent = current.welcomeTitle || DEFAULT_SETTINGS.welcomeTitle;
    welcomeText.textContent = current.welcomeText || DEFAULT_SETTINGS.welcomeText;
    welcomeModal.classList.remove("hidden");
    localStorage.setItem(WELCOME_DATE_KEY, todayKey());
  }

  function startAlarmLoop() {
    clearInterval(state.alarmTimer);
    checkAlarms();
    state.alarmTimer = setInterval(checkAlarms, 30000);
  }

  function checkAlarms() {
    if (!state.data) return;
    dueAlarmRows().forEach((row) => {
      const key = `${todayKey()}|${row.key}`;
      if (state.firedAlarmKeys.has(key)) return;
      state.firedAlarmKeys.add(key);
      showAlarm(row);
    });
  }

  function dueAlarmRows() {
    return [...dailyReminderRows(false), ...oneTimeTodayRows(), ...taskTimerRows()]
      .filter((row) => row.group === "timer" || (row.time && row.sortTime <= nowMinutes()))
      .filter((row) => !day().completed.includes(`今日已完成：${row.time}  ${row.text}`));
  }

  function showAlarm(row) {
    state.activeAlarm = row;
    alarmText.textContent = `${row.time}  ${row.text}`;
    alarmModal.classList.remove("hidden");
    if (row.group === "timer") markTaskTimerFired(row.key);
    sendSystemNotification(row);
  }

  function closeAlarm() {
    alarmModal.classList.add("hidden");
    state.activeAlarm = null;
  }

  function sendSystemNotification(row) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      new Notification("待办提醒", {
        body: `${row.time}  ${row.text}`,
        tag: row.key || `${row.time}-${row.text}`
      });
    } catch {
      // Browser notification support varies by platform.
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setStatus("当前浏览器不支持系统通知。", false);
      return;
    }
    const permission = await Notification.requestPermission();
    settings().notificationsEnabled = permission === "granted";
    scheduleSave();
    setStatus(permission === "granted" ? "系统通知已开启。" : "系统通知未开启。", permission === "granted");
    render();
  }

  function settings() {
    state.data.settings ||= { ...DEFAULT_SETTINGS };
    state.data.settings = { ...DEFAULT_SETTINGS, ...state.data.settings };
    if (state.data.settings.welcomeTitle === OLD_WELCOME_TITLE) state.data.settings.welcomeTitle = DEFAULT_WELCOME_TITLE;
    if (state.data.settings.welcomeText === OLD_WELCOME_TEXT) state.data.settings.welcomeText = DEFAULT_WELCOME_TEXT;
    if (!TEXT[state.data.settings.language]) state.data.settings.language = DEFAULT_SETTINGS.language;
    state.data.settings.diaryPin = String(state.data.settings.diaryPin || "").replace(/\D/g, "").slice(0, 4);
    state.data.settings.ledgerLastCategory = ledgerCategories().includes(state.data.settings.ledgerLastCategory) ? state.data.settings.ledgerLastCategory : "";
    return state.data.settings;
  }

  function language() {
    const code = state.data?.settings?.language || DEFAULT_SETTINGS.language;
    return TEXT[code] ? code : DEFAULT_SETTINGS.language;
  }

  function tx(key) {
    return TEXT[language()]?.[key] || TEXT.zh[key] || key;
  }

  function applyLanguage() {
    const htmlLang = { zh: "zh-CN", ja: "ja", en: "en" }[language()] || "zh-CN";
    document.documentElement.lang = htmlLang;
    document.title = tx("appTitle");
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = tx(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", tx(node.dataset.i18nPlaceholder));
    });
    userLabel.textContent = state.user?.email ? `${tx("synced")}：${state.user.email}` : tx("localMode");
    signOutButton.textContent = state.user ? tx("signOut") : tx("sync");
    updateFullscreenButton();
    updateTimerSelectLabels();
  }

  function isFullscreen() {
    return document.fullscreenElement === appPanel;
  }

  function updateFullscreenButton() {
    if (!fullscreenButton) return;
    fullscreenButton.textContent = isFullscreen() ? tx("exitFullScreen") : tx("fullScreen");
    appPanel.classList.toggle("is-fullscreen", isFullscreen());
  }

  function isStandaloneApp() {
    return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone);
  }

  function windowSizeFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem(PWA_WINDOW_SIZE_KEY) || "null");
      return saved && typeof saved === "object" ? saved : null;
    } catch {
      return null;
    }
  }

  function clampWindowSize(width, height) {
    const maxWidth = window.screen?.availWidth || width || 430;
    const maxHeight = window.screen?.availHeight || height || 720;
    return {
      width: Math.min(Math.max(Math.round(Number(width) || 430), 360), maxWidth),
      height: Math.min(Math.max(Math.round(Number(height) || 720), 520), maxHeight)
    };
  }

  function restorePwaWindowSize() {
    if (!isStandaloneApp() || typeof window.resizeTo !== "function") return;
    const saved = windowSizeFromStorage();
    const size = clampWindowSize(saved?.width || 430, saved?.height || 720);
    if (Math.abs(window.outerWidth - size.width) < 8 && Math.abs(window.outerHeight - size.height) < 8) return;
    setTimeout(() => {
      try {
        window.resizeTo(size.width, size.height);
      } catch {
        // Some browsers block scripted window resize even for installed apps.
      }
    }, 120);
  }

  function savePwaWindowSize() {
    if (!isStandaloneApp() || isFullscreen()) return;
    const size = clampWindowSize(window.outerWidth, window.outerHeight);
    localStorage.setItem(PWA_WINDOW_SIZE_KEY, JSON.stringify(size));
  }

  function schedulePwaWindowSizeSave() {
    if (!isStandaloneApp() || isFullscreen()) return;
    clearTimeout(state.windowSizeTimer);
    state.windowSizeTimer = setTimeout(savePwaWindowSize, 450);
  }

  async function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        await document.exitFullscreen();
      } else if (appPanel.requestFullscreen) {
        await appPanel.requestFullscreen();
      } else {
        setStatus(tx("fullScreenUnsupported"), false);
      }
    } catch (error) {
      setStatus(error.message || tx("fullScreenUnsupported"), false);
    } finally {
      updateFullscreenButton();
    }
  }

  function updateTimerSelectLabels() {
    if (!commandTimerSelect) return;
    const labels = [
      ["0", tx("timerNone")],
      ["60", tx("timer1h")],
      ["120", tx("timer2h")],
      ["240", tx("timer4h")],
      ["480", tx("timer8h")]
    ];
    labels.forEach(([value, label], index) => {
      if (!commandTimerSelect.options[index]) return;
      commandTimerSelect.options[index].value = value;
      commandTimerSelect.options[index].textContent = label;
    });
  }

  function diaryLocked() {
    const current = settings();
    return current.diaryPinEnabled && /^\d{4}$/.test(current.diaryPin || "") && !state.diaryUnlocked;
  }

  function activeDiaryPin() {
    const current = settings();
    return current.diaryPinEnabled && /^\d{4}$/.test(current.diaryPin || "") ? current.diaryPin : "";
  }

  function verifyDiaryPinForChange() {
    const oldPin = activeDiaryPin();
    if (!oldPin) return true;
    const value = window.prompt(tx("diaryOldPinPrompt"));
    if (value === null) return false;
    return String(value || "").replace(/\D/g, "").slice(0, 4) === oldPin;
  }

  function updateDiaryPin(nextPin) {
    const cleanPin = String(nextPin || "").replace(/\D/g, "").slice(0, 4);
    if (!/^\d{4}$/.test(cleanPin)) {
      setStatus(tx("diaryPinRequired"), false);
      render();
      return false;
    }
    if (activeDiaryPin() && cleanPin !== activeDiaryPin() && !verifyDiaryPinForChange()) {
      setStatus(tx("wrongPin"), false);
      render();
      return false;
    }
    settings().diaryPin = cleanPin;
    settings().diaryPinEnabled = true;
    state.diaryUnlocked = false;
    scheduleSave();
    setStatus(tx("diaryPinUpdated"));
    render();
    return true;
  }

  function toggleDiaryPin(enabled) {
    const current = settings();
    if (!enabled && activeDiaryPin()) {
      if (!verifyDiaryPinForChange()) {
        setStatus(tx("wrongPin"), false);
        render();
        return false;
      }
      current.diaryPinEnabled = false;
      current.diaryPin = "";
      state.diaryUnlocked = false;
      scheduleSave();
      setStatus(tx("diaryPinDisabled"));
      render();
      return true;
    }
    current.diaryPinEnabled = Boolean(enabled);
    state.diaryUnlocked = false;
    scheduleSave();
    render();
    return true;
  }

  function viewAvailable(view) {
    const current = settings();
    if (view === "notes") return current.showNotes !== false;
    if (view === "diary") return current.showDiary !== false;
    if (view === "ledger") return current.showLedger !== false;
    return true;
  }

  function ensureViewAvailable() {
    if (!viewAvailable(state.view)) state.view = "todos";
  }

  function applyFeatureVisibility() {
    document.querySelectorAll('.tab[data-view="notes"]').forEach((tab) => tab.classList.toggle("hidden", settings().showNotes === false));
    document.querySelectorAll('.tab[data-view="diary"]').forEach((tab) => tab.classList.toggle("hidden", settings().showDiary === false));
    document.querySelectorAll('.tab[data-view="ledger"]').forEach((tab) => tab.classList.toggle("hidden", settings().showLedger === false));
    if (settings().showDiary === false) state.diaryUnlocked = false;
  }

  function applySettings() {
    if (!state.data) return;
    const current = settings();
    document.documentElement.style.setProperty("--paper", current.bgColor);
    document.documentElement.style.setProperty("--bg", current.topColor);
    document.documentElement.style.setProperty("--accent", current.accentColor);
    document.documentElement.style.setProperty("--mark", current.markColor);
    document.documentElement.style.setProperty("--accent-soft", mixSoft(current.accentColor));
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", current.topColor);
  }

  function mixSoft(color) {
    const hex = String(color || "").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return "#e1f3ee";
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${Math.round((r + 255 * 4) / 5)}, ${Math.round((g + 255 * 4) / 5)}, ${Math.round((b + 255 * 4) / 5)})`;
  }

  function section(title, rows, startIndex = 1, emptyText = tx("none")) {
    const parts = [`<div class="section-title">${escapeHtml(title)}</div>`];
    if (!rows.length) {
      parts.push(`<div class="empty">${escapeHtml(emptyText)}</div>`);
      return parts.join("");
    }
    rows.forEach((row, i) => {
      const index = row.index || startIndex + i;
      const time = row.time ? `<span class="time">${escapeHtml(row.time)}</span> ` : "";
      const action = row.action
        ? `<button class="row-action ${row.action === "complete" ? "complete-action" : ""}" data-action="${row.action}" data-key="${escapeAttr(row.key)}" title="${escapeAttr(row.label || tx("complete"))}" aria-label="${escapeAttr(row.label || tx("complete"))}">${row.action === "complete" ? tx("completeIcon") : row.label || tx("complete")}</button>`
        : "";
      const editAttrs = row.editable ? ` class="row-main editable-row" title="双击修改" data-edit-group="${escapeAttr(row.editGroup)}" data-edit-key="${escapeAttr(row.editKey)}"` : ' class="row-main"';
      parts.push(`<div class="row"><span class="idx">${index}.</span><span${editAttrs}>${time}${escapeHtml(row.text)}</span>${action}</div>`);
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

  function taskTimerRows() {
    const rows = [];
    const now = Date.now();
    Object.keys(state.data.days || {}).forEach((dateKey) => {
      const current = day(dateKey);
      Object.entries(current.timers || {}).forEach(([text, timer]) => {
        const active = current.pending.includes(text) || current.inProgress.includes(text);
        if (!active) {
          delete current.timers[text];
          return;
        }
        const dueAt = Date.parse(timer.remindAt || "");
        if (timer.fired || Number.isNaN(dueAt) || dueAt > now) return;
        const time = clockFromIso(timer.remindAt);
        rows.push({
          group: "timer",
          dateKey,
          taskText: text,
          time,
          text: `${tx("timerAlarmPrefix")}：${text}`,
          key: `timer|${dateKey}|${text}`,
          sortTime: timeMinutes(time)
        });
      });
    });
    return rows.sort((a, b) => a.sortTime - b.sortTime);
  }

  function markTaskTimerFired(key) {
    const [, dateKey, ...parts] = String(key || "").split("|");
    const text = parts.join("|");
    const timer = state.data.days?.[dateKey]?.timers?.[text];
    if (!timer) return;
    timer.fired = true;
    scheduleSave();
  }

  function todoRows() {
    const rows = [];
    const overdue = overdueRows();
    overdue.forEach((row, i) => rows.push({ ...row, index: i + 1, action: "complete", label: tx("complete") }));

    let index = rows.length + 1;
    const timedRows = [...dailyReminderRows(false), ...oneTimeTodayRows()];
    const dueRows = timedRows.filter((row) => !row.time || row.sortTime <= nowMinutes());
    const laterRows = timedRows.filter((row) => row.time && row.sortTime > nowMinutes());
    dueRows.forEach((row) => rows.push({ ...row, group: row.group === "single" ? "single" : "reminder", index: index++, action: "complete", label: tx("complete") }));

    const current = day();
    current.inProgress.forEach((text) => rows.push({ group: "ing", index: index++, time: taskTimerLabel(text), text, key: text, editable: true, editGroup: "inProgress", editKey: text, action: "complete", label: tx("complete") }));
    current.pending.forEach((text) => rows.push({ group: "todo", index: index++, time: taskTimerLabel(text), text, key: text, editable: true, editGroup: "pending", editKey: text, action: "complete", label: tx("complete") }));
    laterRows.forEach((row) => rows.push({ ...row, group: row.group === "single" ? "single" : "reminder", index: index++, action: "complete", label: tx("complete") }));
    return rows;
  }

  function taskTimerLabel(text, dateKey = todayKey()) {
    const timer = state.data.days?.[dateKey]?.timers?.[text];
    if (!timer || !timer.remindAt || timer.fired) return "";
    return `${tx("halfway")} ${clockFromIso(timer.remindAt)}`;
  }

  function renderTodos() {
    const rows = todoRows();
    const completed = day().completed;
    const overdue = rows.filter((row) => row.group === "overdue" || row.group === "overdueSingle");
    let html = "";
    if (overdue.length) html += section(tx("overdueTitle"), overdue);
    html += section(tx("inProgressTitle"), rows.filter((row) => row.group === "ing"));
    html += section(tx("todosTitle"), rows.filter((row) => row.group === "todo" || row.group === "reminder" || row.group === "single"));
    html += `<div class="section-title completed-toggle" data-action="toggleCompleted">${tx("completedTitle")}${state.showCompleted ? tx("collapse") : tx("expand")}</div>`;
    if (state.showCompleted) {
      html += completed.length
        ? completed.map((text, i) => `<div class="row"><span class="idx">${i + 1}.</span><span>${escapeHtml(text)}</span><span></span></div>`).join("")
        : `<div class="empty">${tx("none")}</div>`;
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
      section(tx("futureTodos"), future) +
      section(tx("dailyReminders"), dailyReminderRows(true)) +
      section(tx("weeklyReminders"), weekly) +
      section(tx("monthlyReminders"), monthly);
  }

  function dayName(name) {
    const zh = {
      Monday: "周一",
      Tuesday: "周二",
      Wednesday: "周三",
      Thursday: "周四",
      Friday: "周五",
      Saturday: "周六",
      Sunday: "周日"
    };
    const ja = {
      Monday: "月",
      Tuesday: "火",
      Wednesday: "水",
      Thursday: "木",
      Friday: "金",
      Saturday: "土",
      Sunday: "日"
    };
    const en = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun"
    };
    return ({ zh, ja, en }[language()] || zh)[name] || name;
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
      `<span>${tx("date")}</span>`,
      `<input data-action="historyDate" type="date" value="${escapeAttr(selectedDate)}">`,
      `<button data-action="historyToday" type="button">${tx("today")}</button>`,
      `<button data-action="historyAll" type="button">${tx("all")}</button>`,
      "</div>"
    ].join("");

    const completedRows = selectedDate ? completedRowsForDate(selectedDate) : allCompletedRows();
    html += section(selectedDate ? `${tx("completedTitle")}${selectedDate}` : tx("completedAll"), completedRows, 1, tx("noCompleted"));

    const logRows = versionLogRows(selectedDate);
    html += section(historyUpdateTitle(selectedDate), logRows, 1, tx("noUpdate"));
    content.innerHTML = html;
  }

  function historyUpdateTitle(selectedDate) {
    if (!selectedDate) return tx("updateAll");
    if (language() === "en") return `Update log: ${selectedDate}`;
    if (language() === "ja") return `更新履歴：${selectedDate}`;
    return `更新记录：${selectedDate}`;
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

  function allNotes() {
    state.data.notes = normalizeNotes(state.data.notes, state.data.noteText || "");
    if (!state.activeNoteId || !state.data.notes.some((note) => note.id === state.activeNoteId)) {
      state.activeNoteId = state.data.notes[0].id;
      localStorage.setItem(NOTE_ID_KEY, state.activeNoteId);
    }
    return state.data.notes;
  }

  function activeNote() {
    return allNotes().find((note) => note.id === state.activeNoteId) || allNotes()[0];
  }

  function syncLegacyNoteText() {
    state.data.noteText = allNotes()[0]?.text || "";
  }

  function renderNoteList() {
    const notes = allNotes();
    noteList.innerHTML = notes.map((note, index) => {
      const title = note.title || defaultNoteTitle(index + 1);
      const active = note.id === state.activeNoteId ? " active" : "";
      return `<button class="note-list-item${active}" data-note-id="${escapeAttr(note.id)}" type="button">${escapeHtml(title)}</button>`;
    }).join("");
  }

  function renderNotes() {
    const current = activeNote();
    notePanel.classList.toggle("notes-collapsed", state.noteListCollapsed);
    noteSidebar.classList.toggle("hidden", state.noteListCollapsed);
    noteExpandButton.classList.toggle("hidden", !state.noteListCollapsed);
    noteTitleInput.value = current.title || "";
    noteInput.value = current.text || "";
    noteAddButton.title = tx("noteAdd");
    noteDeleteButton.textContent = tx("noteDelete");
    noteDeleteButton.title = tx("noteDelete");
    noteToggleButton.textContent = tx("noteCollapse");
    noteToggleButton.title = tx("noteCollapse");
    noteExpandButton.title = tx("noteExpand");
    renderNoteList();
  }

  function renderDiary() {
    state.data.diaries ||= {};
    diaryDateInput.value = state.diaryDate;
    diaryInput.value = state.data.diaries[state.diaryDate] || "";
  }

  function renderDiaryLock() {
    content.innerHTML = [
      '<div class="note-lock">',
      `<div class="section-title">${tx("diaryLockedTitle")}</div>`,
      `<p>${tx("diaryLockedHint")}</p>`,
      '<div class="note-lock-form">',
      '<input data-diary-pin type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0000">',
      `<button data-action="unlockDiary" type="button">${tx("unlock")}</button>`,
      "</div>",
      "</div>"
    ].join("");
    requestAnimationFrame(() => content.querySelector("[data-diary-pin]")?.focus());
  }

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function ledgerRangeTitle(period, start, end) {
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    if (period === "day") return startKey;
    if (period === "week") return `${shortDate(startKey)}-${shortDate(endKey)}`;
    if (period === "month") return monthKey(start);
    return String(start.getFullYear());
  }

  function ledgerRange(period) {
    const current = normalizeLedgerPeriod(period);
    const anchor = dateFromKey(state.ledgerAnchorDate);
    let start = new Date(anchor);
    let end = new Date(anchor);
    if (current === "week") {
      const day = anchor.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start = addDays(anchor, mondayOffset);
      end = addDays(start, 6);
    } else if (current === "month") {
      start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    } else if (current === "year") {
      start = new Date(anchor.getFullYear(), 0, 1);
      end = new Date(anchor.getFullYear(), 11, 31);
    }
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    return {
      key: current,
      title: ledgerRangeTitle(current, start, end),
      match: (item) => {
        const date = String(item.date || "");
        return date >= startKey && date <= endKey;
      }
    };
  }

  function ledgerCategories() {
    if (!Array.isArray(state.data.ledgerCategories)) state.data.ledgerCategories = [...DEFAULT_LEDGER_CATEGORIES];
    state.data.ledgerCategories = uniqueStrings(state.data.ledgerCategories);
    return state.data.ledgerCategories;
  }

  function ledgerCategoryLabel(category) {
    return String(category || "").trim() || tx("noCategory");
  }

  function ledgerCategoryOptions(selected = "") {
    const current = String(selected || "").trim();
    return [
      `<option value="" ${current ? "" : "selected"}>${tx("noCategory")}</option>`,
      ...ledgerCategories().map((category) => `<option value="${escapeAttr(category)}" ${category === current ? "selected" : ""}>${escapeHtml(category)}</option>`)
    ].join("");
  }

  function renderLedgerRecords(items, title) {
    if (!items.length) {
      return `<div class="section-title">${escapeHtml(title)}</div><div class="empty">${tx("noLedger")}</div>`;
    }
    const rows = items.map((item) => {
      const category = String(item.category || "").trim();
      return `
        <div class="ledger-record" data-ledger-row data-ledger-id="${escapeAttr(item.id)}">
          <div class="ledger-record-card">
            <input data-action="editLedgerRecordDate" data-ledger-id="${escapeAttr(item.id)}" type="date" value="${escapeAttr(item.date || todayKey())}">
            <select data-action="editLedgerRecordCategory" data-ledger-id="${escapeAttr(item.id)}">${ledgerCategoryOptions(category)}</select>
            <div class="ledger-record-main" data-ledger-note data-ledger-id="${escapeAttr(item.id)}" title="${escapeAttr(tx("editPlaceholder"))}">
              <span class="ledger-record-type">${item.type === "income" ? tx("income") : tx("expense")}</span>
              <span class="ledger-record-amount">${formatMoney(item.amount)}</span>
              <span class="ledger-record-note">${escapeHtml(item.note || tx("note"))}</span>
            </div>
          </div>
          <button class="ledger-record-delete" data-action="deleteLedger" data-key="${escapeAttr(item.id)}" type="button">${tx("delete")}</button>
        </div>
      `;
    }).join("");
    return `<div class="section-title">${escapeHtml(title)}</div><div class="ledger-record-list">${rows}</div>`;
  }

  function renderLedger() {
    const range = ledgerRange(state.ledgerPeriod);
    const items = asArray(state.data.ledger).filter(range.match).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expense = items.filter((item) => item.type !== "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const periodButtons = [
      ["day", tx("periodDay")],
      ["week", tx("periodWeek")],
      ["month", tx("periodMonth")],
      ["year", tx("periodYear")]
    ].map(([key, label]) => `<button class="${range.key === key ? "active" : ""}" data-action="ledgerPeriod" data-period="${key}" type="button">${label}</button>`).join("");
    const categories = ledgerCategories();
    if (state.ledgerCategory === null) state.ledgerCategory = settings().ledgerLastCategory || "";
    if (state.ledgerCategory && !categories.includes(state.ledgerCategory)) state.ledgerCategory = "";
    const categoryRows = [
      `<div class="ledger-category-option ledger-category-fixed${state.ledgerCategory ? "" : " active"}">
          <button class="ledger-category-pick" data-action="selectLedgerCategory" data-category="" type="button">${tx("noCategory")}</button>
        </div>`,
      ...categories.map((category) => `
        <div class="ledger-category-option${category === state.ledgerCategory ? " active" : ""}" data-category-row data-category="${escapeAttr(category)}">
          <button class="ledger-category-pick" data-action="selectLedgerCategory" data-category="${escapeAttr(category)}" type="button">${escapeHtml(category)}</button>
          <button class="ledger-category-delete" data-action="deleteLedgerCategory" data-category="${escapeAttr(category)}" type="button">${tx("delete")}</button>
        </div>
      `)
    ].join("");
    content.innerHTML = [
      '<div class="ledger-form">',
      '<div class="ledger-main-row">',
      `<select data-ledger="type"><option value="expense">${tx("expense")}</option><option value="income">${tx("income")}</option></select>`,
      `<div class="ledger-category-picker" data-category-picker>
        <input data-ledger="category" type="hidden" value="${escapeAttr(state.ledgerCategory)}">
        <button class="ledger-category-trigger" data-action="toggleLedgerCategoryMenu" type="button">
          <span data-category-label>${escapeHtml(ledgerCategoryLabel(state.ledgerCategory))}</span>
          <span class="category-caret">⌄</span>
        </button>
        <div class="ledger-category-menu hidden" data-category-menu>
          <div class="ledger-category-scroll">${categoryRows || `<div class="empty">${tx("none")}</div>`}</div>
          <button class="ledger-category-add-toggle" data-action="toggleLedgerCategoryAdd" type="button">＋</button>
          <div class="ledger-category-add-row hidden" data-category-add-row>
            <input data-ledger="newCategory" type="text" maxlength="8" placeholder="${tx("newCategoryPlaceholder")}">
            <button data-action="addLedgerCategory" type="button">${tx("addCategory")}</button>
          </div>
        </div>
      </div>`,
      `<input data-ledger="amount" type="number" step="0.01" placeholder="${tx("amount")}">`,
      "</div>",
      `<input data-ledger="note" type="text" placeholder="${tx("note")}">`,
      "</div>",
      '<div class="ledger-rangebar">',
      `<input data-action="ledgerDate" type="date" value="${escapeAttr(state.ledgerAnchorDate)}" aria-label="${tx("ledgerDate")}">`,
      `<div class="ledger-periods" role="radiogroup" aria-label="${tx("date")}">${periodButtons}</div>`,
      `<button class="ledger-save-button" data-action="addLedger" type="button">${tx("addLedger")}</button>`,
      "</div>",
      '<div class="ledger-summary">',
      `<span>${tx("income")} ${formatMoney(income)}</span>`,
      `<span>${tx("expense")} ${formatMoney(expense)}</span>`,
      `<span>${tx("balance")} ${formatMoney(income - expense)}</span>`,
      "</div>",
      renderLedgerRecords(items, `${range.title}${tx("ledgerRecords")}`)
    ].join("");
  }

  function formatMoney(value) {
    return Number(value || 0).toFixed(2).replace(/\.00$/, "");
  }

  function addLedger(type, amount, note, category = "") {
    const number = Number(amount);
    if (!number || number <= 0) {
      setStatus("金额需要大于 0。", false);
      return;
    }
    note = String(note || "").trim();
    category = String(category || "").trim();
    if (category && !ledgerCategories().includes(category)) state.data.ledgerCategories.push(category);
    state.ledgerCategory = category;
    settings().ledgerLastCategory = category;
    state.data.ledger.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: todayKey(),
      type,
      amount: Number(number.toFixed(2)),
      category,
      note
    });
    scheduleSave();
    setStatus("已记账 (｡•̀ᴗ-)و");
    render();
  }

  function addLedgerCategory(category) {
    category = String(category || "").trim();
    if (!category) {
      setStatus(tx("ledgerEmptyCategory"), false);
      return;
    }
    if (ledgerCategories().includes(category)) {
      setStatus(tx("categoryExists"));
      return;
    }
    state.data.ledgerCategories.push(category);
    state.ledgerCategory = category;
    scheduleSave();
    setStatus(tx("categoryAdded"));
    render();
  }

  function deleteLedgerCategory(category) {
    category = String(category || "").trim();
    if (!category) return;
    state.data.ledgerCategories = ledgerCategories().filter((item) => item !== category);
    if (state.ledgerCategory === category) state.ledgerCategory = "";
    if (settings().ledgerLastCategory === category) settings().ledgerLastCategory = "";
    scheduleSave();
    setStatus(tx("categoryDeleted"));
    render();
  }

  function toggleLedgerCategoryMenu() {
    const menu = content.querySelector("[data-category-menu]");
    if (!menu) return;
    menu.classList.toggle("hidden");
    content.querySelectorAll(".ledger-category-option.show-delete").forEach((row) => row.classList.remove("show-delete"));
  }

  function closeLedgerCategoryMenu() {
    content.querySelector("[data-category-menu]")?.classList.add("hidden");
  }

  function selectLedgerCategory(category) {
    category = String(category || "").trim();
    state.ledgerCategory = category;
    settings().ledgerLastCategory = category;
    const input = content.querySelector('[data-ledger="category"]');
    const label = content.querySelector("[data-category-label]");
    if (input) input.value = category;
    if (label) label.textContent = ledgerCategoryLabel(category);
    scheduleSave();
    closeLedgerCategoryMenu();
  }

  function toggleLedgerCategoryAdd() {
    const row = content.querySelector("[data-category-add-row]");
    if (!row) return;
    row.classList.toggle("hidden");
    if (!row.classList.contains("hidden")) row.querySelector("input")?.focus();
  }

  function deleteLedger(id) {
    const before = state.data.ledger.length;
    state.data.ledger = state.data.ledger.filter((item) => item.id !== id);
    if (state.data.ledger.length === before) {
      setStatus("没找到这条记账。", false);
      return;
    }
    scheduleSave();
    setStatus("已删除记账 (｡･-･)ﾉ");
    render();
  }

  function updateLedgerRecord(id, changes) {
    const item = state.data.ledger.find((entry) => entry.id === id);
    if (!item) {
      setStatus("没找到这条记账。", false);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(changes, "date")) item.date = normalizeDateText(changes.date || todayKey());
    if (Object.prototype.hasOwnProperty.call(changes, "category")) item.category = String(changes.category || "").trim();
    if (Object.prototype.hasOwnProperty.call(changes, "note")) item.note = String(changes.note || "").trim();
    if (item.category && !ledgerCategories().includes(item.category)) state.data.ledgerCategories.push(item.category);
    scheduleSave();
    setStatus(tx("editDone"));
    render();
  }

  function beginLedgerNoteEdit(target) {
    if (target.querySelector("input")) return;
    const id = target.dataset.ledgerId;
    const item = state.data.ledger.find((entry) => entry.id === id);
    if (!item) return;
    const input = document.createElement("input");
    input.className = "inline-edit ledger-note-edit";
    input.type = "text";
    input.value = item.note || "";
    input.placeholder = tx("note");
    target.replaceChildren(input);
    input.focus();
    input.select();

    let closed = false;
    const close = (shouldSave) => {
      if (closed) return;
      closed = true;
      if (shouldSave) updateLedgerRecord(id, { note: input.value });
      else render();
    };

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        close(true);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    });
    input.addEventListener("blur", () => close(true));
  }

  function renderSettings() {
    const current = settings();
    const notificationText = !("Notification" in window)
      ? tx("notifyUnsupported")
      : Notification.permission === "granted"
        ? tx("notifyAllowed")
        : Notification.permission === "denied"
          ? tx("notifyDenied")
          : tx("notifyEnable");
    content.innerHTML = [
      '<div class="settings-panel">',
      '<div class="section-title">' + tx("featureSection") + "</div>",
      settingCheckbox("showNotes", tx("showNotes"), current.showNotes !== false),
      settingCheckbox("showDiary", tx("showDiary"), current.showDiary !== false),
      settingCheckbox("showLedger", tx("showLedger"), current.showLedger !== false),
      '<div class="section-title">' + tx("diaryLockSection") + "</div>",
      settingCheckbox("diaryPinEnabled", tx("diaryPinEnabled"), current.diaryPinEnabled),
      current.diaryPinEnabled ? settingPin("diaryPin", tx("diaryPin"), "", tx("diaryPinPlaceholder")) : "",
      '<div class="section-title">' + tx("tutorialSection") + "</div>",
      `<button class="setting-button" data-action="openHelp" type="button">${tx("openTutorial")}</button>`,
      '<div class="section-title">' + tx("colorSection") + "</div>",
      settingColor("bgColor", tx("bgColor"), current.bgColor),
      settingColor("topColor", tx("topColor"), current.topColor),
      settingColor("accentColor", tx("accentColor"), current.accentColor),
      settingColor("markColor", tx("markColor"), current.markColor),
      `<button class="setting-button" data-action="resetSettings" type="button">${tx("resetSettings")}</button>`,
      '<div class="section-title">' + tx("dailyPopupSection") + "</div>",
      settingCheckbox("welcomeEnabled", tx("dailyPopupEnabled"), current.welcomeEnabled),
      settingText("welcomeTitle", tx("welcomeTitle"), current.welcomeTitle),
      settingText("welcomeText", tx("welcomeText"), current.welcomeText),
      '<div class="section-title">' + tx("alarmSection") + "</div>",
      `<button class="setting-button" data-action="enableNotifications" type="button">${escapeHtml(notificationText)}</button>`,
      `<div class="setting-note">${tx("notifyNote")}</div>`,
      settingSelect("language", tx("uiLanguage"), current.language, [
        ["zh", tx("languageZh")],
        ["ja", tx("languageJa")],
        ["en", tx("languageEn")]
      ]),
      "</div>"
    ].join("");
  }

  function settingColor(key, label, value) {
    return `<label class="setting-row"><span>${escapeHtml(label)}</span><input data-setting="${key}" type="color" value="${escapeAttr(value)}"></label>`;
  }

  function settingText(key, label, value) {
    return `<label class="setting-row setting-row-text"><span>${escapeHtml(label)}</span><input data-setting="${key}" type="text" value="${escapeAttr(value)}"></label>`;
  }

  function settingCheckbox(key, label, value) {
    return `<label class="setting-row"><span>${escapeHtml(label)}</span><input data-setting="${key}" type="checkbox" ${value ? "checked" : ""}></label>`;
  }

  function settingPin(key, label, value, placeholder = "0000") {
    return `<label class="setting-row"><span>${escapeHtml(label)}</span><input data-setting="${key}" type="password" inputmode="numeric" maxlength="4" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}"></label>`;
  }

  function settingSelect(key, label, value, options) {
    const optionHtml = options.map(([optionValue, optionLabel]) => `<option value="${escapeAttr(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`).join("");
    return `<label class="setting-row"><span>${escapeHtml(label)}</span><select data-setting="${key}">${optionHtml}</select></label>`;
  }

  function openHelp() {
    helpTitle.textContent = tx("helpTitle");
    helpCloseButton.textContent = tx("helpClose");
    helpBody.innerHTML = helpHtml();
    helpModal.classList.remove("hidden");
  }

  function closeHelp() {
    helpModal.classList.add("hidden");
  }

  function helpHtml() {
    if (language() === "en") {
      return [
        "<p>Use xx as your actual task text.</p>",
        "<ul>",
        "<li>Add todo: type <code>xx</code>, then Enter.</li>",
        "<li>Mark done: <code>xx done</code> or <code>done 1</code>.</li>",
        "<li>In progress: <code>1 ing</code> or <code>xx ing</code>.</li>",
        "<li>Delete: <code>delete xx</code> or <code>xx delete</code>.</li>",
        "<li>Future todo: <code>tomorrow xx</code> is supported in Chinese commands such as <code>明天xx</code>.</li>",
        "<li>Timed reminders: <code>每天17:00提醒我xx</code>, <code>明天14:30提醒我xx</code>, <code>每周三10:25提醒我xx</code>, <code>每月1号提醒我xx</code>.</li>",
        "<li>Edit: double-click a normal Today/In progress row.</li>",
        "<li>Notes and diary auto-save while you type.</li>",
        "<li>Ledger commands: <code>支出25 xx</code>, <code>收入300 xx</code>.</li>",
        "</ul>"
      ].join("");
    }
    if (language() === "ja") {
      return [
        "<p>xx を実際の内容に置き換えて使います。</p>",
        "<ul>",
        "<li>ToDo追加：<code>xx</code> と入力して Enter。</li>",
        "<li>完了：<code>xx完成</code> / <code>完成1</code>。</li>",
        "<li>進行中：<code>1 ing</code> / <code>xx ing</code>。</li>",
        "<li>削除：<code>删除xx</code> / <code>xx删除</code>。</li>",
        "<li>未来のToDo：<code>明天xx</code> / <code>后天xx</code> / <code>大后天xx</code>。</li>",
        "<li>通知：<code>每天17:00提醒我xx</code> / <code>明天14:30提醒我xx</code> / <code>每周三10:25提醒我xx</code> / <code>每月1号提醒我xx</code>。</li>",
        "<li>編集：今日待办 / 进行中 の普通項目をダブルクリック。</li>",
        "<li>メモと日記は入力中に自動保存されます。</li>",
        "<li>記帳：<code>支出25 xx</code> / <code>收入300 xx</code>。</li>",
        "</ul>"
      ].join("");
    }
    return [
      "<p>把 xx 换成具体事项即可。</p>",
      "<ul>",
      "<li>添加今日待办：输入 <code>xx</code> 后回车；也可以输入 <code>加入xx</code>。</li>",
      "<li>标记完成：<code>xx完成</code>、<code>完成1</code>、<code>1 ok</code> 都可以。</li>",
      "<li>标记进行中：<code>1 ing</code> 或 <code>xx ing</code>。</li>",
      "<li>删除事项：<code>删除xx</code> 或 <code>xx删除</code>。</li>",
      "<li>未来待办：<code>明天xx</code>、<code>后天xx</code>、<code>大后天xx</code>。</li>",
      "<li>定时提醒：<code>每天17:00提醒我xx</code>、<code>明天14:30提醒我xx</code>、<code>每周三10:25提醒我xx</code>、<code>每月1号提醒我xx</code>。</li>",
      "<li>修改文字：双击“今日待办”或“进行中”的普通事项，输入新内容后回车。</li>",
      "<li>便签和日记都会在输入时自动保存，不需要手动保存。</li>",
      "<li>记账：<code>支出25 xx</code>、<code>收入300 xx</code>；也可以在记账页选择分类后记录。</li>",
      "</ul>"
    ].join("");
  }

  function render() {
    ensureViewAvailable();
    applyLanguage();
    applyFeatureVisibility();
    dateLabel.textContent = navDate();
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.view));
    const lockedDiary = state.view === "diary" && diaryLocked();
    notePanel.classList.toggle("hidden", state.view !== "notes");
    diaryPanel.classList.toggle("hidden", state.view !== "diary" || lockedDiary);
    content.classList.toggle("hidden", (state.view === "notes") || (state.view === "diary" && !lockedDiary));
    commandBar.classList.toggle("hidden", !["todos", "reminders"].includes(state.view));
    commandBar.classList.toggle("reminder-mode", state.view === "reminders");
    commandTimerSelect.classList.toggle("hidden", state.view !== "todos");
    commandInput.placeholder = state.view === "reminders" ? tx("reminderInputPlaceholder") : tx("placeholder");
    localStorage.setItem(VIEW_KEY, state.view);
    if (state.view === "todos") renderTodos();
    if (state.view === "reminders") renderReminders();
    if (state.view === "history") renderHistory();
    if (state.view === "notes") renderNotes();
    if (state.view === "diary") lockedDiary ? renderDiaryLock() : renderDiary();
    if (state.view === "ledger") renderLedger();
    if (state.view === "settings") renderSettings();
  }

  function addToday(text, durationMinutes = 0) {
    text = text.trim();
    if (!text) return;
    const current = day();
    if (current.pending.includes(text) || current.completed.includes(text)) {
      setStatus("已经有这条待办了，不重复添加。");
      return;
    }
    current.pending.push(text);
    if (durationMinutes > 0) scheduleTaskTimer(text, durationMinutes);
    scheduleSave();
    setStatus(durationMinutes > 0 ? tx("timerSet") : "已成功记录 (｡•̀ᴗ-)و");
  }

  function scheduleTaskTimer(text, durationMinutes) {
    const minutes = Number(durationMinutes);
    if (!minutes || minutes <= 0) return;
    const current = day();
    const start = new Date();
    const remind = new Date(start.getTime() + (minutes * 60 * 1000) / 2);
    current.timers[text] = {
      durationMinutes: minutes,
      startedAt: start.toISOString(),
      remindAt: remind.toISOString(),
      fired: false
    };
  }

  function addDatedTodo(offset, text) {
    addTodoOnDate(dateWithOffset(offset), text);
  }

  function addTodoOnDate(dateKey, text) {
    text = text.trim();
    if (!text) return;
    const current = day(dateKey);
    if (current.pending.includes(text) || current.completed.includes(text)) {
      setStatus("已经有这条待办了，不重复添加。");
      return;
    }
    current.pending.push(text);
    if (dateKey !== todayKey()) logUpdate("增加", `${shortDate(dateKey)} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (｡•̀ᴗ-)و");
  }

  function addDailyReminder(time, text) {
    text = text.trim();
    if (!text) return;
    const exists = state.data.dailyReminders.some((item) => item.text === text && reminderTimes(item).includes(time));
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加。");
      return;
    }
    state.data.dailyReminders.push({ times: [time], text });
    logUpdate("增加", `${time} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (｡•̀ᴗ-)و");
  }

  function addDailyImportant(text, startDate = dateWithOffset(1)) {
    text = text.trim();
    if (!text) return;
    const exists = state.data.dailyImportantReminders.some((item) => item.text === text && (!item.startDate || item.startDate <= startDate));
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加。");
      return;
    }
    state.data.dailyImportantReminders.push({ startDate, text });
    logUpdate("增加", `每天 ${text}`);
    scheduleSave();
    setStatus("已成功记录 (｡•̀ᴗ-)و");
  }

  function addOneTimeReminder(dateKey, time, text) {
    text = text.trim();
    if (!text) return;
    const at = `${dateKey} ${time}`;
    const exists = state.data.oneTimeReminders.some((item) => item.at === at && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加。");
      return;
    }
    state.data.oneTimeReminders.push({ at, text });
    logUpdate("增加", `${shortDate(dateKey)} ${time} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (｡•̀ᴗ-)و");
  }

  function addWeeklyReminder(dayText, time, text) {
    text = text.trim();
    if (!text) return;
    const day = weekName(dayText);
    const exists = state.data.weeklyReminders.some((item) => asArray(item.days).includes(day) && item.time === time && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加。");
      return;
    }
    state.data.weeklyReminders.push({ days: [day], time, text });
    logUpdate("增加", `${dayName(day)} ${time} ${text}`);
    scheduleSave();
    setStatus("已成功记录 (｡•̀ᴗ-)و");
  }

  function addMonthlyReminder(dayNumber, text) {
    text = text.trim();
    if (!text) return;
    const exists = state.data.monthlyReminders.some((item) => Number(item.day) === Number(dayNumber) && item.text === text);
    if (exists) {
      setStatus("已经有这条提醒了，不重复添加。");
      return;
    }
    state.data.monthlyReminders.push({ day: Number(dayNumber), text });
    logUpdate("增加", `每月${Number(dayNumber)}号 ${text}`);
    scheduleSave();
    setStatus("已成功记录 (｡•̀ᴗ-)و");
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
      delete old.timers[text];
      current.completed.push(`补完成：${text}（原 ${dateKey}）`);
    } else if (row.group === "overdueSingle" || row.group === "single") {
      removeSingleReminder(row);
      current.completed.push(`${row.time ? `${row.time}  ` : ""}${row.text}`.trim());
    } else if (row.group === "reminder") {
      current.completed.push(`今日已完成：${row.time ? `${row.time}  ` : ""}${row.text}`);
    } else if (row.group === "timer") {
      const source = day(row.dateKey);
      source.pending = source.pending.filter((item) => item !== row.taskText);
      source.inProgress = source.inProgress.filter((item) => item !== row.taskText);
      delete source.timers[row.taskText];
      current.completed.push(row.dateKey === todayKey() ? row.taskText : `补完成：${row.taskText}（原 ${row.dateKey}）`);
    } else {
      current.pending = current.pending.filter((item) => item !== row.key);
      current.inProgress = current.inProgress.filter((item) => item !== row.key);
      delete current.timers[row.key];
      current.completed.push(row.key);
    }
    scheduleSave();
    setStatus("已完成记录 (๑•̀᎑<๑)و");
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
      setStatus("没找到这条待办。", false);
      return;
    }
    completeRow(target);
  }

  function startByQuery(query) {
    const rows = todoRows();
    const target = /^\d+$/.test(query) ? rows.find((row) => row.index === Number(query)) : rows.find((row) => row.text.includes(query));
    if (!target) {
      setStatus("没找到这条待办。", false);
      return;
    }
    const current = day();
    let text = target.text || target.key;
    if (target.group === "overdue") {
      const [dateKey, oldText] = target.key.split("|");
      const old = day(dateKey);
      old.pending = old.pending.filter((item) => item !== oldText);
      old.hidden.push(oldText);
      delete old.timers[oldText];
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
    setStatus("已标记进行中 (๑•̀᎑<๑)و");
    render();
  }

  function beginInlineEdit(target) {
    if (target.querySelector("input")) return;
    const group = target.dataset.editGroup;
    const oldText = target.dataset.editKey;
    if (!group || !oldText) return;
    const input = document.createElement("input");
    input.className = "inline-edit";
    input.type = "text";
    input.value = oldText;
    input.placeholder = tx("editPlaceholder");
    target.replaceChildren(input);
    input.focus();
    input.select();

    let closed = false;
    const close = (shouldSave) => {
      if (closed) return;
      closed = true;
      if (shouldSave) editTodayText(group, oldText, input.value);
      else render();
    };

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        close(true);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    });
    input.addEventListener("blur", () => close(true));
  }

  function editTodayText(group, oldText, nextText) {
    nextText = String(nextText || "").trim();
    if (!nextText || nextText === oldText) {
      render();
      return;
    }
    const current = day();
    const listName = group === "inProgress" ? "inProgress" : "pending";
    const otherName = listName === "pending" ? "inProgress" : "pending";
    if (current[listName].includes(nextText) || current[otherName].includes(nextText)) {
      setStatus(tx("editDuplicate"), false);
      render();
      return;
    }
    const index = current[listName].indexOf(oldText);
    if (index === -1) {
      setStatus("没找到这条待办。", false);
      render();
      return;
    }
    current[listName][index] = nextText;
    if (current.timers[oldText]) {
      current.timers[nextText] = current.timers[oldText];
      delete current.timers[oldText];
    }
    logUpdate("修改", `${oldText} -> ${nextText}`);
    scheduleSave();
    setStatus(tx("editDone"));
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
              delete current.timers[item];
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
      setStatus("没找到可删除的内容。", false);
      return;
    }
    scheduleSave();
    setStatus("已删除记录 (｡･ω･)ﾉﾞ");
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
      delete old.timers[text];
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
    delete current.timers[row.key];
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

  function parseCommand(raw, durationMinutes = 0) {
    const text = raw.trim();
    if (!text) return;
    let match = text.match(/^删除\s*(.+)$/) || text.match(/^(.+?)\s*删除$/);
    if (match) return deleteByQuery(match[1].trim());
    match = text.match(/^(支出|花了|收入|入账)\s*(\d+(?:\.\d{1,2})?)\s*(.*)$/);
    if (match) return addLedger(match[1] === "收入" || match[1] === "入账" ? "income" : "expense", match[2], match[3]);
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
    if (match) return addToday(match[1].trim(), durationMinutes);
    if (state.view === "reminders") return addDailyImportant(text);
    return addToday(text, durationMinutes);
  }

  async function signIn() {
    if (!state.supabase) {
      setStatus("当前未配置同步服务，只能本地使用。", false);
      return;
    }
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
    if (!state.supabase) {
      setStatus("当前未配置同步服务，只能本地使用。", false);
      return;
    }
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
    signInButton.textContent = isBusy ? (language() === "en" ? "Working" : language() === "ja" ? "処理中" : "处理中") : tx("login");
  }

  function useLocalMode() {
    state.user = null;
    if (!state.data) loadLocalData();
    showApp();
  }

  function openSyncLogin() {
    if (!state.supabase) {
      setStatus("当前未配置同步服务，只能本地使用。", false);
      return;
    }
    showAuth();
  }

  async function signOut() {
    if (!state.user) {
      openSyncLogin();
      return;
    }
    await state.supabase.auth.signOut();
    state.user = null;
    loadLocalData();
    showApp();
    setStatus("已退出，当前使用本地模式。");
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
        setStatus("导入成功，已保存到当前账号 (｡•̀ᴗ-)و");
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

  content.addEventListener("pointerdown", (event) => {
    const row = event.target.closest("[data-category-row]");
    if (row && !event.target.closest(".ledger-category-delete")) {
      state.categorySwipe = {
        row,
        startX: event.clientX,
        startY: event.clientY,
        swiped: false
      };
      return;
    }
    const ledgerRow = event.target.closest("[data-ledger-row]");
    if (!ledgerRow || event.target.closest("button,input,select")) return;
    state.ledgerSwipe = {
      row: ledgerRow,
      startX: event.clientX,
      startY: event.clientY,
      swiped: false
    };
  });

  content.addEventListener("pointermove", (event) => {
    const swipe = state.categorySwipe;
    if (swipe) {
      const dx = event.clientX - swipe.startX;
      const dy = event.clientY - swipe.startY;
      if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy) && !swipe.swiped) {
        swipe.swiped = true;
        state.ignoreCategoryClick = true;
        content.querySelectorAll(".ledger-category-option.show-delete").forEach((row) => row.classList.remove("show-delete"));
        swipe.row.classList.add("show-delete");
      }
      return;
    }
    const ledgerSwipe = state.ledgerSwipe;
    if (!ledgerSwipe) return;
    const dx = event.clientX - ledgerSwipe.startX;
    const dy = event.clientY - ledgerSwipe.startY;
    if (dx < -32 && Math.abs(dx) > Math.abs(dy) && !ledgerSwipe.swiped) {
      ledgerSwipe.swiped = true;
      content.querySelectorAll(".ledger-record.show-delete").forEach((row) => row.classList.remove("show-delete"));
      ledgerSwipe.row.classList.add("show-delete");
    }
  });

  content.addEventListener("pointerup", () => {
    const swiped = state.categorySwipe?.swiped;
    state.categorySwipe = null;
    state.ledgerSwipe = null;
    if (swiped) {
      window.setTimeout(() => {
        state.ignoreCategoryClick = false;
      }, 250);
    }
  });

  content.addEventListener("pointercancel", () => {
    state.categorySwipe = null;
    state.ledgerSwipe = null;
    state.ignoreCategoryClick = false;
  });

  content.addEventListener("click", (event) => {
    if (!event.target.closest("[data-category-picker]")) closeLedgerCategoryMenu();
    const actionTarget = event.target.closest("[data-action]");
    const action = actionTarget?.dataset.action;
    if (!action) return;
    if (state.ignoreCategoryClick && ["selectLedgerCategory", "toggleLedgerCategoryMenu"].includes(action)) {
      event.preventDefault();
      return;
    }
    if (action === "toggleCompleted") {
      state.showCompleted = !state.showCompleted;
      render();
    }
    if (action === "complete") {
      const row = todoRows().find((item) => item.key === actionTarget.dataset.key);
      if (row) completeRow(row);
    }
    if (action === "addLedger") {
      addLedger(
        content.querySelector('[data-ledger="type"]').value,
        content.querySelector('[data-ledger="amount"]').value,
        content.querySelector('[data-ledger="note"]').value,
        content.querySelector('[data-ledger="category"]').value
      );
    }
    if (action === "addLedgerCategory") {
      addLedgerCategory(content.querySelector('[data-ledger="newCategory"]').value);
    }
    if (action === "deleteLedgerCategory") {
      deleteLedgerCategory(actionTarget.dataset.category);
    }
    if (action === "toggleLedgerCategoryMenu") {
      toggleLedgerCategoryMenu();
    }
    if (action === "selectLedgerCategory") {
      selectLedgerCategory(actionTarget.dataset.category);
    }
    if (action === "toggleLedgerCategoryAdd") {
      toggleLedgerCategoryAdd();
    }
    if (action === "ledgerPeriod") {
      state.ledgerPeriod = normalizeLedgerPeriod(actionTarget.dataset.period);
      render();
    }
    if (action === "deleteLedger") {
      deleteLedger(actionTarget.dataset.key);
    }
    if (action === "enableNotifications") {
      enableNotifications();
    }
    if (action === "resetSettings") {
      state.data.settings = { ...DEFAULT_SETTINGS };
      state.diaryUnlocked = false;
      applySettings();
      applyLanguage();
      scheduleSave();
      setStatus(tx("settingsResetDone"));
      render();
    }
    if (action === "openHelp") {
      openHelp();
    }
    if (action === "unlockDiary") {
      const value = content.querySelector("[data-diary-pin]")?.value || "";
      if (value === settings().diaryPin) {
        state.diaryUnlocked = true;
        render();
      } else {
        setStatus(tx("wrongPin"), false);
      }
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

  content.addEventListener("dblclick", (event) => {
    const ledgerNote = event.target.closest("[data-ledger-note]");
    if (ledgerNote && content.contains(ledgerNote)) {
      beginLedgerNoteEdit(ledgerNote);
      return;
    }
    const editable = event.target.closest(".editable-row");
    if (!editable || !content.contains(editable)) return;
    beginInlineEdit(editable);
  });

  content.addEventListener("change", (event) => {
    if (event.target.dataset.action === "editLedgerRecordDate") {
      updateLedgerRecord(event.target.dataset.ledgerId, { date: event.target.value });
      return;
    }
    if (event.target.dataset.action === "editLedgerRecordCategory") {
      updateLedgerRecord(event.target.dataset.ledgerId, { category: event.target.value });
      return;
    }
    if (event.target.dataset.action === "ledgerDate") {
      state.ledgerAnchorDate = event.target.value || todayKey();
      render();
      return;
    }
    if (event.target.dataset.action === "historyDate") {
      state.historyDate = event.target.value || "";
      localStorage.setItem(HISTORY_DATE_KEY, state.historyDate);
      render();
      return;
    }
    const key = event.target.dataset.setting;
    if (!key) return;
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    if (key === "diaryPin") {
      if (String(value || "").trim()) updateDiaryPin(value);
      else render();
      return;
    }
    if (key === "diaryPinEnabled") {
      toggleDiaryPin(value);
      return;
    }
    settings()[key] = value;
    applySettings();
    applyLanguage();
    scheduleSave();
    render();
  });

  content.addEventListener("input", (event) => {
    const key = event.target.dataset.setting;
    if (!key || event.target.type === "checkbox") return;
    if (key === "diaryPin") {
      event.target.value = String(event.target.value || "").replace(/\D/g, "").slice(0, 4);
      return;
    }
    settings()[key] = event.target.value;
    applySettings();
    scheduleSave();
  });

  content.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.matches("[data-diary-pin]")) return;
    event.preventDefault();
    const value = event.target.value || "";
    if (value === settings().diaryPin) {
      state.diaryUnlocked = true;
      render();
    } else {
      setStatus(tx("wrongPin"), false);
    }
  });

  function submitCommand(event) {
    event?.preventDefault();
    const duration = state.view === "todos" ? Number(commandTimerSelect.value || 0) : 0;
    parseCommand(commandInput.value, duration);
    commandInput.value = "";
    commandTimerSelect.value = "0";
    render();
  }

  commandForm.addEventListener("submit", submitCommand);

  commandInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    submitCommand();
  });

  noteTitleInput.addEventListener("input", () => {
    const current = activeNote();
    current.title = noteTitleInput.value.trim() || tx("noteDefaultTitle");
    renderNoteList();
    clearTimeout(state.noteTimer);
    state.noteTimer = setTimeout(() => {
      scheduleSave();
    }, 3000);
  });

  noteInput.addEventListener("input", () => {
    const current = activeNote();
    current.text = noteInput.value;
    syncLegacyNoteText();
    clearTimeout(state.noteTimer);
    state.noteTimer = setTimeout(() => {
      scheduleSave();
    }, 3000);
  });

  noteList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-note-id]");
    if (!button) return;
    state.activeNoteId = button.dataset.noteId;
    localStorage.setItem(NOTE_ID_KEY, state.activeNoteId);
    renderNotes();
  });

  noteAddButton.addEventListener("click", () => {
    const notes = allNotes();
    const nextIndex = notes.length + 1;
    const note = {
      id: `note-${Date.now()}`,
      title: `${tx("noteDefaultTitle")}${nextIndex}`,
      text: ""
    };
    notes.push(note);
    state.activeNoteId = note.id;
    state.noteListCollapsed = false;
    localStorage.setItem(NOTE_ID_KEY, state.activeNoteId);
    localStorage.setItem(NOTE_LIST_COLLAPSED_KEY, "0");
    syncLegacyNoteText();
    scheduleSave();
    renderNotes();
  });

  noteDeleteButton.addEventListener("click", () => {
    const notes = allNotes();
    const index = notes.findIndex((note) => note.id === state.activeNoteId);
    if (notes.length <= 1) {
      const current = notes[0];
      current.title = tx("noteDefaultTitle");
      current.text = "";
      state.activeNoteId = current.id;
      localStorage.setItem(NOTE_ID_KEY, state.activeNoteId);
      syncLegacyNoteText();
      scheduleSave();
      setStatus(tx("noteCleared"));
      renderNotes();
      return;
    }
    const removeIndex = index >= 0 ? index : 0;
    notes.splice(removeIndex, 1);
    const next = notes[Math.min(removeIndex, notes.length - 1)];
    state.activeNoteId = next.id;
    localStorage.setItem(NOTE_ID_KEY, state.activeNoteId);
    syncLegacyNoteText();
    scheduleSave();
    setStatus(tx("noteDeleted"));
    renderNotes();
  });

  noteToggleButton.addEventListener("click", () => {
    state.noteListCollapsed = true;
    localStorage.setItem(NOTE_LIST_COLLAPSED_KEY, "1");
    renderNotes();
  });

  noteExpandButton.addEventListener("click", () => {
    state.noteListCollapsed = false;
    localStorage.setItem(NOTE_LIST_COLLAPSED_KEY, "0");
    renderNotes();
  });

  diaryDateInput.addEventListener("change", () => {
    state.diaryDate = diaryDateInput.value || todayKey();
    localStorage.setItem(DIARY_DATE_KEY, state.diaryDate);
    render();
  });

  diaryInput.addEventListener("input", () => {
    clearTimeout(state.diaryTimer);
    state.diaryTimer = setTimeout(() => {
      state.data.diaries ||= {};
      state.data.diaries[state.diaryDate] = diaryInput.value;
      scheduleSave();
    }, 3000);
  });

  signInButton.addEventListener("click", signIn);
  signUpButton.addEventListener("click", signUp);
  localUseButton.addEventListener("click", useLocalMode);
  fullscreenButton?.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  window.addEventListener("resize", schedulePwaWindowSizeSave);
  window.addEventListener("beforeunload", savePwaWindowSize);
  signOutButton.addEventListener("click", signOut);
  welcomeCloseButton.addEventListener("click", () => welcomeModal.classList.add("hidden"));
  alarmCloseButton.addEventListener("click", closeAlarm);
  alarmDoneButton.addEventListener("click", () => {
    if (state.activeAlarm) completeRow(state.activeAlarm);
    closeAlarm();
  });
  helpCloseButton.addEventListener("click", closeHelp);
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
