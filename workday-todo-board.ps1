$dataPath = Join-Path $PSScriptRoot "workday-todos.json"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$pidPath = Join-Path $PSScriptRoot "workday-todo-board.pid"
$mutexCreated = $false
$script:singleInstanceMutex = New-Object System.Threading.Mutex($true, "Local\CodexWorkdayTodoBoardSingleInstance", [ref]$mutexCreated)
if (-not $mutexCreated) {
  [System.Windows.Forms.MessageBox]::Show("待办看板已经开着啦，先用当前窗口就行 (｡•̀ᴗ-)✧", "待办提醒", "OK", "Information") | Out-Null
  exit
}

Set-Content -LiteralPath $pidPath -Value $PID -Encoding ASCII -ErrorAction SilentlyContinue

function New-AppIcon {
  $bitmap = New-Object System.Drawing.Bitmap 32, 32
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $graphics.Clear([System.Drawing.Color]::Transparent)
  $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 244, 228))
  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 170, 84), 2)
  $earBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 220, 164))
  $faceBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 203))
  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(82, 92, 110), 2)
  $thinPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(82, 92, 110), 1)
  $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(98, 166, 142))
  $accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(98, 166, 142), 2)

  $graphics.FillEllipse($bgBrush, 1, 1, 30, 30)
  $graphics.DrawEllipse($borderPen, 1, 1, 30, 30)

  $leftEar = @(
    (New-Object System.Drawing.Point(8, 12)),
    (New-Object System.Drawing.Point(12, 5)),
    (New-Object System.Drawing.Point(15, 13))
  )
  $rightEar = @(
    (New-Object System.Drawing.Point(17, 13)),
    (New-Object System.Drawing.Point(21, 5)),
    (New-Object System.Drawing.Point(24, 12))
  )
  $graphics.FillPolygon($earBrush, $leftEar)
  $graphics.FillPolygon($earBrush, $rightEar)
  $graphics.DrawPolygon($linePen, $leftEar)
  $graphics.DrawPolygon($linePen, $rightEar)
  $graphics.FillEllipse($faceBrush, 7, 10, 18, 17)
  $graphics.DrawEllipse($linePen, 7, 10, 18, 17)
  $graphics.FillEllipse($accentBrush, 13, 18, 2, 2)
  $graphics.FillEllipse($accentBrush, 19, 18, 2, 2)
  $graphics.DrawArc($thinPen, 15, 20, 5, 3, 20, 140)
  $graphics.DrawLine($linePen, 8, 20, 3, 18)
  $graphics.DrawLine($linePen, 8, 22, 3, 23)
  $graphics.DrawLine($linePen, 24, 20, 29, 18)
  $graphics.DrawLine($linePen, 24, 22, 29, 23)
  $graphics.DrawLine($accentPen, 10, 25, 23, 18)
  $graphics.DrawLine($thinPen, 10, 25, 7, 22)
  $graphics.DrawLine($thinPen, 10, 25, 7, 28)
  $graphics.DrawLine($thinPen, 14, 23, 12, 20)
  $graphics.DrawLine($thinPen, 14, 23, 12, 26)
  $graphics.DrawLine($thinPen, 18, 21, 16, 18)
  $graphics.DrawLine($thinPen, 18, 21, 16, 24)
  $graphics.DrawLine($thinPen, 23, 18, 27, 15)
  $graphics.DrawLine($thinPen, 23, 18, 27, 21)

  $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
  $graphics.Dispose()
  $bgBrush.Dispose()
  $borderPen.Dispose()
  $earBrush.Dispose()
  $faceBrush.Dispose()
  $linePen.Dispose()
  $thinPen.Dispose()
  $accentBrush.Dispose()
  $accentPen.Dispose()
  return $icon
}

function Set-RoundedControl($control, $radius) {
  if ($null -eq $control -or $control.Width -lt 2 -or $control.Height -lt 2) { return }

  $effectiveRadius = [Math]::Max(1, [Math]::Min([int]$radius, [Math]::Floor([Math]::Min($control.Width, $control.Height) / 2)))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $effectiveRadius * 2
  $rect = New-Object System.Drawing.Rectangle(0, 0, $control.Width, $control.Height)

  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  $control.Region = New-Object System.Drawing.Region($path)
  $path.Dispose()
}

function Add-RoundedBorder($control, $radius, $borderColor) {
  if ($null -eq $script:roundedBorderRadius) { $script:roundedBorderRadius = @{} }
  if ($null -eq $script:roundedBorderColor) { $script:roundedBorderColor = @{} }

  $controlId = $control.GetHashCode()
  $script:roundedBorderRadius[$controlId] = [int]$radius
  $script:roundedBorderColor[$controlId] = $borderColor

  $control.Add_Paint({
    param($sender, $e)
    if ($null -eq $sender -or $sender.Width -lt 2 -or $sender.Height -lt 2) { return }

    $e.Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $senderId = $sender.GetHashCode()
    $paintRadius = 8
    if ($null -ne $script:roundedBorderRadius -and $script:roundedBorderRadius.ContainsKey($senderId)) {
      $paintRadius = [int]$script:roundedBorderRadius[$senderId]
    }
    $paintColor = [System.Drawing.Color]::FromArgb(200, 190, 174)
    if ($null -ne $script:roundedBorderColor -and $script:roundedBorderColor.ContainsKey($senderId) -and $null -ne $script:roundedBorderColor[$senderId]) {
      $paintColor = $script:roundedBorderColor[$senderId]
    }

    $effectiveRadius = [Math]::Max(1, [Math]::Min($paintRadius, [Math]::Floor([Math]::Min($sender.Width, $sender.Height) / 2)))
    $diameter = $effectiveRadius * 2
    $rect = New-Object System.Drawing.Rectangle(0, 0, $sender.Width - 1, $sender.Height - 1)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
    $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
    $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    $pen = New-Object System.Drawing.Pen($paintColor, 1)
    $e.Graphics.DrawPath($pen, $path)
    $pen.Dispose()
    $path.Dispose()
  })
}

function Get-DataSnapshot {
  $now = Get-Date
  $dateKey = $now.ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $today = $data.days.$dateKey
  $overdueTodos = @(Get-OverdueTodoObjects $data $dateKey)

  if ($null -eq $today) {
    $pending = @()
    $inProgress = @()
    $completed = @()
  } else {
    $pending = @($today.pending)
    $inProgress = @()
    if ($null -ne $today.PSObject.Properties["inProgress"]) {
      $inProgress = @($today.inProgress)
    }
    $completed = @($today.completed)
  }

  $daily = @()
  if ($null -eq $today -or $today.useDailyTodos -ne $false) {
    $daily = @(Get-DailyTodoItems $data $dateKey)
  }

  $hidden = @()
  if ($null -ne $today -and $null -ne $today.PSObject.Properties["hidden"]) {
    $hidden = @($today.hidden)
  }

  $seen = @{}
  $todos = @()
  foreach ($item in @($daily + $pending)) {
    if ([string]::IsNullOrWhiteSpace($item)) { continue }
    if ($completed -contains $item) { continue }
    if ($inProgress -contains $item) { continue }
    if ($hidden -contains $item) { continue }
    if ($seen.ContainsKey($item)) { continue }
    $seen[$item] = $true
    $todos += $item
  }

  return @{
    Now = $now
    DateKey = $dateKey
    Data = $data
    Todos = $todos
    InProgress = $inProgress
    OverdueTodos = $overdueTodos
    Completed = $completed
  }
}

function Save-Data($data) {
  $json = $data | ConvertTo-Json -Depth 20
  Set-Content -LiteralPath $dataPath -Value $json -Encoding UTF8
}

function Format-ShortDate($dateKey) {
  $date = [datetime]::ParseExact($dateKey, "yyyy-MM-dd", $null)
  return "$($date.Month)/$($date.Day)"
}

function Get-JapaneseWeekday($date) {
  switch ($date.DayOfWeek.ToString()) {
    "Sunday" { "日" }
    "Monday" { "月" }
    "Tuesday" { "火" }
    "Wednesday" { "水" }
    "Thursday" { "木" }
    "Friday" { "金" }
    "Saturday" { "土" }
    default { "" }
  }
}

function Get-DateNavText {
  $now = Get-Date
  return "$($now.Month)/$($now.Day) $(Get-JapaneseWeekday $now)"
}

function Ensure-ArrayProperty($data, $propertyName) {
  if ($null -eq $data.PSObject.Properties[$propertyName]) {
    $data | Add-Member -MemberType NoteProperty -Name $propertyName -Value @()
  }
}

function Add-VersionLog($data, $action, $text) {
  Ensure-ArrayProperty $data "versionLog"
  $now = Get-Date
  $cutoff = $now.AddDays(-7)
  $kept = @()
  foreach ($item in @($data.versionLog)) {
    try {
      $loggedAt = [datetime]::Parse($item.at)
      if ($loggedAt -ge $cutoff) { $kept += $item }
    } catch {
      $kept += $item
    }
  }

  $data.versionLog = @($kept + [pscustomobject]@{
    at = $now.ToString("yyyy-MM-dd HH:mm")
    action = $action
    text = $text
  })
}

function Try-ParseDatePrefix($text) {
  $trimmed = $text.Trim()
  $now = Get-Date
  $year = $now.Year

  if ($trimmed -match "^(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})日?号?\s*(.*)$") {
    return [pscustomobject]@{
      DateKey = ("{0:0000}-{1:00}-{2:00}" -f [int]$matches[1], [int]$matches[2], [int]$matches[3])
      Rest = $matches[4].Trim()
    }
  }

  if ($trimmed -match "^(\d{1,2})[./月](\d{1,2})日?号?\s*(.*)$") {
    return [pscustomobject]@{
      DateKey = ("{0:0000}-{1:00}-{2:00}" -f $year, [int]$matches[1], [int]$matches[2])
      Rest = $matches[3].Trim()
    }
  }

  return $null
}

function Get-DailyTodoItems($data, $dateKey) {
  $items = @()
  $items += @($data.dailyTodos)

  return $items
}

function Get-OverdueTodoObjects($data, $dateKey) {
  $items = @()
  $seen = @{}

  foreach ($property in @($data.days.PSObject.Properties | Sort-Object Name)) {
    $dayKey = $property.Name
    if ($dayKey -ge $dateKey) { continue }

    $day = $property.Value
    $pending = @($day.pending)
    $completed = @($day.completed)
    $hidden = @()
    if ($null -ne $day.PSObject.Properties["hidden"]) {
      $hidden = @($day.hidden)
    }

    foreach ($item in $pending) {
      if ([string]::IsNullOrWhiteSpace($item)) { continue }
      if ($completed -contains $item) { continue }
      if ($hidden -contains $item) { continue }

      $key = "$dayKey|$(Normalize-DedupeKey $item)"
      if ($seen.ContainsKey($key)) { continue }
      $seen[$key] = $true
      $items += [pscustomobject]@{
        DateKey = $dayKey
        Text = $item
      }
    }
  }

  return $items
}

function Ensure-Today($data, $dateKey) {
  $dayProperty = $data.days.PSObject.Properties[$dateKey]
  if ($null -eq $dayProperty) {
    $today = [pscustomobject]@{
      pending = @()
      inProgress = @()
      completed = @()
      hidden = @()
    }
    $data.days | Add-Member -MemberType NoteProperty -Name $dateKey -Value $today
    return $today
  }

  $today = $dayProperty.Value
  if ($null -eq $today.PSObject.Properties["pending"]) {
    $today | Add-Member -MemberType NoteProperty -Name "pending" -Value @()
  }
  if ($null -eq $today.PSObject.Properties["completed"]) {
    $today | Add-Member -MemberType NoteProperty -Name "completed" -Value @()
  }
  if ($null -eq $today.PSObject.Properties["inProgress"]) {
    $today | Add-Member -MemberType NoteProperty -Name "inProgress" -Value @()
  }
  if ($null -eq $today.PSObject.Properties["hidden"]) {
    $today | Add-Member -MemberType NoteProperty -Name "hidden" -Value @()
  }
  return $today
}

function Add-TodayTodo($item) {
  if ([string]::IsNullOrWhiteSpace($item)) { return $false }

  $dateKey = (Get-Date).ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $today = Ensure-Today $data $dateKey

  $pending = @($today.pending)
  $completed = @($today.completed)
  if (($pending -notcontains $item) -and ($completed -notcontains $item)) {
    $today.pending = @($pending + $item)
    Save-Data $data
    return $true
  }
  return $true
}

function Add-DatedTodo($dateKey, $item) {
  if ([string]::IsNullOrWhiteSpace($dateKey) -or [string]::IsNullOrWhiteSpace($item)) { return $false }

  $clean = $item.Trim(" ，,。.")
  if ([string]::IsNullOrWhiteSpace($clean)) { return $false }

  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $day = Ensure-Today $data $dateKey
  $pending = @($day.pending)
  $completed = @($day.completed)
  $hidden = @()
  if ($null -ne $day.PSObject.Properties["hidden"]) {
    $hidden = @($day.hidden)
  }

  if (($pending -notcontains $clean) -and ($completed -notcontains $clean) -and ($hidden -notcontains $clean)) {
    $day.pending = @($pending + $clean)
    Save-Data $data
    return $true
  }
  return $false
}

function Get-TodayTodoEntries($snapshot) {
  $dateKey = $snapshot.DateKey
  $todos = @($snapshot.Todos)
  $inProgress = @($snapshot.InProgress)
  $reminders = @(Get-ReminderObjects $snapshot $false | Where-Object {
    @($inProgress) -notcontains $_.Text
  })

  $dueReminders = @($reminders | Where-Object {
    $_.SortKey -like "0-*" -or $_.SortKey -like "1-*"
  } | Sort-Object SortKey, Time, Text)
  $laterReminders = @($reminders | Where-Object {
    $_.SortKey -notlike "0-*" -and $_.SortKey -notlike "1-*"
  } | Sort-Object SortKey, Time, Text)

  $entries = @()
  foreach ($reminder in $dueReminders) {
    $entries += [pscustomobject]@{
      Text = $reminder.Text
      DateKey = $dateKey
      IsReminder = $true
      Reminder = $reminder
      Group = "due"
    }
  }
  foreach ($item in $todos) {
    $entries += [pscustomobject]@{
      Text = $item
      DateKey = $dateKey
      IsReminder = $false
      Reminder = $null
      Group = "todo"
    }
  }
  foreach ($reminder in $laterReminders) {
    $entries += [pscustomobject]@{
      Text = $reminder.Text
      DateKey = $dateKey
      IsReminder = $true
      Reminder = $reminder
      Group = "later"
    }
  }

  return $entries
}

function Start-TodayTodo($query) {
  if ([string]::IsNullOrWhiteSpace($query)) { return $false }

  $dateKey = (Get-Date).ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $today = Ensure-Today $data $dateKey
  $snapshot = Get-DataSnapshot
  $visibleOverdue = @($snapshot.OverdueTodos)
  $visibleInProgress = @($snapshot.InProgress)
  $visibleInProgressEntries = @()
  foreach ($item in $visibleInProgress) {
    $visibleInProgressEntries += [pscustomobject]@{
      Text = $item
      DateKey = $dateKey
      IsReminder = ($item -match "^今天\s+\d{2}:\d{2}")
      Reminder = $null
    }
  }
  $visibleMainTodoEntries = @(Get-TodayTodoEntries $snapshot)
  $visibleTodoEntries = @()
  $visibleTodoEntries += $visibleInProgressEntries
  $visibleTodoEntries += $visibleMainTodoEntries

  $target = $null
  $targetDate = $dateKey
  $number = 0
  if ($query -match "^过期待办\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleOverdue.Count) {
      $target = $visibleOverdue[$number - 1].Text
      $targetDate = $visibleOverdue[$number - 1].DateKey
    }
  } elseif ($query -match "^进行中\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleInProgressEntries.Count) {
      $entry = $visibleInProgressEntries[$number - 1]
      $target = $entry.Text
      $targetDate = $entry.DateKey
    }
  } elseif ($query -match "^待办\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleMainTodoEntries.Count) {
      $entry = $visibleMainTodoEntries[$number - 1]
      $target = $entry.Text
      $targetDate = $entry.DateKey
    }
  } elseif ([int]::TryParse($query, [ref]$number)) {
    if ($number -ge 1 -and $number -le $visibleOverdue.Count) {
      $target = $visibleOverdue[$number - 1].Text
      $targetDate = $visibleOverdue[$number - 1].DateKey
    } elseif ($number -gt $visibleOverdue.Count -and $number -le ($visibleOverdue.Count + $visibleTodoEntries.Count)) {
      $entry = $visibleTodoEntries[$number - $visibleOverdue.Count - 1]
      $target = $entry.Text
      $targetDate = $entry.DateKey
    }
  }

  if ($null -eq $target) {
    $overdueMatch = $visibleOverdue | Where-Object { $_.Text -eq $query -or "$($_.DateKey)  $($_.Text)" -eq $query } | Select-Object -First 1
    if ($null -ne $overdueMatch) {
      $target = $overdueMatch.Text
      $targetDate = $overdueMatch.DateKey
    }
  }
  if ($null -eq $target) {
    $overdueMatch = $visibleOverdue | Where-Object { $_.Text -like "*$query*" -or "$($_.DateKey)  $($_.Text)" -like "*$query*" } | Select-Object -First 1
    if ($null -ne $overdueMatch) {
      $target = $overdueMatch.Text
      $targetDate = $overdueMatch.DateKey
    }
  }
  if ($null -eq $target) {
    $entry = $visibleTodoEntries | Where-Object { $_.Text -eq $query } | Select-Object -First 1
    if ($null -ne $entry) {
      $target = $entry.Text
      $targetDate = $entry.DateKey
    }
  }
  if ($null -eq $target) {
    $entry = $visibleTodoEntries | Where-Object { $_.Text -like "*$query*" } | Select-Object -First 1
    if ($null -ne $entry) {
      $target = $entry.Text
      $targetDate = $entry.DateKey
    }
  }
  if ($null -eq $target) { return $false }

  if ($targetDate -eq $dateKey) {
    $today.pending = @(@($today.pending) | Where-Object { $_ -ne $target })
  } else {
    $sourceDay = Ensure-Today $data $targetDate
    $sourceDay.pending = @(@($sourceDay.pending) | Where-Object { $_ -ne $target })
    if (@($sourceDay.hidden) -notcontains $target) {
      $sourceDay.hidden = @(@($sourceDay.hidden) + $target)
    }
  }
  if (@($today.inProgress) -notcontains $target) {
    $today.inProgress = @(@($today.inProgress) + $target)
  }
  Save-Data $data
  return $true
}

function Add-Note($item) {
  if ([string]::IsNullOrWhiteSpace($item)) { return $false }

  $clean = $item.Trim(" ，,。.")
  if ([string]::IsNullOrWhiteSpace($clean)) { return $false }

  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -eq $data.PSObject.Properties["noteText"]) {
    $data | Add-Member -MemberType NoteProperty -Name "noteText" -Value ""
  }
  if ($null -eq $data.PSObject.Properties["notes"]) {
    $data | Add-Member -MemberType NoteProperty -Name "notes" -Value @()
  }

  $prefix = (Get-Date).ToString("M/d HH:mm")
  $line = "$prefix  $clean"
  if ([string]::IsNullOrWhiteSpace($data.noteText)) {
    $data.noteText = $line
  } else {
    $data.noteText = "$($data.noteText)$([Environment]::NewLine)$line"
  }
  Save-Data $data
  return $true
}

function Try-AddRelativeDateTodoCommand($command) {
  $text = $command.Trim()
  if ($text -notmatch "^(明天|后天|大后天)\s*(.+)$") { return $false }

  $label = $matches[1]
  $item = $matches[2].Trim()
  if ([string]::IsNullOrWhiteSpace($item)) { return $false }

  $timePattern = "^(上午|下午|晚上|中午|早上)?\s*\d{1,2}(?:[:：；点]\d{0,2})?"
  if ($item -match $timePattern) { return $false }

  $offset = switch ($label) {
    "明天" { 1 }
    "后天" { 2 }
    "大后天" { 3 }
    default { 1 }
  }
  $dateKey = (Get-Date).AddDays($offset).ToString("yyyy-MM-dd")
  return Add-DatedTodo $dateKey $item
}

function Add-DailyImportantReminder($item) {
  if ([string]::IsNullOrWhiteSpace($item)) { return $false }

  $clean = $item.Trim()
  $clean = $clean -replace "^(每天|每日)\s*", ""
  $clean = $clean.Trim(" ，,。.") 
  if ([string]::IsNullOrWhiteSpace($clean)) { return $false }

  $dateKey = (Get-Date).ToString("yyyy-MM-dd")
  $startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $today = Ensure-Today $data $dateKey

  if ($null -eq $data.PSObject.Properties["dailyImportantReminders"]) {
    $data | Add-Member -MemberType NoteProperty -Name "dailyImportantReminders" -Value @()
  }

  $exists = @($data.dailyImportantReminders) | Where-Object { $_.text -eq $clean } | Select-Object -First 1
  if ($null -ne $exists) { return $false }

  $today.pending = @(@($today.pending) | Where-Object { $_ -ne $item -and $_ -ne $clean -and $_ -ne "每天 $clean" })
  $data.dailyImportantReminders = @(@($data.dailyImportantReminders) + [pscustomobject]@{
    startDate = $startDate
    text = $clean
  })
  Add-VersionLog $data "增加" "最重要：从 $(Format-ShortDate $startDate) 起每天 $clean"
  Save-Data $data
  return $true
}

function Try-AddDailyTodoCommand($command) {
  $text = $command.Trim()
  if ($text -notmatch "^(每天|每日)\s*(.+)$") { return $false }

  $rest = $matches[2].Trim()
  $timePattern = "^(上午|下午|晚上|中午|早上)?\s*\d{1,2}(?:[:：；点]\d{0,2})?"
  if ($rest -match $timePattern) { return $false }

  return Add-DailyImportantReminder $rest
}

function Remove-DailyTodoRule($data, $query) {
  if ([string]::IsNullOrWhiteSpace($query)) { return $false }

  $cleanQuery = $query.Trim()
  $cleanQuery = $cleanQuery -replace "^(每天|每日)\s*", ""
  $cleanQuery = $cleanQuery.Trim(" ，,。.")

  $removed = $false
  if ($null -ne $data.PSObject.Properties["dailyTodos"]) {
    $before = @($data.dailyTodos).Count
    $data.dailyTodos = @(@($data.dailyTodos) | Where-Object { $_ -ne $cleanQuery -and $_ -notlike "*$cleanQuery*" })
    if (@($data.dailyTodos).Count -ne $before) { $removed = $true }
  }

  if ($null -ne $data.PSObject.Properties["dailyTodoRules"]) {
    $before = @($data.dailyTodoRules).Count
    $data.dailyTodoRules = @(@($data.dailyTodoRules) | Where-Object { $_.text -ne $cleanQuery -and $_.text -notlike "*$cleanQuery*" })
    if (@($data.dailyTodoRules).Count -ne $before) { $removed = $true }
  }

  if ($null -ne $data.PSObject.Properties["dailyImportantReminders"]) {
    $before = @($data.dailyImportantReminders).Count
    $data.dailyImportantReminders = @(@($data.dailyImportantReminders) | Where-Object { $_.text -ne $cleanQuery -and $_.text -notlike "*$cleanQuery*" })
    if (@($data.dailyImportantReminders).Count -ne $before) {
      Add-VersionLog $data "删除" "最重要：每天 $cleanQuery"
      $removed = $true
    }
  }

  return $removed
}

function Remove-MonthlyReminderRule($data, $query) {
  if ([string]::IsNullOrWhiteSpace($query)) { return $false }

  $cleanQuery = $query.Trim()
  if ($cleanQuery -notmatch "^(每月|每个月)\s*(\d{1,2})\s*(号|日)?\s*(.*)$") { return $false }

  $day = [int]$matches[2]
  $reminderText = Clean-ReminderText $matches[4]
  if ($day -lt 1 -or $day -gt 31 -or [string]::IsNullOrWhiteSpace($reminderText)) { return $false }
  if ($null -eq $data.PSObject.Properties["monthlyReminders"]) { return $false }

  $before = @($data.monthlyReminders).Count
  $data.monthlyReminders = @(@($data.monthlyReminders) | Where-Object {
    -not ([int]$_.day -eq $day -and ($_.text -eq $reminderText -or $_.text -like "*$reminderText*"))
  })

  if (@($data.monthlyReminders).Count -eq $before) { return $false }
  Add-VersionLog $data "删除" "每月$($day)号 $reminderText"
  return $true
}

function Normalize-TimeText($rawTime, $meridiem) {
  $time = $rawTime.Replace("；", ":").Replace("：", ":")
  $hour = $null
  $minute = 0

  if ($time -match "^(\d{1,2})[:点](\d{1,2})?$") {
    $hour = [int]$matches[1]
    if ($matches[2]) { $minute = [int]$matches[2] }
  } elseif ($time -match "^(\d{1,2})$") {
    $hour = [int]$matches[1]
  } else {
    return $null
  }

  if (($meridiem -match "下午|晚上") -and $hour -lt 12) {
    $hour += 12
  }
  if (($meridiem -match "中午") -and $hour -lt 11) {
    $hour += 12
  }

  if ($hour -lt 0 -or $hour -gt 23 -or $minute -lt 0 -or $minute -gt 59) {
    return $null
  }

  return "{0:00}:{1:00}" -f $hour, $minute
}

function Clean-ReminderText($text) {
  $clean = $text.Trim()
  $clean = $clean -replace "^(提醒我|提醒|叫我|通知我|提示我)\s*", ""
  $clean = $clean -replace "\s*(提醒我|提醒|叫我|通知我|提示我)$", ""
  return $clean.Trim(" ，,。.")
}

function Add-DailyReminder($time, $text) {
  if ([string]::IsNullOrWhiteSpace($time) -or [string]::IsNullOrWhiteSpace($text)) { return $false }

  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -eq $data.PSObject.Properties["dailyReminders"]) {
    $data | Add-Member -MemberType NoteProperty -Name "dailyReminders" -Value @()
  }

  $exists = @($data.dailyReminders) | Where-Object {
    (@($_.times) -contains $time -or @($_.hours | ForEach-Object { "{0:00}:00" -f [int]$_ }) -contains $time) -and $_.text -eq $text
  } | Select-Object -First 1

  if ($null -eq $exists) {
    $data.dailyReminders = @(@($data.dailyReminders) + [pscustomobject]@{
      times = @($time)
      text = $text
    })
    Add-VersionLog $data "增加" "每天 $time $text"
    Save-Data $data
    return $true
  }
  $script:lastInputStatus = "已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ"
  return $true
}

function Add-OneTimeReminder($dateKey, $time, $text) {
  if ([string]::IsNullOrWhiteSpace($dateKey) -or [string]::IsNullOrWhiteSpace($time) -or [string]::IsNullOrWhiteSpace($text)) { return $false }

  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -eq $data.PSObject.Properties["oneTimeReminders"]) {
    $data | Add-Member -MemberType NoteProperty -Name "oneTimeReminders" -Value @()
  }

  $at = "$dateKey $time"
  $exists = @($data.oneTimeReminders) | Where-Object { $_.at -eq $at -and $_.text -eq $text } | Select-Object -First 1
  if ($null -eq $exists) {
    $data.oneTimeReminders = @(@($data.oneTimeReminders) + [pscustomobject]@{
      at = $at
      text = $text
    })
    Add-VersionLog $data "增加" "$(Format-ShortDate $dateKey) $time $text"
    Save-Data $data
    return $true
  }
  $script:lastInputStatus = "已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ"
  return $true
}

function Add-DateImportantReminder($dateKey, $text) {
  if ([string]::IsNullOrWhiteSpace($dateKey) -or [string]::IsNullOrWhiteSpace($text)) { return $false }

  $clean = Clean-ReminderText $text
  if ([string]::IsNullOrWhiteSpace($clean)) { return $false }

  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  Ensure-ArrayProperty $data "dateImportantReminders"

  $exists = @($data.dateImportantReminders) | Where-Object { $_.date -eq $dateKey -and $_.text -eq $clean } | Select-Object -First 1
  if ($null -ne $exists) {
    $script:lastInputStatus = "已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ"
    return $true
  }

  $data.dateImportantReminders = @(@($data.dateImportantReminders) + [pscustomobject]@{
    date = $dateKey
    text = $clean
  })
  Add-VersionLog $data "增加" "$(Format-ShortDate $dateKey) 最重要 $clean"
  Save-Data $data
  return $true
}

function Add-MonthlyReminder($day, $text) {
  if ($day -lt 1 -or $day -gt 31 -or [string]::IsNullOrWhiteSpace($text)) { return $false }

  $clean = Clean-ReminderText $text
  if ([string]::IsNullOrWhiteSpace($clean)) { return $false }

  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  Ensure-ArrayProperty $data "monthlyReminders"

  $exists = @($data.monthlyReminders) | Where-Object { [int]$_.day -eq $day -and $_.text -eq $clean } | Select-Object -First 1
  if ($null -ne $exists) {
    $script:lastInputStatus = "已经有这条提醒了，不重复添加 (｡･ω･｡)ﾉ"
    return $true
  }

  $data.monthlyReminders = @(@($data.monthlyReminders) + [pscustomobject]@{
    day = $day
    text = $clean
  })
  Add-VersionLog $data "增加" "每月$($day)号 $clean"
  Save-Data $data
  return $true
}

function Normalize-DedupeKey($text) {
  $key = "$text"
  $key = $key -replace "\s+", ""
  $key = $key -replace '[，,。.！!：:；;、"''“”‘’]', ""
  $key = $key -replace "我姐", "姐"
  return $key
}

function Remove-ReminderRule($data, $reminder) {
  if ($null -eq $reminder) { return $false }

  if ($reminder.Type -eq "dailyImportant") {
    $data.dailyImportantReminders = @(@($data.dailyImportantReminders) | Where-Object {
      -not ($_.text -eq $reminder.ReminderText)
    })
    Add-VersionLog $data "删除" "最重要：每天 $($reminder.ReminderText)"
    return $true
  }

  if ($reminder.Type -eq "dateImportant") {
    $data.dateImportantReminders = @(@($data.dateImportantReminders) | Where-Object {
      -not ($_.date -eq $reminder.DateKey -and $_.text -eq $reminder.ReminderText)
    })
    Add-VersionLog $data "删除" "$(Format-ShortDate $reminder.DateKey) 最重要 $($reminder.ReminderText)"
    return $true
  }

  if ($reminder.Type -eq "monthly") {
    $data.monthlyReminders = @(@($data.monthlyReminders) | Where-Object {
      -not ([int]$_.day -eq [int]$reminder.Day -and $_.text -eq $reminder.ReminderText)
    })
    Add-VersionLog $data "删除" "每月$($reminder.Day)号 $($reminder.ReminderText)"
    return $true
  }

  if ($reminder.Type -eq "daily") {
    $newReminders = @()
    foreach ($item in @($data.dailyReminders)) {
      if ($item.text -ne $reminder.ReminderText) {
        $newReminders += $item
        continue
      }

      $keptTimes = @()
      if ($null -ne $item.PSObject.Properties["times"]) {
        $keptTimes = @($item.times | Where-Object { $_ -ne $reminder.Time })
      }
      $keptHours = @()
      if ($null -ne $item.PSObject.Properties["hours"]) {
        $removeHour = [int]($reminder.Time.Substring(0, 2))
        $keptHours = @($item.hours | Where-Object { [int]$_ -ne $removeHour })
      }

      if ($keptTimes.Count -gt 0 -or $keptHours.Count -gt 0) {
        if ($null -ne $item.PSObject.Properties["times"]) { $item.times = $keptTimes }
        if ($null -ne $item.PSObject.Properties["hours"]) { $item.hours = $keptHours }
        $newReminders += $item
      }
    }
    $data.dailyReminders = $newReminders
    Add-VersionLog $data "删除" "每天 $($reminder.Time) $($reminder.ReminderText)"
    return $true
  }

  if ($reminder.Type -eq "weekly") {
    $data.weeklyReminders = @(@($data.weeklyReminders) | Where-Object {
      -not ($_.time -eq $reminder.Time -and $_.text -eq $reminder.ReminderText)
    })
    Add-VersionLog $data "删除" "每周 $($reminder.Time) $($reminder.ReminderText)"
    return $true
  }

  if ($reminder.Type -eq "oneTime") {
    $data.oneTimeReminders = @(@($data.oneTimeReminders) | Where-Object {
      -not ($_.at -eq $reminder.At -and $_.text -eq $reminder.ReminderText)
    })
    Add-VersionLog $data "删除" "$(Format-ShortDate ($reminder.At.Substring(0, 10))) $($reminder.Time) $($reminder.ReminderText)"
    return $true
  }

  if ($reminder.Type -eq "futureTodo") {
    $sourceDay = Ensure-Today $data $reminder.DateKey
    $original = $reminder.OriginalText
    if ([string]::IsNullOrWhiteSpace($original)) {
      $original = @($sourceDay.pending | Where-Object {
        (Normalize-DedupeKey $_) -eq (Normalize-DedupeKey $reminder.ReminderText) -or $_ -like "*$($reminder.ReminderText)*"
      } | Select-Object -First 1)
    }
    if ([string]::IsNullOrWhiteSpace($original)) { return $false }

    $sourceDay.pending = @(@($sourceDay.pending) | Where-Object { $_ -ne $original })
    if (@($sourceDay.hidden) -notcontains $original) {
      $sourceDay.hidden = @(@($sourceDay.hidden) + $original)
    }
    Add-VersionLog $data "删除" "$(Format-ShortDate $reminder.DateKey) 待办 $original"
    return $true
  }

  return $false
}

function Try-AddReminderCommand($command) {
  $text = $command.Trim()
  $timePattern = "(上午|下午|晚上|中午|早上)?\s*(\d{1,2}(?:[:：；点]\d{0,2})?)"

  if ($text -match "^(每月|每个月)\s*(\d{1,2})\s*(号|日)?\s*(.*)$") {
    $day = [int]$matches[2]
    $reminderText = Clean-ReminderText $matches[4]
    return Add-MonthlyReminder $day $reminderText
  }

  $datePrefix = Try-ParseDatePrefix $text
  if ($null -ne $datePrefix) {
    $rest = $datePrefix.Rest
    if ([string]::IsNullOrWhiteSpace($rest)) { return $false }

    if ($rest -match "^$timePattern\s*(.*)$") {
      $time = Normalize-TimeText $matches[2] $matches[1]
      $reminderText = Clean-ReminderText $matches[3]
      return Add-OneTimeReminder $datePrefix.DateKey $time $reminderText
    }

    return Add-DateImportantReminder $datePrefix.DateKey $rest
  }

  if ($text -match "^(今天|今日)\s*(.*)$") {
    $rest = $matches[2].Trim()
    if ([string]::IsNullOrWhiteSpace($rest)) { return $false }

    if ($rest -match "^$timePattern\s*(.*)$") {
      $time = Normalize-TimeText $matches[2] $matches[1]
      $reminderText = Clean-ReminderText $matches[3]
      return Add-OneTimeReminder (Get-Date).ToString("yyyy-MM-dd") $time $reminderText
    }

    return Add-DateImportantReminder (Get-Date).ToString("yyyy-MM-dd") $rest
  }

  if ($text -match "^(每天|每日)\s*$timePattern\s*(.*)$") {
    $time = Normalize-TimeText $matches[3] $matches[2]
    $reminderText = Clean-ReminderText $matches[4]
    return Add-DailyReminder $time $reminderText
  }

  if ($text -match "^明天\s*$timePattern\s*(.*)$") {
    $time = Normalize-TimeText $matches[2] $matches[1]
    $reminderText = Clean-ReminderText $matches[3]
    $dateKey = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    return Add-OneTimeReminder $dateKey $time $reminderText
  }

  if ($text -match "^(\d{4})[-年](\d{1,2})[-月](\d{1,2})日?\s*$timePattern\s*(.*)$") {
    $dateKey = "{0:0000}-{1:00}-{2:00}" -f [int]$matches[1], [int]$matches[2], [int]$matches[3]
    $time = Normalize-TimeText $matches[5] $matches[4]
    $reminderText = Clean-ReminderText $matches[6]
    return Add-OneTimeReminder $dateKey $time $reminderText
  }

  return $false
}

function Complete-TodayTodo($query) {
  if ([string]::IsNullOrWhiteSpace($query)) { return $false }

  $dateKey = (Get-Date).ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $today = Ensure-Today $data $dateKey
  $snapshot = Get-DataSnapshot
  $visibleInProgress = @($snapshot.InProgress)
  $visibleOverdue = @($snapshot.OverdueTodos)
  $visibleReminders = @(Get-ReminderObjects $snapshot $false)
  $visibleInProgressEntries = @()
  foreach ($item in $visibleInProgress) {
    $visibleInProgressEntries += [pscustomobject]@{
      Text = $item
      DateKey = $dateKey
      IsReminder = ($item -match "^今天\s+\d{2}:\d{2}")
      Reminder = $null
    }
  }
  $visibleMainTodoEntries = @(Get-TodayTodoEntries $snapshot)
  $visibleTodoEntries = @()
  $visibleTodoEntries += $visibleInProgressEntries
  $visibleTodoEntries += $visibleMainTodoEntries

  $target = $null
  $targetDate = $dateKey
  $targetIsReminder = $false
  $number = 0
  if ($query -match "^过期待办\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleOverdue.Count) {
      $target = $visibleOverdue[$number - 1].Text
      $targetDate = $visibleOverdue[$number - 1].DateKey
    }
  } elseif ($query -match "^进行中\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleInProgressEntries.Count) {
      $entry = $visibleInProgressEntries[$number - 1]
      $target = $entry.Text
      $targetDate = $entry.DateKey
      $targetIsReminder = $entry.IsReminder
    }
  } elseif ($query -match "^待办\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleMainTodoEntries.Count) {
      $entry = $visibleMainTodoEntries[$number - 1]
      $target = $entry.Text
      $targetDate = $entry.DateKey
      $targetIsReminder = $entry.IsReminder
    }
  } elseif ([int]::TryParse($query, [ref]$number)) {
    if ($number -ge 1 -and $number -le $visibleOverdue.Count) {
      $target = $visibleOverdue[$number - 1].Text
      $targetDate = $visibleOverdue[$number - 1].DateKey
    } elseif ($number -gt $visibleOverdue.Count -and $number -le ($visibleOverdue.Count + $visibleTodoEntries.Count)) {
      $entry = $visibleTodoEntries[$number - $visibleOverdue.Count - 1]
      $target = $entry.Text
      $targetDate = $entry.DateKey
      $targetIsReminder = $entry.IsReminder
    }
  }

  if ($null -eq $target) {
    $overdueMatch = $visibleOverdue | Where-Object { $_.Text -eq $query -or "$($_.DateKey)  $($_.Text)" -eq $query } | Select-Object -First 1
    if ($null -ne $overdueMatch) {
      $target = $overdueMatch.Text
      $targetDate = $overdueMatch.DateKey
    }
  }
  if ($null -eq $target) {
    $overdueMatch = $visibleOverdue | Where-Object { $_.Text -like "*$query*" -or "$($_.DateKey)  $($_.Text)" -like "*$query*" } | Select-Object -First 1
    if ($null -ne $overdueMatch) {
      $target = $overdueMatch.Text
      $targetDate = $overdueMatch.DateKey
    }
  }
  if ($null -eq $target) {
    $entry = $visibleTodoEntries | Where-Object { $_.Text -eq $query } | Select-Object -First 1
    if ($null -ne $entry) {
      $target = $entry.Text
      $targetDate = $entry.DateKey
      $targetIsReminder = $entry.IsReminder
    }
  }
  if ($null -eq $target) {
    $entry = $visibleTodoEntries | Where-Object { $_.Text -like "*$query*" } | Select-Object -First 1
    if ($null -ne $entry) {
      $target = $entry.Text
      $targetDate = $entry.DateKey
      $targetIsReminder = $entry.IsReminder
    }
  }

  if ($null -eq $target) {
    $target = ($visibleReminders | Where-Object { $_.Text -eq $query } | Select-Object -First 1).Text
    if ($null -ne $target) { $targetIsReminder = $true }
  }
  if ($null -eq $target) {
    $target = ($visibleReminders | Where-Object { $_.Text -like "*$query*" } | Select-Object -First 1).Text
    if ($null -ne $target) { $targetIsReminder = $true }
  }
  if ($null -eq $target) { return $false }

  if ($targetDate -eq $dateKey) {
    $today.pending = @(@($today.pending) | Where-Object { $_ -ne $target })
    $today.inProgress = @(@($today.inProgress) | Where-Object { $_ -ne $target })
  } else {
    $sourceDay = Ensure-Today $data $targetDate
    $sourceDay.pending = @(@($sourceDay.pending) | Where-Object { $_ -ne $target })
    if (@($sourceDay.hidden) -notcontains $target) {
      $sourceDay.hidden = @(@($sourceDay.hidden) + $target)
    }
  }

  $completedText = $target
  if ($targetIsReminder -or $target -match "^每天\s+" -or $target -match "^每周" -or $target -match "^每月" -or $target -match "^今天\s+") {
    $completedText = "今日已完成：$target"
  } elseif ($targetDate -ne $dateKey) {
    $completedText = "补完成：$target（原 $targetDate）"
  }

  if (@($today.completed) -notcontains $completedText) {
    $today.completed = @(@($today.completed) + $completedText)
  }
  Save-Data $data
  return $true
}

function Remove-WorkItem($query) {
  if ([string]::IsNullOrWhiteSpace($query)) { return $false }

  $dateKey = (Get-Date).ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $today = Ensure-Today $data $dateKey
  $snapshot = Get-DataSnapshot
  $visibleInProgress = @($snapshot.InProgress)
  $visibleOverdue = @($snapshot.OverdueTodos)
  $visibleReminders = @(Get-ReminderObjects $snapshot $true)
  $visibleInProgressEntries = @()
  foreach ($item in $visibleInProgress) {
    $visibleInProgressEntries += [pscustomobject]@{
      Text = $item
      DateKey = $dateKey
      IsReminder = ($item -match "^今天\s+\d{2}:\d{2}")
      Reminder = $null
    }
  }
  $visibleMainTodoEntries = @(Get-TodayTodoEntries $snapshot)
  $visibleTodoEntries = @()
  $visibleTodoEntries += $visibleInProgressEntries
  $visibleTodoEntries += $visibleMainTodoEntries

  if (Remove-DailyTodoRule $data $query) {
    $cleanQuery = $query.Trim() -replace "^(每天|每日)\s*", ""
    $today.pending = @(@($today.pending) | Where-Object { $_ -ne $query -and $_ -ne $cleanQuery -and $_ -ne "每天 $cleanQuery" })
    Save-Data $data
    return $true
  }

  if (Remove-MonthlyReminderRule $data $query) {
    Save-Data $data
    return $true
  }

  $targetTodo = $null
  $targetTodoDate = $dateKey
  $targetReminder = $null
  $number = 0
  if ($query -match "^过期待办\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleOverdue.Count) {
      $targetTodo = $visibleOverdue[$number - 1].Text
      $targetTodoDate = $visibleOverdue[$number - 1].DateKey
    }
  } elseif ($query -match "^进行中\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleInProgressEntries.Count) {
      $entry = $visibleInProgressEntries[$number - 1]
      $targetTodo = $entry.Text
      $targetTodoDate = $entry.DateKey
    }
  } elseif ($query -match "^待办\s*(\d+)$") {
    $number = [int]$matches[1]
    if ($number -ge 1 -and $number -le $visibleMainTodoEntries.Count) {
      $entry = $visibleMainTodoEntries[$number - 1]
      if ($entry.IsReminder) {
        $targetReminder = $entry.Reminder
      } else {
        $targetTodo = $entry.Text
        $targetTodoDate = $entry.DateKey
      }
    }
  } elseif ([int]::TryParse($query, [ref]$number)) {
    if ($number -ge 1 -and $number -le $visibleOverdue.Count) {
      $targetTodo = $visibleOverdue[$number - 1].Text
      $targetTodoDate = $visibleOverdue[$number - 1].DateKey
    } elseif ($number -gt $visibleOverdue.Count -and $number -le ($visibleOverdue.Count + $visibleTodoEntries.Count)) {
      $entry = $visibleTodoEntries[$number - $visibleOverdue.Count - 1]
      if ($entry.IsReminder) {
        $targetReminder = $entry.Reminder
      } else {
        $targetTodo = $entry.Text
        $targetTodoDate = $entry.DateKey
      }
    }
  }

  if ($null -eq $targetTodo) {
    $overdueMatch = $visibleOverdue | Where-Object { $_.Text -eq $query -or "$($_.DateKey)  $($_.Text)" -eq $query } | Select-Object -First 1
    if ($null -ne $overdueMatch) {
      $targetTodo = $overdueMatch.Text
      $targetTodoDate = $overdueMatch.DateKey
    }
  }
  if ($null -eq $targetTodo) {
    $overdueMatch = $visibleOverdue | Where-Object { $_.Text -like "*$query*" -or "$($_.DateKey)  $($_.Text)" -like "*$query*" } | Select-Object -First 1
    if ($null -ne $overdueMatch) {
      $targetTodo = $overdueMatch.Text
      $targetTodoDate = $overdueMatch.DateKey
    }
  }
  if ($null -eq $targetTodo -and $null -eq $targetReminder) {
    $entry = $visibleTodoEntries | Where-Object { $_.Text -eq $query } | Select-Object -First 1
    if ($null -ne $entry) {
      if ($entry.IsReminder) {
        $targetReminder = $entry.Reminder
      } else {
        $targetTodo = $entry.Text
        $targetTodoDate = $entry.DateKey
      }
    }
  }
  if ($null -eq $targetTodo -and $null -eq $targetReminder) {
    $entry = $visibleTodoEntries | Where-Object { $_.Text -like "*$query*" } | Select-Object -First 1
    if ($null -ne $entry) {
      if ($entry.IsReminder) {
        $targetReminder = $entry.Reminder
      } else {
        $targetTodo = $entry.Text
        $targetTodoDate = $entry.DateKey
      }
    }
  }

  if ($null -ne $targetTodo) {
    if ($targetTodoDate -eq $dateKey) {
      $today.pending = @(@($today.pending) | Where-Object { $_ -ne $targetTodo })
      $today.inProgress = @(@($today.inProgress) | Where-Object { $_ -ne $targetTodo })
      if (@($today.hidden) -notcontains $targetTodo) {
        $today.hidden = @(@($today.hidden) + $targetTodo)
      }
    } else {
      $sourceDay = Ensure-Today $data $targetTodoDate
      $sourceDay.pending = @(@($sourceDay.pending) | Where-Object { $_ -ne $targetTodo })
      if (@($sourceDay.hidden) -notcontains $targetTodo) {
        $sourceDay.hidden = @(@($sourceDay.hidden) + $targetTodo)
      }
    }
    Save-Data $data
    return $true
  }

  if ($null -eq $targetReminder) {
    $targetReminder = $visibleReminders | Where-Object { $_.Text -eq $query } | Select-Object -First 1
  }
  if ($null -eq $targetReminder) {
    $targetReminder = $visibleReminders | Where-Object { $_.Text -like "*$query*" } | Select-Object -First 1
  }
  if ($null -eq $targetReminder) { return $false }

  $removed = Remove-ReminderRule $data $targetReminder
  if ($removed) {
    Save-Data $data
    return $true
  }
  return $false
}

function Invoke-InputCommand($commandText) {
  $command = $commandText.Trim()
  if ([string]::IsNullOrWhiteSpace($command)) { return $false }
  $matchCommand = $command.Replace("ｏ", "o").Replace("Ｏ", "O").Replace("ｋ", "k").Replace("Ｋ", "K")

  if ($matchCommand -match "^删除\s*(.+)$") {
    return Remove-WorkItem $matches[1].Trim()
  } elseif ($matchCommand -match "^(.+?)\s*删除$") {
    return Remove-WorkItem $matches[1].Trim()
  } elseif ($matchCommand -match "^(便签|笔记)\s*(.+)$") {
    return Add-Note $matches[2].Trim()
  } elseif ($matchCommand -match "^加入\s*(.+)$") {
    $item = $matches[1].Trim()
    if (Try-AddRelativeDateTodoCommand $item) { return $true }
    if (Try-AddDailyTodoCommand $item) { return $true }
    return Add-TodayTodo $item
  } elseif ($matchCommand -match "^完成\s*(.+)$") {
    return Complete-TodayTodo $matches[1].Trim()
  } elseif ($matchCommand -match "^(.+?)\s*((?:o\s*k\s*)+|完成|好了|完事了)$") {
    return Complete-TodayTodo $matches[1].Trim()
  } elseif ($matchCommand -match "^(.+?)\s*(ing|ING)$") {
    return Start-TodayTodo $matches[1].Trim()
  } elseif (Try-AddReminderCommand $matchCommand) {
    return $true
  } elseif (Try-AddRelativeDateTodoCommand $matchCommand) {
    return $true
  } elseif (Try-AddDailyTodoCommand $matchCommand) {
    return $true
  } else {
    return Add-TodayTodo $command
  }
}

function Get-TodoText {
  $snapshot = Get-DataSnapshot
  $overdueTodos = @($snapshot.OverdueTodos)
  $inProgress = @($snapshot.InProgress)
  $completed = @($snapshot.Completed)
  $todoEntries = @(Get-TodayTodoEntries $snapshot)
  $todoItems = @($todoEntries | ForEach-Object { $_.Text })

  $lines = @()

  if ($overdueTodos.Count -gt 0) {
    $lines += "过期待办："
    for ($i = 0; $i -lt $overdueTodos.Count; $i++) {
      $lines += "$($i + 1). $(Format-ShortDate $overdueTodos[$i].DateKey)  $($overdueTodos[$i].Text)"
    }
    $lines += ""
  }

  if ($inProgress.Count -gt 0) {
    $inProgressStart = $overdueTodos.Count + 1
    $lines += "进行中："
    for ($i = 0; $i -lt $inProgress.Count; $i++) {
      $lines += "$($inProgressStart + $i). $($inProgress[$i])"
    }
    $lines += ""
  }

  $todoStart = $overdueTodos.Count + $inProgress.Count + 1
  $lines += "今日待办："

  if ($todoItems.Count -eq 0) {
    $lines += "暂无"
  } else {
    for ($i = 0; $i -lt $todoItems.Count; $i++) {
      $lines += "$($todoStart + $i). $($todoItems[$i])"
    }
  }

  if ($completed.Count -gt 0) {
    $completedTitle = if ($script:showCompletedOnTodo) { "已完成：▼ $($completed.Count)条，点击收起" } else { "已完成：▶ $($completed.Count)条，点击展开" }
    $lines += @("", $completedTitle)
    if ($script:showCompletedOnTodo) {
      for ($i = 0; $i -lt $completed.Count; $i++) {
        $lines += "$($i + 1). $($completed[$i])"
      }
    }
  }

  return ($lines -join [Environment]::NewLine)
}

function Get-ReminderObjects($snapshot, $includeFuture) {
  $now = $snapshot.Now
  $dateKey = $snapshot.DateKey
  $data = $snapshot.Data
  $completed = @($snapshot.Completed)

  $lines = @()
  if ($null -ne $data.PSObject.Properties["dailyImportantReminders"]) {
    foreach ($reminder in @($data.dailyImportantReminders)) {
      if ([string]::IsNullOrWhiteSpace($reminder.text)) { continue }

      $startDate = $reminder.startDate
      if ([string]::IsNullOrWhiteSpace($startDate)) {
        $startDate = "1900-01-01"
      }
      if ($dateKey -lt $startDate -and -not $includeFuture) { continue }

      $text = "$($reminder.text)"
      $oldText = "最重要：每天  $($reminder.text)"
      if (-not $includeFuture -and ($completed -contains $text -or $completed -contains "今日已完成：$text" -or $completed -contains $oldText -or $completed -contains "今日已完成：$oldText")) { continue }
      $lines += [pscustomobject]@{
        SortKey = "0-0000"
        Text = $text
        Type = "dailyImportant"
        Time = ""
        ReminderText = $reminder.text
        At = $null
        DateKey = $startDate
      }
    }
  }

  if ($null -ne $data.PSObject.Properties["dateImportantReminders"]) {
    foreach ($reminder in @($data.dateImportantReminders)) {
      if ([string]::IsNullOrWhiteSpace($reminder.date) -or [string]::IsNullOrWhiteSpace($reminder.text)) { continue }
      if ($reminder.date -lt $dateKey) { continue }
      if ($reminder.date -ne $dateKey -and -not $includeFuture) { continue }

      $text = "$(Format-ShortDate $reminder.date)  $($reminder.text)"
      if ($reminder.date -eq $dateKey) {
        $text = "最重要：今天  $($reminder.text)"
      }
      if (-not $includeFuture -and ($completed -contains $text -or $completed -contains "今日已完成：$text")) { continue }
      $lines += [pscustomobject]@{
        SortKey = "0-$($reminder.date)"
        Text = $text
        Type = "dateImportant"
        Time = ""
        ReminderText = $reminder.text
        At = $null
        DateKey = $reminder.date
      }
    }
  }

  if ($null -ne $data.PSObject.Properties["monthlyReminders"]) {
    foreach ($reminder in @($data.monthlyReminders)) {
      if ([string]::IsNullOrWhiteSpace($reminder.text)) { continue }
      $day = [int]$reminder.day
      if ($day -lt 1 -or $day -gt 31) { continue }

      $isToday = ($now.Day -eq $day)
      if (-not $isToday -and -not $includeFuture) { continue }

      $text = "每月$($day)号  $($reminder.text)"
      if (-not $includeFuture -and ($completed -contains $text -or $completed -contains "今日已完成：$text")) { continue }
      $sortKey = if ($isToday) { "0-monthly-{0:00}" -f $day } else { "5-monthly-{0:00}" -f $day }
      $lines += [pscustomobject]@{
        SortKey = $sortKey
        Text = $text
        Type = "monthly"
        Time = ""
        ReminderText = $reminder.text
        At = $null
        DateKey = "monthly-{0:00}" -f $day
        Day = $day
        OriginalText = $reminder.text
      }
    }
  }

  foreach ($reminder in @($data.dailyReminders)) {
    $times = @()
    if ($null -ne $reminder.PSObject.Properties["times"]) {
      $times += @($reminder.times)
    }
    if ($null -ne $reminder.PSObject.Properties["hours"]) {
      $times += @($reminder.hours | ForEach-Object { "{0:00}:00" -f [int]$_ })
    }

    foreach ($time in $times) {
      $reminderAt = [datetime]::ParseExact("$dateKey $time", "yyyy-MM-dd HH:mm", $null)
      $sortGroup = if ($reminderAt -le $now) { "1" } else { "3" }
      $text = "$time  $($reminder.text)"
      $oldText = "每天 $time  $($reminder.text)"
      if (-not $includeFuture -and ($completed -contains $text -or $completed -contains "今日已完成：$text" -or $completed -contains $oldText -or $completed -contains "今日已完成：$oldText")) { continue }
      $lines += [pscustomobject]@{
        SortKey = "$sortGroup-$time"
        Text = $text
        Type = "daily"
        Time = $time
        ReminderText = $reminder.text
        At = $null
        DateKey = $dateKey
      }
    }
  }

  foreach ($reminder in @($data.weeklyReminders)) {
    $dayNames = @($reminder.days)
    $isToday = $dayNames -contains $now.DayOfWeek.ToString()
    $dayLabel = ($dayNames | ForEach-Object {
      switch ($_) {
        "Monday" { "周一" }
        "Tuesday" { "周二" }
        "Wednesday" { "周三" }
        "Thursday" { "周四" }
        "Friday" { "周五" }
        "Saturday" { "周六" }
        "Sunday" { "周日" }
        default { $_ }
      }
    }) -join "/"
    $label = "$dayLabel $($reminder.time)  $($reminder.text)"
    $oldLabel = "每周$dayLabel $($reminder.time)  $($reminder.text)"
    if (-not $includeFuture -and ($completed -contains $label -or $completed -contains "今日已完成：$label" -or $completed -contains $oldLabel -or $completed -contains "今日已完成：$oldLabel")) { continue }

    if ($isToday) {
      $reminderAt = [datetime]::ParseExact("$dateKey $($reminder.time)", "yyyy-MM-dd HH:mm", $null)
      $sortGroup = if ($reminderAt -le $now) { "1" } else { "3" }
      $lines += [pscustomobject]@{
        SortKey = "$sortGroup-$($reminder.time)"
        Text = $label
        Type = "weekly"
        Time = $reminder.time
        ReminderText = $reminder.text
        At = $null
        DateKey = $dateKey
      }
    } elseif ($includeFuture) {
      $lines += [pscustomobject]@{
        SortKey = "4-$($reminder.time)"
        Text = $label
        Type = "weekly"
        Time = $reminder.time
        ReminderText = $reminder.text
        At = $null
        DateKey = $dateKey
      }
    }
  }

  foreach ($reminder in @($data.oneTimeReminders)) {
    $reminderAt = [datetime]::ParseExact($reminder.at, "yyyy-MM-dd HH:mm", $null)
    if ($reminderAt.ToString("yyyy-MM-dd") -eq $dateKey) {
      $time = $reminderAt.ToString("HH:mm")
      $sortGroup = if ($reminderAt -le $now) { "1" } else { "3" }
      $text = "今天 $time  $($reminder.text)"
      if ($completed -contains $text -or $completed -contains "今日已完成：$text") { continue }
      $lines += [pscustomobject]@{
        SortKey = "$sortGroup-$time"
        Text = $text
        Type = "oneTime"
        Time = $time
        ReminderText = $reminder.text
        At = $reminder.at
        DateKey = $dateKey
      }
    } elseif ($includeFuture -and $reminderAt -ge $now.AddMinutes(-30)) {
      $text = "$(Format-ShortDate $reminderAt.ToString('yyyy-MM-dd')) $($reminderAt.ToString('HH:mm'))  $($reminder.text)"
      $lines += [pscustomobject]@{
        SortKey = "4-$($reminderAt.ToString('yyyy-MM-dd HH:mm'))"
        Text = $text
        Type = "oneTime"
        Time = $reminderAt.ToString("HH:mm")
        ReminderText = $reminder.text
        At = $reminder.at
        DateKey = $reminderAt.ToString("yyyy-MM-dd")
      }
    }
  }

  if ($includeFuture) {
    foreach ($property in @($data.days.PSObject.Properties | Sort-Object Name)) {
      $dayKey = $property.Name
      if ($dayKey -le $dateKey) { continue }

      $day = $property.Value
      $pending = @($day.pending)
      $completed = @($day.completed)
      $hidden = @()
      if ($null -ne $day.PSObject.Properties["hidden"]) {
        $hidden = @($day.hidden)
      }

      foreach ($item in $pending) {
        if ([string]::IsNullOrWhiteSpace($item)) { continue }
        if ($completed -contains $item) { continue }
        if ($hidden -contains $item) { continue }

        $time = ""
        $content = $item
        if ($item -match "^\s*(\d{1,2}:\d{2})(?:[-~至]\d{1,2}:\d{2})?\s*(.+)$") {
          $time = $matches[1]
          $content = $matches[2].Trim()
        }

        if ($time) {
          $text = "$(Format-ShortDate $dayKey) $time  $content"
          $sortKey = "4-$dayKey $time"
        } else {
          $text = "$(Format-ShortDate $dayKey) 待办  $content"
          $sortKey = "4-$dayKey 99:99"
        }

        $lines += [pscustomobject]@{
          SortKey = $sortKey
          Text = $text
          Type = "futureTodo"
          Time = $time
          ReminderText = $content
          At = $null
          DateKey = $dayKey
          Day = $null
          OriginalText = $item
        }
      }
    }
  }

  $seen = @{}
  $deduped = @()
  foreach ($line in @($lines | Sort-Object SortKey)) {
    $dayPart = "$($line.DateKey)"
    $timePart = "$($line.Time)"
    $contentPart = "$(Normalize-DedupeKey $line.ReminderText)"
    $key = "$dayPart|$timePart|$contentPart"
    if ($seen.ContainsKey($key)) { continue }
    $seen[$key] = $true
    $deduped += [pscustomobject]@{
      Text = $line.Text
      SortKey = $line.SortKey
      Type = $line.Type
      Time = $line.Time
      ReminderText = $line.ReminderText
      At = $line.At
      DateKey = $line.DateKey
      Day = $line.Day
      OriginalText = $line.OriginalText
    }
  }

  return $deduped
}

function Get-ReminderLines($snapshot, $includeFuture) {
  return @(Get-ReminderObjects $snapshot $includeFuture | ForEach-Object { $_.Text })
}

function Get-ReminderText {
  $snapshot = Get-DataSnapshot
  $reminders = @(Get-ReminderObjects $snapshot $true)
  $futureItems = @($reminders | Where-Object {
    $_.Type -in @("futureTodo", "dateImportant", "oneTime") -and $_.DateKey -ne $snapshot.DateKey
  } | Sort-Object `
    @{ Expression = { if ($_.DateKey -match "^\d{4}-\d{2}-\d{2}$") { $_.DateKey } else { "9999-12-31" } } }, `
    @{ Expression = { if ([string]::IsNullOrWhiteSpace($_.Time)) { "99:99" } else { $_.Time } } }, `
    @{ Expression = { $_.Text } })
  $dailyItems = @($reminders | Where-Object {
    $_.Type -in @("dailyImportant", "daily")
  } | Sort-Object SortKey, Time, Text)
  $weeklyItems = @($reminders | Where-Object {
    $_.Type -eq "weekly"
  } | Sort-Object SortKey, Time, Text)
  $monthlyItems = @($reminders | Where-Object {
    $_.Type -eq "monthly"
  } | Sort-Object @{ Expression = { [int]$_.Day } }, Text)

  $lines = @()

  $lines += "未来待办："
  if ($futureItems.Count -gt 0) {
    for ($i = 0; $i -lt $futureItems.Count; $i++) {
      $lines += "$($i + 1). $($futureItems[$i].Text)"
    }
  } else {
    $lines += "暂无"
  }

  $lines += @("", "每日提醒：")
  if ($dailyItems.Count -gt 0) {
    for ($i = 0; $i -lt $dailyItems.Count; $i++) {
      $lines += "$($i + 1). $($dailyItems[$i].Text)"
    }
  } else {
    $lines += "暂无"
  }

  $lines += @("", "每周提醒：")
  if ($weeklyItems.Count -gt 0) {
    for ($i = 0; $i -lt $weeklyItems.Count; $i++) {
      $lines += "$($i + 1). $($weeklyItems[$i].Text)"
    }
  } else {
    $lines += "暂无"
  }

  $lines += @("", "每月提醒：")
  if ($monthlyItems.Count -gt 0) {
    for ($i = 0; $i -lt $monthlyItems.Count; $i++) {
      $lines += "$($i + 1). $($monthlyItems[$i].Text)"
    }
  } else {
    $lines += "暂无"
  }

  return ($lines -join [Environment]::NewLine)
}

function Get-NotesText {
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -ne $data.PSObject.Properties["noteText"]) {
    return "$($data.noteText)"
  }

  if ($null -ne $data.PSObject.Properties["notes"]) {
    $notes = @($data.notes)
    if ($notes.Count -gt 0) {
    $ordered = @($notes | Sort-Object at -Descending)
      $lines = @()
    for ($i = 0; $i -lt $ordered.Count; $i++) {
        $lines += "$($ordered[$i].text)"
        $lines += "$($ordered[$i].at)"
        $lines += ""
      }
      return ($lines -join [Environment]::NewLine).Trim()
    }
  }

  return ""
}

function Save-NotesText($content) {
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -eq $data.PSObject.Properties["noteText"]) {
    $data | Add-Member -MemberType NoteProperty -Name "noteText" -Value ""
  }
  if ($null -eq $data.PSObject.Properties["notes"]) {
    $data | Add-Member -MemberType NoteProperty -Name "notes" -Value @()
  }
  $data.noteText = "$content"
  Save-Data $data
}

function Should-ShowNoteTipToday {
  $dateKey = (Get-Date).ToString("yyyy-MM-dd")
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($null -eq $data.PSObject.Properties["lastNoteTipDate"]) {
    $data | Add-Member -MemberType NoteProperty -Name "lastNoteTipDate" -Value ""
  }

  if ($data.lastNoteTipDate -eq $dateKey) {
    return $false
  }

  $data.lastNoteTipDate = $dateKey
  Save-Data $data
  return $true
}

function Get-VersionText {
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $lines = @("更新版本", "")

  $logs = @()
  if ($null -ne $data.PSObject.Properties["versionLog"]) {
    $cutoff = (Get-Date).AddDays(-7)
    $logs = @($data.versionLog | Where-Object {
      try { [datetime]::Parse($_.at) -ge $cutoff } catch { $true }
    } | Sort-Object at -Descending)
  }

  if ($logs.Count -eq 0) {
    $lines += "最近七天没有定时提醒更新记录 (｡•̀ᴗ-)✧"
  } else {
    foreach ($log in $logs) {
      $lines += "- $($log.at)  $($log.action)：$($log.text)"
    }
  }

  return ($lines -join [Environment]::NewLine)
}

function Get-HistoryDates {
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $dates = @()
  foreach ($date in @($data.days.PSObject.Properties.Name | Sort-Object -Descending)) {
    $completed = @($data.days.$date.completed)
    if ($completed.Count -gt 0) {
      $dates += [pscustomobject]@{
        DateKey = $date
        Count = $completed.Count
      }
    }
  }
  return $dates
}

function Get-CompletedHistoryText {
  $data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $selectedDate = ""
  if ($null -ne $script:selectedHistoryDate) { $selectedDate = [string]$script:selectedHistoryDate }

  if ([string]::IsNullOrWhiteSpace($selectedDate)) {
    $lines = @("历史记录", "点左上角日期，或点小猫菜单，可以快捷选择日期。", "")
    $dates = @($data.days.PSObject.Properties.Name | Sort-Object -Descending)
  } else {
    $lines = @("历史记录：$selectedDate", "点左上角日期，或点小猫菜单，可以切换日期。", "")
    $dates = @($selectedDate)
  }

  $hasAny = $false

  foreach ($date in $dates) {
    $day = $data.days.$date
    if ($null -eq $day) { continue }
    $completed = @($day.completed)
    if ($completed.Count -eq 0) { continue }

    $hasAny = $true
    $lines += "$date  ฅ^•ﻌ•^ฅ"
    for ($i = 0; $i -lt $completed.Count; $i++) {
      $lines += "$($i + 1). $($completed[$i])"
    }
    $lines += ""
  }

  if (-not $hasAny) {
    $lines += "暂无"
  }

  return ($lines -join [Environment]::NewLine)
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "待办提醒 頑張って！"
$form.Size = New-Object System.Drawing.Size(300, 500)
$form.StartPosition = "Manual"
$form.Location = New-Object System.Drawing.Point(40, 80)
$form.TopMost = $true
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::Sizable
$form.MinimumSize = New-Object System.Drawing.Size(240, 420)
$form.BackColor = [System.Drawing.Color]::FromArgb(255, 251, 245)
$form.Icon = New-AppIcon

$font = New-Object System.Drawing.Font("SimSun", 10)
$form.Font = $font

$script:contentMargin = 18
function Get-ContentWidth {
  return [Math]::Max(180, $form.ClientSize.Width - ($script:contentMargin * 2))
}

$toolbar = New-Object System.Windows.Forms.Panel
$toolbar.Dock = "Top"
$toolbar.Height = 50
$toolbar.BackColor = [System.Drawing.Color]::FromArgb(255, 246, 235)
$toolbar.AutoScroll = $false

$script:isLocked = $true

$lockDot = New-Object System.Windows.Forms.Panel
$lockDot.Location = New-Object System.Drawing.Point(8, 15)
$lockDot.Size = New-Object System.Drawing.Size(18, 18)
$lockDot.BackColor = $toolbar.BackColor
$lockDot.Cursor = [System.Windows.Forms.Cursors]::Hand
$lockDot.Add_Paint({
  param($sender, $e)
  $e.Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 248))
  $pinBrush = if ($script:isLocked) {
    New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(98, 166, 142))
  } else {
    New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(236, 213, 184))
  }
  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(82, 92, 110), 1)
  $pinPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(82, 92, 110), 1)

  $e.Graphics.FillEllipse($bgBrush, 1, 1, 16, 16)
  $e.Graphics.DrawEllipse($linePen, 1, 1, 16, 16)
  $e.Graphics.FillEllipse($pinBrush, 6, 3, 6, 6)
  $e.Graphics.DrawEllipse($pinPen, 6, 3, 6, 6)
  $e.Graphics.DrawLine($pinPen, 9, 9, 9, 14)
  $e.Graphics.DrawLine($pinPen, 6, 11, 12, 11)
  $e.Graphics.DrawLine($pinPen, 9, 14, 7, 17)
  $e.Graphics.DrawLine($pinPen, 9, 14, 11, 17)

  $bgBrush.Dispose()
  $pinBrush.Dispose()
  $linePen.Dispose()
  $pinPen.Dispose()
})

function Apply-LockState {
  $form.TopMost = $script:isLocked
  if ($script:isLocked) {
    $form.TopMost = $false
    $form.TopMost = $true
    $form.Activate()
  }
  $lockDot.Invalidate()
  if ($null -ne $toolTip) {
    $lockText = if ($script:isLocked) { "已置顶：左键取消，右键更多" } else { "未置顶：左键置顶，右键更多" }
    $toolTip.SetToolTip($lockDot, $lockText)
  }
}

function Toggle-Lock {
  $script:isLocked = -not $script:isLocked
  Apply-LockState
}

$lockDot.Add_MouseUp({
  param($sender, $eventArgs)
  if ($eventArgs.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
    Toggle-Lock
  } elseif ($eventArgs.Button -eq [System.Windows.Forms.MouseButtons]::Right -and $null -ne $script:catMenu) {
    $script:catMenu.Show($lockDot, 0, $lockDot.Height)
  }
})

$dateLabel = New-Object System.Windows.Forms.Label
$dateLabel.Text = Get-DateNavText
$dateLabel.AutoSize = $false
$dateLabel.TextAlign = "MiddleLeft"
$dateLabel.Font = New-Object System.Drawing.Font("SimSun", 8.5, [System.Drawing.FontStyle]::Bold)
$dateLabel.ForeColor = [System.Drawing.Color]::FromArgb(89, 103, 115)
$dateLabel.BackColor = $toolbar.BackColor
$dateLabel.Location = New-Object System.Drawing.Point(29, 11)
$dateLabel.Size = New-Object System.Drawing.Size(34, 28)
$dateLabel.Cursor = [System.Windows.Forms.Cursors]::Hand
$dateLabel.Add_Click({
  if ($script:currentView -eq "completed") {
    Show-HistoryDateMenu $dateLabel
  }
})

$toolTip = New-Object System.Windows.Forms.ToolTip
$toolTip.SetToolTip($lockDot, "已置顶：左键取消，右键更多")
$toolTip.SetToolTip($dateLabel, "历史页可点这里筛选日期")

$todoButton = New-Object System.Windows.Forms.Button
$todoButton.Text = "待办"
$todoButton.Width = 34
$todoButton.Height = 28
$todoButton.Location = New-Object System.Drawing.Point(66, 11)

$reminderButton = New-Object System.Windows.Forms.Button
$reminderButton.Text = "提醒"
$reminderButton.Width = 34
$reminderButton.Height = 28
$reminderButton.Location = New-Object System.Drawing.Point(102, 11)

$noteButton = New-Object System.Windows.Forms.Button
$noteButton.Text = "便签"
$noteButton.Width = 34
$noteButton.Height = 28
$noteButton.Location = New-Object System.Drawing.Point(138, 11)

$completedButton = New-Object System.Windows.Forms.Button
$completedButton.Text = "历史"
$completedButton.Width = 34
$completedButton.Height = 28
$completedButton.Location = New-Object System.Drawing.Point(174, 11)

$versionButton = New-Object System.Windows.Forms.Button
$versionButton.Text = "更新"
$versionButton.Width = 34
$versionButton.Height = 28
$versionButton.Location = New-Object System.Drawing.Point(210, 11)

$refreshButton = New-Object System.Windows.Forms.Button
$refreshButton.Text = "刷新"
$refreshButton.Width = 34
$refreshButton.Height = 28
$refreshButton.Location = New-Object System.Drawing.Point(246, 11)

foreach ($button in @($todoButton, $reminderButton, $noteButton, $completedButton, $versionButton, $refreshButton)) {
  $button.Font = New-Object System.Drawing.Font("SimSun", 8, [System.Drawing.FontStyle]::Regular)
  $button.FlatStyle = "Flat"
  $button.BackColor = [System.Drawing.Color]::FromArgb(255, 253, 248)
  $button.ForeColor = [System.Drawing.Color]::FromArgb(69, 80, 92)
  $button.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(231, 213, 190)
  $button.FlatAppearance.BorderSize = 0
  $button.FlatAppearance.MouseOverBackColor = [System.Drawing.Color]::FromArgb(255, 241, 222)
  $button.FlatAppearance.MouseDownBackColor = [System.Drawing.Color]::FromArgb(246, 226, 204)
  Set-RoundedControl $button 8
  Add-RoundedBorder $button 10 ([System.Drawing.Color]::FromArgb(226, 205, 178))
  $button.Add_Resize({
    param($sender, $eventArgs)
    Set-RoundedControl $sender 8
  })
}

$todoButton.Tag = "待办"
$reminderButton.Tag = "提醒"
$noteButton.Tag = "便签"
$completedButton.Tag = "历史"
$versionButton.Tag = "更新"
$refreshButton.Tag = "刷新"

$dateLabel.Name = "dateLabel"
$todoButton.Name = "todoButton"
$reminderButton.Name = "reminderButton"
$noteButton.Name = "noteButton"
$completedButton.Name = "completedButton"
$versionButton.Name = "versionButton"
$refreshButton.Name = "refreshButton"

$navScroll = New-Object System.Windows.Forms.HScrollBar
$navScroll.Location = New-Object System.Drawing.Point(28, 39)
$navScroll.Size = New-Object System.Drawing.Size(252, 12)
$navScroll.Anchor = "Left,Right,Bottom"
$navScroll.SmallChange = 8
$navScroll.LargeChange = 40
$navScroll.Minimum = 0
$navScroll.Value = 0

$script:navControls = @($dateLabel, $todoButton, $reminderButton, $noteButton, $completedButton, $versionButton, $refreshButton)
$script:navBaseX = @{
  dateLabel = 29
  todoButton = 66
  reminderButton = 102
  noteButton = 138
  completedButton = 174
  versionButton = 210
  refreshButton = 246
}
$script:navContentWidth = 280

function Apply-NavScroll {
  $offset = $navScroll.Value
  foreach ($control in $script:navControls) {
    $baseX = $script:navBaseX[$control.Name]
    $control.Location = New-Object System.Drawing.Point($baseX - $offset, $control.Location.Y)
  }
}

function Update-NavScrollRange {
  $visibleWidth = [Math]::Max(1, $navScroll.ClientSize.Width)
  $maxOffset = [Math]::Max(0, $script:navContentWidth - $visibleWidth + 8)
  $navScroll.LargeChange = [Math]::Min(80, [Math]::Max(24, $visibleWidth))
  $navScroll.Maximum = $maxOffset + $navScroll.LargeChange - 1
  $navScroll.Enabled = ($maxOffset -gt 0)
  if ($navScroll.Value -gt $maxOffset) {
    $navScroll.Value = $maxOffset
  }
  Apply-NavScroll
}

$navScroll.Add_ValueChanged({ Apply-NavScroll })
$navScroll.Visible = $false
$toolbar.Add_MouseWheel({
  param($sender, $e)
  $step = if ($e.Delta -lt 0) { $navScroll.SmallChange } else { -$navScroll.SmallChange }
  $maxOffset = [Math]::Max(0, $navScroll.Maximum - $navScroll.LargeChange + 1)
  $nextValue = [Math]::Max($navScroll.Minimum, [Math]::Min($maxOffset, $navScroll.Value + $step))
  if ($nextValue -ne $navScroll.Value) { $navScroll.Value = $nextValue }
})
$toolbar.Add_Resize({ Update-NavScrollRange })

$textBox = New-Object System.Windows.Forms.RichTextBox
$textBox.Multiline = $true
$textBox.ReadOnly = $true
$textBox.ScrollBars = "Vertical"
$textBox.BorderStyle = "None"
$textBox.WordWrap = $true
$textBox.BackColor = [System.Drawing.Color]::FromArgb(255, 254, 250)
$textBox.ForeColor = [System.Drawing.Color]::FromArgb(33, 37, 43)
$textBox.Font = New-Object System.Drawing.Font("SimSun", 9.5, [System.Drawing.FontStyle]::Regular)
$textBox.Location = New-Object System.Drawing.Point(18, 66)
$textBox.Size = New-Object System.Drawing.Size((Get-ContentWidth), 328)
$textBox.Anchor = "Top,Bottom,Left,Right"
$textBox.Add_Enter({
  if ($script:currentView -eq "notes" -and $textBox.ForeColor -eq [System.Drawing.Color]::Gray -and $textBox.Text -eq $script:notePlaceholder) {
    $script:loadingNote = $true
    $textBox.Text = ""
    $textBox.ForeColor = [System.Drawing.Color]::FromArgb(33, 37, 43)
    $script:loadingNote = $false
  }
})
$textBox.Add_Leave({
  if ($script:currentView -eq "notes" -and [string]::IsNullOrWhiteSpace($textBox.Text)) {
    Save-CurrentNoteIfNeeded
    $script:loadingNote = $true
    $textBox.Text = $script:notePlaceholder
    $textBox.ForeColor = [System.Drawing.Color]::Gray
    $script:loadingNote = $false
    $script:noteDirty = $false
  }
})
$textBox.Add_TextChanged({
  if ($script:currentView -eq "notes" -and -not $script:loadingNote) {
    $script:noteDirty = $true
  }
})
$textBox.Add_MouseDown({
  param($sender, $e)
  if ($script:currentView -ne "todos") { return }

  $charIndex = $textBox.GetCharIndexFromPosition($e.Location)
  if ($charIndex -lt 0 -or $charIndex -ge $textBox.TextLength) { return }
  $lineIndex = $textBox.GetLineFromCharIndex($charIndex)
  if ($lineIndex -lt 0 -or $lineIndex -ge $textBox.Lines.Count) { return }

  $lineText = $textBox.Lines[$lineIndex].Trim()
  if ($lineText.StartsWith("已完成：")) {
    $script:showCompletedOnTodo = -not $script:showCompletedOnTodo
    Refresh-Board
  }
})

$inputSeparator = New-Object System.Windows.Forms.Panel
$inputSeparator.Location = New-Object System.Drawing.Point(18, 394)
$inputSeparator.Size = New-Object System.Drawing.Size((Get-ContentWidth), 1)
$inputSeparator.Anchor = "Bottom,Left,Right"
$inputSeparator.BackColor = [System.Drawing.Color]::FromArgb(225, 218, 204)

$inputPanel = New-Object System.Windows.Forms.Panel
$inputPanel.Location = New-Object System.Drawing.Point(18, 402)
$inputPanel.Size = New-Object System.Drawing.Size((Get-ContentWidth), 26)
$inputPanel.Anchor = "Bottom,Left,Right"
$inputPanel.BackColor = [System.Drawing.Color]::FromArgb(255, 253, 248)
Set-RoundedControl $inputPanel 8
Add-RoundedBorder $inputPanel 10 ([System.Drawing.Color]::FromArgb(226, 205, 178))
$inputPanel.Add_Resize({
  param($sender, $eventArgs)
  Set-RoundedControl $sender 8
})

$inputBox = New-Object System.Windows.Forms.TextBox
$inputBox.Font = New-Object System.Drawing.Font("SimSun", 9)
$inputBox.Location = New-Object System.Drawing.Point(10, 5)
$inputBox.Size = New-Object System.Drawing.Size(242, 18)
$inputBox.Anchor = "Top,Left,Right"
$inputBox.BorderStyle = "None"
$inputBox.BackColor = [System.Drawing.Color]::FromArgb(255, 253, 248)
$inputBox.Text = "写点什么吧 (｡･ω･｡)ﾉ"
$inputBox.ForeColor = [System.Drawing.Color]::Gray
$inputBox.Add_Enter({
  if ($inputBox.ForeColor -eq [System.Drawing.Color]::Gray) {
    $inputBox.Text = ""
    $inputBox.ForeColor = [System.Drawing.Color]::Black
  }
})
$inputBox.Add_Leave({
  if ([string]::IsNullOrWhiteSpace($inputBox.Text)) {
    $inputBox.Text = "写点什么吧 (｡･ω･｡)ﾉ"
    $inputBox.ForeColor = [System.Drawing.Color]::Gray
  }
})
$inputBox.Add_KeyDown({
  param($sender, $e)

  if ($e.KeyCode -eq [System.Windows.Forms.Keys]::Enter) {
    $e.SuppressKeyPress = $true
    $text = $inputBox.Text.Trim()

    if ($text -and $text -ne "写点什么吧 (｡･ω･｡)ﾉ") {
      try {
        $script:lastInputStatus = ""
        $success = Invoke-InputCommand $text
        if ($success) {
          $inputBox.Text = ""
          $inputBox.ForeColor = [System.Drawing.Color]::Black
          Refresh-Board
          if ([string]::IsNullOrWhiteSpace($script:lastInputStatus)) {
            Set-InlineStatus "已成功记录 (๑•̀ㅂ•́)و✧" $true
          } else {
            Set-InlineStatus $script:lastInputStatus $true
          }
        } else {
          Set-InlineStatus "没有记录成功，可能重复或没匹配到 (｡•́︿•̀｡)" $false
        }
      } catch {
        Set-InlineStatus "记录失败了 (｡•́︿•̀｡)" $false
      }
    }
  }
})
$inputPanel.Controls.Add($inputBox)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = ""
$statusLabel.AutoSize = $false
$statusLabel.Location = New-Object System.Drawing.Point(18, 434)
$statusLabel.Size = New-Object System.Drawing.Size(200, 18)
$statusLabel.Anchor = "Bottom,Left,Right"
$statusLabel.TextAlign = "MiddleLeft"
$statusLabel.Font = New-Object System.Drawing.Font("SimSun", 8.5)
$statusLabel.BackColor = $form.BackColor

$statusTimer = New-Object System.Windows.Forms.Timer
$statusTimer.Interval = 5000
$statusTimer.Add_Tick({
  $statusTimer.Stop()
  $statusLabel.Text = ""
})

$script:currentView = "todos"
$script:selectedHistoryDate = ""
$script:loadingNote = $false
$script:noteDirty = $false
$script:notePlaceholder = "写点什么吧 (｡･ω･｡)ﾉ"
$script:showCompletedOnTodo = $false
$script:lastInputStatus = ""

$noteSaveTimer = New-Object System.Windows.Forms.Timer
$noteSaveTimer.Interval = 3000
$noteSaveTimer.Add_Tick({
  Save-CurrentNoteIfNeeded $false
})

function Set-InlineStatus($message, $isSuccess) {
  $statusTimer.Stop()
  $statusLabel.Text = $message
  if ($isSuccess) {
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(52, 128, 92)
  } else {
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(180, 72, 72)
  }
  $statusTimer.Start()
}

function Update-NavButtons {
  switch ($script:currentView) {
    "todos" { $script:activeNavButton = $todoButton }
    "reminders" { $script:activeNavButton = $reminderButton }
    "notes" { $script:activeNavButton = $noteButton }
    "completed" { $script:activeNavButton = $completedButton }
    "version" { $script:activeNavButton = $versionButton }
    default { $script:activeNavButton = $null }
  }

  foreach ($button in @($todoButton, $reminderButton, $noteButton, $completedButton, $versionButton, $refreshButton)) {
    $button.Text = "$($button.Tag)"
    $button.TextAlign = "MiddleCenter"
    if ($button -eq $script:activeNavButton) {
      $button.BackColor = [System.Drawing.Color]::FromArgb(255, 238, 216)
    } else {
      $button.BackColor = [System.Drawing.Color]::FromArgb(255, 253, 248)
    }
    $button.Invalidate()
  }
}

function Clear-NoteStatusIfNeeded {
  if ($statusLabel.Text -like "便签*") {
    $statusTimer.Stop()
    $statusLabel.Text = ""
  }
}

function Save-CurrentNoteIfNeeded($showStatus = $true) {
  if ($script:currentView -ne "notes") { return }
  if (-not $script:noteDirty) { return }

  try {
    $content = $textBox.Text
    if ($textBox.ForeColor -eq [System.Drawing.Color]::Gray -and $content -eq $script:notePlaceholder) {
      $content = ""
    }
    Save-NotesText $content
    $script:noteDirty = $false
    if ($showStatus) {
    Set-InlineStatus "便签已自动保存 (｡･ω･｡)ﾉ" $true
    }
  } catch {
    if ($showStatus) {
      Set-InlineStatus "便签保存失败了 (｡•́︿•̀｡)" $false
    }
  }
}

function Set-NotesLayout($enabled) {
  $contentWidth = Get-ContentWidth
  if ($enabled) {
    $inputPanel.Visible = $false
    $inputSeparator.Visible = $false
    $textBox.Size = New-Object System.Drawing.Size($contentWidth, 366)
  } else {
    $showTodoInput = ($script:currentView -eq "todos")
    $inputPanel.Visible = $showTodoInput
    $inputSeparator.Visible = $showTodoInput
    if ($showTodoInput) {
      $textBox.Size = New-Object System.Drawing.Size($contentWidth, 328)
    } else {
      $textBox.Size = New-Object System.Drawing.Size($contentWidth, 366)
    }
  }
}

function Set-NotesView {
  Update-NavButtons
  $script:loadingNote = $true
  Set-NotesLayout $true
  $textBox.ReadOnly = $false
  $noteText = Get-NotesText
  if ([string]::IsNullOrWhiteSpace($noteText)) {
    $textBox.Text = $script:notePlaceholder
    $textBox.ForeColor = [System.Drawing.Color]::Gray
  } else {
    $textBox.Text = $noteText
    $textBox.ForeColor = [System.Drawing.Color]::FromArgb(33, 37, 43)
  }
  $textBox.SelectAll()
  $textBox.SelectionFont = New-Object System.Drawing.Font("SimSun", 9.5, [System.Drawing.FontStyle]::Regular)
  $textBox.SelectionBackColor = [System.Drawing.Color]::FromArgb(255, 254, 250)
  $textBox.BackColor = [System.Drawing.Color]::FromArgb(255, 254, 250)
  $textBox.Select($textBox.TextLength, 0)
  $script:loadingNote = $false
  $script:noteDirty = $false
  $noteSaveTimer.Start()
  if (Should-ShowNoteTipToday) {
    Set-InlineStatus "便签会每 3 秒自动保存 (｡･ω･｡)ﾉ" $true
  }
}

function Get-NavDateText {
  if ($script:currentView -eq "completed") {
    if (-not [string]::IsNullOrWhiteSpace($script:selectedHistoryDate)) {
      return (Format-ShortDate $script:selectedHistoryDate)
    }
    return "全部"
  }
  return Get-DateNavText
}

function Refresh-Board {
  $dateLabel.Text = Get-NavDateText
  Update-NavButtons
  if ($script:currentView -eq "completed") {
    Set-BoardText (Get-CompletedHistoryText)
  } elseif ($script:currentView -eq "reminders") {
    Set-BoardText (Get-ReminderText)
  } elseif ($script:currentView -eq "notes") {
    Save-CurrentNoteIfNeeded $false
  } elseif ($script:currentView -eq "version") {
    Set-BoardText (Get-VersionText)
  } else {
    Set-BoardText (Get-TodoText)
  }
}

function Highlight-Line($pattern, $color) {
  $start = 0
  while ($start -lt $textBox.TextLength) {
    $index = $textBox.Find($pattern, $start, [System.Windows.Forms.RichTextBoxFinds]::None)
    if ($index -lt 0) { break }
    $textBox.Select($index, $pattern.Length)
    $textBox.SelectionBackColor = $color
    $start = $index + $pattern.Length
  }
}

function Highlight-Regex($pattern, $color) {
  $matches = [regex]::Matches($textBox.Text, $pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
  foreach ($match in $matches) {
    $textBox.Select($match.Index, $match.Length)
    $textBox.SelectionBackColor = $color
  }
}

function Set-BoardText($content) {
  if ($script:currentView -ne "notes") {
    $noteSaveTimer.Stop()
  }
  Set-NotesLayout $false
  $textBox.ReadOnly = $true
  $textBox.ForeColor = [System.Drawing.Color]::FromArgb(33, 37, 43)
  $textBox.Text = $content
  $textBox.SelectAll()
  $textBox.SelectionFont = New-Object System.Drawing.Font("SimSun", 9.5, [System.Drawing.FontStyle]::Regular)
  $textBox.SelectionBackColor = [System.Drawing.Color]::FromArgb(255, 254, 250)

  $labelColor = [System.Drawing.Color]::FromArgb(255, 241, 198)
  $timeColor = [System.Drawing.Color]::FromArgb(224, 243, 238)

  if ($script:currentView -eq "todos") {
    Highlight-Regex "^(过期待办：|进行中：|今日待办：|已完成：.*)$" $labelColor
    Highlight-Regex "(?<!\d)\d{2}:\d{2}|周[一二三四五六日]\s+\d{2}:\d{2}|今天\s+\d{2}:\d{2}|\d{1,2}/\d{1,2}\s+\d{2}:\d{2}|\d{4}-\d{2}-\d{2}" $timeColor
  } elseif ($script:currentView -eq "reminders") {
    Highlight-Regex "^(未来待办：|每日提醒：|每周提醒：|每月提醒：)$" $labelColor
    Highlight-Regex "(?<!\d)\d{2}:\d{2}|周[一二三四五六日]\s+\d{2}:\d{2}|今天\s+\d{2}:\d{2}|\d{1,2}/\d{1,2}\s+\d{2}:\d{2}|\d{4}-\d{2}-\d{2}" $timeColor
  } elseif ($script:currentView -eq "completed") {
    Highlight-Regex "^\d{4}-\d{2}-\d{2}\s+ฅ\^•ﻌ•\^ฅ$" $labelColor
  } elseif ($script:currentView -eq "version") {
    Highlight-Regex "^更新版本$" $labelColor
    Highlight-Regex "(?<!\d)\d{2}:\d{2}|\d{4}-\d{2}-\d{2}" $timeColor
  }

  $textBox.Select(0, 0)
}

function Show-HistoryDateMenu($ownerControl) {
  $menu = New-Object System.Windows.Forms.ContextMenuStrip

  $allItem = New-Object System.Windows.Forms.ToolStripMenuItem
  $allItem.Text = "全部日期"
  $allItem.Add_Click({
    $script:selectedHistoryDate = ""
    $script:currentView = "completed"
    Clear-NoteStatusIfNeeded
    Refresh-Board
  })
  [void]$menu.Items.Add($allItem)

  $dates = @(Get-HistoryDates)
  if ($dates.Count -gt 0) {
    [void]$menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))
    foreach ($item in $dates) {
      $dateKey = [string]$item.DateKey
      $count = [int]$item.Count
      $dateItem = New-Object System.Windows.Forms.ToolStripMenuItem
      $dateItem.Text = "$dateKey  $count 条"
      $dateItem.Tag = $dateKey
      $dateItem.Add_Click({
        param($sender, $eventArgs)
        $script:selectedHistoryDate = [string]$sender.Tag
        $script:currentView = "completed"
        Clear-NoteStatusIfNeeded
        Refresh-Board
      })
      [void]$menu.Items.Add($dateItem)
    }
  }

  $menu.Show($ownerControl, 0, $ownerControl.Height)
}

$script:catMenu = New-Object System.Windows.Forms.ContextMenuStrip
$catHistoryItem = New-Object System.Windows.Forms.ToolStripMenuItem
$catHistoryItem.Text = "历史记录"
$catHistoryDateItem = New-Object System.Windows.Forms.ToolStripMenuItem
$catHistoryDateItem.Text = "选择历史日期"
$catVersionItem = New-Object System.Windows.Forms.ToolStripMenuItem
$catVersionItem.Text = "更新记录"
$catRefreshItem = New-Object System.Windows.Forms.ToolStripMenuItem
$catRefreshItem.Text = "刷新当前页"
$catLockItem = New-Object System.Windows.Forms.ToolStripMenuItem
$catLockItem.Text = "取消置顶"
$script:catMenu.Items.AddRange(@($catHistoryItem, $catHistoryDateItem, $catVersionItem, $catRefreshItem, (New-Object System.Windows.Forms.ToolStripSeparator), $catLockItem))
$script:catMenu.Add_Opening({
  $catLockItem.Text = if ($script:isLocked) { "取消置顶" } else { "置顶" }
  $catHistoryDateItem.Visible = ($script:currentView -eq "completed")
})
$catHistoryItem.Add_Click({
  Save-CurrentNoteIfNeeded $false
  $script:currentView = "completed"
  $script:selectedHistoryDate = ""
  Clear-NoteStatusIfNeeded
  Refresh-Board
})
$catHistoryDateItem.Add_Click({
  Save-CurrentNoteIfNeeded $false
  $script:currentView = "completed"
  Clear-NoteStatusIfNeeded
  Refresh-Board
  Show-HistoryDateMenu $lockDot
})
$catVersionItem.Add_Click({
  Save-CurrentNoteIfNeeded $false
  $script:currentView = "version"
  Clear-NoteStatusIfNeeded
  Refresh-Board
})
$catRefreshItem.Add_Click({
  try {
    Refresh-Board
    if ($script:currentView -ne "notes") {
      Clear-NoteStatusIfNeeded
    }
    Set-InlineStatus "刷新完了 (｡･ω･｡)ﾉ" $true
  } catch {
    Set-InlineStatus "刷新失败了 (｡•́︿•̀｡)" $false
  }
})
$catLockItem.Add_Click({ Toggle-Lock })

$refreshButton.Add_Click({
  try {
    Refresh-Board
    if ($script:currentView -ne "notes") {
      Clear-NoteStatusIfNeeded
    }
    Set-InlineStatus "刷新完了 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧" $true
  } catch {
    Set-InlineStatus "刷新失败了 (｡•́︿•̀｡)" $false
  }
})
$todoButton.Add_Click({
  Save-CurrentNoteIfNeeded $false
  $script:currentView = "todos"
  Clear-NoteStatusIfNeeded
  Refresh-Board
})
$reminderButton.Add_Click({
  Save-CurrentNoteIfNeeded $false
  $script:currentView = "reminders"
  Clear-NoteStatusIfNeeded
  Refresh-Board
})
$noteButton.Add_Click({
  Save-CurrentNoteIfNeeded
  $script:currentView = "notes"
  Set-NotesView
})
$completedButton.Add_Click({
  Save-CurrentNoteIfNeeded $false
  if ($script:currentView -eq "completed") {
    Show-HistoryDateMenu $completedButton
    return
  }
  $script:currentView = "completed"
  $script:selectedHistoryDate = ""
  Clear-NoteStatusIfNeeded
  Refresh-Board
})
$versionButton.Add_Click({
  Save-CurrentNoteIfNeeded $false
  $script:currentView = "version"
  Clear-NoteStatusIfNeeded
  Refresh-Board
})

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 30000
$timer.Add_Tick({ Refresh-Board })

$toolbar.Controls.Add($lockDot)
$toolbar.Controls.Add($dateLabel)
$toolbar.Controls.Add($todoButton)
$toolbar.Controls.Add($reminderButton)
$toolbar.Controls.Add($noteButton)
$toolbar.Controls.Add($completedButton)
$toolbar.Controls.Add($versionButton)
$toolbar.Controls.Add($refreshButton)
$form.Controls.Add($textBox)
$form.Controls.Add($inputSeparator)
$form.Controls.Add($inputPanel)
$form.Controls.Add($statusLabel)
$form.Controls.Add($toolbar)

$form.Add_Shown({
  Update-NavScrollRange
  Refresh-Board
  Apply-LockState
  $timer.Start()
})

$form.Add_FormClosed({
  Save-CurrentNoteIfNeeded
  $timer.Stop()
  $statusTimer.Stop()
  $noteSaveTimer.Stop()
  Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
  if ($script:singleInstanceMutex) {
    try {
      $script:singleInstanceMutex.ReleaseMutex()
    } catch {
    }
    $script:singleInstanceMutex.Dispose()
  }
})

[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::Run($form)
























