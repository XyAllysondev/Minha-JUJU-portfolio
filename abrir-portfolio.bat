@echo off
title Portfolio Julia Araujo - servidor local
cd /d "%~dp0"

echo.
echo   ============================================
echo     PORTFOLIO - JULIA ARAUJO
echo   ============================================
echo.
echo   Abrindo em: http://localhost:8899
echo.
echo   Para encerrar, feche esta janela.
echo.

start "" "http://localhost:8899"

python -m http.server 8899 --bind 127.0.0.1 2>nul
if errorlevel 1 (
  py -m http.server 8899 --bind 127.0.0.1 2>nul
)
if errorlevel 1 (
  echo   Python nao encontrado. Abrindo o arquivo direto...
  start "" "index.html"
  pause
)
