# PowerShell script to remove /api/v1 prefixes from all API files
$files = @(
    "src\lib\api\client.ts",
    "src\lib\api\newArrivalApi.ts",
    "src\lib\api\wishlist.ts",
    "src\lib\api\uploadApi.ts",
    "src\lib\api\socialLinkApi.ts",
    "src\lib\api\saleApi.ts",
    "src\lib\api\reviewsRepliesApi.ts",
    "src\lib\api\reviewMediaApi.ts",
    "src\lib\api\headerLogoApi.ts"
)

foreach ($file in $files) {
    $fullPath = "d:\Web Devlopment\VS code\vardhman_mills\frontend\$file"
    if (Test-Path $fullPath) {
        Write-Host "Updating $file..."
        (Get-Content $fullPath) -replace "'/api/v1/", "'/" | Set-Content $fullPath -Encoding UTF8
    }
}

Write-Host "Done! Removed all /api/v1 prefixes from API files."
