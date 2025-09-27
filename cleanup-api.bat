@echo off
echo Eliminando archivos API obsoletos...

REM Eliminar archivos OAuth obsoletos
if exist "src\app\api\oauth" rmdir /s /q "src\app\api\oauth"

REM Eliminar archivos Google obsoletos (excepto google-classroom)
if exist "src\app\api\google\auth" rmdir /s /q "src\app\api\google\auth"
if exist "src\app\api\google\callback" del "src\app\api\google\callback\route.ts"
if exist "src\app\api\google\callback-signin" rmdir /s /q "src\app\api\google\callback-signin"
if exist "src\app\api\google\classes" rmdir /s /q "src\app\api\google\classes"
if exist "src\app\api\google\dashboard" rmdir /s /q "src\app\api\google\dashboard"
if exist "src\app\api\google\disconnect" rmdir /s /q "src\app\api\google\disconnect"
if exist "src\app\api\google\signin" rmdir /s /q "src\app\api\google\signin"
if exist "src\app\api\google\status" rmdir /s /q "src\app\api\google\status"
if exist "src\app\api\google\sync" rmdir /s /q "src\app\api\google\sync"
if exist "src\app\api\google\test" rmdir /s /q "src\app\api\google\test"

REM Eliminar archivos auth obsoletos (excepto [...nextauth])
if exist "src\app\api\auth\detect-role" rmdir /s /q "src\app\api\auth\detect-role"
if exist "src\app\api\auth\detect-role-simple" rmdir /s /q "src\app\api\auth\detect-role-simple"
if exist "src\app\api\auth\google" rmdir /s /q "src\app\api\auth\google"
if exist "src\app\api\auth\redirect" rmdir /s /q "src\app\api\auth\redirect"

REM Eliminar archivos debug y test
if exist "src\app\api\debug" rmdir /s /q "src\app\api\debug"
if exist "src\app\api\test" rmdir /s /q "src\app\api\test"

echo Limpieza de APIs completada!
pause
