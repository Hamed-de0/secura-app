param(
  [int]$Port = 8001,
  [string]$App = "app.main:app",
  [string]$ReloadDir = "app"
)

# 1) Make WatchFiles use polling (more stable on Windows)
$env:WATCHFILES_FORCE_POLLING = "1"
# Optional: avoid .pyc churn
$env:PYTHONDONTWRITEBYTECODE = "1"

# 2) Kill any process holding the port
Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# 3) Clean caches that confuse the watcher
Get-ChildItem -Recurse -Force -Include "__pycache__", "*.pyc" -ErrorAction SilentlyContinue |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 4) Start uvicorn with sane reload settings
uvicorn $App `
  --host 0.0.0.0 --port $Port `
  --reload --reload-dir $ReloadDir `
  --reload-exclude "node_modules/*,.git/*,venv/*,__pycache__/*" `
  --reload-delay 0.3
