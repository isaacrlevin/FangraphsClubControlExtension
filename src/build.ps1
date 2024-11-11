param (
    [string]$target
)

if (-not $target) {
    Write-Host "Please provide an argument: 'chrome' or 'firefox'"
    exit 1
}

switch ($target) {
    "chrome" {
        $TARGET_DIR = "chrome"
        $BUILT_DIR = "built-chrome"
    }
    "firefox" {
        $TARGET_DIR = "mozilla"
        $BUILT_DIR = "built-firefox"
    }
    default {
        Write-Host "Invalid argument. Use 'chrome' or 'firefox'."
        exit 1
    }
}

if (-not (Test-Path -Path $BUILT_DIR)) {
    New-Item -ItemType Directory -Path $BUILT_DIR | Out-Null
}

Copy-Item -Path "$TARGET_DIR\*" -Destination $BUILT_DIR -Recurse -Force
Copy-Item -Path "scripts" -Destination $BUILT_DIR -Recurse -Force
Copy-Item -Path "styles" -Destination $BUILT_DIR -Recurse -Force
Copy-Item -Path "icons" -Destination $BUILT_DIR -Recurse -Force

Write-Host "Copied extension artifacts to '$BUILT_DIR'."