$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$outputDir = Join-Path $projectRoot "artifacts\demo"
$narrationPath = Join-Path $PSScriptRoot "narration.txt"
$voicePath = Join-Path $outputDir "narration.wav"
$rawVideoPath = Join-Path $outputDir "match-pulse-raw.webm"
$finalVideoPath = Join-Path $outputDir "match-pulse-demo.mp4"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Push-Location $projectRoot
try {
  node scripts/demo/record-demo.mjs

  Add-Type -AssemblyName System.Speech
  $speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $speaker.Rate = -1
  $speaker.Volume = 100
  $speaker.SetOutputToWaveFile($voicePath)
  $speaker.Speak((Get-Content -Raw $narrationPath))
  $speaker.Dispose()

  $ffmpeg = (& node -e "console.log(require('ffmpeg-static'))").Trim()
  if (-not (Test-Path -LiteralPath $ffmpeg)) {
    throw "ffmpeg-static binary not found"
  }

  & $ffmpeg -y `
    -i $rawVideoPath `
    -i $voicePath `
    -filter_complex "[1:a]highpass=f=80,lowpass=f=8000,volume=1.08,apad=pad_dur=120[a]" `
    -map 0:v:0 `
    -map "[a]" `
    -c:v libx264 `
    -preset medium `
    -crf 18 `
    -pix_fmt yuv420p `
    -r 30 `
    -c:a aac `
    -b:a 192k `
    -movflags +faststart `
    -shortest `
    $finalVideoPath

  Get-Item $finalVideoPath | Select-Object FullName, Length, LastWriteTime
}
finally {
  Pop-Location
}
