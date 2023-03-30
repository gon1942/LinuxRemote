#define _GNU_SOURCE
#include <stdio.h>
#include <string.h>
#include <sys/select.h>
#include <ctype.h>  // isspace()
#include <string.h> // strcpy_s() strlen()
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <libaudit.h>
#include <auparse.h>
#include <libnotify/notify.h>
#include <locale.h>
#include <curl/curl.h>
#include <time.h>
#include "unistd.h"
#include "fcntl.h"

#define MY_ACCOUNT 1000
#define BUFFER_SIZE 1024

char *hamonizeBlockRules(const char *d)
{
    const char *data = d;
    syslog(LOG_INFO, "test2] ----------------------------> d : [%s], data: [%s], lens:[%ld] \n", d, data, strlen(d));
    syslog(LOG_INFO, "#----------hamonizeBlockRules------------------###############.\n");

    syslog(LOG_INFO, "test@@@@@@@@@@@@@@-----------------------execl호출 %s \n", data);
    // execl("/bin/sudo", "sudo", "kill", "-9", data, NULL);

    // kill 함수를 사용하여 프로세스를 종료
    kill(atoi(data), SIGKILL);

    return 0;
}

int main(int argc, char *argv[])
{

    auparse_state_t *au = NULL;
    char tmp[MAX_AUDIT_MESSAGE_LENGTH + 1], bus[32];
    const char *keyname;
    const char *keysArgv = argv[1];
    const char *filename = NULL;
    const char *pid = NULL;
    const char *comm = NULL;

    au = auparse_init(AUSOURCE_FILE_POINTER, stdin);

    // while (auparse_next_event(au) > 0)
    // {
    //     pid = auparse_find_field(au, "pid");
    //     comm = auparse_find_field(au, "comm");
    //     keyname = auparse_find_field(au, "key");

    //     syslog(LOG_INFO, "-----------------> Check pid :[%s], comm: [%s] : keyname [%s] \n", pid, comm, keyname);

    //     // 프로그램 설치 및 삭제 정책 시
    //     if (keyname && strcmp(keyname, "\"hamonizeBlockRules\"") == 0)
    //     {
    //         if (strcmp(comm, "\"rm\"") != 0)
    //         {
    //             syslog(LOG_INFO, "hamonizeBlockRules---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
    //             hamonizeBlockRules(pid);
    //         }
    //     }
    // };

    while (auparse_next_event(au) > 0)
    {
        pid = auparse_find_field(au, "pid");
        comm = auparse_find_field(au, "comm");
        keyname = auparse_find_field(au, "key");

        syslog(LOG_INFO, "-----------------> Checkkeyname=====[%s] \n", keyname);
        if (keyname && strcmp(keyname, "\"hamonizeBlockRules\"") == 0)
        {

            syslog(LOG_INFO, "-----------------> Check pid :[%s], comm: [%s] : keyname [%s],  \n", pid, comm, keyname);

            // do
            // {
            // filename = auparse_find_field(au, "name");
            // if (filename && strcmp(filename, "(null)"))
            // {
            // syslog(LOG_INFO, "----------------------------> Check filename : [%s], pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", filename, pid, comm, keyname, auparse_interpret_realpath(au));
            syslog(LOG_INFO, "-----------------> Check pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", pid, comm, keyname, auparse_interpret_realpath(au));
            hamonizeBlockRules(pid);
            // }

            // } while (auparse_next_record(au) > 0);
        }
    };

    closelog();
    return 0;
}