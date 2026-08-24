@echo off
:: This script uninstalls the broken USB/IP VHCI driver to fix mouse and keyboard freeze issues.
title Fix Mouse and Keyboard Freeze
echo ======================================================
echo  Fixing Mouse ^& Keyboard Freeze (USB/IP Driver)
echo ======================================================
echo.
echo Running driver uninstallation...
pnputil /delete-driver oem11.inf /uninstall /force
echo.
echo ======================================================
echo  Done! Please restart your computer to apply the fix.
echo ======================================================
echo.
pause
