# Script per aggiornare la password del database nel file .env
# Uso: .\scripts\update_db_password.ps1

Write-Host "=== Aggiornamento Password Database ===" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "ERRORE: File backend\.env non trovato!" -ForegroundColor Red
    exit 1
}

# Chiedi la password
$password = Read-Host "Inserisci password PostgreSQL" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# Leggi il file .env
$envContent = Get-Content $envPath

# Sostituisci la riga DB_PASSWORD
$newContent = @()
foreach ($line in $envContent) {
    if ($line -match "^DB_PASSWORD=") {
        $newContent += "DB_PASSWORD=$passwordPlain"
    } else {
        $newContent += $line
    }
}

# Scrivi il file aggiornato
Set-Content -Path $envPath -Value $newContent -Encoding UTF8

Write-Host ""
Write-Host "✅ Password aggiornata nel file .env" -ForegroundColor Green
Write-Host ""
Write-Host "Prossimi passi:" -ForegroundColor Yellow
Write-Host "1. Esegui le migrazioni: cd backend && npm run migrate"
Write-Host "2. Riavvia il server: npm start"