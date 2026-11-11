@echo off
chcp 65001 >nul
title تشغيل سيرفر مشروع أمل (AMAL)

echo ===================================================
echo     جاري تشغيل سيرفر مشروع أمل (AMAL)...
echo ===================================================
echo.

cd /d "%~dp0"

:: التأكد من ملف الإعدادات للـ API
if not exist "api\.env" (
    echo [تجهيز] إنشاء ملف api/.env من النموذج...
    copy "api\.env.example" "api\.env" >nul
)

:: تشغيل سيرفر الـ API (FastAPI) في نافذة منفصلة
echo [1/2] تشغيل سيرفر الباك إند (FastAPI على المنفذ 8000)...
start "AMAL - Backend API (Port 8000)" cmd /k "cd /d ""%~dp0api"" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: مهلة قصيرة للتأكد من بدء الخادم
timeout /t 2 /nobreak >nul

:: تشغيل سيرفر الواجهة الأمامية (Vite)
echo [2/2] تشغيل سيرفر الفرونت إند (Vite على المنفذ 5173)...
start "AMAL - Frontend Vite (Port 5173)" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev"

:: مهلة ثم فتح المتصفح تلقائياً
timeout /t 3 /nobreak >nul
echo.
echo ===================================================
echo     تم إطلاق السيرفرات بنجاح!
echo     الواجهة: http://localhost:5173
echo     الـ API: http://127.0.0.1:8000
echo ===================================================
start http://localhost:5173
