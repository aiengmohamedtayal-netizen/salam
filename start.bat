@echo off
chcp 65001 >nul
title تشغيل سيرفر مشروع أمل (AMAL)

echo ===================================================
echo       جاري تشغيل مشروع أمل (AMAL Platform)...
echo ===================================================
echo.

set "APP_DIR=%~dp0"
set "API_DIR=%APP_DIR%api"

REM 1. التحقق من توفر Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [خطأ] لم يتم العثور على Python في النظام!
    pause
    exit /b 1
)

REM 2. التحقق من توفر npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [خطأ] لم يتم العثور على Node.js / npm في النظام!
    pause
    exit /b 1
)

REM 3. التأكد من ملف الإعدادات للـ API
if not exist "%API_DIR%\.env" (
    if exist "%API_DIR%\.env.example" (
        echo [تجهيز] إنشاء ملف api/.env من النموذج...
        copy "%API_DIR%\.env.example" "%API_DIR%\.env" >nul
    )
)

REM 4. التأكد من ملف الإعدادات للفرونت إند
if not exist "%APP_DIR%\.env.local" (
    if exist "%APP_DIR%\.env.example" (
        echo [تجهيز] إنشاء ملف .env.local للفرونت إند...
        copy "%APP_DIR%\.env.example" "%APP_DIR%\.env.local" >nul
    )
)

REM 5. فحص وتثبيت حزم الفرونت إند في حال أول تشغيل
if not exist "%APP_DIR%\node_modules\" (
    echo [تجهيز] جاري تثبيت مكتبات الفرونت إند لأول مرة (npm install)...
    cd /d "%APP_DIR%" && call npm install
)

REM 6. تشغيل سيرفر الباك إند (FastAPI) على المنفذ 8000
echo [1/2] جاري تشغيل سيرفر الباك إند (FastAPI على المنفذ 8000)...
start "AMAL - Backend API (Port 8000)" /D "%API_DIR%" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM انتظار ثوان للتأكد من إقلاع الباك إند
ping 127.0.0.1 -n 3 >nul

REM 7. تشغيل سيرفر الواجهة الأمامية (Vite) على المنفذ 5173
echo [2/2] جاري تشغيل سيرفر الواجهة الأمامية (Vite على المنفذ 5173)...
start "AMAL - Frontend Vite (Port 5173)" /D "%APP_DIR%" cmd /k "npm.cmd run dev"

REM انتظار ثوان لتجهيز الواجهة
ping 127.0.0.1 -n 3 >nul

echo.
echo ===================================================
echo       تم إطلاق السيرفرات بنجاح!
echo       الواجهة الأمامية : http://localhost:5173
echo       سيرفر الـ API    : http://127.0.0.1:8000
echo       توثيق الـ API   : http://127.0.0.1:8000/docs
echo ===================================================
echo.
echo جاري فتح المتصفح على الموقع...
start http://localhost:5173

echo.
echo ملاحظة: اترك النوافذ المفتوحة للسيرفرات تعمل.
echo اضغط أي مفتاح لإغلاق هذه النافذة فقط...
pause >nul
