@echo off

echo "Перевірка файлів TypeScript на наявністu044c JSX синтаксису"



:: u0417наu0445одимо всі .ts файли в проекті

echo "Пошук .ts файлів з JSX..."



set "JSX_FILES="



for /f "tokens=*" %%i in ('findstr /s /m "<.*>" "src\*.ts"') do (

    echo "u0417найдено потенційний JSX синтаксис в файлі: %%i"

    set "JSX_FILES=%%i !JSX_FILES!"

)



if not defined JSX_FILES (

    echo "u041dе знайдено .ts файлів з JSX."

) else (

    echo "u0417найдено потенційні проблеми. Пропонуu0454мо наступні варіанти:"

    echo "1. Перейменуйте файли з .ts на .tsx"

    echo "2. u0417амінітu044c JSX синтаксис на React.createElement"

)



echo "u0413отово!"

pause
