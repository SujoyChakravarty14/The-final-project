# Start the Backend
Write-Host "Starting FastAPI Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; if (-not (Test-Path .venv)) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; python -m uvicorn app:app --reload`""

# Start the Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""

Write-Host "Both servers are starting in new windows." -ForegroundColor Green
Write-Host "Please make sure to set your GEMINI_API_KEY in backend/.env before testing!" -ForegroundColor Yellow
