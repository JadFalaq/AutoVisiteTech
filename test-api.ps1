$body = @{
    message = "test powershell"
    session_id = "test_ps"
} | ConvertTo-Json

try {
    Write-Host "Test API Gateway..."
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/chat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Succès via API Gateway:"
    Write-Host $response | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur via API Gateway:"
    Write-Host $_.Exception.Message
}

try {
    Write-Host "`nTest Direct Chatbot..."
    $response = Invoke-RestMethod -Uri "http://localhost:8006/api/chat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Succès direct:"
    Write-Host $response | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur direct:"
    Write-Host $_.Exception.Message
}
