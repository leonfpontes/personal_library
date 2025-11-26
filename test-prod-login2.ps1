# Test login endpoint in production
$body = @{
    email = "leonfpontes@gmail.com"
    password = "changeme123"
} | ConvertTo-Json

Write-Host "Testing login at: https://biblioteca.leopontes.com.br/api/auth/login" -ForegroundColor Cyan
Write-Host "Body: $body`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod `
        -Uri "https://biblioteca.leopontes.com.br/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ LOGIN SUCCESS!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ LOGIN FAILED!" -ForegroundColor Red
    Write-Host "`nStatus Code:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorBody = $reader.ReadToEnd()
        Write-Host "`nError Response:" -ForegroundColor Yellow
        Write-Host $errorBody
        
        try {
            $errorJson = $errorBody | ConvertFrom-Json
            Write-Host "`nParsed Error:" -ForegroundColor Yellow
            $errorJson | ConvertTo-Json -Depth 10
        } catch {
            Write-Host "Could not parse error as JSON"
        }
    }
}
