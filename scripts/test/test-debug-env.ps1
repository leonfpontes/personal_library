# Test debug endpoint to check environment variables
$headers = @{
    "Authorization" = "Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}

try {
    $response = Invoke-RestMethod `
        -Uri "https://biblioteca.leopontes.com.br/api/debug/check-env" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Success! Environment variables status:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd()
    }
}
