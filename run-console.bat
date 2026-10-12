@echo off
title Annam - Smart Food Distribution & Waste Reduction System
echo =================================================================
echo   Building and Running Annam Console Application in Pure Java
echo =================================================================

cd /d "%~dp0"

if not exist "out" mkdir out

echo Compiling Java source files...
javac -d out -encoding UTF-8 src\main\java\com\annam\model\*.java src\main\java\com\annam\data\*.java src\main\java\com\annam\dto\*.java src\main\java\com\annam\policy\*.java src\main\java\com\annam\service\*.java src\main\java\com\annam\Main.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed. Please check Java errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo Starting Console Application...
java -cp out com.annam.Main
pause
