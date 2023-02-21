@ECHO OFF

SET sevenzip="C:\Program Files\7-Zip\7z.exe"

IF EXIST "UploadMe.zip" (
    DEL "UploadMe.zip"
)

%sevenzip% a -tzip -x!*.bat UploadMe.zip .\