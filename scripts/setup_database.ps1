# Script PowerShell per configurare il database PostgreSQL
# Prerequisiti: PostgreSQL installato e nel PATH

Write-Host "=== Configurazione Database Vicanto ===" -ForegroundColor Cyan
Write-Host ""

# Verifica se psql è disponibile
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERRORE: PostgreSQL non trovato nel PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluzioni:" -ForegroundColor Yellow
    Write-Host "1. Installa PostgreSQL da: https://www.postgresql.org/download/windows/"
    Write-Host "2. Aggiungi PostgreSQL al PATH di sistema"
    Write-Host "3. Oppure usa pgAdmin per creare manualmente il database 'vicanto_db'"
    Write-Host ""
    exit 1
}

Write-Host "PostgreSQL trovato: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Chiedi credenziali
$dbUser = Read-Host "Inserisci username PostgreSQL (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Inserisci password PostgreSQL" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

Write-Host ""
Write-Host "Creazione database 'vicanto_db'..." -ForegroundColor Yellow

# Crea database
$env:PGPASSWORD = $dbPasswordPlain
$createDbQuery = "CREATE DATABASE vicanto_db;"
$result = & psql -U $dbUser -d postgres -c $createDbQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database 'vicanto_db' creato con successo!" -ForegroundColor Green
} else {
    if ($result -match "already exists") {
        Write-Host "Database 'vicanto_db' esiste già." -ForegroundColor Yellow
    } else {
        Write-Host "Errore nella creazione del database:" -ForegroundColor Red
        Write-Host $result
        Write-Host ""
        Write-Host "Prova a creare manualmente il database con:" -ForegroundColor Yellow
        Write-Host "CREATE DATABASE vicanto_db;"
    }
}

# Aggiorna file .env
Write-Host ""
Write-Host "Aggiornamento file .env..." -ForegroundColor Yellow

$envPath = "backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $newContent = @()
    foreach ($line in $envContent) {
        if ($line -match "^DB_PASSWORD=") {
            $newContent += "DB_PASSWORD=$dbPasswordPlain"
        } elseif ($line -match "^DB_USER=") {
            $newContent += "DB_USER=$dbUser"
        } else {
            $newContent += $line
        }
    }
    Set-Content -Path $envPath -Value $newContent -Encoding UTF8
    Write-Host "File .env aggiornato con le credenziali database." -ForegroundColor Green
} else {
    Write-Host "File .env non trovato. Crealo manualmente." -ForegroundColor Red
}

$env:PGPASSWORD = $null
Write-Host ""
Write-Host "=== Configurazione completata ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prossimi passi:" -ForegroundColor Yellow
Write-Host "1. Esegui le migrazioni: cd backend && npm run migrate"
Write-Host "2. Riavvia il server: npm start"