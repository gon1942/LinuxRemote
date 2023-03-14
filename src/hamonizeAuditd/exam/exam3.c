#define _GNU_SOURCE
#include <stdio.h>
#include <sys/select.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <libaudit.h>
#include <auparse.h>
#include <libnotify/notify.h>
#include <locale.h>

#define MY_ACCOUNT 1000
const char *note = "Login Alert";

static int goto_record_type(auparse_state_t *au, int type)
{
    int cur_type;

    auparse_first_record(au);
    do
    {
        cur_type = auparse_get_type(au);
        if (cur_type == type)
        {
            auparse_first_field(au);
            return type; // Normal exit
        }
    } while (auparse_next_record(au) > 0);

    return -1;
}

static void handle_event(auparse_state_t *au,
                         auparse_cb_event_t cb_event_type, void *user_data)
{
    syslog(LOG_INFO, "###############################callback log-----\n");
    syslog(LOG_INFO, "####################################################callback log---------[%d] \n", cb_event_type);

    const char *auid;
    int uid;

    // if (cb_event_type == AUPARSE_CB_EVENT_READY)
    // {
    // syslog(LOG_INFO, "##-t*******************************************************tttttt--%d", cb_event_type);

    // int type =0;
    // type= auparse_get_type(au);
    // goto_record_type(au, type);
    // syslog(LOG_INFO, "auid:[%d], uid ]---------\n", type);

    // const char *name;
    // auparse_first_field(au);
    // name = auparse_find_field(au, "node");
    // syslog(LOG_INFO, "##-t*****************************************aaaaaaaaaaaaaa**************tttttt--%s] ,[%s]", name, auparse_find_field(au, "type"));

    // do
    // {
    //         const char *name = auparse_get_field_name(au);
    //         syslog(LOG_INFO, "auid:[%s], node:[%s] , um---------\n", auparse_find_field(au, "auid"), auparse_find_field(au, "node"));
    //         // syslog(LOG_INFO, "auid:[%s], node:[%s] , umsg [%s]---------\n", auparse_find_field(au, "auid"), auparse_find_field(au, "node"), auparse_find_field(au, "uid"));

    //         // syslog(LOG_INFO,       "##-ttt auid----------------------%s=>>>>>  %s", auparse_find_field(au, "auid"), auparse_get_field_str(au) );
    //         // syslog(LOG_INFO,"## ---check %s ] -----%s ]====  %s ]===interpret= >%s\n",auparse_find_field(au, "auid"),  auparse_get_field_name(au), auparse_get_field_str(au), auparse_interpret_field(au));
    //         // syslog(LOG_INFO,"## ---check %s ] -----%s ]====  %s ]===type= >%s\n",auparse_find_field(au, "auid"),  auparse_get_field_name(au), auparse_get_field_str(au), auparse_find_field(au, "type"));
    // } while (auparse_next_field(au) > 0);

    // return;
    // }

    // if (auparse_first_record(au) <= 0)
    // {
    //         syslog(LOG_INFO, "##-t********************auparse_first record ==== 0 *******");
    //         return; /* If no first record, then no event ! */
    // }

    // syslog(LOG_INFO, "-----AUDIT_SYSCALL--------111-------------->%s: %s \n", audit_msg_type_to_name(auparse_get_type(au)), auparse_get_record_text(au));
    // syslog(LOG_INFO, "-----AUDIT_SYSCALL--------111------111111111-------->%s\n", auparse_get_field_str(au));
    // syslog(LOG_INFO, "----auparse_next_record########################## ------>%d \n", auparse_next_record(au));
    // syslog(LOG_INFO, "##-daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaatatdataaaaaaaaaaaaaaaaa------%d", auparse_first_record(au));

    // do
    // {
    // do
    // {
    printf("%s=%s, [%s] \n", auparse_get_field_name(au), auparse_get_field_str(au), auparse_find_field(au, "name"));
    auparse_first_field(au);
    do
    {
        // syslog(LOG_INFO, "auid:[%s], node:[%s] , umsg [%s]---------\n", auparse_find_field(au, "auid"), auparse_find_field(au, "node"), auparse_find_field(au, "uid"));
        syslog(LOG_INFO, "auid:[%s], node:[%s] ,  ---------\n", auparse_find_field(au, "auid"), auparse_find_field(au, "node"));
        // printf("%s=%s, [%s] \n", auparse_get_field_name(au),auparse_get_field_str(au) , auparse_find_field(au, "name") );

        // syslog(LOG_INFO,       "##-ttt auid----------------------%s=>>>>>  %s", auparse_find_field(au, "auid"), auparse_get_field_str(au) );
        // syslog(LOG_INFO,"## ---check %s ] -----%s ]====  %s ]===interpret= >%s\n",auparse_find_field(au, "auid"),  auparse_get_field_name(au), auparse_get_field_str(au), auparse_interpret_field(au));
        // syslog(LOG_INFO,"## ---check %s ] -----%s ]====  %s ]===type= >%s\n",auparse_find_field(au, "auid"),  auparse_get_field_name(au), auparse_get_field_str(au), auparse_find_field(au, "type"));
    } while (auparse_next_field(au) > 0);
    // } while (auparse_next_record(au) > 0);
    // } while (auparse_next_event(au) > 0);

    // const char *type = auparse_find_field(au, "type");
    // syslog(LOG_INFO, "##-ttttttttttttttttttttttttt--%s", type);
    // do
    // {
    //         int typea, num = 0;
    //         typea = auparse_get_type(au);
    //         /* Now we can branch based on what record type we find. This is just a few suggestions, but it could be anything. */
    //         switch (typea)
    //         {

    //         case AUDIT_AVC:
    //                 syslog(LOG_INFO, "##----------------------AUDIT_AVC--\n");
    //                 break;
    //         case AUDIT_SYSCALL:
    //                 syslog(LOG_INFO, "##----------------------AUDIT_SYSCALL--\n");

    //                 // syslog(LOG_INFO, "##---------------------got record: %s", auparse_get_record_text(au));
    //                 syslog(LOG_INFO, "-----AUDIT_SYSCALL---------------------->%s: %s\n", audit_msg_type_to_name(auparse_get_type(au)), auparse_get_record_text(au));

    //                 // const char *text;
    //                 // text = auparse_get_record_text(self->au);

    //                 do
    //                 {
    //                         // printf("%s\n", auparse_get_record_text(au));
    //                         syslog(LOG_INFO, "##---------aaaaaaaaaaaaaaaa------------got record: %s \n", auparse_get_record_text(au));
    //                         // } while (auparse_next_record(au) > 0);
    //                 } while (auparse_next_field(au) > 0);
    //                 // syslog(LOG_INFO, "##----------------------AUDIT_SYSCALL--%s\n", auparse_get_record_text(au));

    //                 break;
    //         case AUDIT_USER_LOGIN:
    //                 syslog(LOG_INFO, "###############AUDIT_USER_LOGIN####################\n");
    //                 syslog(LOG_INFO, "###############AUDIT_USER_LOGIN@@@@@@@@@@@@@@--\n");

    //                 break;
    //         case AUDIT_ANOM_ABEND:
    //                 syslog(LOG_INFO, "##-------------------------------AUDIT_ANOM_ABEND--\n");
    //                 break;
    //         case AUDIT_MAC_STATUS:
    //                 syslog(LOG_INFO, "##-------------------AUDIT_MAC_STATUS--\n");
    //                 break;
    //         default:
    //                 break;
    //         }
    //         num++;

    //         // syslog(LOG_INFO, "##-#############################"    );
    //         // auparse_first_field(au);
    //         // do
    //         // {

    //         //         char data[1024];
    //         //         const char *name = auparse_get_field_name(au);
    //         //         const char *value = auparse_interpret_field(au);
    //         //         syslog(LOG_INFO, "##-name--%s", name);
    //         //         syslog(LOG_INFO, "##-value--%s", value);

    //         // } while (auparse_next_field(au) > 0);
    // } while (auparse_next_record(au) > 0);

    // auparse_first_record(au);
    // do
    // {
    //         auparse_first_field(au);
    //         // auparse_next_field(au);
    //         // int type = auparse_get_type(au);
    //         do
    //         {
    //                 syslog(LOG_INFO, "\n");
    //                 if (auparse_interpret_realpath(au) != NULL)
    //                 {

    //                         syslog(LOG_INFO, "%s<---typename---------\n", auparse_get_field_name(au));
    //                         syslog(LOG_INFO, "%s<---typename---------\n", auparse_get_type_name(au));
    //                         syslog(LOG_INFO, "%s<---fieldstr--------\n", auparse_get_field_str(au));
    //                         syslog(LOG_INFO, "%s<---realpath--------\n", auparse_interpret_realpath(au));
    //                 }
    //         } while (auparse_next_field(au) > 0);

    // } while (auparse_next_record(au) > 0);
}

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

void auparse_callback(auparse_state_t *au, auparse_cb_event_t cb_event_type,
                      void *user_data)
{
    int *event_cnt = (int *)user_data;

    if (cb_event_type == AUPARSE_CB_EVENT_READY)
    {
        if (auparse_first_record(au) <= 0)
            return;
        printf("event: %d\\n", *event_cnt);
        printf("records:%d\\n", auparse_get_num_records(au));
        do
        {
            printf("fields:%d\\n", auparse_get_num_fields(au));
            printf("type=%d ", auparse_get_type(au));
            const au_event_t *e = auparse_get_timestamp(au);
            if (e == NULL)
                return;
            // printf("event time: %u.%u:%lu\\n", (unsigned)e\->sec, e\->milli, e\->serial);
            auparse_first_field(au);
            do
            {
                syslog(LOG_INFO, "--------[%s]=[%s] (%s)\\n", auparse_get_field_name(au),
                       auparse_get_field_str(au),
                       auparse_interpret_field(au));
            } while (auparse_next_field(au) > 0);
            printf("\\n");

        } while (auparse_next_record(au) > 0);
        (*event_cnt)++;
    }
}

static const char *buf[] = {

    "type=SYSCALL msg=audit(1677045059.978:13159): arch=c000003e syscall=257 name=\"aaaaaaa\"success=yes exit=3 a0=ffffff9c a1=7ffc0f68b041 a2=941 a3=1b6 items=2 ppid=5848 pid=322727 auid=4294967295 uid=1000 gid=1000 euid=1000 suid=1000 fsuid=1000 egid=1000 sgid=1000 fsgid=1000 tty=pts2 ses=4294967295 comm=\"touch\" exe=\"/usr/bin/touch\" subj=unconfined key=\"hmryan\"\n",
    "type=PATH msg=audit(1677044945.634:13123): item=1 name=\"/home/gonpc/test/autid--==========1-----238\" inode=8794073 dev=08:02 mode=0100664 ouid=1000 ogid=1000 rdev=00:00 nametype=NORMAL cap_fp=0 cap_fi=0 cap_fe=0 cap_fver=0 cap_frootid=0\n",
    NULL};

int main222(int argc, char *argv[])
{

    syslog(LOG_INFO, "Start =============================-----\n");
    // auparse_state_t *au = NULL;
    char *files[3] = {"test.log", "test2.log", NULL};
    setlocale(6, "");
    auparse_state_t *au;

    au = auparse_init(AUSOURCE_BUFFER_ARRAY, buf);
    if (au == NULL)
    {
        printf("Error - %s\n", strerror(errno));
        return 1;
    }

    printf("Starting Test 1, iterate...\n");
    while (auparse_next_event(au) > 0)
    {
        // if (auparse_find_field(au, "auid")) {
        printf("%s=%s, [%s] \n", auparse_get_field_name(au), auparse_get_field_str(au), auparse_find_field(au, "name"));
        // printf("interp auid=%s\n", auparse_interpret_field(au));
        // } else
        // 	printf("Error iterating to auid\n");
    }
}

int main(int argc, char *argv[])
{

    auparse_state_t *au = NULL;
    char tmp[MAX_AUDIT_MESSAGE_LENGTH + 1], bus[32];

    /* Initialize the auparse library */
    au = auparse_init(AUSOURCE_FILE_POINTER, stdin);
    while (auparse_next_event(au) > 0)
    {
        // if (auparse_find_field(au, "auid")) {

        // auparse_first_record(au);

        if (auparse_find_field(au, "type") && auparse_find_field(au, "name") && auparse_find_field(au, "nametype"))
        {
            syslog(LOG_INFO, "Szzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz =============================-----\n");
            syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s]]---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"));
            // syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s], realpath [%s]---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"), auparse_find_field(au, "nametype"));
        }
        // syslog(LOG_INFO, "auid:, node:[%s] , umsg [%s],---------\n", auparse_find_field(au, "type"), auparse_find_field(au, "name"));

        // syslog(LOG_INFO, "auid:[%s], node:[%s] , umsg [%s], realpath [%s]---------\n", auparse_find_field(au, "auid"), auparse_find_field(au, "node"), auparse_find_field(au, "name"), auparse_interpret_realpath(au));
        // printf("interp auid=%s\n", auparse_interpret_field(au));
        // } else
        // 	printf("Error iterating to auid\n");
    }


    closelog();

    // return 0;
}