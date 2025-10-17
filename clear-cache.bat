@echo off
echo Clearing Next.js cache...
echo.

REM Stop any running processes (user needs to do this manually)
echo Please make sure to stop the development server (Ctrl+C) before running this script.
echo.
pause

REM Delete .next folder
if exist .next (
    echo Deleting .next folder...
    rmdir /s /q .next
    echo .next folder deleted successfully!
) else (
    echo .next folder not found.
)

echo.
echo Cache cleared! You can now run: npm run dev
echo.
pause
