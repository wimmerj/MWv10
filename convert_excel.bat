@echo off
REM Batch skript pro snadnou konverzi Excel -> JSON
echo ============================================================
echo Excel to JSON Konvertor pro Podrobnosti PZS
echo ============================================================
echo.

REM Kontrola existence Python virtual environment
if exist ".venv\Scripts\python.exe" (
    echo Pouzivam virtualni prostredi...
    set PYTHON_CMD=.venv\Scripts\python.exe
) else (
    echo Virtualni prostredi nenalezeno, pouzivam systemovy Python...
    set PYTHON_CMD=python
)

REM Kontrola existence souboru
if not exist "02_Podrobnosti_PZS_edited.xlsx" (
    echo.
    echo CHYBA: Soubor "02_Podrobnosti_PZS_edited.xlsx" nebyl nalezen!
    echo Ujistete se, ze soubor existuje ve slozce projektu.
    pause
    exit /b 1
)

echo.
echo Spoustim konverzi...
echo.
%PYTHON_CMD% convert_excel_to_json.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo USPECH: Konverze dokoncena!
    echo ============================================================
    echo.
    echo Vytvoreny soubor: 02_Podrobnosti_PZS_edited.json
    echo.
    echo Chcete nahradit puvodni JSON soubor? (A/N)
    set /p REPLACE="> "
    
    if /i "%REPLACE%"=="A" (
        echo.
        echo Vytvarem zalohu puvodniho souboru...
        copy 02_Podrobnosti_PZS.json 02_Podrobnosti_PZS_backup.json >nul
        echo Nahrazuji puvodni soubor...
        copy /Y 02_Podrobnosti_PZS_edited.json 02_Podrobnosti_PZS.json >nul
        echo.
        echo HOTOVO! Novy JSON soubor je aktivni.
        echo Zaloha puvodniho souboru: 02_Podrobnosti_PZS_backup.json
    ) else (
        echo.
        echo Puvodni soubor nebyl nahrazen.
        echo Novy soubor je ulozen jako: 02_Podrobnosti_PZS_edited.json
    )
) else (
    echo.
    echo CHYBA: Konverze selhala!
    echo Zkontrolujte chybovou zpravu vyse.
)

echo.
echo ============================================================
pause
