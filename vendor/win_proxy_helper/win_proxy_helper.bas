Attribute VB_Name = "WinProxyHelper"
Option Explicit

Private Const INTERNET_OPTION_REFRESH As Long = 37
Private Const INTERNET_OPTION_SETTINGS_CHANGED As Long = 39

Private Declare Function InternetSetOption _
        Lib "wininet.dll" Alias "InternetSetOptionA" ( _
        ByVal hInternet As Long, ByVal dwOption As Long, _
        lpBuffer As Any, ByVal dwBufferLength As Long) As Long
        
 
 
Public Function RefreshProxy() As Boolean
    Call InternetSetOption(0, INTERNET_OPTION_SETTINGS_CHANGED, ByVal 0&, 0)
    Call InternetSetOption(0, INTERNET_OPTION_REFRESH, ByVal 0&, 0)
End Function

Public Sub Main()
   Con.Initialize
   Con.WriteLine "Apply proxy setting..."
   Call InternetSetOption(0, INTERNET_OPTION_SETTINGS_CHANGED, ByVal 0&, 0)
   Call InternetSetOption(0, INTERNET_OPTION_REFRESH, ByVal 0&, 0)
   Con.WriteLine "DONE"
End Sub

