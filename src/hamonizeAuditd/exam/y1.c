/**
 * 실행 파일,  (deb, rpm)
 * 실행 파일이 아닌 경우  ( doc 파일...etc) -      필수 값 : 파일 경로.  파일명
 *      -> 파일명을 해시값으로 변환하여 저장.
 *      -> 해당 파일은 삭제되지 않도록 처리.
 *      -> 해당 파일은 이동 불가 처리.
 *      -> 해당 파일은 수정 불가 처리.
 *      ->
 *
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <string.h>
#include <sys/select.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <libaudit.h>
#include <auparse.h>
#include <libnotify/notify.h>
#include <locale.h>
#include <stdlib.h>

#define MY_ACCOUNT 1000
const char *note = "Login Alert";

static auparse_state_t *init_auparse(void)
{
        auparse_state_t *au = NULL;
        // if (stdin_flag) {
        // 	au = auparse_init(AUSOURCE_FILE_POINTER, stdin);
        // } else if (file) {
        // 	au = auparse_init(AUSOURCE_FILE, file);
        // } else {
        au = auparse_init(AUSOURCE_LOGS, NULL);
        // }
        // if (au == NULL) {
        // 	fprintf(stderr, "Error: %s\n", strerror(errno));
        // }
        return au;
}

void Eliminate(char *str, char ch)
{
        for (; *str != '\0'; str++) // 종료 문자를 만날 때까지 반복
        {
                if (*str == ch) // ch와 같은 문자일 때
                {
                        strcpy(str, str + 1);
                        str--;
                }
        }
}
int getLength(char str[])
{
        int len = 0;
        for (int i = 0; str[i] != '\0'; i++)
                len++;
        return len;
}

char *concat(char strto[], const char strfrom[])
{
        int tlen = getLength(strto);
        int i = 0;
        for (i = 0; strfrom[i] != '\0'; i++)
                strto[tlen + i] = strfrom[i];
        strto[tlen + i] = '\0';
        return strto;
}
char *my_strcat(char *d, const char *s)
{
        char *p = d;
        while (*d)
                d++;
        while (*s)
                *d++ = *s++;
        *d = '\0';
        return p;
}

int main(int argc, char *argv[])
{

        auparse_state_t *au = NULL;
        char tmp[MAX_AUDIT_MESSAGE_LENGTH + 1], bus[32];
        const char *keyname;
        const char *keysArgv = argv[1];
        const char *filename = NULL;
        const char *pid = NULL;

        /* Initialize the auparse library */
        au = auparse_init(AUSOURCE_FILE_POINTER, stdin);

        while (auparse_next_event(au) > 0)
        {
                pid = auparse_find_field(au, "pid");

                do
                {
                        filename = auparse_find_field(au, "name");
                        if (filename && strcmp(filename, "(null)"))
                        {
                                // syslog(LOG_INFO, "----------------------------> filename : [%s] \n", filename);
                                syslog(LOG_INFO, "----------------------------> filename : [%s], pid :[%s] \n", filename, pid);
                        }

                } while (auparse_next_record(au) > 0);
        };

        closelog();
        return 0;
}