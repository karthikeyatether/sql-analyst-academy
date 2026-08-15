Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")
sLinkFile = strDesktop & "\SQL Analyst Academy.lnk"

Set oLink = oWS.CreateShortcut(sLinkFile)
strBase = WScript.Arguments(0)
oLink.TargetPath = strBase & "\_launch.bat"
oLink.WorkingDirectory = strBase
oLink.IconLocation = strBase & "\core\public\app_icon.ico,0"
oLink.Description = "SQL Analyst Academy - Master SQL for Data Analytics"
oLink.WindowStyle = 1
oLink.Save

WScript.Echo "Shortcut successfully created on Desktop with icon: " & sLinkFile
