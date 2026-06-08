@echo off
setlocal
set "APP_DIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "PROGRAMS=%APPDATA%\Microsoft\Windows\Start Menu\Programs"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$shell=New-Object -ComObject WScript.Shell; " ^
  "$app='%APP_DIR%launch-workday-todo-board.cmd'; " ^
  "foreach($path in @('%DESKTOP%\工作待办提醒.lnk','%PROGRAMS%\工作待办提醒.lnk','%STARTUP%\工作待办提醒.lnk')) { " ^
  "  $s=$shell.CreateShortcut($path); $s.TargetPath=$app; $s.WorkingDirectory='%APP_DIR%'; $s.Description='工作待办提醒本地看板'; $s.IconLocation='C:\Windows\System32\shell32.dll,24'; $s.Save() " ^
  "}"

start "" "%APP_DIR%launch-workday-todo-board.cmd"
echo 已安装工作待办提醒。可从桌面或开始菜单打开。
pause
