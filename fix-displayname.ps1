# Встановлюємо кодування для виводу
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Виправлення помилки displayName в Bridgeless режимі..." -ForegroundColor Cyan

Write-Host "Очищення кешу WatermelonDB..." -ForegroundColor Yellow
if (Test-Path ".watermelon") {
    Remove-Item -Recurse -Force ".watermelon"
}

Write-Host "Очищення кешу Metro..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
}

Write-Host "Запуск додатку у Bridgeless режимі..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c", "npx expo start --no-dev --minify --clear --no-bundler"

Write-Host "Дочекайтесь запуску Metro сервера (5 секунд)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Тепер відкрийте нову командну строку і запустіть 'npm run android'" -ForegroundColor Cyan
Write-Host "Або запустіть з поточного терміналу? (Y/N)" -ForegroundColor Yellow
$answer = Read-Host

if ($answer -eq "Y" -or $answer -eq "y") {
    Write-Host "Запускаємо Android застосунок..." -ForegroundColor Green
    Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c", "npm run android"
}