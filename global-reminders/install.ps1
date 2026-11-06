param(
    [string]$TargetCodexHome = $(if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' })
)

$ErrorActionPreference = 'Stop'
$targetRoot = [IO.Path]::GetFullPath($TargetCodexHome)
$sourceRoot = $PSScriptRoot
$hookFolder = Join-Path $targetRoot 'hooks'
$skillFolder = Join-Path $targetRoot 'skills/dkalchenko-manage-agents'
$hookFile = Join-Path $hookFolder 'dkalchenko-skill-routing.cjs'
$configFile = Join-Path $targetRoot 'hooks.json'
$utf8 = [Text.UTF8Encoding]::new($false)

# Parse and validate before changing the target. Existing unrelated hooks survive.
$config = if (Test-Path -LiteralPath $configFile) {
    Get-Content -LiteralPath $configFile -Raw | ConvertFrom-Json -AsHashtable
} else { @{} }
if ($config -isnot [System.Collections.IDictionary]) { throw 'hooks.json must be an object' }
if (-not $config.Contains('hooks')) { $config['hooks'] = @{} }
if ($config.hooks -isnot [System.Collections.IDictionary]) { throw 'hooks must be an object' }

# Resolve from the configured home without interpolating paths into shell code.
$command = 'node -e "require(require(''node:path'').join(process.env.CODEX_HOME || require(''node:path'').join(require(''node:os'').homedir(), ''.codex''), ''hooks/dkalchenko-skill-routing.cjs''))"'
$events = @('SessionStart', 'UserPromptSubmit', 'PreToolUse', 'SubagentStart')
foreach ($event in $events) {
    if ($config.hooks.Contains($event) -and $config.hooks[$event] -isnot [array]) {
        throw "hooks.$event must be an array"
    }
    $groups = @($config.hooks[$event] | Where-Object { $null -ne $_ })
    $found = $false
    foreach ($group in $groups) {
        foreach ($handler in $group.hooks) {
            if ($handler.command -eq $command) { $found = $true }
        }
    }
    if (-not $found) {
        $groups += @{
            hooks = @(@{
                type = 'command'
                command = $command
                statusMessage = 'Checking AGENTS skill routing'
                timeout = 5
            })
        }
    }
    $config.hooks[$event] = @($groups)
}

New-Item -ItemType Directory -Path $hookFolder, (Join-Path $skillFolder 'agents') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $sourceRoot 'hooks/remind.cjs') -Destination $hookFile -Force
Copy-Item -LiteralPath (Join-Path $sourceRoot 'skills/dkalchenko-manage-agents/SKILL.md') -Destination (Join-Path $skillFolder 'SKILL.md') -Force
Copy-Item -LiteralPath (Join-Path $sourceRoot 'skills/dkalchenko-manage-agents/agents/openai.yaml') -Destination (Join-Path $skillFolder 'agents/openai.yaml') -Force
if (Test-Path -LiteralPath $configFile) {
    $backupFile = "$configFile.dkalchenko-backup-$([Guid]::NewGuid().ToString('N'))"
    Copy-Item -LiteralPath $configFile -Destination $backupFile
}
[IO.File]::WriteAllText($configFile, ($config | ConvertTo-Json -Depth 100) + [Environment]::NewLine, $utf8)
Write-Output "Installed user-level AGENTS reminders in $targetRoot"
Write-Output 'Restart Codex and review/trust the four user-level hooks. Hook trust was not changed.'
Write-Output 'For a custom home, launch Codex with CODEX_HOME matching this target.'
