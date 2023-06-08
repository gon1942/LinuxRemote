#define _GNU_SOURCE
#include <stdio.h>
#include <signal.h>
#include <sys/select.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>
#include "libaudit.h"
#include "auparse.h"
#include <stdlib.h>
#include <string.h>
#include <signal.h>

// #include <libnotify/notify.h>

/* Global Data */
static volatile int stop = 0;
static volatile int hup = 0;
static auparse_state_t *au = NULL;

#define MY_ACCOUNT 1000
const char *note = "Hamonize  Alert";

/* Local declarations */
static void handle_event(auparse_state_t *au,
						 auparse_cb_event_t cb_event_type, void *user_data);

/*
 * SIGTERM handler
 */
static void term_handler(int sig)
{
	stop = 1;
}

/*
 * SIGHUP handler: re-read config
 */
static void hup_handler(int sig)
{
	hup = 1;
}

static void reload_config(void)
{
	hup = 0;

	/*
	 * Add your code here that re-reads the config file and changes
	 * how your plugin works.
	 */
}

int main(int argc, char *argv[])
{
	char tmp[MAX_AUDIT_MESSAGE_LENGTH];
	struct sigaction sa;

	/* Register sighandlers */
	sa.sa_flags = 0;
	sigemptyset(&sa.sa_mask);
	/* Set handler for the ones we care about */
	sa.sa_handler = term_handler;
	sigaction(SIGTERM, &sa, NULL);
	sa.sa_handler = hup_handler;
	sigaction(SIGHUP, &sa, NULL);
	/* Set STDIN non-blocking */
	fcntl(0, F_SETFL, O_NONBLOCK);

	/* Initialize the auparse library */
	au = auparse_init(AUSOURCE_FEED, 0);
	if (au == NULL)
	{
		printf("audisp-example is exiting due to auparse init errors");
		return -1;
	}
	// auparse_set_eoe_timeout(2);
	auparse_add_callback(au, handle_event, NULL, NULL);
	do
	{

		fd_set read_mask;
		int retval;
		int read_size = 1; /* Set to 1 so it's not EOF */

		/* Load configuration */
		if (hup)
		{
			reload_config();
		}
		do
		{
			FD_ZERO(&read_mask);
			FD_SET(0, &read_mask);

			if (auparse_feed_has_data(au))
			{
				struct timeval tv;
				tv.tv_sec = 1;
				tv.tv_usec = 0;
				retval = select(1, &read_mask, NULL, NULL, &tv);
			}
			else
				retval = select(1, &read_mask, NULL, NULL, NULL);

			/* If we timed out & have events, shake them loose */
			if (retval == 0 && auparse_feed_has_data(au))
				auparse_feed_age_events(au);

		} while (retval == -1 && errno == EINTR && !hup && !stop);

		/* Now the event loop */
		if (!stop && !hup && retval > 0)
		{
			while ((read_size = read(0, tmp, MAX_AUDIT_MESSAGE_LENGTH)) > 0)
			{
				auparse_feed(au, tmp, read_size);
			}
		}
		if (read_size == 0) /* EOF */
			break;
	} while (stop == 0);

	/* Flush any accumulated events from queue */
	auparse_flush_feed(au);
	auparse_destroy(au);
	// if (stop)
	// 	syslog(LOG_INFO, "-------audisp-example is exiting on stop request\n");
	// else
	// 	syslog(LOG_INFO, "-------audisp-example is exiting on stdin EOF\n");

	return 0;
}

/* This function shows how to dump a whole event by iterating over records */
static void dump_whole_event(auparse_state_t *au)
{
	auparse_first_record(au);
	do
	{
		syslog(LOG_INFO, "---------------3333333-------------%s\n", auparse_get_record_text(au));
	} while (auparse_next_record(au) > 0);
	printf("\n");
}

char *hamonizeLogin()
{
	syslog(LOG_INFO, "#-------------------hamonizeLogin-------------------------###############.\n");
	int ret = system("/bin/bash /etc/hamonize/agentJobs/eqchk");
	WEXITSTATUS(ret);
	syslog(LOG_INFO, "--------hamonizeLogin---------ret : %d \n", ret);
	return 0;
}

// static void notify()
// {
// 	/* send a message */
// 	/* Setup the notification stuff */
// 	char msg[256], *name = NULL;

// 	NotifyNotification *n = notify_notification_new(note, "해당프로그램은 Hamonize 관리자로 부터 실행 차단프로그램입니다.", NULL);
// 	notify_notification_set_urgency(n, NOTIFY_URGENCY_NORMAL);
// 	notify_notification_set_timeout(n, 3000); // 3 seconds
// 	notify_notification_show(n, NULL);
// 	g_object_unref(G_OBJECT(n));

// 	free(name);

// 	syslog(LOG_INFO, "notify@@@@@@@@@@@@@@-----------------------execl호출  \n");
// }

// void wallNotify(const char *pnm)
// {
// 	syslog(LOG_INFO, "wallNotifywallNotifywallNotifywallNotifywallNotifywallNotify@@@@@@@@@@@@@@-----------------------execl호출  \n");
// 	char command[1024];
// 	// const char* message = "해당프로그램은 Hamonize 관리자로 부터 실행 차단프로그램입니다.";
// 	const char *message = " is Block Program(Application) by Admin";
// 	// sprintf(command, "echo '%s' | iconv -t utf-8 | wall", message);

// 	sprintf(command, "printf ['%s']'%s' | iconv -t utf-8 | wall ", pnm, message);
// 	system(command);
// 	return;
// }
/* This function shows how to dump a whole record's text */
static void dump_whole_record(auparse_state_t *au)
{
	const char *keyname;
	const char *filename = NULL;
	const char *pid = NULL;
	const char *comm = NULL;
	pid = auparse_find_field(au, "pid");
	comm = auparse_find_field(au, "comm");
	keyname = auparse_find_field(au, "key");
	syslog(LOG_INFO, "-----------------> Check pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", pid, comm, keyname, auparse_interpret_realpath(au));

	if (keyname && strcmp(keyname, "\"hamonizeBlockRules\"") == 0)
	{
		syslog(LOG_INFO, "--------------------key [%s]", keyname);

		pid_t pidt = atoi(pid);
		kill(pidt, SIGKILL);
		syslog(LOG_INFO, "-----===============>>>---------------Failed to kill process with PID %d.\n", pidt);
syslog(LOG_INFO, "-----------------> Check pid ========commmmm comm: [%s]  \n", comm);

		char command[1024];
		sprintf(command, "/bin/bash /etc/hamonize/agentJobs/blockNoti '%s'", comm);
		int ret = system(command);
		WEXITSTATUS(ret);
		printf("block noti -------ret : %d \n", ret);

		// notify();
		// wallNotify();
	}
}

/* This function shows how to iterate through the fields of a record and print its name and raw value and interpreted value. */
static void dump_fields_of_record(auparse_state_t *au)
{
	// syslog(LOG_INFO, " record type %d(%s) has %d fields\n", auparse_get_type(au), audit_msg_type_to_name(auparse_get_type(au)), auparse_get_num_fields(au));
	// printf("line=%d file=%s\n", auparse_get_line_number(au),auparse_get_filename(au) ? auparse_get_filename(au) : "stdin");

	const au_event_t *e = auparse_get_timestamp(au);
	if (e == NULL)
	{
		printf("Error getting timestamp - aborting\n");
		return;
	}
	/* Note that e->sec can be treated as time_t data if you want
	 * something a little more readable */
	printf("event time: %u.%u:%lu, host=%s\n", (unsigned)e->sec,
		   e->milli, e->serial, e->host ? e->host : "?");
	auparse_first_field(au);

	do
	{
		printf("field: %s=%s (%s)\n",
			   auparse_get_field_name(au),
			   auparse_get_field_str(au),
			   auparse_interpret_field(au));
	} while (auparse_next_field(au) > 0);
	printf("\n");
}

/* This function receives a single complete event at a time from the auparse
 * library. This is where the main analysis code would be added. */
static void handle_event(auparse_state_t *au,
						 auparse_cb_event_t cb_event_type, void *user_data)
{
	int type, num = 0;

	if (cb_event_type != AUPARSE_CB_EVENT_READY)
		return;

	/* Loop through the records in the event looking for one to process.
	   We use physical record number because we may search around and
	   move the cursor accidentally skipping a record. */
	while (auparse_goto_record_num(au, num) > 0)
	{
		type = auparse_get_type(au);
		/* Now we can branch based on what record type we find.
		   This is just a few suggestions, but it could be anything. */
		switch (type)
		{
		case AUDIT_AVC:
			dump_fields_of_record(au);
			break;
		case AUDIT_SYSCALL:
			dump_whole_record(au);
			break;
		case AUDIT_USER_LOGIN:
			// hamonizeLogin();

			syslog(LOG_INFO, "#-------------------hamonizeLogin-------------------------###############.\n");
			int ret = system("/bin/bash /etc/hamonize/agentJobs/eqchk");
			WEXITSTATUS(ret);
			syslog(LOG_INFO, "--------hamonizeLogin---------ret : %d \n", ret);

			break;
		case AUDIT_ANOM_ABEND:
			break;
		// case AUDIT_MAC_STATUS:
		// 	dump_whole_event(au);
		// 	break;
		default:
			break;
		}
		num++;
	}
}

// rules : -a always,exit -F path=/usr/bin/htop -F perm=xarw  -k hamonizeBlockRules
/**
plugin

active = yes
direction = out
path = /sbin/audisp-example
type = always
args = 1
format = string


compile
gcc -o ./audisp-example audisp-example.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl


*/
