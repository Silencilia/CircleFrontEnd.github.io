# PowerShell script to reload localStorage for Circle app
Write-Host "Reloading localStorage for Circle app..." -ForegroundColor Green

# Start the app if not running
Start-Process "http://localhost:3000" -ErrorAction SilentlyContinue

Write-Host "App opened in browser. To reload localStorage:" -ForegroundColor Yellow
Write-Host "1. Press F12 to open Developer Tools" -ForegroundColor Cyan
Write-Host "2. Go to Console tab" -ForegroundColor Cyan
Write-Host "3. Run: window.location.reload()" -ForegroundColor Cyan
Write-Host "4. Or run: localStorage.removeItem('circle-data'); window.location.reload()" -ForegroundColor Cyan

Write-Host "`nAlternative method - use the backend reload function:" -ForegroundColor Yellow
Write-Host "1. In the browser console, run:" -ForegroundColor Cyan
Write-Host "   const { reloadFromStorage } = useContacts(); reloadFromStorage();" -ForegroundColor Cyan

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
