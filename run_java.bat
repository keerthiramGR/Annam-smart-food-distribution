@echo off
title Annam - Smart Food Distribution System (Java Interactive Terminal)
echo ========================================================
echo   Compiling Annam Java Core Console Application...
echo ========================================================

if not exist "bin" mkdir bin

dir /s /b src\main\java\*.java > sources.txt
javac -d bin @sources.txt
del sources.txt

if %errorlevel% neq 0 (
    echo [ERROR] Java compilation failed. Please ensure JDK 17+ is installed.
    pause
    exit /b %errorlevel%
)

echo ========================================================
echo   Starting Annam Interactive Terminal (Multi-Role)...
echo ========================================================
java -cp bin com.annam.Main

