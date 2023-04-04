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
#include <locale.h>
#include <curl/curl.h>
#include <time.h>
#include "unistd.h"
#include "fcntl.h"

int main(int argc, char *argv[])
{

    auparse_state_t *au = NULL;
    const char *keyname;
    const char *keysArgv = argv[1];
    const char *filename = NULL;
    const char *pid = NULL;
    const char *ppid = NULL;
    const char *comm = NULL;

    au = auparse_init(AUSOURCE_FEED, 0);
syslog(LOG_INFO, "-init---------> Check keyname--");
    // while (auparse_next_event(au) > 0)
    // {

    // do
    // {
    //     pid = auparse_find_field(au, "pid");

    //     comm = auparse_find_field(au, "comm");
    //     keyname = auparse_find_field(au, "key");

    //     syslog(LOG_INFO, "-init---------> Check keyname [%s],  \n", keyname);
    //     if (keyname)
    //     {
    //         if (strcmp(keyname, "\"hamonizeBlockRules\"") == 0)
    //         {
    //             syslog(LOG_INFO, "-init---111111111111111-222222222222222------> Check keyname [%s], comm: [%s], pid: [%s]  \n", keyname, comm, pid);
    //             au = NULL;
    //         }
    //         else
    //         {
    //             syslog(LOG_INFO, "-init---111111111111111-3333333333333333------> Check keyname [%s],  \n", keyname);
    //         }
    //     }
    //     else
    //     {
    //         syslog(LOG_INFO, "-init----22222222222-----> Check keyname [%s],  \n", keyname);
    //     }

    //     if (keyname && strcmp(keyname, "\"hamonizeBlockRules\"") == 0)
    //     {

    //         // do
    //         // {
    //         filename = auparse_find_field(au, "name");
    //         if (filename && strcmp(filename, "(null)"))
    //         {
    //             syslog(LOG_INFO, "-----Run------------> Check pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", pid, comm, keyname, auparse_interpret_realpath(au));
    //         }

    //         // } while (auparse_next_record(au) > 0);
    //     }
    //     else
    //     {
    //         syslog(LOG_INFO, "-init-----else ----> Check keyname [%s],  \n", keyname);
    //     }
    // } while (auparse_next_record(au) > 0);
    // };

    auparse_destroy(au);

    return 0;
}