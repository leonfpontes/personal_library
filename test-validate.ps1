# Test validate endpoint with session token from login
# First, get the session token
$loginBody = @{
    email = "leonfpontes@gmail.com"
    password = "changeme123"
} | ConvertTo-Json

Write-Host "1. Getting session token..." -ForegroundColor Cyan
$loginResponse = Invoke-WebRequest `
    -Uri "https://biblioteca.leopontes.com.br/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -SessionVariable session

$sessionCookie = $session.Cookies.GetCookies("https://biblioteca.leopontes.com.br") | Where-Object { $_.Name -eq "session" }

if ($sessionCookie) {
    Write-Host "   Session cookie obtained: $($sessionCookie.Value.Substring(0, 20))..." -ForegroundColor Green
    
    # Test validate without bookSlug
    Write-Host "`n2. Testing validate without bookSlug..." -ForegroundColor Cyan
    $validateResponse1 = Invoke-RestMethod `
        -Uri "https://biblioteca.leopontes.com.br/api/auth/validate" `
        -Method GET `
        -WebSession $session
    
    Write-Host "   Response:" -ForegroundColor Yellow
    $validateResponse1 | ConvertTo-Json -Depth 5
    
    # Test validate with bookSlug
    Write-Host "`n3. Testing validate with bookSlug=vivencia_pombogira..." -ForegroundColor Cyan
    try {
        $validateResponse2 = Invoke-RestMethod `
            -Uri "https://biblioteca.leopontes.com.br/api/auth/validate?bookSlug=vivencia_pombogira" `
            -Method GET `
            -WebSession $session
        
        Write-Host "   Response:" -ForegroundColor Yellow
        $validateResponse2 | ConvertTo-Json -Depth 5
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            Write-Host "   Response body: $($reader.ReadToEnd())" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Failed to get session cookie" -ForegroundColor Red
}
