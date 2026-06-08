待办提醒 顽张って！ - 云端账号版

说明
- 这是网页云端版，支持账号登录。
- 每个用户的数据存在 Supabase 数据库中，并通过 Row Level Security 隔离。
- 仓库里不应该提交真实 workday-todos.json。
- 桌面版 PowerShell 文件仍保留在仓库里，方便以后继续维护本地 app。

文件
- index.html：网页入口。
- styles.css：界面样式。
- app.js：网页逻辑。
- config.example.js：Supabase 配置模板。
- supabase-schema.sql：数据库表和权限策略。
- workday-todos.example.json：空示例数据。
- workday-todo-board.ps1：原本地桌面版。
- install-workday-todo-board.cmd / launch-workday-todo-board.cmd：桌面版安装和启动脚本。

部署前配置
1. 创建 Supabase 项目。
2. 在 Supabase SQL Editor 中执行 supabase-schema.sql。
3. 复制 config.example.js 为 config.js。
4. 把 config.js 里的 url 和 anonKey 改成 Supabase 项目的值。
5. 如果部署到 GitHub Pages，config.js 也需要提交到仓库；anon key 是前端公开 key，安全边界靠 RLS，不靠隐藏 key。

GitHub Pages 部署
1. 打开 GitHub 仓库 Settings。
2. 进入 Pages。
3. Source 选择 Deploy from a branch。
4. Branch 选择 main，目录选择 /root。
5. 保存后等待 Pages 生成网址。

使用
- 注册账号：输入邮箱和密码，点注册。
- 登录账号：输入邮箱和密码，点登录。
- 输入普通文字并回车：加入今日待办。
- 输入“加入XX”：加入今日待办。
- 输入“XX完成”或“完成XX”：标记完成。
- 输入“XXing”：标记进行中。
- 输入“每天9:00提醒我XX”：加入每日固定提醒。
- 输入“每月1号提醒我XX”：加入每月固定提醒。
- 输入“明天XX / 后天XX / 大后天XX”：加入未来待办。
- 便签页会在停止输入后自动保存。
- 导出：下载当前账号数据 JSON。
- 导入：把本地 JSON 导入当前账号并保存到云端。

隐私
- 不要把真实 workday-todos.json 提交到 public 仓库。
- Supabase 必须开启 RLS，本仓库提供的 SQL 已开启。
- 每条数据通过 user_id 绑定 auth.users(id)，策略只允许当前登录用户读写自己的数据。

已知边界
- 网页端不支持真正的系统级弹窗提醒；浏览器通知需要额外申请通知权限，后续可以加。
- 当前云端版先以“一个用户一份 JSON 文档”保存，便于从桌面版迁移。后续如果功能继续扩大，可以拆成 todos/reminders/notes/history 多张表。
