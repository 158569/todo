import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type TodoDocument = {
  user_id: string;
  data: Record<string, unknown>;
};

type PushSubscriptionRow = {
  endpoint: string;
  user_id: string;
  subscription: Record<string, unknown>;
};

type Reminder = {
  tag: string;
  title: string;
  body: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const vapidSubject = Deno.env.get("TODO_VAPID_SUBJECT") || "mailto:todo@example.com";
const vapidPublicKey = Deno.env.get("TODO_VAPID_PUBLIC_KEY") || "";
const vapidPrivateKey = Deno.env.get("TODO_VAPID_PRIVATE_KEY") || "";
const timeZone = Deno.env.get("TODO_TIME_ZONE") || "Asia/Shanghai";
const appUrl = Deno.env.get("TODO_APP_URL") || "/";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return json({ ok: false, error: "Missing Supabase or VAPID environment variables." }, 500);
  }

  const now = zonedNow(new Date());
  const { data: docs, error: docsError } = await supabase
    .from("todo_documents")
    .select("user_id,data");
  if (docsError) return json({ ok: false, error: docsError.message }, 500);

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const doc of (docs || []) as TodoDocument[]) {
    const reminders = dueReminders(doc.data || {}, now);
    if (!reminders.length) continue;

    const { data: subscriptions, error: subError } = await supabase
      .from("todo_push_subscriptions")
      .select("endpoint,user_id,subscription")
      .eq("user_id", doc.user_id)
      .eq("enabled", true);
    if (subError) {
      errors.push(subError.message);
      continue;
    }

    for (const reminder of reminders) {
      for (const sub of (subscriptions || []) as PushSubscriptionRow[]) {
        const deliveryKey = await sha256Hex(`${doc.user_id}|${sub.endpoint}|${now.dateKey} ${now.time}|${reminder.tag}`);
        const inserted = await reserveDelivery(deliveryKey, doc.user_id, sub.endpoint, reminder.tag);
        if (!inserted) {
          skipped += 1;
          continue;
        }

        try {
          await webpush.sendNotification(sub.subscription as never, JSON.stringify({
            title: reminder.title,
            body: reminder.body,
            tag: reminder.tag,
            url: appUrl
          }));
          sent += 1;
        } catch (error) {
          const statusCode = Number((error as { statusCode?: number }).statusCode || 0);
          if (statusCode === 404 || statusCode === 410) await disableSubscription(sub.endpoint);
          errors.push(error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  return json({ ok: true, sent, skipped, errors });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" }
  });
}

function zonedNow(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "long"
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  const dateKey = `${get("year")}-${get("month")}-${get("day")}`;
  const time = `${get("hour")}:${get("minute")}`;
  return {
    dateKey,
    time,
    weekday: get("weekday"),
    dayOfMonth: Number(get("day")),
    utcMillis: date.getTime()
  };
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function reminderTimes(item: Record<string, unknown>) {
  const times = asArray<string>(item.times);
  if (times.length) return times.map(normalizeTime).filter(Boolean);
  const hours = asArray<string | number>(item.hours);
  return hours.map((hour) => normalizeTime(`${hour}:00`)).filter(Boolean);
}

function normalizeTime(value: string) {
  const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${(match[2] || "00").padStart(2, "0")}`;
}

function dayData(data: Record<string, unknown>, dateKey: string) {
  const days = data.days && typeof data.days === "object" ? data.days as Record<string, Record<string, unknown>> : {};
  return days[dateKey] || {};
}

function completedSet(data: Record<string, unknown>, dateKey: string) {
  return new Set(asArray<string>(dayData(data, dateKey).completed));
}

function isCompleted(completed: Set<string>, key: string) {
  return completed.has(key) || completed.has(`今日已完成：${key}`);
}

function dueReminders(data: Record<string, unknown>, now: ReturnType<typeof zonedNow>) {
  const completed = completedSet(data, now.dateKey);
  const reminders: Reminder[] = [];

  for (const item of asArray<Record<string, unknown>>(data.dailyReminders)) {
    const text = String(item.text || "").trim();
    if (!text || !reminderTimes(item).includes(now.time)) continue;
    const key = `${now.time}  ${text}`;
    if (isCompleted(completed, key)) continue;
    reminders.push({
      tag: `daily|${now.time}|${text}`,
      title: "memo提醒",
      body: `${now.time}  ${text}`
    });
  }

  for (const item of asArray<Record<string, unknown>>(data.weeklyReminders)) {
    const text = String(item.text || "").trim();
    const days = asArray<string>(item.days);
    const time = normalizeTime(String(item.time || ""));
    if (!text || time !== now.time || !days.includes(now.weekday)) continue;
    const key = `${time}  ${text}`;
    if (isCompleted(completed, key)) continue;
    reminders.push({
      tag: `weekly|${now.weekday}|${time}|${text}`,
      title: "memo提醒",
      body: `${time}  ${text}`
    });
  }

  for (const item of asArray<Record<string, unknown>>(data.oneTimeReminders)) {
    const text = String(item.text || "").trim();
    const at = String(item.at || "").trim();
    if (!text || at !== `${now.dateKey} ${now.time}`) continue;
    const key = `${now.time}  ${text}`;
    if (isCompleted(completed, key)) continue;
    reminders.push({
      tag: `once|${at}|${text}`,
      title: "memo提醒",
      body: `${now.time}  ${text}`
    });
  }

  for (const item of asArray<Record<string, unknown>>(data.monthlyReminders)) {
    const text = String(item.text || "").trim();
    const time = normalizeTime(String(item.time || ""));
    if (!text || !time || time !== now.time || Number(item.day) !== now.dayOfMonth) continue;
    const key = `${time}  ${text}`;
    if (isCompleted(completed, key)) continue;
    reminders.push({
      tag: `monthly|${now.dayOfMonth}|${time}|${text}`,
      title: "memo提醒",
      body: `${time}  ${text}`
    });
  }

  dueTaskTimers(data, now).forEach((reminder) => reminders.push(reminder));

  return reminders;
}

function dueTaskTimers(data: Record<string, unknown>, now: ReturnType<typeof zonedNow>) {
  const reminders: Reminder[] = [];
  const days = data.days && typeof data.days === "object" ? data.days as Record<string, Record<string, unknown>> : {};
  for (const [dateKey, day] of Object.entries(days)) {
    const timers = day.timers && typeof day.timers === "object" ? day.timers as Record<string, Record<string, unknown>> : {};
    for (const [timerKey, timer] of Object.entries(timers)) {
      if (timer.fired === true) continue;
      const remindAt = Date.parse(String(timer.remindAt || ""));
      if (!Number.isFinite(remindAt) || remindAt > now.utcMillis) continue;
      const text = String(timer.text || timerKey).trim();
      if (!timerStillActive(data, day, timer, text)) continue;
      reminders.push({
        tag: `timer|${dateKey}|${timerKey}|${String(timer.remindAt || "")}`,
        title: "memo待办跟进",
        body: text
      });
    }
  }
  return reminders;
}

function timerStillActive(data: Record<string, unknown>, day: Record<string, unknown>, timer: Record<string, unknown>, text: string) {
  if (timer.source === "oneTime") {
    const at = String(timer.at || "");
    return asArray<Record<string, unknown>>(data.oneTimeReminders).some((item) => item.at === at && item.text === text);
  }
  return asArray<string>(day.pending).includes(text) || asArray<string>(day.inProgress).includes(text);
}

async function reserveDelivery(deliveryKey: string, userId: string, endpoint: string, reminderTag: string) {
  const { error } = await supabase
    .from("todo_push_deliveries")
    .insert({
      delivery_key: deliveryKey,
      user_id: userId,
      endpoint,
      reminder_tag: reminderTag
    });
  if (!error) return true;
  if (String(error.code) === "23505") return false;
  throw error;
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function disableSubscription(endpoint: string) {
  await supabase
    .from("todo_push_subscriptions")
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq("endpoint", endpoint);
}
