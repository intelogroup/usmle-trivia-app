@echo off
echo Verifying Supabase MCP Server Installation...
echo.
echo Setting environment variable...
set SUPABASE_ACCESS_TOKEN=sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5
echo.
echo Downloading and checking Supabase MCP Server...
npx -y @supabase/mcp-server-supabase@latest --help 2>&1
echo.
echo Exit code: %ERRORLEVEL%
echo.
echo Configuration file location:
echo %APPDATA%\BLACKBOXAI\User\globalStorage\blackboxapp.blackboxagent\settings\blackbox_mcp_settings.json
echo.
echo Current configuration:
type "%APPDATA%\BLACKBOXAI\User\globalStorage\blackboxapp.blackboxagent\settings\blackbox_mcp_settings.json"
