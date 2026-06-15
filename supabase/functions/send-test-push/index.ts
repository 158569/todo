import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type PushSubscriptionRow = {
  endpoint: string;
  subscription: Record<string, unknown>;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const vapidSubject = Deno.env.get("TODO_VAPID_SUBJECT") || "mailto:todo@example.com";
const vapidPublicKey = Deno.env.get("TODO_VAPID_PUBLIC_KEY") || "";
const vapidPrivateKey = Deno.env.get("TODO_VAPID_PRIVATE_KEY") || "";
const appUrl = Deno.env.get("TODO_APP_URL") || "/";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

Deno.serve(async (request) => {
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return json({ ok: false, error: "Missing Supabase or VAPID environment variables." }, 500);
  }

  const jwt = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ ok: false, error: "Missing authorization." }, 401);

  const { data: authData, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !authData.user) return json({ ok: false, error: "Invalid user." }, 401);

  let message = "memo 测试推送";
  try {
    const body = await request.json();
    if (typeof body?.message === "string" && body.message.trim()) message = body.message.trim();
  } catch {
    // Empty body is fine.
  }

  const { data: subscriptions, error: subError } = await supabase
    .from("todo_push_subscriptions")
    .select("endpoint,subscription")
    .eq("user_id", authData.user.id)
    .eq("enabled", true);
  if (subError) return json({ ok: false, error: subError.message }, 500);
  if (!subscriptions?.length) return json({ ok: true, sent: 0, disabled: 0 });

  let sent = 0;
  let disabled = 0;
  const errors: string[] = [];

  for (const sub of subscriptions as PushSubscriptionRow[]) {
    try {
      await webpush.sendNotification(sub.subscription as never, JSON.stringify({
        title: "memo 测试推送",
        body: message,
        tag: `memo-test-${Date.now()}`,
        url: appUrl
      }));
      sent += 1;
    } catch (error) {
      const statusCode = Number((error as { statusCode?: number }).statusCode || 0);
      if (statusCode === 404 || statusCode === 410) {
        await disableSubscription(sub.endpoint);
        disabled += 1;
      }
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return json({ ok: true, sent, disabled, errors });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function disableSubscription(endpoint: string) {
  await supabase
    .from("todo_push_subscriptions")
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq("endpoint", endpoint);
}
