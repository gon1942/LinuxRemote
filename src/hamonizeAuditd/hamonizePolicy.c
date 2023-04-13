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

char *hamonizeBlockRules(const char *d)
{
    const char *data = d;
    syslog(LOG_INFO, "test2] ----------------------------> d : [%s], data: [%s], lens:[%ld] \n", d, data, strlen(d));
    syslog(LOG_INFO, "#----------hamonizeBlockRules------------------###############.\n");

    syslog(LOG_INFO, "test@@@@@@@@@@@@@@-----------------------execl호출 %s \n", data);
    // execl("/bin/sudo", "sudo", "kill", "-9", data, NULL);

    // kill 함수를 사용하여 프로세스를 종료
    // kill(atoi(data), SIGKILL);

    return 0;
}

char *hamonizeUpdt()
{
    syslog(LOG_INFO, "#----------hamonizeUpdt------------------###############.\n");
    // int ret = system("/bin/bash /home/gonpc/jobs/2023/newHamonize/src/hamonizeCtl/shell/agentJobs/updtjob.sh");
    // int ret = system("/etc/hamonize/agentJobs/updtjob.sh");
    // int ret = system("/usr/local/hamonize-connect/hamonizeCtl --updt");
    int ret = system("/bin/bash /etc/hamonize/agentJobs/updtjob.sh");

    WEXITSTATUS(ret);

    syslog(LOG_INFO, "--------hamonizeUpdt---------ret : %d \n", ret);
    return 0;
}

char *hamonizeBlock()
{
    syslog(LOG_INFO, "#----------hamonizeBlock------------------###############.\n");

    // int ret = system("/home/gonpc/jobs/2023/newHamonize/src/hamonizeCtl/shell/agentJobs/progrmBlock");
    int ret = system("/etc/hamonize/agentJobs/progrmBlock");

    // int ret = system("/usr/local/hamonize-connect/hamonizeCtl --progrmblock");

    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
    return 0;
}

char *hamonizeDevice()
{
    syslog(LOG_INFO, "#----------hamonizeDevice------------------###############.\n");
    int ret = system("/usr/local/hamonize-connect/hamonizeCtl --devicepolicy");
    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
    return 0;
}

char *hamonizeDeviceSendLog()
{
    syslog(LOG_INFO, "#-------------------hamonizeDeviceSendLog-------------------------###############.\n");
    int ret = system("/usr/local/hamonize-connect/hamonizeCtl --devicepolicySend");
    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
    return 0;
}

char *hamonizeUfw()
{
    syslog(LOG_INFO, "#-------------------hamonizeUfw-------------------------###############.\n");
    int ret = system("/usr/local/hamonize-connect/hamonizeCtl --ufw");
    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
    return 0;
}

char *hamonizeLogin()
{
    syslog(LOG_INFO, "#-------------------hamonizeLogin-------------------------###############.\n");
    int ret = system("touch /tmp/aaaa-login-1");
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

        // Device
        if (keyname && strcmp(keyname, "\"hamonizeDevice\"") == 0)
        {
            if (strcmp(comm, "\"rm\"") != 0)
            {
                syslog(LOG_INFO, "Device---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
                hamonizeDevice();
            }
        }

        // Device Send Log
        if (keyname && strcmp(keyname, "\"hamonizeUssb\"") == 0)
        {
            if (strcmp(comm, "\"rm\"") != 0)
            {
                syslog(LOG_INFO, "Device---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
                hamonizeDeviceSendLog();
            }
        }

        // Ufw
        if (keyname && strcmp(keyname, "\"hamonizeUfw\"") == 0)
        {
            if (strcmp(comm, "\"rm\"") != 0)
            {
                syslog(LOG_INFO, "Ufw---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
                hamonizeUfw();
            }
        }

        if (keyname && strcmp(keyname, "\"hamonizeBlockRules\"") == 0)

        {
            if (strcmp(comm, "\"rm\"") != 0)
            {
                syslog(LOG_INFO, "Ufw---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
                hamonizeBlockRules(pid);
            }
        }

        // Login
        // if (keyname && strcmp(keyname, "\"login\"") == 0)
        // {
        //     if (strcmp(comm, "\"rm\"") != 0)
        //     {
        //         syslog(LOG_INFO, "Ufw---------------  key : [%s] , keysArgv : [%s],  comm = [%s]", keyname, keysArgv, comm);
        //         hamonizeLogin();
        //     }
        // }
    };

    closelog();
    return 0;
}