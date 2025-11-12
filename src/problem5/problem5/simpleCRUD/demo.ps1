###############################################################################
# EXPRESS + TYPESCRIPT + SQLITE CRUD DEMO
# Demonstrates create → list → get → update → delete using Invoke-RestMethod.
###############################################################################

$apiBase = "http://localhost:3000/api/items"

Write-Host "======================================" -ForegroundColor DarkGray
Write-Host " EXPRESS + TYPESCRIPT + SQLITE CRUD DEMO" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor DarkGray
Write-Host ""

# -----------------------------
# CREATE
# -----------------------------
Write-Host "Creating a new item..." -ForegroundColor Yellow

$createBody = @{
    name        = "Sample"
    description = "Hello"
} | ConvertTo-Json

$res = irm $apiBase -Method Post -ContentType 'application/json' -Body $createBody
$id = $res.id

Write-Host "Created item with ID: $id" -ForegroundColor Green
$res | ConvertTo-Json -Depth 5
Write-Host ""


# -----------------------------
# LIST
# -----------------------------
Write-Host "Listing all items..." -ForegroundColor Yellow

$list = irm "${apiBase}?search=sa&limit=5&offset=0&sort=createdAt&order=desc"

Write-Host "Total items: $($list.total)"
$list.items | ConvertTo-Json -Depth 5
Write-Host ""


# -----------------------------
# GET
# -----------------------------
Write-Host "Getting item by ID: $id" -ForegroundColor Yellow

$get = irm "$apiBase/$id"
$get | ConvertTo-Json -Depth 5
Write-Host ""


# -----------------------------
# UPDATE
# -----------------------------
Write-Host "Updating item description..." -ForegroundColor Yellow

$patch = @{
    description = "Updated description for demo"
} | ConvertTo-Json

$upd = irm "$apiBase/$id" -Method Patch -ContentType 'application/json' -Body $patch
$upd | ConvertTo-Json -Depth 5
Write-Host ""


# -----------------------------
# DELETE
# -----------------------------
Write-Host "Deleting item ID: $id" -ForegroundColor Yellow

try {
    irm "$apiBase/$id" -Method Delete | Out-Null
    Write-Host "Deleted item ID: $id" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.Value__
    Write-Host "Delete failed for ID: $id with status code: $status" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor DarkGray
Write-Host " DEMO COMPLETE" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor DarkGray
