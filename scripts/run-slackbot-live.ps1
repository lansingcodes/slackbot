[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$SlackToken,

    [Parameter(Mandatory = $false)]
    [string]$FirebaseConfig,

    [Parameter(Mandatory = $false)]
    [string]$HerokuKeepaliveUrl,

    [Parameter(Mandatory = $false)]
    [switch]$SkipNpmInstall
)

function Prompt-ForSecret {
    param(
        [string]$PromptText
    )

    $secureValue = Read-Host -Prompt $PromptText -AsSecureString
    if (-not $secureValue.Length) {
        return $null
    }

    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    )
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not $SlackToken) {
    $SlackToken = Prompt-ForSecret -PromptText 'Enter Slack bot token (xoxb-...)'
}

if (-not $SlackToken) {
    Write-Error 'HUBOT_SLACK_TOKEN is required to run against live Slack.'
    exit 1
}

if (-not $FirebaseConfig) {
    $FirebaseConfig = Read-Host -Prompt 'Optionally paste FIREBASE_WEB_CONFIG JSON (press Enter to skip)'
}

if (-not $HerokuKeepaliveUrl) {
    $HerokuKeepaliveUrl = Read-Host -Prompt 'Optional HUBOT_HEROKU_KEEPALIVE_URL (press Enter to skip)'
}

$env:HUBOT_SLACK_TOKEN = $SlackToken

if ($FirebaseConfig) {
    $env:FIREBASE_WEB_CONFIG = $FirebaseConfig
}

if ($HerokuKeepaliveUrl) {
    $env:HUBOT_HEROKU_KEEPALIVE_URL = $HerokuKeepaliveUrl
}

$env:DEBUG = 'true'
$env:HUBOT_HTTPD = 'false'

$nodeBinPath = Join-Path $repoRoot 'node_modules/.bin'
if (Test-Path $nodeBinPath) {
    $env:PATH = "$nodeBinPath${[IO.Path]::PathSeparator}$env:PATH"
}

$shouldInstall = $true
if ($SkipNpmInstall) {
    $shouldInstall = $false
} elseif (Test-Path (Join-Path $repoRoot 'node_modules')) {
    $shouldInstall = $false
}

if ($shouldInstall) {
    Write-Host 'Installing npm dependencies (run with -SkipNpmInstall to skip)...'
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error 'npm install failed. Aborting.'
        exit $LASTEXITCODE
    }
}

try {
    Write-Host 'Starting Hubot against live Slack. Press Ctrl+C to stop.'
    & (Join-Path $repoRoot 'bin/hubot.cmd') --adapter slack @args
} finally {
    Write-Host 'Cleaning up sensitive environment variables.'
    Remove-Item Env:\HUBOT_SLACK_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:\FIREBASE_WEB_CONFIG -ErrorAction SilentlyContinue
    Remove-Item Env:\HUBOT_HEROKU_KEEPALIVE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:\DEBUG -ErrorAction SilentlyContinue
    Remove-Item Env:\HUBOT_HTTPD -ErrorAction SilentlyContinue
}
