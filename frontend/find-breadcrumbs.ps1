# Script to remove all Breadcrumbs components from pages
$files = @(
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\wishlist\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\sale\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\search\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\quick-order\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\new-arrivals\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\order-tracking\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\products\search\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\products\[slug]\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\categories\[category]\page.tsx",
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\categories\[category]\[subcategory]\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Checking: $file"
        $content = Get-Content $file -Raw
        if ($content -match '<Breadcrumbs') {
            Write-Host "  Found Breadcrumbs in: $file" -ForegroundColor Yellow
        }
    }
}
