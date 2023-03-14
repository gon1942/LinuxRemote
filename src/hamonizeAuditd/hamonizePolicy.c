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
#include <json-c/json.h>
#include <time.h>
#include "unistd.h"
#include "fcntl.h"

#define MY_ACCOUNT 1000
#define BUFFER_SIZE 1024

char *hamonizeUpdt()
{
    syslog(LOG_INFO, "#----------hamonizeUpdt------------------###############.\n");

    // int ret = system("/home/gonpc/jobs/2023/hamonize/src/dist/hamonizeCtl --updt");
    int ret = system("/etc/hamonize/hamonizeCtl --updt");
    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
    return 0;
}

char *hamonizeBlock()
{
    syslog(LOG_INFO, "#----------hamonizeBlock------------------###############.\n");

    // int ret = system("/home/gonpc/jobs/2023/hamonize/src/dist/hamonizeCtl --updt");
    int ret = system("/etc/hamonize/hamonizeCtl --progrmblock");
    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
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

    while (auparse_next_event(au) > 0)
    {
        pid = auparse_find_field(au, "pid");
        comm = auparse_find_field(au, "comm");
        keyname = auparse_find_field(au, "key");

        // 프로그램 설치 및 삭제 정책 시
        if (keyname && strcmp(keyname, "\"hamonizeUpdt\"") == 0)
        {
            if (strcmp(comm, "\"rm\"") != 0)
            {
                syslog(LOG_INFO, "UPDT---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
                hamonizeUpdt();
            }
        }

        // 프로그램 차단 정책 시
        if (keyname && strcmp(keyname, "\"hamonizeBlock\"") == 0)
        {
            if (strcmp(comm, "\"rm\"") != 0)
            {
                syslog(LOG_INFO, "BLOCK---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
                hamonizeBlock();
            }
        }
    };

    closelog();
    return 0;
}