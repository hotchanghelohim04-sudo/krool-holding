<#
  Vérification locale de la stack Docker (fin de l'étape 0).

  Usage (depuis la racine du dépôt) :
      powershell -ExecutionPolicy Bypass -File infra\scripts\verifier-docker.ps1
  Options :
      -Arreter   arrête la stack à la fin (les données PostgreSQL sont conservées)

  Le script :
    1. crée .env à partir de .env.example s'il n'existe pas (secrets aléatoires) ;
    2. construit et démarre db, redis, backend, worker, frontend ;
    3. attend les healthchecks puis teste l'API et le site.
#>
param([switch]$Arreter)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\..")

function Write-Etape($texte) { Write-Host "`n==> $texte" -ForegroundColor Yellow }

function New-Hex([int]$octets) {
    $buffer = New-Object byte[] $octets
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
    return -join ($buffer | ForEach-Object { $_.ToString("x2") })
}

Write-Etape "Vérification de Docker"
docker version --format "Client {{.Client.Version}} / Serveur {{.Server.Version}}"
if ($LASTEXITCODE -ne 0) { throw "Docker ne répond pas : lance Docker Desktop puis réessaie." }

if (-not (Test-Path ".env")) {
    Write-Etape "Création de .env (secrets aléatoires)"
    $motDePasse = New-Hex 16
    $contenu = (Get-Content ".env.example" -Raw) `
        -replace "(?m)^DJANGO_SECRET_KEY=.*$", "DJANGO_SECRET_KEY=$(New-Hex 48)" `
        -replace "(?m)^POSTGRES_PASSWORD=.*$", "POSTGRES_PASSWORD=$motDePasse" `
        -replace "(?m)^DATABASE_URL=.*$", "DATABASE_URL=postgres://krool:$motDePasse@localhost:5432/krool"
    # UTF-8 sans BOM : un BOM casserait la lecture du fichier par Docker Compose.
    [IO.File]::WriteAllText((Join-Path (Get-Location) ".env"), $contenu, (New-Object Text.UTF8Encoding $false))
    Write-Host ".env créé (non versionné)."
} else {
    Write-Host ".env existant conservé."
}

Write-Etape "Construction et démarrage (premier lancement : plusieurs minutes)"
docker compose up -d --build --wait --wait-timeout 600
if ($LASTEXITCODE -ne 0) {
    docker compose ps
    docker compose logs --tail 50
    throw "La stack n'a pas démarré correctement (voir les journaux ci-dessus)."
}

Write-Etape "Tests"
$api = Invoke-WebRequest -UseBasicParsing "http://localhost:8000/api/health/"
Write-Host "API  /api/health/ -> $($api.StatusCode) $($api.Content)"
$site = Invoke-WebRequest -UseBasicParsing "http://localhost:3000/fr"
Write-Host "Site /fr          -> $($site.StatusCode)"

Write-Etape "État des services"
docker compose ps

Write-Host "`nÉtape 0 vérifiée : site sur http://localhost:3000 , API sur http://localhost:8000/api/health/" -ForegroundColor Green

if ($Arreter) {
    Write-Etape "Arrêt de la stack"
    docker compose down
}
