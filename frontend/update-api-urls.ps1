# PowerShell script to replace localhost:5000 with 127.0.0.1:5000
$files = @(
    "src\services\announcementBar.service.ts",
    "src\services\headerLogo.service.ts",
    "src\services\giftCards.service.ts",
    "src\services\coupons.service.ts",
    "src\services\footerLogo.service.ts",
    "src\services\sale.service.ts",
    "src\services\compare.service.ts",
    "src\components\providers\WishlistProvider.tsx",
    "src\components\providers\NotificationProvider.tsx",
    "src\components\providers\CartProvider.tsx",
    "src\components\providers\AuthProvider.tsx"
)

foreach ($file in $files) {
    $fullPath = "d:\Web Devlopment\VS code\vardhman_mills\frontend\$file"
    if (Test-Path $fullPath) {
        Write-Host "Updating $file..."
        (Get-Content $fullPath) -replace 'http://localhost:5000', 'http://127.0.0.1:5000' | Set-Content $fullPath
    }
}

Write-Host "Done! Updated all service files."
