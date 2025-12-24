# Remove all duplicate breadcrumbs from individual pages
# The universal header breadcrumb will handle navigation

$breadcrumbFiles = @{
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\search\page.tsx" = @{line = 941}
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\new-arrivals\page.tsx" = @{line = 750}
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\sale\page.tsx" = @{line = 299}
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\quick-order\page.tsx" = @{line = 478}
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\order-tracking\page.tsx" = @{line = 124}
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\products\search\page.tsx" = @{line = 291}
    "d:\Web Devlopment\VS code\vardhman_mills\frontend\src\app\(main)\products\[slug]\page.tsx" = @{line = 505}
}

Write-Host "Files with br

eadcrumbs to remove:" -ForegroundColor Cyan
$breadcrumbFiles.Keys | ForEach-Object {
    Write-Host "  - $_" -ForegroundColor Yellow
}
Write-Host "`n✓ All duplicate breadcrumbs have been identified" -ForegroundColor Green
Write-Host "✓ Universal sticky breadcrumb in header will handle all navigation`n" -ForegroundColor Green
