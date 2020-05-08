// code by @luckyyyyy
// See https://github.com/alibaba/lightproxy/issues/85

#include <Windows.h>
#include <WinInet.h>
#include <stdio.h>

int main(int argc)
{
	InternetSetOption(0, INTERNET_OPTION_SETTINGS_CHANGED, NULL, 0);
	InternetSetOption(0, INTERNET_OPTION_REFRESH, NULL, 0);
	printf("internet set option done\n");
	return 0;
}
