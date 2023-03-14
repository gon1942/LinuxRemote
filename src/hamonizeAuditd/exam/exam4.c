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

// sudo apt-get install libssl-dev
#include <openssl/sha.h>

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


int main(int argc, char *argv[])
{

    auparse_state_t *au = NULL;
    char tmp[MAX_AUDIT_MESSAGE_LENGTH + 1], bus[32];

    /* Initialize the auparse library */
    au = auparse_init(AUSOURCE_FILE_POINTER, stdin);
    do
    {
        // if (auparse_find_field(au, "auid")) {

        // auparse_first_record(au);

        syslog(LOG_INFO, "auid:, node:[%s] , umsg--------\n", auparse_find_field(au, "name"));
        syslog(LOG_INFO, "auid:, umsg [%s]]---------\n", auparse_find_field(au, "type"));

        // if (auparse_find_field(au, "type") && auparse_find_field(au, "name") )
        // {
        //     syslog(LOG_INFO, "Szzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz =============================-----\n");
        //     syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s]]---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"));
            // syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s], realpath [%s]---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"), auparse_find_field(au, "nametype"));
        // }
        // syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s],---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"));

        // syslog(LOG_INFO, "auid:[%s], node:[%s] , umsg [%s], realpath [%s]---------\n", auparse_find_field(au, "auid"), auparse_find_field(au, "node"), auparse_find_field(au, "name"), auparse_interpret_realpath(au));
        // printf("interp auid=%s\n", auparse_interpret_field(au));
        // } else
        // 	printf("Error iterating to auid\n");
    }while (auparse_next_event(au) > 0);



    // return 0;
}

int main2(int argc, char *argv[])
{

        auparse_state_t *au = NULL;
        char tmp[MAX_AUDIT_MESSAGE_LENGTH + 1], bus[32];
        const char *keyname = NULL;
        const char *filename = NULL;
        const char *pid = NULL;
        const char *keysArgv = argv[1];

        /* Initialize the auparse library */
        au = auparse_init(AUSOURCE_FILE_POINTER, stdin);
        // au = auparse_init(AUSOURCE_FEED, 0);

        while (auparse_next_event(au) > 0)
        {
                pid = auparse_find_field(au, "pid");
                // syslog(LOG_INFO, "---2222222222222------3333333-------------------->%s\n", pid);

                filename = auparse_find_field(au, "name");

                do
                {

                        if (filename && strcmp(filename, "(null)"))
                        {
                                syslog(LOG_INFO, "----------------------------> filename : [%s] \n", filename);
                                // syslog(LOG_INFO, "----------------------------> filename : [%s], pid :[%s] \n", filename, pid);
                        }

                } while (auparse_next_record(au) > 0);

                /*
                // key check -------------------------------------------------
                // auparse_find_field(au, "key");
                // const char *aaa = "\"aaaa\"";
                // const char *hmryan = "\"hmryan\"";
                // if (keyname && strcmp(keyname, hmryan) == 0)
                // {
                //         syslog(LOG_INFO, "key name hmryan ---------------------  key : [%s] , keysArgv : [%s], tmp---[%s]", keyname, keysArgv, aaa);
                // }

                // if (keyname && strcmp(keyname, aaa) == 0)
                // {
                //         syslog(LOG_INFO, "key name aaaaa ---------------------  key : [%s] , keysArgv : [%s], tmp---[%s]", keyname, keysArgv, aaa);
                // }
                // key check -------------------------------------------------
                */

                // if (auparse_find_field(au, "type") && auparse_find_field(au, "name") && auparse_find_field(au, "nametype"))
                // {
                //         syslog(LOG_INFO, "Szzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz =============================-----\n");
                //         syslog(LOG_INFO, "auid:, node:[%s] ,--type-- [%s]----\n", auparse_find_field(au, "name"), auparse_find_field(au, "type"));
                //         // syslog(LOG_INFO, "auid:, node:[%s] ,--------\n", auparse_find_field(au, "type"));

                //         // syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s], realpath [%s]---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"), auparse_find_field(au, "nametype"));
                // }

                // if (k && strcmp(k, argv[1])) {
                //         syslog(LOG_INFO, "333333333************************33333333333333333e:[%s] , [%s]", keyname, argv[1]);
                // }
        }
        // auparse_destroy(au);
        // closelog();
}