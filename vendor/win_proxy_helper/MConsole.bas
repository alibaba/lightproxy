Attribute VB_Name = "Con"
' *************************************************************************
'  Copyright ©1996-2010 Karl E. Peterson
'  All Rights Reserved, http://vb.mvps.org/
' *************************************************************************
'  You are free to use this code within your own applications, but you
'  are expressly forbidden from selling or otherwise distributing this
'  source code, non-compiled, without prior written consent.
' *************************************************************************
'  Redistributed - with full permission - on http://www.vbadvance.com
' *************************************************************************
'  Portions blatently "stolen" from Peter Young, author of vbAdvance (the
'  tool I use to compile VB5/6 console applications), who contributed the
'  notion of creating a lightweight COM object rather than use a full-blown
'  class in order to allow for the callback handling within a single module.
'  For a very cool tool, see: http://www.vbadvance.com
' *************************************************************************
'  Release History.
'  Version 1.00 - February 2004
'   * Initial release with vbAdvance (v3.00).
'  Version 1.01 - March 16, 2004
'   * Added assignment to m_hWnd in Initialize, which allows all usage of
'     that variable to actually work prior to explicit call to hWnd prop.
'   * Changed Initialize to return ConsoleLaunchModes enum.
'   * Added ParentProcessID r/o property.
'   * Added ParentFileName r/o property.
'   * Added LaunchType r/o property.
'   * Added GetProcessParent private method.
'   * Added GetProcessFileName private method.
'   * Added FindConsole private method.
'   * Added numerous declares to support new properties and methods!
'  Version 1.02 - March 18, 2004
'   * Added TaskVisible public property.
'  Version 1.03 - June 8, 2006
'   * Added FlashWindow public method.
'   * Added ReadChar public method.
'   * Added ReadPassword public method.
'  Version 1.04 - February 17, 2010
'   * Fixed GetProcessFileName to work with 64-bit images.
'   * Added MapDeviceName private method.
' *************************************************************************
Option Explicit

' Console related Win32 API declarations
Private Declare Function CloseHandle Lib "kernel32" (ByVal hObject As Long) As Long
Private Declare Function GetStdHandle Lib "kernel32" (ByVal nStdHandle As Long) As Long
Private Declare Function ReadFile Lib "kernel32" (ByVal hFile As Long, lpBuffer As Any, ByVal nNumberOfBytesToRead As Long, lpNumberOfBytesRead As Long, lpOverlapped As Any) As Long
Private Declare Function ReadFileEx Lib "kernel32" (ByVal hFile As Long, lpBuffer As Any, ByVal nNumberOfBytesToRead As Long, lpOverlapped As Any, ByVal lpCompletionRoutine As Long) As Long
Private Declare Function WriteFile Lib "kernel32" (ByVal hFile As Long, lpBuffer As Any, ByVal nNumberOfBytesToWrite As Long, lpNumberOfBytesWritten As Long, lpOverlapped As Any) As Long
Private Declare Function WriteFileEx Lib "kernel32" (ByVal hFile As Long, lpBuffer As Any, ByVal nNumberOfBytesToWrite As Long, lpOverlapped As Any, ByVal lpCompletionRoutine As Long) As Long
Private Declare Function GetFileSize Lib "kernel32" (ByVal hFile As Long, lpFileSizeHigh As Long) As Long
Private Declare Function SetStdHandle Lib "kernel32" (ByVal nStdHandle As Long, ByVal nHandle As Long) As Long
Private Declare Function AllocConsole Lib "kernel32" () As Long
Private Declare Function FreeConsole Lib "kernel32" () As Long

Private Declare Function PeekConsoleInput Lib "kernel32" Alias "PeekConsoleInputA" (ByVal hConsoleInput As Long, ByRef lpBuffer As Any, ByVal nRecords As Long, ByRef lpNumberOfEventsRead As Long) As Long
Private Declare Function GetNumberOfConsoleInputEvents Lib "kernel32" (ByVal hConsoleInput As Long, ByRef lpNumberOfEvents As Long) As Long
Private Declare Function ReadConsole Lib "kernel32" Alias "ReadConsoleA" (ByVal hConsoleInput As Long, lpBuffer As Any, ByVal nNumberOfCharsToRead As Long, lpNumberOfCharsRead As Long, lpReserved As Any) As Long
Private Declare Function ReadConsoleOutput Lib "kernel32" Alias "ReadConsoleOutputA" (ByVal hConsoleOutput As Long, lpBuffer As CHAR_INFO, dwBufferSize As COORD, dwBufferCoord As COORD, lpReadRegion As SMALL_RECT) As Long
Private Declare Function ReadConsoleOutputAttribute Lib "kernel32" (ByVal hConsoleOutput As Long, lpAttribute As Long, ByVal nLength As Long, dwReadCoord As COORD, lpNumberOfAttrsRead As Long) As Long
Private Declare Function ReadConsoleOutputCharacter Lib "kernel32" Alias "ReadConsoleOutputCharacterA" (ByVal hConsoleOutput As Long, ByVal lpCharacter As String, ByVal nLength As Long, dwReadCoord As COORD, lpNumberOfCharsRead As Long) As Long
Private Declare Function WriteConsole Lib "kernel32" Alias "WriteConsoleA" (ByVal hConsoleOutput As Long, lpBuffer As Any, ByVal nNumberOfCharsToWrite As Long, lpNumberOfCharsWritten As Long, lpReserved As Any) As Long
Private Declare Function WriteConsoleOutput Lib "kernel32" Alias "WriteConsoleOutputA" (ByVal hConsoleOutput As Long, lpBuffer As CHAR_INFO, dwBufferSize As COORD, dwBufferCoord As COORD, lpWriteRegion As SMALL_RECT) As Long
Private Declare Function WriteConsoleOutputAttribute Lib "kernel32" (ByVal hConsoleOutput As Long, lpAttribute As Integer, ByVal nLength As Long, dwWriteCoord As COORD, lpNumberOfAttrsWritten As Long) As Long
Private Declare Function WriteConsoleOutputCharacter Lib "kernel32" Alias "WriteConsoleOutputCharacterA" (ByVal hConsoleOutput As Long, ByVal lpCharacter As String, ByVal nLength As Long, dwWriteCoord As COORD, lpNumberOfCharsWritten As Long) As Long
Private Declare Function FlushConsoleInputBuffer Lib "kernel32" (ByVal hConsoleInput As Long) As Long
Private Declare Function ReadConsoleInput Lib "kernel32" Alias "ReadConsoleInputA" (ByVal hConsoleInput As Long, lpBuffer As Any, ByVal nLength As Long, lpNumberOfEventsRead As Long) As Long
Private Declare Function WriteConsoleInput Lib "kernel32" Alias "WriteConsoleOutputA" (ByVal hConsoleInput As Long, ByVal lpBuffer As Any, ByVal nLength As Long, lpNumberOfEventsWritten As Long) As Long

Private Declare Function GetConsoleCursorInfo Lib "kernel32" (ByVal hConsoleOutput As Long, lpConsoleCursorInfo As CONSOLE_CURSOR_INFO) As Long
Private Declare Function GetConsoleMode Lib "kernel32" (ByVal hConsoleHandle As Long, lpMode As Long) As Long
Private Declare Function GetConsoleScreenBufferInfo Lib "kernel32" (ByVal hConsoleOutput As Long, lpConsoleScreenBufferInfo As CONSOLE_SCREEN_BUFFER_INFO) As Long
Private Declare Function GetConsoleTitle Lib "kernel32" Alias "GetConsoleTitleA" (ByVal lpConsoleTitle As String, ByVal nSize As Long) As Long
Private Declare Function SetConsoleActiveScreenBuffer Lib "kernel32" (ByVal hConsoleOutput As Long) As Long
Private Declare Function SetConsoleCtrlHandler Lib "kernel32" (ByVal HandlerRoutine As Long, ByVal Add As Long) As Long
Private Declare Function SetConsoleCursorInfo Lib "kernel32" (ByVal hConsoleOutput As Long, lpConsoleCursorInfo As CONSOLE_CURSOR_INFO) As Long
Private Declare Function SetConsoleCursorPosition Lib "kernel32" (ByVal hConsoleOutput As Long, dwCursorPosition As Any) As Long
Private Declare Function SetConsoleMode Lib "kernel32" (ByVal hConsoleHandle As Long, ByVal dwMode As Long) As Long
Private Declare Function SetConsoleScreenBufferSize Lib "kernel32" (ByVal hConsoleOutput As Long, dwSize As Any) As Long
Private Declare Function SetConsoleTextAttribute Lib "kernel32" (ByVal hConsoleOutput As Long, ByVal wAttributes As Long) As Long
Private Declare Function SetConsoleTitle Lib "kernel32" Alias "SetConsoleTitleA" (ByVal lpConsoleTitle As String) As Long
Private Declare Function SetConsoleWindowInfo Lib "kernel32" (ByVal hConsoleOutput As Long, ByVal bAbsolute As Long, lpConsoleWindow As SMALL_RECT) As Long

Private Declare Function GetConsoleCP Lib "kernel32" () As Long
Private Declare Function SetConsoleCP Lib "kernel32" (ByVal wCodePageID As Integer) As Long
Private Declare Function GetConsoleOutputCP Lib "kernel32" () As Long
Private Declare Function SetConsoleOutputCP Lib "kernel32" (ByVal wCodePageID As Integer) As Long
Private Declare Function GetConsoleDisplayMode Lib "kernel32" (lpModeFlags As Long) As Long
Private Declare Function SetConsoleDisplayMode Lib "kernel32" (ByVal hConsoleHandle As Long, ByVal dwConsoleDisplayMode As Long, dwPreviousDisplayMode As Long) As Long

Private Declare Function GetLogicalDriveStrings Lib "kernel32" Alias "GetLogicalDriveStringsA" (ByVal nBufferLength As Long, ByVal lpBuffer As String) As Long
Private Declare Function QueryDosDevice Lib "kernel32" Alias "QueryDosDeviceA" (ByVal lpDeviceName As String, ByVal lpTargetPath As String, ByVal ucchMax As Long) As Long

' PSAPI Declares (available only in NT4 and later!)...
' Although, this download *used* to be offered for NT 3.51 as well:
' http://www.microsoft.com/downloads/details.aspx?displaylang=en&FamilyID=3D1FBAED-D122-45CF-9D46-1CAE384097AC
Private Declare Function GetModuleFileNameEx Lib "PSAPI" Alias "GetModuleFileNameExA" (ByVal hProcess As Long, ByVal hModule As Long, ByVal lpFileName As String, nSize As Long) As Long
Private Declare Function GetProcessImageFileName Lib "PSAPI" Alias "GetProcessImageFileNameA" (ByVal hProcess As Long, ByVal lpImageFileName As String, ByVal nSize As Long) As Long

' Process info API declarations - NT4 and earlier - undocumented.
Private Declare Function NtQueryInformationProcess Lib "ntdll" (ByVal ProcessHandle As Long, ByVal ProcessInformationClass As SYSTEM_INFORMATION_CLASS, ByRef ProcessInformation As Any, ByVal lProcessInformationLength As Long, ByRef lReturnLength As Long) As Long

' Process info API declarations - 9x/NT5+
Private Declare Function CreateToolhelp32Snapshot Lib "kernel32" (ByVal dwFlags As Long, ByVal th32ProcessID As Long) As Long
Private Declare Function Process32First Lib "kernel32" (ByVal hSnapshot As Long, ByRef lppe As PROCESSENTRY32) As Long
Private Declare Function Process32Next Lib "kernel32" (ByVal hSnapshot As Long, ByRef lppe As PROCESSENTRY32) As Long

' NT5 (Windows 2000) and later, only!
Private Declare Function GetConsoleWindow Lib "kernel32" () As Long

' Other Win32 API declarations.
Private Declare Function EnumThreadWindows Lib "user32" (ByVal dwThreadId As Long, ByVal lpfn As Long, ByVal lParam As Long) As Long
Private Declare Function GetModuleFileName Lib "kernel32" Alias "GetModuleFileNameA" (ByVal hModule As Long, ByVal lpFileName As String, ByVal nSize As Long) As Long
Private Declare Function FindWindow Lib "user32" Alias "FindWindowA" (ByVal lpClassName As String, ByVal lpWindowName As String) As Long
Private Declare Function GetWindowThreadProcessId Lib "user32" (ByVal hWnd As Long, lpdwProcessId As Long) As Long
Private Declare Function GetCurrentProcessId Lib "kernel32" () As Long
Private Declare Function GetCurrentThreadId Lib "kernel32" () As Long
Private Declare Function GetWindowLong Lib "user32" Alias "GetWindowLongA" (ByVal hWnd As Long, ByVal nIndex As Long) As Long
Private Declare Function GetForegroundWindow Lib "user32" () As Long
Private Declare Function SetForegroundWindow Lib "user32" (ByVal hWnd As Long) As Long
Private Declare Function AttachThreadInput Lib "user32" (ByVal idAttach As Long, ByVal idAttachTo As Long, ByVal fAttach As Long) As Long
Private Declare Function GetSystemMenu Lib "user32" (ByVal hWnd As Long, ByVal revert As Long) As Long
Private Declare Function RemoveMenu Lib "user32" (ByVal hMenu As Long, ByVal nPosition As Long, ByVal wFlags As Long) As Long
Private Declare Function IsIconic Lib "user32" (ByVal hWnd As Long) As Long
Private Declare Function IsZoomed Lib "user32" (ByVal hWnd As Long) As Long
Private Declare Function IsWindowVisible Lib "user32" (ByVal hWnd As Long) As Long
Private Declare Function ShowWindow Lib "user32" (ByVal hWnd As Long, ByVal nCmdShow As Long) As Long
Private Declare Function FlashWindowEx Lib "user32" (pfi As FLASHWINFO) As Long
Private Declare Function GetVersionEx Lib "kernel32" Alias "GetVersionExA" (lpVersionInformation As Any) As Long
Private Declare Function OpenProcess Lib "kernel32" (ByVal dwDesiredAccess As Long, ByVal bInheritHandle As Long, ByVal dwProcessID As Long) As Long
Private Declare Sub OutputDebugString Lib "kernel32" Alias "OutputDebugStringA" (ByVal lpOutputString As String)

Private Declare Sub CopyMemory Lib "kernel32" Alias "RtlMoveMemory" (Destination As Any, Source As Any, ByVal Length As Long)
Private Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
Private Declare Function SleepEx Lib "kernel32" (ByVal dwMilliseconds As Long, ByVal bAlertable As Long) As Long
Private Declare Sub ExitProcess Lib "kernel32" (ByVal uExitCode As Long)

' Used to determine if an API function is exported.
Private Declare Function GetModuleHandle Lib "kernel32" Alias "GetModuleHandleA" (ByVal lpModuleName As String) As Long
Private Declare Function LoadLibrary Lib "kernel32" Alias "LoadLibraryA" (ByVal lpLibFileName As String) As Long
Private Declare Function GetProcAddress Lib "kernel32" (ByVal hModule As Long, ByVal lpProcName As String) As Long
Private Declare Function FreeLibrary Lib "kernel32" (ByVal hLibModule As Long) As Long

' Maximum path length (without special handling) in NT
Private Const MAX_PATH As Long = 260&

' Uncover process information on 9x/NT5+.
Private Type PROCESSENTRY32
   dwSize As Long
   cntUsage As Long
   th32ProcessID As Long
   th32DefaultHeapID As Long
   th32ModuleID As Long
   cntThreads As Long
   th32ParentProcessID As Long
   pcPriClassBase As Long
   dwFlags As Long
   szExeFile As String * MAX_PATH
End Type

' Process information under NT4- (undoc'd)
Public Type PROCESS_BASIC_INFORMATION
   ExitStatus As Long
   PebBaseAddress As Long
   AffinityMask As Long
   BasePriority As Long
   UniqueProcessId As Long
   InheritedFromUniqueProcessId As Long  ' ParentProcessID
End Type

' Process information types
Private Enum SYSTEM_INFORMATION_CLASS
   SystemBasicInformation = 0
   SystemPerformanceInformation = 2
   SystemTimeOfDayInformation = 3
   SystemProcessInformation = 5
   SystemProcessorPerformanceInformation = 8
   SystemInterruptInformation = 23
   SystemExceptionInformation = 33
   SystemRegistryQuotaInformation = 37
   SystemLookasideInformation = 45
End Enum

' Used to find hidden controller window.
Private Const GWL_HWNDPARENT As Long = (-8)
Private Const GWL_STYLE As Long = (-16)
Private Const WS_SYSMENU As Long = &H80000

' Toolhelp constants.
Private Const TH32CS_SNAPPROCESS As Long = &H2&

' Used by the OpenProcess API call
Private Const PROCESS_ALL_ACCESS As Long = &H1F0FFF
Private Const PROCESS_QUERY_INFORMATION As Long = &H400
Private Const PROCESS_VM_READ As Long = &H10

' Some calls need to know OS
Private Type OSVERSIONINFO
   dwOSVersionInfoSize As Long
   dwMajorVersion As Long
   dwMinorVersion As Long
   dwBuildNumber As Long
   dwPlatformId As Long
   szCSDVersion As String * 128
End Type

' Used with FlashWindowEx - Note Win98/2000+ only!
Private Type FLASHWINFO
   cbSize As Long
   hWnd As Long
   dwFlags As Long
   uCount As Long
   dwTimeout As Long
End Type

' FlashWindow flag constants
Private Const FLASHW_STOP As Long = 0&
Private Const FLASHW_CAPTION As Long = 1&
Private Const FLASHW_TRAY As Long = 2&
Private Const FLASHW_ALL As Long = FLASHW_CAPTION Or FLASHW_TRAY
Private Const FLASHW_TIMER As Long = 4&
Private Const FLASHW_TIMERNOFG As Long = &HC&

' Platform ID constants
Private Const VER_PLATFORM_WIN32s As Long = &H0
Private Const VER_PLATFORM_WIN32_WINDOWS As Long = &H1
Private Const VER_PLATFORM_WIN32_NT As Long = &H2

' Standard I/O handle constants.
Private Const STD_ERROR_HANDLE          As Long = -12&
Private Const STD_INPUT_HANDLE          As Long = -10&
Private Const STD_OUTPUT_HANDLE         As Long = -11&

' Used to understand console display mode.
Private Const CONSOLE_WINDOWED As Long = 0
Private Const CONSOLE_FULLSCREEN As Long = 1             ' fullscreen console
Private Const CONSOLE_FULLSCREEN_HARDWARE As Long = 2    ' console owns the hardware

' Input Mode flags:
Private Const ENABLE_PROCESSED_INPUT    As Long = &H1&
Private Const ENABLE_LINE_INPUT         As Long = &H2&
Private Const ENABLE_ECHO_INPUT         As Long = &H4&
Private Const ENABLE_WINDOW_INPUT       As Long = &H8&
Private Const ENABLE_MOUSE_INPUT        As Long = &H10&

' Output Mode flags:
Private Const ENABLE_PROCESSED_OUTPUT   As Long = &H1&
Private Const ENABLE_WRAP_AT_EOL_OUTPUT As Long = &H2&

' Attributes flags.
Private Const FOREGROUND_BLUE           As Long = &H1&    ' text color contains blue.
Private Const FOREGROUND_GREEN          As Long = &H2&    ' text color contains green.
Private Const FOREGROUND_RED            As Long = &H4&    ' text color contains red.
Private Const FOREGROUND_INTENSITY      As Long = &H8&    ' text color is intensified.
Private Const BACKGROUND_BLUE           As Long = &H10&   ' background color contains blue.
Private Const BACKGROUND_GREEN          As Long = &H20&   ' background color contains green.
Private Const BACKGROUND_RED            As Long = &H40&   ' background color contains red.
Private Const BACKGROUND_INTENSITY      As Long = &H80&   ' background color is intensified.

' Type of control signal received by the handler
Private Const CTRL_C_EVENT = 0
Private Const CTRL_BREAK_EVENT = 1
Private Const CTRL_CLOSE_EVENT = 2
'  3 is reserved!
'  4 is reserved!
Private Const CTRL_LOGOFF_EVENT = 5
Private Const CTRL_SHUTDOWN_EVENT = 6

' ShowWindow() Commands
Private Const SW_HIDE = 0
Private Const SW_SHOWNORMAL = 1
Private Const SW_NORMAL = 1
Private Const SW_SHOWMINIMIZED = 2
Private Const SW_SHOWMAXIMIZED = 3
Private Const SW_MAXIMIZE = 3
Private Const SW_SHOWNOACTIVATE = 4
Private Const SW_SHOW = 5
Private Const SW_MINIMIZE = 6
Private Const SW_SHOWMINNOACTIVE = 7
Private Const SW_SHOWNA = 8
Private Const SW_RESTORE = 9
Private Const SW_SHOWDEFAULT = 10
Private Const SW_FORCEMINIMIZE = 11
Private Const SW_MAX = 11

' Structures used with API.
Private Type OVERLAPPED
   Internal                            As Long
   InternalHigh                        As Long
   offset                              As Long
   OffsetHigh                          As Long
   hEvent                              As Long
End Type

Private Type CHAR_INFO
   Char                                As Integer
   Attributes                          As Integer
End Type

Private Type CONSOLE_CURSOR_INFO
   dwSize                              As Long
   bVisible                            As Long
End Type

Private Type COORD
   x                                   As Integer
   y                                   As Integer
End Type

Private Type SMALL_RECT
   Left                                As Integer
   Top                                 As Integer
   Right                               As Integer
   Bottom                              As Integer
End Type

Private Type CONSOLE_SCREEN_BUFFER_INFO
   dwSize                              As COORD
   dwCursorPosition                    As COORD
   wAttributes                         As Integer
   srWindow                            As SMALL_RECT
   dwMaximumWindowSize                 As COORD
End Type

' Combination of INPUT_RECORD and KEY_EVENT_RECORD structures.
Private Type INPUT_KEY_EVENT_RECORD
   EventType As Integer         '   WORD  EventType;
   bKeyDown As Long             '   BOOL  bKeyDown;
   wRepeatCount As Integer      '   WORD  wRepeatCount;
   wVirtualKeyCode As Integer   '   WORD  wVirtualKeyCode;
   wVirtualScanCode As Integer  '   WORD  wVirtualScanCode;
   AsciiChar As Integer         '   CHAR  AsciiChar;
   dwControlKeyState As Long    '   DWORD dwControlKeyState;
End Type

' Possible types of console events.
Private Const KEY_EVENT As Integer = &H1                 ' Event contains key event record
Private Const MOUSE_EVENT As Integer = &H2               ' Event contains mouse event record
Private Const WINDOW_BUFFER_SIZE_EVENT As Integer = &H4  ' Event contains window change event record
Private Const MENU_EVENT As Integer = &H8                ' Event contains menu event record
Private Const FOCUS_EVENT As Integer = &H10              ' Event contains focus change

' Structures used in creation of lightweight object.
Private Type ConsoleType
   pVTable As Long
   pThisObject As IUnknown
End Type

Private Type VTable
   VTable(0 To 2) As Long
End Type

' Window class constant(s)
Const ConsoleClassName As String = "ConsoleWindowClass"
Const ConsoleClassName95 As String = "tty"

' Member variables used to manage lightweight object.
Private m_CT As ConsoleType
Private m_VTable As VTable
Private m_pVTable As Long

' Task related member variables.
Private m_StdError            As Long
Private m_StdInput            As Long
Private m_StdOutput           As Long
Private m_OriginalInputMode   As Long
Private m_OriginalOutputMode  As Long
Private m_OriginalColors      As Long
Private m_CloseProgram        As Boolean
Private m_ControlEvent        As Long
Private m_BackColor           As Long
Private m_ForeColor           As Long
Private m_Compiled            As Boolean
Private m_Redirected          As Boolean
Private m_ExitCode            As Long
Private m_hWnd                As Long
' *** Added at v1.01 ***
Private m_ParentProcessID     As Long
Private m_ParentFilename      As String

' Consumable enumerations
Public Enum ConsoleControlSignals
   conEventNone = -1
   conEventControlC = CTRL_C_EVENT
   conEventControlBreak = CTRL_BREAK_EVENT
   conEventClose = CTRL_CLOSE_EVENT
   conEventLogoff = CTRL_LOGOFF_EVENT
   conEventShutdown = CTRL_SHUTDOWN_EVENT
End Enum

Public Enum ConsoleWriteAlignments
   conAlignNone
   conAlignLeft
   conAlignCentered
   conAlignRight
End Enum

Public Enum ConsoleOutputDestinations
   conStandardOutput
   conStandardError
End Enum

' *** Added v1.01 ***
Public Enum ConsoleLaunchModes
   conLaunchUnknown = 0  'indeterminate - NT versions prior to 4.0
   conLaunchConsole = 1  'launched at command line.
   conLaunchExplorer = 2 'double-clicked, from shortcut, etc.
   conLaunchVBIDE = 4    'running within the IDE
End Enum

' Enumeration of character attributes.
Public Enum ConsoleColors
   [_ColorMin] = 0&
   conBlack = 0&
   conBlue = FOREGROUND_BLUE
   conGreen = FOREGROUND_GREEN
   conCyan = FOREGROUND_BLUE Or FOREGROUND_GREEN
   conRed = FOREGROUND_RED
   conMagenta = FOREGROUND_RED Or FOREGROUND_BLUE
   conYellow = FOREGROUND_RED Or FOREGROUND_GREEN
   conWhite = FOREGROUND_BLUE Or FOREGROUND_GREEN Or FOREGROUND_RED
   conBlackHi = FOREGROUND_INTENSITY
   conBlueHi = FOREGROUND_BLUE Or FOREGROUND_INTENSITY
   conCyanHi = FOREGROUND_BLUE Or FOREGROUND_GREEN Or FOREGROUND_INTENSITY
   conGreenHi = FOREGROUND_GREEN Or FOREGROUND_INTENSITY
   conRedHi = FOREGROUND_RED Or FOREGROUND_INTENSITY
   conMagentaHi = FOREGROUND_RED Or FOREGROUND_BLUE Or FOREGROUND_INTENSITY
   conYellowHi = FOREGROUND_RED Or FOREGROUND_GREEN Or FOREGROUND_INTENSITY
   conWhiteHi = FOREGROUND_BLUE Or FOREGROUND_GREEN Or FOREGROUND_RED Or FOREGROUND_INTENSITY
   [_ColorMax] = FOREGROUND_BLUE Or FOREGROUND_GREEN Or FOREGROUND_RED Or FOREGROUND_INTENSITY
End Enum

' ******************************************
'  Initialize / Terminate
'    Release is called automatically when
'    application is terminating.
' ******************************************
Public Function Initialize() As ConsoleLaunchModes
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   Dim lpBuffer As Long, CharsRead As Long
   Dim nRet As Long, nErr As Long
   Const ERROR_INVALID_HANDLE As Long = 6
   ' ****************************************************
   ' If the VTable pointer is uninitialized, we haven't
   ' been through this routine yet, so only do the init
   ' stuff when that's the case...
   ' ****************************************************
   ' Create the lightweight COM object that provides
   ' us with both automatic teardown notification,
   ' and allows us to sink notifications directly.
   If m_pVTable = 0 Then
      With m_CT
         If .pVTable = 0 Then
            ' Create the lightweight's VTable:
            With m_VTable
               .VTable(0) = FuncPtr(AddressOf QueryInterface)
               .VTable(1) = FuncPtr(AddressOf AddRef)
               .VTable(2) = FuncPtr(AddressOf Release)
               m_pVTable = VarPtr(.VTable(0))
            End With
            ' Finish setting up the lightweight.
            .pVTable = m_pVTable
            CopyMemory .pThisObject, VarPtr(.pVTable), 4
         End If
      End With

      ' Create a console to play in, if running in the IDE.
      ' Cache handle to console window, either way.
      m_Compiled = IsCompiled()
      If m_Compiled Then
         ' *** Added in v1.01 ***
         m_hWnd = Con.hWnd
      Else
         ' *** Changed in v1.01 ***
         m_hWnd = LaunchConsole()
      End If

      'Set up the handler callback.
      Call SetConsoleCtrlHandler(AddressOf HandlerRoutine, True)

      ' Get the standard handles.
      m_StdError = GetStdHandle(STD_ERROR_HANDLE)
      m_StdInput = GetStdHandle(STD_INPUT_HANDLE)
      m_StdOutput = GetStdHandle(STD_OUTPUT_HANDLE)
      
      ' Save the current INPUT and OUTPUT modes.
      Call GetConsoleMode(m_StdInput, m_OriginalInputMode)
      Call GetConsoleMode(m_StdOutput, m_OriginalOutputMode)

      ' Set a default INPUT mode.
      Const defInputMode = ENABLE_LINE_INPUT Or _
                           ENABLE_PROCESSED_INPUT Or _
                           ENABLE_ECHO_INPUT
      Call SetConsoleMode(m_StdInput, defInputMode)

      ' Set a default OUTPUT mode.
      Const defOutputMode = ENABLE_PROCESSED_OUTPUT Or _
                            ENABLE_WRAP_AT_EOL_OUTPUT
      Call SetConsoleMode(m_StdOutput, defOutputMode)

      ' Get the current colors.
      Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
      m_OriginalColors = csbi.wAttributes
      m_BackColor = csbi.wAttributes \ &H10
      m_ForeColor = csbi.wAttributes Mod &H10

      ' Test to see whether standard input has been redirected.
      ' In this case, Err.LastDllError returns 0, oddly enough.
      ' Source: Dr. GUI, July 2003, "Do You Know Where That Stream's Been?"
      ' http://msdn.microsoft.com/library/en-us/dnaskdr/html/askgui07152003.asp
      nRet = PeekConsoleInput(m_StdInput, lpBuffer, 0, CharsRead)
      nErr = Err.LastDllError
      m_Redirected = (nRet = 0) And (nErr = ERROR_INVALID_HANDLE)
      
      ' Initial control signal status.
      m_ControlEvent = conEventNone
      
      ' *** Added at v1.01 ***
      ' Determine parent process name, cache.
      m_ParentFilename = GetProcessParent()
      
      ' *** Added at v1.02 ***
      ' Hide hidden controller window so we disappear from
      ' Applications tab in Task Manager.
      Const defTaskVisible As Boolean = False
      Con.TaskVisible = defTaskVisible
      
      ' *** Added at v1.01 ***
      ' Assign LaunchMode to retval.
      Initialize = LaunchMode()
   End If
End Function

' *****************************************************
'  Lightweight object's Release method will be called
'  automatically when application terminates.
'  Release, in turn, calls Terminate to perform all
'  task-related clean-up activities.
' *****************************************************
Private Sub Terminate()
   ' Restore original colors
   Call SetConsoleTextAttribute(m_StdOutput, m_OriginalColors)

   ' Restore original INPUT and OUTPUT modes
   Call SetConsoleMode(m_StdInput, m_OriginalInputMode)
   Call SetConsoleMode(m_StdOutput, m_OriginalOutputMode)

   ' Kill off IDE-hosted console, after pausing
   ' to allow results to be viewed.
   If Not m_Compiled Then
      Call Con.SetFocus(True)
      Con.PressAnyKey vbCrLf & vbCrLf & _
         " --- Execution Complete: Press any key to return to the IDE --- "
      Call FreeConsole
   End If

   ' Close all the standard handles
   Call CloseHandle(m_StdError)
   Call CloseHandle(m_StdInput)
   Call CloseHandle(m_StdOutput)
   
   ' Return appropriate exit code, but *only*
   ' if running from EXE, else IDE exits too.
   ' App *must* be compiled to native code to
   ' avoid a nasty shutdown GPF in runtime!
   If m_Compiled Then
      Call ExitProcess(m_ExitCode)
   End If
End Sub

' ******************************************
'  Public Properties: Read/Write
' ******************************************
Public Property Let BackColor(ByVal NewBackColor As ConsoleColors)
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Attempt to set a new backcolor.
   If NewBackColor >= [_ColorMin] And NewBackColor <= [_ColorMax] Then
      Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
      m_ForeColor = csbi.wAttributes Mod &H10
      m_BackColor = NewBackColor * &H10
      Call SetConsoleTextAttribute(m_StdOutput, m_ForeColor Or m_BackColor)
   End If
End Property

Public Property Get BackColor() As ConsoleColors
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Get the current colors, return backcolor.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   m_BackColor = csbi.wAttributes \ &H10
   BackColor = m_BackColor
End Property

Public Property Let Break(ByVal NewVal As Boolean)
   ' Give client a chance to reset this flag so it
   ' can proceed to clean up after itself.
   m_CloseProgram = NewVal
End Property

Public Property Get Break() As Boolean
   ' When the user attempts to manually shutdown
   ' the console app, our Handler will be tickled
   ' and set a flag that the process can check.
   ' If the process ignores this flag, the system
   ' tends to call ExitProcess in response.
   Break = m_CloseProgram
End Property

Public Property Let BufferHeight(ByVal NewHeight As Integer)
   Dim sz As COORD
   ' Attempt setting a new height for console buffer.
   If NewHeight > 0 Then
      sz.x = Con.BufferWidth
      sz.y = NewHeight
      Call SetConsoleScreenBufferSize(m_StdOutput, ByVal CoordToLong(sz))
      Debug.Print "BufferHeight: "; Err.LastDllError
   End If
End Property

Public Property Get BufferHeight() As Integer
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Return height of console buffer.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   BufferHeight = csbi.dwSize.y
End Property

Public Property Let BufferWidth(ByVal NewWidth As Integer)
   Dim sz As COORD
   ' Attempt setting a new width for console buffer.
   If NewWidth > 0 Then
      sz.x = NewWidth
      sz.y = Con.BufferHeight
      Call SetConsoleScreenBufferSize(m_StdOutput, ByVal CoordToLong(sz))
   End If
End Property

Public Property Get BufferWidth() As Integer
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Return width of console buffer.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   BufferWidth = csbi.dwSize.x
End Property

Public Property Let CodePageI(ByVal NewCP As Integer)
   ' Attempt to set current input codepage ID.
   Call SetConsoleCP(NewCP)
End Property

Public Property Get CodePageI() As Integer
   ' Retrieve current input codepage ID.
   CodePageI = GetConsoleCP()
End Property

Public Property Let CodePageO(ByVal NewCP As Integer)
   ' Attempt to set current output codepage ID.
   Call SetConsoleOutputCP(NewCP)
End Property

Public Property Get CodePageO() As Integer
   ' Retrieve current input codepage ID.
   CodePageO = GetConsoleOutputCP()
End Property

Public Property Let CurrentX(ByVal NewPosition As Integer)
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Determine current cursor position.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   ' Clamping request at buffer extents in extreme cases.
   If NewPosition > csbi.dwSize.x Then
      csbi.dwCursorPosition.x = csbi.dwSize.x
   ElseIf NewPosition < 0 Then
      csbi.dwCursorPosition.x = 0
   Else
      csbi.dwCursorPosition.x = NewPosition
   End If
   ' Attempt to set new cursor position.
   Call SetConsoleCursorPosition(m_StdOutput, ByVal CoordToLong(csbi.dwCursorPosition))
End Property

Public Property Get CurrentX() As Integer
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Return X-position of cursor; 0-based.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   CurrentX = csbi.dwCursorPosition.x
End Property

Public Property Let CurrentY(ByVal NewPosition As Integer)
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Determine current cursor position.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   ' Clamping request at buffer extents in extreme cases.
   If NewPosition > csbi.dwSize.y Then
      csbi.dwCursorPosition.y = csbi.dwSize.y
   ElseIf NewPosition < 0 Then
      csbi.dwCursorPosition.y = 0
   Else
      csbi.dwCursorPosition.y = NewPosition
   End If
   ' Attempt to set new cursor position.
   Call SetConsoleCursorPosition(m_StdOutput, ByVal CoordToLong(csbi.dwCursorPosition))
End Property

Public Property Get CurrentY() As Integer
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Return Y-position of cursor; 0-based.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   CurrentY = csbi.dwCursorPosition.y
End Property

Public Property Let CursorHeight(ByVal NewPercentage As Integer)
   Dim cci As CONSOLE_CURSOR_INFO
   ' Cursor height is restricted to 1-100% of cell size.
   If NewPercentage >= 1 And NewPercentage <= 100 Then
      ' Get current values.
      Call GetConsoleCursorInfo(m_StdOutput, cci)
      cci.dwSize = NewPercentage
      Call SetConsoleCursorInfo(m_StdOutput, cci)
   End If
End Property

Public Property Get CursorHeight() As Integer
   Dim cci As CONSOLE_CURSOR_INFO
   ' Return cursor height as a percentage of character cell size.
   Call GetConsoleCursorInfo(m_StdOutput, cci)
   CursorHeight = cci.dwSize
End Property

Public Property Let CursorVisible(ByVal NewVisible As Boolean)
   Dim cci As CONSOLE_CURSOR_INFO
   ' Get current values, and set as requested.
   Call GetConsoleCursorInfo(m_StdOutput, cci)
   cci.bVisible = NewVisible
   Call SetConsoleCursorInfo(m_StdOutput, cci)
End Property

Public Property Get CursorVisible() As Boolean
   Dim cci As CONSOLE_CURSOR_INFO
   ' Return cursor visibility.
   Call GetConsoleCursorInfo(m_StdOutput, cci)
   CursorVisible = cci.bVisible
End Property

Public Property Let ExitCode(ByVal NewExitCode As Long)
   ' Simply stash exitcode to use as app is terminating.
   m_ExitCode = NewExitCode
End Property

Public Property Get ExitCode() As Long
   ' Return cached value.
   ExitCode = m_ExitCode
End Property

Public Property Let ForeColor(ByVal NewForeColor As ConsoleColors)
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Attempt to set a new forecolor.
   If NewForeColor >= [_ColorMin] And NewForeColor <= [_ColorMax] Then
      Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
      m_BackColor = (csbi.wAttributes \ &H10) * &H10
      m_ForeColor = NewForeColor
      Call SetConsoleTextAttribute(m_StdOutput, m_ForeColor Or m_BackColor)
   End If
End Property

Public Property Get ForeColor() As ConsoleColors
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Get the current colors, return forecolor.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   m_ForeColor = csbi.wAttributes Mod &H10
   ForeColor = m_ForeColor
End Property

Public Property Let FullScreen(ByVal NewVal As Boolean)
   Dim lpModeFlags As Long
   Dim dwPrevMode As Long
   ' Attempt to set full-screen status.  Not supported on Win9x!
   If Exported("kernel32", "SetConsoleDisplayMode") = False Or _
      Exported("kernel32", "GetConsoleDisplayMode") = False Then
      ' No need to continue!
      Exit Property
   End If

   ' Make sure there is a need to change.
   If GetConsoleDisplayMode(lpModeFlags) Then
      If CBool(lpModeFlags And CONSOLE_FULLSCREEN_HARDWARE) Then
         If NewVal = False Then
            ' We are currently running full-screen,
            ' and we need to switch to windowed.
            Call SetConsoleDisplayMode(m_StdOutput, 0&, dwPrevMode)
         End If
      Else
         If NewVal = True Then
            ' We are currently running windowed, and
            ' we need to switch to full-screen.
            Call SetConsoleDisplayMode(m_StdOutput, 1&, dwPrevMode)
         End If
      End If
   End If
End Property

Public Property Get FullScreen() As Boolean
   Dim lpModeFlags As Long
   ' Attempt to set full-screen status.  Not supported on Win9x!
   If Exported("kernel32", "GetConsoleDisplayMode") Then
      If GetConsoleDisplayMode(lpModeFlags) Then
         FullScreen = CBool(lpModeFlags And CONSOLE_FULLSCREEN_HARDWARE)
      End If
   End If
End Property

Public Property Let Height(ByVal NewHeight As Integer)
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Determine maximum height (chars) of console window.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   ' Adjust structure elements to be sure they're 0-based.
   csbi.srWindow.Top = 0
   csbi.srWindow.Right = csbi.srWindow.Right - csbi.srWindow.Left
   csbi.srWindow.Left = 0
   ' Make sure requested height is valid (0-based).
   If NewHeight > csbi.dwMaximumWindowSize.y Then
      csbi.srWindow.Bottom = csbi.dwMaximumWindowSize.y - 1
   Else
      csbi.srWindow.Bottom = NewHeight - 1
   End If
   ' Attempt setting new console window height.
   Call SetConsoleWindowInfo(m_StdOutput, True, csbi.srWindow)
End Property

Public Property Get Height() As Integer
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Return height (chars) of console window.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   Height = csbi.srWindow.Bottom - csbi.srWindow.Top + 1
End Property

Public Property Let TaskVisible(ByVal NewVal As Boolean)
   ' Attempt to set task's current visibility state.
   ' This affects the Applications tab in Task Manager.
   ' If True, there are two icons - one for the console
   ' task itself, and one for this task running within
   ' the console.  If false, only the console icon shows.
   If NewVal Then
      Call ShowWindow(FindHiddenTopWindow(), SW_SHOW)
   Else
      Call ShowWindow(FindHiddenTopWindow(), SW_HIDE)
   End If
End Property

Public Property Get TaskVisible() As Boolean
   ' Return current state of task visibility.
   TaskVisible = IsWindowVisible(FindHiddenTopWindow())
End Property

Public Property Let Title(ByVal NewTitle As String)
   ' Update the console title text
   Call SetConsoleTitle(NewTitle)
End Property

Public Property Get Title() As String
   Dim Buffer As String
   Dim nRet As Long
   ' Read title text of console
   Buffer = Space$(1024)
   nRet = GetConsoleTitle(Buffer, Len(Buffer))
   If nRet Then
      Title = Left$(Buffer, nRet)
   End If
End Property

Public Property Let Visible(ByVal NewVal As Boolean)
   ' Attempt to set current visibility state.
   If NewVal Then
      Call ShowWindow(m_hWnd, SW_SHOW)
   Else
      Call ShowWindow(m_hWnd, SW_HIDE)
   End If
End Property

Public Property Get Visible() As Boolean
   ' Return current state of visibility.
   Visible = IsWindowVisible(m_hWnd)
End Property

Public Property Let Width(ByVal NewWidth As Integer)
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Determine maximum height (chars) of console window.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   ' Adjust structure elements to be sure they're 0-based.
   csbi.srWindow.Left = 0
   csbi.srWindow.Bottom = csbi.srWindow.Bottom - csbi.srWindow.Top
   csbi.srWindow.Top = 0
   ' Make sure requested height is valid (0-based).
   If NewWidth > csbi.dwMaximumWindowSize.x Then
      csbi.srWindow.Right = csbi.dwMaximumWindowSize.x - 1
   Else
      csbi.srWindow.Right = NewWidth - 1
   End If
   ' Attempt setting new console window height.
   Call SetConsoleWindowInfo(m_StdOutput, True, csbi.srWindow)
End Property

Public Property Get Width() As Integer
   Dim csbi As CONSOLE_SCREEN_BUFFER_INFO
   ' Return width (chars) of console window.
   Call GetConsoleScreenBufferInfo(m_StdOutput, csbi)
   Width = csbi.srWindow.Right - csbi.srWindow.Left + 1
End Property

Public Property Let WindowState(ByVal NewState As FormWindowStateConstants)
   ' Set new state as requested.
   Select Case NewState
      Case vbNormal
         Call ShowWindow(m_hWnd, SW_RESTORE)
      Case vbMinimized
         Call ShowWindow(m_hWnd, SW_MINIMIZE)
      Case vbMaximized
         Call ShowWindow(m_hWnd, SW_MAXIMIZE)
   End Select
End Property

Public Property Get WindowState() As FormWindowStateConstants
   ' Return current state.
   If IsIconic(m_hWnd) Then
      WindowState = vbMinimized
   ElseIf IsZoomed(m_hWnd) Then
      WindowState = vbMaximized
   Else
      WindowState = vbNormal
   End If
End Property

' ******************************************
'  Public Properties: Read-Only
' ******************************************
Public Property Get ControlEvent() As ConsoleControlSignals
   '  This property may be queried if the Break property is found to
   '  be True. It indicates what sort of event occurred that
   '  requires the application to shutdown.
   ' ================================================================
   '  Note: A Win95 bug prevents some events from signaling!
   '  http://support.microsoft.com/default.aspx?scid=kb;en-us;130717
   ' ================================================================
   ControlEvent = m_ControlEvent
End Property

Public Property Get Compiled() As Boolean
   ' Return cached value.
   Compiled = m_Compiled
End Property

Public Property Get hStdErr() As Long
   ' Return handle to standard error.
   hStdErr = m_StdError
End Property

Public Property Get hStdIn() As Long
   ' Return handle to standard input.
   hStdIn = m_StdInput
End Property

Public Property Get hStdOut() As Long
   ' Return handle to standard output.
   hStdOut = m_StdOutput
End Property

Public Property Get hWnd() As Long
   ' 124103 - HOWTO: Obtain a Console Window Handle (HWND)
   ' http://support.microsoft.com/default.aspx?scid=KB;en-us;q124103
   Dim os As OSVERSIONINFO
   Dim Title As String
   Dim Unique As String
   Dim nRet As Long

   ' Returned cached value, if possible.
   If m_hWnd = 0 Then
      ' Determine what operating system this is.
      os.dwOSVersionInfoSize = Len(os)
      Call GetVersionEx(os)

      If os.dwPlatformId = VER_PLATFORM_WIN32_NT _
         And os.dwMajorVersion >= 5 Then
         ' This is Windows2000 or later!
         m_hWnd = GetConsoleWindow()

      Else ' Take the tortuous path...
         ' Cache the associated title.
         Title = Space$(1024)
         nRet = GetConsoleTitle(Title, Len(Title))
         If nRet Then
            Title = Left$(Title, nRet)
         End If

         ' Construct unique string to use as new title.
         Unique = Format$(Now, "yyyymmddhhnnss") & Hex$(GetCurrentProcessId())

         ' Set new title to use for search.
         If SetConsoleTitle(Unique) Then
            ' Find window most likely to be our console.
            m_hWnd = FindConsole(Unique)
            ' Restore original title.
            Call SetConsoleTitle(Title)
         End If
      End If
   End If
   hWnd = m_hWnd
End Property

Public Property Get LaunchMode() As ConsoleLaunchModes
   ' *** Added at v1.01 (entire routine) ***
   ' Assumes parent name is found at Initialize.
   Dim ParentName As String
   Const OldAppMod As String = "winoa386.mod"
   
   ' On "advanced" operating systems, console apps will
   ' always be running under the process shown in
   ' %COMSPEC%, but on early 9x systems they'll be
   ' running under WINOA386.MOD
   ParentName = LCase$(m_ParentFilename)
   If Len(m_ParentFilename) Then
      If m_Compiled = False Then
         ' Running under the VB IDE.
         LaunchMode = conLaunchVBIDE
         
      ElseIf (LCase$(Environ("Comspec")) = ParentName) Then
         ' Ex: C:\WINNT\system32\cmd.exe
         LaunchMode = conLaunchConsole
         
      ElseIf (InStr(ParentName, OldAppMod) = (Len(ParentName) - Len(OldAppMod) + 1)) Then
         ' Ex: C:\WINDOWS\SYSTEM\WINOA386.MOD
         LaunchMode = conLaunchConsole
         
      Else
         ' Ex: C:\WINNT\Explorer.EXE
         LaunchMode = conLaunchExplorer
         
      End If
   Else
      ' This could happen in NT 3.51 and earlier,
      ' if PSAPI.DLL is not present.
      LaunchMode = conLaunchUnknown
      
   End If
End Property

Public Property Get ParentFileName() As String
   ' *** Added at v1.01 (entire routine) ***
   ParentFileName = m_ParentFilename
End Property

Public Property Get ParentProcessID() As Long
   ' *** Added at v1.01 (entire routine) ***
   ParentProcessID = m_ParentProcessID
End Property

Public Property Get Piped() As Boolean
   ' Just test this once, in Initialize...
   Piped = m_Redirected
End Property

Public Property Get Redirected() As Boolean
   ' Just test this once, in Initialize...
   Redirected = m_Redirected
End Property

' ******************************************
'  Public Methods
' ******************************************
Public Sub DebugOutput(ByVal Data As String, Optional ByVal CrLf As Boolean = True)
   ' ====================================================
   ' Highly recommended utility for reading this output
   ' from a compiled EXE -- DBWin32 by Grant Schenck:
   '  -- http://grantschenck.tripod.com/dbwinv2.htm
   ' ====================================================
   ' Output to the ether...  Someone may be listening...
   Debug.Print Data;
   Call OutputDebugString(Data)
   If CrLf Then
      Debug.Print
      Call OutputDebugString(vbCrLf)
   End If
End Sub

Public Sub FlashWindow(Optional ByVal Count As Long = 2, Optional ByVal Delay As Long = 250)
   Dim fwi As FLASHWINFO
   ' Assign some defaults
   With fwi
      .cbSize = Len(fwi)
      .hWnd = hWnd
      .dwFlags = FLASHW_ALL
      .uCount = Count
      .dwTimeout = Delay
   End With
   ' This function only works on Win98+ and Win2000+.
   ' Gracefully degrade (fail) on older systems.
   On Error Resume Next
   Call FlashWindowEx(fwi)
   On Error GoTo 0
End Sub

Public Function Flush() As Boolean
   ' Flush the console input buffer of any
   ' waiting input records.
   Flush = CBool(FlushConsoleInputBuffer(m_StdInput))
End Function

Public Function ReadChar() As Byte   'KeyAscii
   Dim Mode As Long
   Dim Char As Byte
   Dim CharsRead As Long

   ' Flush input buffer.
   Call FlushConsoleInputBuffer(m_StdInput)

   ' Cache existing mode, so it can be restored.
   Call GetConsoleMode(m_StdInput, Mode)

   ' Set mode to not wait for an Enter key before returning.
   ' No echo of character, either.
   Call SetConsoleMode(m_StdInput, 0&)

   ' Wait for a single keystroke.
   Call ReadConsole(m_StdInput, Char, 1&, CharsRead, ByVal 0&)

   ' Restore original mode.
   Call SetConsoleMode(m_StdInput, Mode)
   
   ' Return KeyAscii value of the key user pressed.
   ReadChar = Char
End Function

Public Function ReadLine(Optional ByVal Prompt As String = "", Optional NumChars As Long = 0) As String
   ' ===============================================================
   ' ReadConsole fails if input has been redirected, so we
   ' need to use ReadFile instead.  Under normal circumstances,
   ' ReadFile will keep going until the EOF is hit.  This is
   ' still represented by Cntl-Z.  For piped/redirected input,
   ' Windows provides Cntl-Z automatically.
   ' ===============================================================
   Dim Char As Byte
   Dim CharsRead As Long
   Dim sRet As String
   
   ' Write prompt to user, if provided.
   If Len(Prompt) Then
      Con.WriteLine Prompt, False
   End If
   
   ' ReadFile doesn't return until user presses Enter, or
   ' some form of Control-Break.  The strategy is to call it
   ' once, during which all input will be made and the first
   ' character returned.  Then call ReadFile repeatedly until
   ' queue is exhausted, which will be at the point where input
   ' was terminated (Enter/Cntl-C).
   Do
      Call ReadFile(m_StdInput, Char, 1&, CharsRead, ByVal 0&)
      If CharsRead Then
         DebugOutput Format$(Char, "000") & Space$(6) & IIf(Char > 27, Chr$(Char), "[ ]")
         
         If Char = 13 Then
            ' All done!  Pop the final CR off queue.
            Call ReadFile(m_StdInput, Char, 1&, CharsRead, ByVal 0&)
            Exit Do
         ElseIf Char = 10 Then
            ' Linefeed - ignore.
         Else
            ' Append to return string.
            sRet = sRet & Chr$(Char)
         End If
      End If
      
      ' Give Windows a chance to breathe...
      Call SleepEx(10, True)
      
      ' Display some indication if input was terminated.
      ' Break handler also terminates ReadFile call.
      If Con.Break Then
         If Con.ControlEvent = conEventControlBreak Or Con.ControlEvent = conEventControlC Then
            Con.WriteLine "^C"
         End If
         Exit Do
      End If
   Loop
   
   ' ReadFile doesn't return until user presses Enter,
   ' so the best we can do is read all keystrokes, then
   ' truncate at requested number.
   If NumChars Then
      sRet = Left$(sRet, NumChars)
   End If
   
   ' Assign results
   ReadLine = sRet
End Function

Public Function ReadPassword(Optional Prompt As String = "", Optional PasswordChar As String = "*") As String
   Dim Buffer As String
   Dim CharsWritten As Long
   Dim KeyAscii As Byte
   Dim cX As Long, cY As Long

   ' Make sure password character is no longer than 1-char.
   ' A zero-length string is valid, too.
   If Len(Trim$(PasswordChar)) > 1 Then
      PasswordChar = Left$(Trim$(PasswordChar), 1)
   End If
   
   ' Write prompt to user.
   If Len(Prompt) Then
      Call WriteConsole(m_StdOutput, ByVal Prompt, Len(Prompt), CharsWritten, ByVal 0&)
   End If
   
   ' Cache starting location of cursor.
   cX = CurrentX
   cY = CurrentY
   
   ' Demonstrates how to effectively use the ReadChar function to
   ' process a single character at a time, until Enter is pressed.
   Do
      KeyAscii = ReadChar()
      Select Case KeyAscii
         Case vbKeyReturn, vbKeyTab
            Exit Do         ' All done!
         
         Case vbKeyBack     ' Jerk/User fat-fingered us...
            If Len(Buffer) Then
               ' Need to remove last char from buffer.
               Buffer = Left$(Buffer, Len(Buffer) - 1)
               ' This is where it may get really ugly!
               If Len(PasswordChar) Then
                  ' Reprint passwordchar string, minus one.
                  CurrentX = cX
                  CurrentY = cY
                  Prompt = String$(Len(Buffer), PasswordChar) & " "
                  Call WriteConsole(m_StdOutput, ByVal Prompt, Len(Prompt), CharsWritten, ByVal 0&)
                  ' Back up one space.
                  If CurrentX = 0 Then 'zero-based!
                     ' Need to go up a row, and to end.
                     CurrentY = CurrentY - 1
                     CurrentX = Width - 1 'zero-based!
                  Else
                     ' Just back up on same row.
                     CurrentX = CurrentX - 1
                  End If
               End If
            End If
         
         Case Is < vbKeySpace
            ' This is some sort of weird control keystroke.
            ' We should probably ignore.
         
         Case Else
            ' Append this character to the buffer.
            Buffer = Buffer & Chr$(KeyAscii)
            ' Write out dummy character, as needed.
            If Len(PasswordChar) Then
               Call WriteConsole(m_StdOutput, ByVal PasswordChar, 1&, CharsWritten, ByVal 0&)
            End If
      End Select
   Loop
   
   ' Toss in a Cr/Lf, since user pressed Enter?
   Call WriteConsole(m_StdOutput, ByVal vbCrLf, 2&, CharsWritten, ByVal 0&)
   
   ' Return accumulated results.
   ReadPassword = Buffer
End Function

Public Function ReadStream() As String
   Dim Buffer As String
   Dim CharsRead As Long
   Dim sRet As String
   Const BufferSize As Long = 10240&
   
   ' Read as many characters as there are available.
   ' We cannot rely on the return from GetFileSize,
   ' as this may be low in cases where the piped input
   ' is somewhat slow in coming.
   Buffer = Space$(BufferSize)
   Do
      Call ReadFile(m_StdInput, ByVal Buffer, Len(Buffer), CharsRead, ByVal 0&)
      If CharsRead Then
         sRet = sRet & Left$(Buffer, CharsRead)
      End If
   Loop While CharsRead
      
   ' Assign results
   ReadStream = sRet
End Function

Public Function Resize(ByVal NewWidth As Integer, ByVal NewHeight As Integer) As Boolean
   Dim sz As COORD
   ' Attempt setting a new size for console buffer.
   If NewWidth > 0 And NewHeight > 0 Then
      sz.x = NewWidth
      sz.y = NewHeight
      Resize = CBool(SetConsoleScreenBufferSize(m_StdOutput, sz))
   End If
End Function

Public Function SetFocus(Optional ByVal Force As Boolean = False) As Boolean
   Dim ForeThreadID As Long
   Dim nRet As Long

   ' Restore and repaint
   If IsIconic(m_hWnd) Then
      Call ShowWindow(m_hWnd, SW_RESTORE)
   Else
      Call ShowWindow(m_hWnd, SW_SHOW)
   End If

   ' Try stardard SFW, in case OS supports that.
   Call SetForegroundWindow(m_hWnd)

   ' Nothing to do if already in foreground.
   If m_hWnd = GetForegroundWindow() Then
      SetFocus = True

   ElseIf Force = True Then
      ' First need to get the thread responsible for this window,
      ' and the thread for the foreground window.
      ForeThreadID = GetWindowThreadProcessId(GetForegroundWindow, ByVal 0&)

      ' By sharing input state, threads share their concept of
      ' the active window.
      If ForeThreadID <> App.ThreadID Then
         Call AttachThreadInput(ForeThreadID, App.ThreadID, True)
         nRet = SetForegroundWindow(m_hWnd)
         Call AttachThreadInput(ForeThreadID, App.ThreadID, False)
      Else
         nRet = SetForegroundWindow(m_hWnd)
      End If

      ' SetForegroundWindow return accurately reflects success.
      SetFocus = CBool(nRet)
   End If
End Function

Public Function ShowCursor(ByVal Show As Boolean) As Long
   Static Count As Long
   Dim cci As CONSOLE_CURSOR_INFO
   ' This routine is coded to behave exactly like the ShowCursor API.
   ' It sets an internal display counter that determines whether the
   ' cursor should be displayed. The cursor is displayed only if the
   ' display count is greater than or equal to 0. The initial display
   ' count is 0...
   If Show Then
      Count = Count + 1
   Else
      Count = Count - 1
   End If
   ' Check current visibility, and react accordingly.
   Call GetConsoleCursorInfo(m_StdOutput, cci)
   If (CBool(cci.bVisible) = True) And (Count < 0) Then
      ' Need to hide the cursor.
      cci.bVisible = False
      Call SetConsoleCursorInfo(m_StdOutput, cci)
   ElseIf (CBool(cci.bVisible) = False) And (Count >= 0) Then
      ' Need to show the cursor.
      cci.bVisible = True
      Call SetConsoleCursorInfo(m_StdOutput, cci)
   End If
   ' Return value of new display counter.
   ShowCursor = Count
End Function

Public Function WriteLine(Optional ByVal Text As String = "", Optional ByVal CrLf As Boolean = True, Optional Destination As ConsoleOutputDestinations = conStandardOutput, Optional Alignment As ConsoleWriteAlignments = conAlignNone) As Long
   Dim BytesWritten As Long
   Dim hOutput As Long
   
   ' Write to StdOut unless told otherwise.
   ' No alignment options for StdError.
   If Destination = conStandardError Then
      hOutput = m_StdError
   Else
      hOutput = m_StdOutput
      ' Position cursor appropriately, if aligned specially.
      If Alignment = conAlignCentered Then
         If Len(Text) < Con.BufferWidth Then
            Con.CurrentX = (Con.BufferWidth - Len(Text)) \ 2
         End If
      ElseIf Alignment = conAlignLeft Then
         Con.CurrentX = 0
      ElseIf Alignment = conAlignRight Then
         Con.CurrentX = Con.BufferWidth - Len(Text)
      End If
   End If
   
   ' Append an extra CR/LF pair to output string.
   If CrLf = True Then
      ' But not if already against right side!
      If Alignment <> conAlignRight Then
         Text = Text & vbCrLf
      End If
   End If
   
   ' Using WriteConsole prevents output from being redirected
   ' to a file or piped to another app, so we need to use
   ' WriteFile instead (with the unfortunate consequence being
   ' that Unicode output isn't supported).
   If Len(Text) Then
      Call WriteFile(hOutput, ByVal Text, Len(Text), BytesWritten, ByVal 0&)
      ' Return number of bytes written.
      WriteLine = BytesWritten
   End If
End Function

Public Sub PressAnyKey(Optional ByVal Prompt As String, Optional ByVal CrLf As Boolean = True)
   Dim Mode As Long
   Dim Buffer As String
   Dim CharsRead As Long
   Dim CharsWritten As Long

   ' Write prompt to user.
   If Len(Prompt) = 0 Then
      Prompt = "Press any key to continue . . . "
   End If
   Call WriteConsole(m_StdOutput, ByVal Prompt, Len(Prompt), CharsWritten, ByVal 0&)
   
   ' Delegate work of waiting for a single character.
   Call ReadChar

   ' Scroll, if requested.
   If CrLf Then
      Prompt = vbCrLf
      Call WriteConsole(m_StdOutput, ByVal Prompt, Len(Prompt), CharsWritten, ByVal 0&)
   End If
End Sub

Public Function WaitingInput() As Boolean
   Dim LoDWord As Long
   Dim HiDWord As Long
   Const INVALID_FILE_SIZE As Long = -1&
   ' Check to see how much input is queued up.
   ' Most useful(?) when first starting up to
   ' determine whether piped/redirected input
   ' has been sent to this app.
   LoDWord = GetFileSize(m_StdInput, HiDWord)
   WaitingInput = (LoDWord <> INVALID_FILE_SIZE)
End Function

' ******************************************
'  Private Methods
' ******************************************
Private Function CoordToLong(sz As COORD) As Long
   ' Sling the bits into a Long to pass directly to API.
   Call CopyMemory(CoordToLong, sz, 4&)
End Function

Private Function Exported(ByVal ModuleName As String, ByVal ProcName As String) As Boolean
   Dim hModule As Long
   Dim lpProc As Long
   Dim FreeLib As Boolean

   ' check first to see if the module is already
   ' mapped into this process.
   hModule = GetModuleHandle(ModuleName)
   If hModule = 0 Then
      ' need to load module into this process.
      hModule = LoadLibrary(ModuleName)
      FreeLib = True
   End If

   ' if the module is mapped, check procedure
   ' address to verify it's exported.
   If hModule Then
      lpProc = GetProcAddress(hModule, ProcName)
      Exported = (lpProc <> 0)
   End If

   ' unload library if we loaded it here.
   If FreeLib Then Call FreeLibrary(hModule)
End Function

Private Function FindConsole(ByVal Caption As String) As Long
   Dim hWnd As Long
   ' *** Added in v1.01 (entire routine) ***
   ' In case caption was just changed, allow to update.
   Call Sleep(10)
   ' Search for console window using passed caption
   ' and known good console window classnames.
   hWnd = FindWindow(ConsoleClassName, Caption)
   If hWnd = 0 Then
      ' Try the Win95 console classname.
      hWnd = FindWindow(ConsoleClassName95, Caption)
      If hWnd = 0 Then
         ' Try no classname at all.
         hWnd = FindWindow(vbNullString, Caption)
      End If
   End If
   FindConsole = hWnd
End Function

Private Function FindHiddenTopWindow() As Long
   ' *** Added at v1.02 (entire routine) ***
   ' This function returns the hidden toplevel window
   ' associated with the current thread of execution.
   Call EnumThreadWindows(GetCurrentThreadId(), AddressOf EnumThreadWndProc, VarPtr(FindHiddenTopWindow))
End Function

Private Function FuncPtr(ByVal Whatever As Long) As Long
   ' Return whatever was passed
   FuncPtr = Whatever
End Function

Private Function IsCompiled() As Boolean
   ' Just call once, in Initialize, to avoid
   ' messing with error object unnecessarily.
   On Error Resume Next
   Debug.Print 1 / 0
   IsCompiled = (Err.Number = 0)
End Function

Private Function GetProcessFileName(ByVal ProcessID As Long) As String
   ' *** Added at v1.01 (entire routine) ***
   Dim hProcess As Long
   Dim Buffer As String
   Dim nChars As Long
   Const ERROR_PARTIAL_COPY As Long = 299&
   
   ' Allocate space for results.
   Buffer = Space$(MAX_PATH)
   
   ' If no ID was passed, get name of current process.
   If ProcessID = 0 Then
      Call GetModuleFileName(ProcessID, Buffer, Len(Buffer))
   
   Else
      ' Get a handle to the process.
      hProcess = OpenProcess(PROCESS_QUERY_INFORMATION Or PROCESS_VM_READ, 0, ProcessID)
      If hProcess Then
         ' Grab the filename for base module.
         nChars = GetModuleFileNameEx(hProcess, 0, Buffer, Len(Buffer))
         ' Truncate and return buffer.
         If nChars Then
            GetProcessFileName = Left$(Buffer, nChars)
         Else
            ' *** Added at v1.04 (http://winprogger.com/?p=26) ***
            If Err.LastDllError = ERROR_PARTIAL_COPY Then
               nChars = GetProcessImageFileName(hProcess, Buffer, Len(Buffer))
               If nChars Then
                  GetProcessFileName = MapDeviceName(Left$(Buffer, nChars))
               End If
            End If
            ' *** End of v1.04 update ***
         End If
         Call CloseHandle(hProcess)
      End If
   End If
End Function

Private Function GetProcessParent() As String
   ' *** Added at v1.01 (entire routine) ***
   Dim ProcessID As Long
   Dim os As OSVERSIONINFO
   Dim hProcess As Long
   Dim info As PROCESS_BASIC_INFORMATION
   Dim Buffer As String
   Dim hSnap As Long
   Dim ProcEntry As PROCESSENTRY32
   Dim nRet As Long
   
   Const STATUS_SUCCESS As Long = 0
   
   ' Windows 2000+ and Windows 9x ship with the
   ' ToolHelp routines, so we only need to use
   ' NTDLL on NT4 and lower.
   os.dwOSVersionInfoSize = Len(os)
   Call GetVersionEx(os)
   
   ' We are after the parent of *this* process.
   ProcessID = GetCurrentProcessId()
   
   If m_Compiled = False Then
      ' If uncompiled, we are running under the VB IDE process.
      ' Return full name/path and current process ID.
      GetProcessParent = GetProcessFileName(0&)
      m_ParentProcessID = ProcessID
   
   ElseIf os.dwPlatformId = VER_PLATFORM_WIN32_NT And os.dwMajorVersion < 5 Then
      ' *** Use undocumented calls only when needed. ***
      ' This is a version of NT prior to Win2000!
      ' Make sure we have the needed function.
      If Exported("ntdll", "NtQueryInformationProcess") Then
         ' Obtain a handle to the current process.
         hProcess = OpenProcess(PROCESS_QUERY_INFORMATION Or PROCESS_VM_READ, 0, ProcessID)
         If hProcess Then
            nRet = NtQueryInformationProcess(hProcess, SystemBasicInformation, info, Len(info), ByVal 0&)
            If nRet = STATUS_SUCCESS Then
               m_ParentProcessID = info.InheritedFromUniqueProcessId
            End If
            ' Done with this process.
            Call CloseHandle(hProcess)
         End If
         ' Return results.
         GetProcessParent = GetProcessFileName(m_ParentProcessID)
      End If
      
   Else
      ' Use the documented methods...
      ' Make sure we have the needed function.
      hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0&)
      If hSnap Then
         ProcEntry.dwSize = Len(ProcEntry)
         
         ' Iterate through the processes once to find the parent:
         If Process32First(hSnap, ProcEntry) Then
            Do
               If ProcEntry.th32ProcessID = ProcessID Then
                  ' This is us.  Get the parent ID:
                  m_ParentProcessID = ProcEntry.th32ParentProcessID
                  Exit Do
               End If
            Loop While Process32Next(hSnap, ProcEntry)
         End If
         
         ' Now get the parent name.
         If os.dwPlatformId = VER_PLATFORM_WIN32_NT Then
            ' Newer NT version toolhelp libraries do not
            ' provide path information, so it's better to
            ' use GetModuleFileNameEx for max info.
            GetProcessParent = GetProcessFileName(m_ParentProcessID)
         Else
            ' In Win9x versions, iterate the process snapshot. Again.
            If Process32First(hSnap, ProcEntry) Then
               Do
                  If ProcEntry.th32ProcessID = m_ParentProcessID Then
                     ' This is the parent process -- get its filename.
                     GetProcessParent = TrimNull(ProcEntry.szExeFile)
                     Exit Do
                  End If
               Loop While Process32Next(hSnap, ProcEntry)
            End If
         End If
         
      End If
   End If
End Function

Private Function LaunchConsole() As Long
   Dim Title As String
   Dim nRet As Long
   Dim hWnd As Long
   Dim hMenu As Long
   Dim PID As Long

   ' Fire one up!
   Call AllocConsole

   ' Get the associated title.
   Title = Space$(1024)
   nRet = GetConsoleTitle(Title, Len(Title))
   If nRet Then
      Title = Left$(Title, nRet)
   End If

   ' Find window most likely to be our new console.
   hWnd = FindConsole(Title)

   ' Confirm by comparing Process IDs.
   Call GetWindowThreadProcessId(hWnd, PID)
   If PID = GetCurrentProcessId() Then

      ' Disable its Close button, because if we accidently
      ' press that during debugging, everything goes kaboom!
      Const SC_CLOSE As Long = &HF060&
      Const MF_BYCOMMAND As Long = &H0&
      hMenu = GetSystemMenu(hWnd, False)
      Call RemoveMenu(hMenu, SC_CLOSE, MF_BYCOMMAND)

      ' Push new window to front.
      Call SetForegroundWindow(hWnd)

      ' *** Changed in v1.01 ***
      ' Return handle to console window.
      LaunchConsole = hWnd
   End If
End Function

Private Function MapDeviceName(ByVal DevName As String) As String
   ' *** Added in v1.04 (entire routine) ***
   ' Supports call to GetProcessImageFileName API by
   ' local GetProcessFilename in x64 systems.
   Dim Buffer As String
   Dim Drives() As String
   Dim nChars As Long
   Dim i As Long
   Const ERROR_INSUFFICIENT_BUFFER As Long = 122&
   
   ' Find out how large the buffer needs to be.
   nChars = GetLogicalDriveStrings(0&, Buffer)
   Buffer = Space$(nChars)
   
   ' Get list of all drive strings.
   If GetLogicalDriveStrings(nChars, Buffer) Then
      Drives = Split(Buffer, vbNullChar)
      ' Get device name for each drive string.
      For i = LBound(Drives) To UBound(Drives)
         If Len(Drives(i)) Then
            ' Truncate at first backslash.
            nChars = InStr(Drives(i), "\")
            If nChars Then
               Drives(i) = Left$(Drives(i), nChars - 1)
            End If
            
            ' Get device name for this drive, starting
            ' with a reasonably sized buffer.
            Buffer = Space$(MAX_PATH)
            Do
               nChars = QueryDosDevice(Drives(i), Buffer, Len(Buffer))
               If Err.LastDllError = ERROR_INSUFFICIENT_BUFFER Then
                  ' Increase buffer and try again.
                  Buffer = Space$(Len(Buffer) * 2)
               Else
                  ' Buffer terminates with two nulls.
                  Buffer = Left$(Buffer, nChars - 2)
                  Exit Do
               End If
            Loop
         
            ' Check incoming string for match.
            If InStr(1, DevName, Buffer, vbTextCompare) = 1 Then
               If Len(DevName) > Len(Buffer) Then
                  ' Looks good, swap devname for drive string.
                  MapDeviceName = Drives(i) & Mid$(DevName, Len(Buffer) + 1)
                  Exit For
               End If
            End If
         End If
      Next i
   End If
End Function

Public Function MakeLong(ByVal HiWord As Integer, ByVal LoWord As Integer) As Long
   Call CopyMemory(MakeLong, LoWord, 2)
   Call CopyMemory(ByVal (VarPtr(MakeLong) + 2), HiWord, 2)
End Function

Private Function TrimNull(ByVal StrIn As String) As String
   Dim nul As Long
   ' Truncate input string at first null.
   ' If no nulls, perform ordinary Trim.
   nul = InStr(StrIn, vbNullChar)
   Select Case nul
      Case Is > 1
         TrimNull = Left(StrIn, nul - 1)
      Case 1
         TrimNull = ""
      Case 0
         TrimNull = Trim(StrIn)
   End Select
End Function

' ******************************************
'  Callback Handlers
' ******************************************
Private Function EnumThreadWndProc(ByVal hWnd As Long, ByVal lpResult As Long) As Long
   ' *** Added at v1.02 (entire routine) ***
   Dim nStyle As Long
   ' The one we want has the WS_SYSMENU style bit set!
   nStyle = GetWindowLong(hWnd, GWL_STYLE)
   If (nStyle And WS_SYSMENU) = WS_SYSMENU Then
      ' Copy hWnd to result variable pointer,
      ' and stop enumeration.
      Call CopyMemory(ByVal lpResult, hWnd, 4&)
      EnumThreadWndProc = False
   Else
      ' Continue enumeration.
      EnumThreadWndProc = True
   End If
End Function

Private Function HandlerRoutine(ByVal dwCtrlType As Long) As Long
   ' THIS ROUTINE IS NOT THREAD-SAFE. MODIFY WITH GREAT CARE.
   ' Return True to say that we are handling it.
   m_CloseProgram = True
   m_ControlEvent = dwCtrlType
   HandlerRoutine = True
End Function

' ******************************************
'  COM interface for lightweight object.
' ******************************************
Private Function QueryInterface(This As ConsoleType, riid As Long, pvObj As Long) As Long
   Const E_NOINTERFACE As Long = &H80004002
   ' QueryInterface not expected.
   Debug.Assert False
   pvObj = 0
   QueryInterface = E_NOINTERFACE
End Function

Private Function AddRef(This As ConsoleType) As Long
   ' No need to AddRef.
   Debug.Assert False
End Function

Private Function Release(This As ConsoleType) As Long
   ' ************************************************
   '  Called automatically when the app terminates.
   '  Run teardown code in Release.
   ' ************************************************
   Call Terminate
End Function

