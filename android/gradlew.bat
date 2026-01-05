::
:: Copyright 2015 the original author or authors.
::
:: Licensed under the Apache License, Version 2.0 (the "License");
:: you may not use this file except in compliance with the License.
:: You may obtain a copy of the License at
::
::      https://www.apache.org/licenses/LICENSE-2.0
::
:: Unless required by applicable law or agreed to in writing, software
:: distributed under the License is distributed on an "AS IS" BASIS,
:: WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
:: See the License for the specific language governing permissions and
:: limitations under the License.
::

@if "%DEBUG%" == "" @echo off
:: ##########################################################################
::
::  Gradle start up script for Windows
::
:: ##########################################################################

:: Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

:: Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS=-Xmx64m -Xms64m

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

:: Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/b
if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
:: Setup the command line

:: Verify that the user has this script in the gradlew directory.
if not exist "%APP_HOME%\gradlew" (
    :: Ok, we will also allow this script to be in the parent directory.
    if not exist "%APP_HOME%\..\gradlew" (
        echo The gradlew script must be run from the gradlew directory or its parent directory.
        goto fail
    )
)

:: Set-up parameters for Gradle wrapper.
set GRADLE_WRAPPER_JAR="%APP_HOME%\gradle\wrapper\gradle-wrapper.jar"
set GRADLE_WRAPPER_PROPERTIES="%APP_HOME%\gradle\wrapper\gradle-wrapper.properties"

:: Get the application name from the gradle-wrapper.properties file
set GRADLE_APP_NAME_BYTES_STRING=
for /f "tokens=1,2 delims==" %%a in ('findstr "gradle.app.name" "%GRADLE_WRAPPER_PROPERTIES%"') do (
    if "%%a"=="gradle.app.name" (
        set GRADLE_APP_NAME_STRING=%%b
        set GRADLE_APP_NAME_BYTES_STRING=-Dgradle.app.name=%%b
    )
)

:: Execute Gradle
%JAVA_EXE% %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% %GRADLE_APP_NAME_BYTES_STRING% -jar %GRADLE_WRAPPER_JAR% %*

:end
:: End local scope for the variables with windows NT shell
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code.
if not "" == "%GRADLE_EXIT_CONSOLE%" (
  exit 1
)
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
