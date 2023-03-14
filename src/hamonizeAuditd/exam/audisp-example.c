#define _GNU_SOURCE
#include <stdio.h>
#include <sys/select.h>
#include <string.h>
#include <errno.h>
#include <libaudit.h>
#include <auparse.h>


static void handle_event(auparse_state_t *au,
                auparse_cb_event_t cb_event_type, void *user_data)
{
        if (cb_event_type != AUPARSE_CB_EVENT_READY)
                return;

        auparse_first_record(au);
        do {
                int type = auparse_get_type(au);
                printf("example============");
                printf("record type %d(%s) has %d fields\n",
                        auparse_get_type(au),
                        audit_msg_type_to_name(auparse_get_type(au)),
                        auparse_get_num_fields(au));
        } while (auparse_next_record(au) > 0);
}

int main(int argc, char *argv[])
{
        auparse_state_t *au = NULL;
        char tmp[MAX_AUDIT_MESSAGE_LENGTH+1];

        /* Initialize the auparse library */
        au = auparse_init(AUSOURCE_FEED, 0);
        auparse_add_callback(au, handle_event, NULL, NULL);
        do {
                int retval = -1;
                fd_set read_mask;

                FD_ZERO(&read_mask);
                FD_SET(0, &read_mask);

                do {
                        retval = select(1, &read_mask, NULL, NULL, NULL);
                } while (retval == -1 && errno == EINTR);

                /* Now the event loop */
                 if (retval > 0) {
                        if (fgets_unlocked(tmp, MAX_AUDIT_MESSAGE_LENGTH,
                                stdin)) {
                                auparse_feed(au, tmp, strnlen(tmp, MAX_AUDIT_MESSAGE_LENGTH));
                        }
                } else if (retval == 0)
                        auparse_flush_feed(au);
                if (feof(stdin))
                        break;
        } while (1);

        /* Flush any accumulated events from queue */
        auparse_flush_feed(au);
        auparse_destroy(au);

        return 0;
}
