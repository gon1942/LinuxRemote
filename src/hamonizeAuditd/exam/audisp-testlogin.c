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

#define MY_ACCOUNT 1000
const char *note = "Login Alert";

static void handle_event(auparse_state_t *au,
                auparse_cb_event_t cb_event_type, void *user_data)
{
        if (cb_event_type != AUPARSE_CB_EVENT_READY)
                return;

        auparse_first_record(au);
        do {
                int type = auparse_get_type(au);
                if (type == AUDIT_USER_LOGIN) {
                        char msg[256],  *name = NULL;
                        const char *res;

                        /* create a message */
                        if (!auparse_find_field(au, "acct")) {
                                auparse_first_record(au);
                                if (auparse_find_field(au, "auid"))
                                    name = strdup(auparse_interpret_field(au));
                        } else
                                name = strdup(auparse_interpret_field(au));
                        res = auparse_find_field(au, "res");
                        snprintf(msg, sizeof(msg), "%s log in %s", name ? name : "someone", res);

                        /* send a message */
                        NotifyNotification *n = notify_notification_new(note, "msgmsgmsgmsgmsg", NULL);
                        notify_notification_set_urgency(n, NOTIFY_URGENCY_NORMAL);
                        notify_notification_set_timeout(n, 3000); //3 seconds
                        notify_notification_show (n, NULL);
                        g_object_unref(G_OBJECT(n));

                        free(name);
                        return;
                }
        } while (auparse_next_record(au) > 0);
}

int main(int argc, char *argv[])
{
        auparse_state_t *au = NULL;
        char tmp[MAX_AUDIT_MESSAGE_LENGTH+1], bus[32];

        /* Initialize the auparse library */
        au = auparse_init(AUSOURCE_FEED, 0);
        auparse_add_callback(au, handle_event, NULL, NULL);

        /* Setup the notification stuff */
        notify_init(note); 
        snprintf(bus, sizeof(bus), "unix:path=/run/user/%d/bus", MY_ACCOUNT);
        setenv("DBUS_SESSION_BUS_ADDRESS", bus, 1);
        if (setresuid(MY_ACCOUNT, MY_ACCOUNT, MY_ACCOUNT))
                return 1;

        do {
                int retval;
                fd_set read_mask;

                FD_ZERO(&read_mask);
                FD_SET(0, &read_mask);

                do {
                        retval = select(1, &read_mask, NULL, NULL, NULL);
                } while (retval == -1 && errno == EINTR);

                /* Now the event loop */
                 if (retval > 0) {
                        if (fgets_unlocked(tmp, MAX_AUDIT_MESSAGE_LENGTH, stdin)) {
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