#define _GNU_SOURCE
#include <stdio.h>
#include <sys/select.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <libaudit.h>
#include <auparse.h>
#include <syslog.h>
#include <locale.h>
#include <errno.h>
#include <pwd.h>
#include <getopt.h>
#include "libaudit.h"
#include "auparse.h"
#include <syslog.h>
#include <libnotify/notify.h>

#define MY_ACCOUNT 1000
const char *note = "Login Alert";

/*
 * Flags bitset
 */
unsigned flags = 0x0;

#define F_VERBOSE 0x00000001
#define F_CHECK 0x00000002
#define F_USESTDIN 0x00000004

/*
 * Print a null terminated string, escaping chararters from the given set
 */
void print_escape(FILE *fd, char *str, const char *escape)
{
        register char *s = str;
        int ch;

        while ((ch = (int)*s++))
        {
                if (strrchr(escape, ch))
                        fputc('\\', fd);
                fputc(ch, fd);
        }
}

/*
 * auparse_callback - callback routine to be executed once a complete event is composed
 */
void auparse_callback(auparse_state_t *au, auparse_cb_event_t cb_event_type, void *user_data)
{
        int *event_cnt = (int *)user_data;
        syslog(LOG_INFO, "##---%ls", event_cnt);

        if (cb_event_type == AUPARSE_CB_EVENT_READY)
        {
                // syslog(LOG_INFO, "##---%d", auparse_first_record(au));
                // if (auparse_first_record(au) <= 0){
                //         return; /* If no first record, then no event ! */
                // }

                // auparse_first_record(au);

                do
                {
                        auparse_first_field(au); /* Move to first field */
                        do
                        {

                                if (auparse_interpret_realpath(au) != NULL)
                                {

                                        syslog(LOG_INFO, "%s<---typename---------\n", auparse_get_type_name(au));
                                        syslog(LOG_INFO, "%s<---fieldstr--------\n", auparse_get_field_str(au));
                                        syslog(LOG_INFO, "%s<---realpath--------\n", auparse_interpret_realpath(au));
                                }
                                // const char *fname = auparse_get_field_name(au);
                                /* We ignore the node and type fields */
                                // if (strcmp(fname, "type") != 0 || strcmp(fname, "node") != 0)
                                // {
                                        // printf strcmp(fname, "type")
                                        // printf(" %d------------%s", strcmp(fname, "type"), auparse_get_field_str(au) );
                                //         syslog(LOG_INFO, "%s<------------END", auparse_get_field_str(au));
                                // }

                                // if (strcmp(fname, "type")q == 0 || strcmp(fname, "node") == 0)
                                //         continue;

                                // const char *subj = auparse_interpret_field(au);
                                // if (strcmp(subj, "unset") == 0)
                                //         printf("subj==========%s", subj);
                                //         subj = "system";
                                // if (subj  || subj == NULL) {
                                //         printf("subj==========%s", subj);
                                //         printf("-----------");
                                // }

                                // const char *aufstr = auparse_get_field_str(au);
                                // printf("===aufstr====%s", aufstr);
                                // if (fname == "name"){
                                // printf(" fname is : %s , %s -END", fname, auparse_get_field_str(au));
                                // }
                        } while (auparse_next_field(au) > 0);

                        syslog(LOG_INFO, "\n");
                        syslog(LOG_INFO, "\n");
                        syslog(LOG_INFO, "\n");
                } while (auparse_next_record(au) > 0);
        }
}

int main(int argc, char **argv)
{

        printf("main--------------------------------------");
        openlog("ryan-################### --> ", LOG_CONS, LOG_USER);

        auparse_state_t *au = NULL;
        char tmp[MAX_AUDIT_MESSAGE_LENGTH + 1], bus[32];

        /* Initialize the auparse library */
        au = auparse_init(AUSOURCE_FEED, 0);

        auparse_add_callback(au, auparse_callback, NULL, NULL);

        do
        {

                syslog(LOG_INFO, "************main******************");

                int retval;
                fd_set read_mask;
                FD_ZERO(&read_mask);
                FD_SET(0, &read_mask);

                do
                {
                        retval = select(1, &read_mask, NULL, NULL, NULL);
                } while (retval == -1 && errno == EINTR);

                /* Now the event loop */
                if (retval > 0)
                {
                        if (fgets_unlocked(tmp, MAX_AUDIT_MESSAGE_LENGTH, stdin))
                        {
                                auparse_feed(au, tmp, strnlen(tmp, MAX_AUDIT_MESSAGE_LENGTH));
                        }
                }
                else if (retval == 0)
                        auparse_flush_feed(au);
                if (feof(stdin))
                        break;

        } while (1);

        auparse_flush_feed(au);
        auparse_destroy(au); /* this also free's event_cnt */

        closelog();

        return 0;
}
