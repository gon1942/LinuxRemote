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

char *test()
{
    syslog(LOG_INFO, "#-------------------file read-------------------------###############.\n");
    // int ret = system("/home/gonpc/jobs/hamonize_work/server/agent/new-hamonize-connect/src/dist/hamonizeCtl --devicepolicySend");
    // printf("ret : %d \n", ret);
    // return 0;

    // int ret = system("/home/gonpc/jobs/hamonize_work/server/agent/new-hamonize-connect/src/dist/hamonizeCtl --devicepolicySend");
    int ret = system("/etc/hamonize/hamonizeCtl --devicepolicySend");
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
    const char *hamonizeKeyName = "\"hamonizeUssb\"";

    au = auparse_init(AUSOURCE_FILE_POINTER, stdin);

    while (auparse_next_event(au) > 0)
    {
        pid = auparse_find_field(au, "pid");
        comm = auparse_find_field(au, "comm");
        keyname = auparse_find_field(au, "key");
        syslog(LOG_INFO, "key name aaaaa ---------------1111111111111------  key : [%s] , keysArgv : [%s], tmp---[%s]", keyname, keysArgv, hamonizeKeyName);
        if (keyname && strcmp(keyname, hamonizeKeyName) == 0)
        {
            syslog(LOG_INFO, "key name aaaaa ------22222---------------  key : [%s] , keysArgv : [%s], tmp---[%s]", keyname, keysArgv, hamonizeKeyName);
            test();
            // filename = auparse_find_field(au, "name");
            // if (filename && strcmp(filename, "(null)"))
            // {
            //     syslog(LOG_INFO, "-----------------> Check pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", pid, comm, keyname, auparse_interpret_realpath(au));
            // }
        }
    };

    closelog();
    return 0;
}