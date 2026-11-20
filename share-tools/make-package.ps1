# Builds the site and packs it with the no-install launcher into YourProject.zip (project folder).
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
Set-Location $project

if (-not (Test-Path 'node_modules')) {
  Write-Host 'Installing packages...'
  npm install
  if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
}

Write-Host 'Building the site...'
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed (see the error above)' }

$stage = Join-Path $env:TEMP ('your-project-package-' + [guid]::NewGuid().ToString('N'))
$pkg = Join-Path $stage 'YourProject'
New-Item -ItemType Directory -Path $pkg | Out-Null
Copy-Item -Recurse (Join-Path $project 'dist') (Join-Path $pkg 'site')
foreach ($f in 'Start YourProject.bat', 'server.ps1', 'READ ME FIRST.txt') {
  Copy-Item (Join-Path $PSScriptRoot $f) $pkg
}

$zip = Join-Path $project 'YourProject.zip'
if (Test-Path $zip) { Remove-Item $zip -Confirm:$false }
Compress-Archive -Path $pkg -DestinationPath $zip
Remove-Item -Recurse -Force $stage -Confirm:$false

Write-Host ''
Write-Host ("Done: {0} ({1:N1} MB)" -f $zip, ((Get-Item $zip).Length / 1MB)) -ForegroundColor Green
