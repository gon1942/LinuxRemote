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


                auparse_first_record(au);

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

                                /* We ignore the node and type fields */
                                // if (strcmp(fname, "type") != 0  || strcmp(fname, "node") !=0 ){
                                //         // printf strcmp(fname, "type")
                                //         // printf(" %d------------%s", strcmp(fname, "type"), auparse_get_field_str(au) );
                                //         printf(" %s<------------END", auparse_get_field_str(au) );
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

 void auparse_callback2(auparse_state_t *au, auparse_cb_event_t cb_event_type, void *user_data)
       {
           int *event_cnt = (int *)user_data;

           if (cb_event_type == AUPARSE_CB_EVENT_READY) {
               if (auparse_first_record(au) <= 0) return;
               printf("event: %d\n", *event_cnt);
               printf("records:%d\n", auparse_get_num_records(au));
               do {
                   printf("fields:%d\n", auparse_get_num_fields(au));
                   printf("type=%d ", auparse_get_type(au));
                   const au_event_t *e = auparse_get_timestamp(au);
                   if (e == NULL) return;
                   printf("event time: %u.%u:%lu\n", (unsigned)e->sec, e->milli, e->serial);
                   auparse_first_field(au);
                   do {
                       printf("%s=%s (%s)\n", auparse_get_field_name(au), auparse_get_field_str(au), auparse_interpret_field(au));
                   } while (auparse_next_field(au) > 0);
                   printf("\n");

               } while(auparse_next_record(au) > 0);
               (*event_cnt)++;
           }
       }

int main(int argc, char **argv)
{

        printf("main--------------------------------------");
        openlog("ryan-################### --> ", LOG_CONS, LOG_USER);

        auparse_state_t *au = NULL;
        char *filename = argv[1];
        printf("===%s",filename);
           FILE *fp;
           char buf[256];
           size_t len;
           int *event_cnt = malloc(sizeof(int));

           au = auparse_init(AUSOURCE_FEED, 0);

           *event_cnt = 1;
           auparse_add_callback(au, auparse_callback, event_cnt, free);

           if ((fp = fopen(filename, "r")) == NULL) {
               fprintf(stderr, "could not open '%s', %s\n", filename, strerror(errno));
               return 1;
           }

           while ((len = fread(buf, 1, sizeof(buf), fp))) {
               auparse_feed(au, buf, len);
           }
           auparse_flush_feed(au);


        closelog();

        return 0;
}



/*
	// how
		auparse_first_field(au);
		f = auparse_find_field(au, "exe");
		if (f) {
			const char *exe = auparse_interpret_field(au);
			D.how = strdup(exe);
			if ((strncmp(D.how, "/usr/bin/python", 15) == 0) ||
			    (strncmp(D.how, "/usr/bin/sh", 11) == 0) ||
			    (strncmp(D.how, "/usr/bin/bash", 13) == 0) ||
			    (strncmp(D.how, "/usr/bin/perl", 13) == 0)) {
				int fnum;
				rc = 0;
				// Comm should be the previous field
				if ((fnum = auparse_get_field_num(au)) > 0)
					rc = auparse_goto_field_num(au,fnum-1);
				if (rc == 0)
					auparse_first_record(au);
				f = auparse_find_field(au, "comm");
				if (f) {
					free((void *)D.how);
					exe = auparse_interpret_field(au);
					D.how = strdup(exe);
				}
			}
		} else {










 char *fv, *ifv = NULL;
                auparse_first_field(au); /* Move to first field */
                do
                {
                    fv = (char *)auparse_get_field_str(au);
                    ifv = (char *)auparse_interpret_field(au);
                    printf("%s=", auparse_get_field_name(au));
                    print_escape(stdout, fv, "=()");
                    printf(" (");
                    print_escape(stdout, ifv, "=()");
                    printf(") ");
                } while (auparse_next_field(au) > 0);            
*/