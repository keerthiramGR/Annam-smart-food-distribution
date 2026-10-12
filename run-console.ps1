# PowerShell script to compile and run Annam Console Application
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

if (-not (Test-Path "out")) {
    New-Item -ItemType Directory -Path "out" | Out-Null
}

Write-Host "Compiling Annam Java files..." -ForegroundColor Cyan
$sourceFiles = Get-ChildItem -Path "src/main/java" -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName
& javac -d out -encoding UTF-8 $sourceFiles

if ($LASTEXITCODE -eq 0) {
    Write-Host "Starting Annam Console Application..." -ForegroundColor Green
    & java -cp out com.annam.Main
} else {
    Write-Host "Compilation failed with error code $LASTEXITCODE" -ForegroundColor Red
}
