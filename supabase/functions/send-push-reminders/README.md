# send-push-reminders

后台手机提醒需要三件事：

1. 在 Supabase SQL Editor 运行项目里的 `supabase-schema.sql`。
2. 生成一组 Web Push VAPID keys，把 public key 填到 `config.js` 的 `vapidPublicKey`。
3. 给这个 Edge Function 设置环境变量：
   - `TODO_VAPID_PUBLIC_KEY`
   - `TODO_VAPID_PRIVATE_KEY`
   - `TODO_VAPID_SUBJECT`，例如 `mailto:你的邮箱`
   - `TODO_APP_URL`，线上 App 地址
   - `TODO_TIME_ZONE`，默认 `Asia/Shanghai`

部署后，用 Supabase Scheduler/Cron 每 1 分钟调用一次 `send-push-reminders`。

另外部署 `send-test-push`，设置页里的“发送测试推送”会调用它，专门用来测试当前账号的手机订阅是否能收到后台推送。
