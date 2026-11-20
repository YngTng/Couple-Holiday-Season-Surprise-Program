# Tiny local web server that runs YourProject.exe on a laptop with nothing installed.
# Serves the "site" folder next to this script at http://localhost:<port>/ and opens the browser.
# Only this computer can reach it. Close the window to stop it.

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'site'))
if (-not (Test-Path (Join-Path $root 'index.html'))) {
  Write-Host "  Can't find the site folder next to this file. Unzip the whole package first." -ForegroundColor Red
  Read-Host '  Press Enter to close'
  exit 1
}

$types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'; '.gif' = 'image/gif'; '.webp' = 'image/webp'; '.ico' = 'image/x-icon'
  '.woff2' = 'font/woff2'; '.woff' = 'font/woff'; '.txt' = 'text/plain; charset=utf-8'; '.mp3' = 'audio/mpeg'
}

# First free port from 4173 up.
$listener = $null
foreach ($port in 4173..4193) {
  $candidate = New-Object System.Net.HttpListener
  $candidate.Prefixes.Add("http://localhost:$port/")
  try { $candidate.Start(); $listener = $candidate; break } catch { $candidate.Close() }
}
if (-not $listener) {
  Write-Host '  Ports 4173-4193 are all busy. Close other programs and try again.' -ForegroundColor Red
  Read-Host '  Press Enter to close'
  exit 1
}

$url = "http://localhost:$port/"
Write-Host ''
Write-Host '  ==============================================' -ForegroundColor Magenta
Write-Host '    YourProject.exe' -ForegroundColor Magenta
Write-Host '  ==============================================' -ForegroundColor Magenta
Write-Host ''
Write-Host "  Running at $url"
Write-Host ''
Write-Host '  Leave this window open while you use it. Close it when you are done.' -ForegroundColor Yellow
Write-Host ''
Start-Process $url

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    try {
      $path = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
      if ($path -eq '') { $path = 'index.html' }
      $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
      # Stay inside the site folder; unknown paths fall back to the app.
      if (-not $file.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $file -PathType Leaf)) {
        $file = Join-Path $root 'index.html'
      }
      $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
      $response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
      $response.Headers.Add('Cache-Control', 'no-cache')
      $response.Headers.Add('Accept-Ranges', 'bytes')
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $start = 0
      $end = $bytes.Length - 1
      # Byte ranges let the browser jump around in songs (dragging the progress bar).
      $range = $context.Request.Headers['Range']
      if ($range -match '^bytes=(\d*)-(\d*)$' -and $bytes.Length -gt 0) {
        if ($Matches[1] -ne '') { $start = [long]$Matches[1] } elseif ($Matches[2] -ne '') { $start = [Math]::Max(0, $bytes.Length - [long]$Matches[2]) }
        if ($Matches[1] -ne '' -and $Matches[2] -ne '') { $end = [Math]::Min([long]$Matches[2], $bytes.Length - 1) }
        if ($start -gt $end) {
          $response.StatusCode = 416
          $response.Headers.Add('Content-Range', "bytes */$($bytes.Length)")
          $response.ContentLength64 = 0
          continue
        }
        $response.StatusCode = 206
        $response.Headers.Add('Content-Range', "bytes $start-$end/$($bytes.Length)")
      }
      $count = $end - $start + 1
      $response.ContentLength64 = $count
      $response.OutputStream.Write($bytes, [int]$start, [int]$count)
    } catch {
      $response.StatusCode = 500
    } finally {
      $response.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
}
