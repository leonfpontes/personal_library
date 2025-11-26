# Test login endpoint in production
$body = @{
    email = "leonfpontes@gmail.com"
    password = "changeme123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://personal-library-28jvadrym-leonardos-projects-e41e454f.vercel.app/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -ErrorAction SilentlyContinue

Write-Host "Status Code:" $response.StatusCode
Write-Host "Response Body:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
