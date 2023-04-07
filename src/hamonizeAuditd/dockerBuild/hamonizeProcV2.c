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

#include <libnotify/notify.h>
#include <curl/curl.h>
#include <json-c/json.h>

/* Global Data */
static volatile int stop = 0;
static volatile int hup = 0;
static auparse_state_t *au = NULL;

#define MY_ACCOUNT 1000
#define MAX_ID_LENGTH 1024
#define FILE_PATH "/etc/hamonize/propertiesJob/propertiesInfo.hm"

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
	syslog(LOG_INFO, "----------------------------");

	char tmp[MAX_AUDIT_MESSAGE_LENGTH];
	struct sigaction sa;

	/* notify--------------------------------*/
	char bus[32];
	notify_init(note);
	snprintf(bus, sizeof(bus), "unix:path=/run/user/%d/bus", MY_ACCOUNT);
	setenv("DBUS_SESSION_BUS_ADDRESS", bus, 1);
	if (setresuid(MY_ACCOUNT, MY_ACCOUNT, MY_ACCOUNT))
	{
		syslog(LOG_INFO, "setresuid failed");
		return 1;
	}

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
	if (stop)
		syslog(LOG_INFO, "----------------1111111------------audisp-example is exiting on stop request\n");
	else
		syslog(LOG_INFO, "----------------2222222------------audisp-example is exiting on stdin EOF\n");

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

char *hamonizeUpdt()
{
	syslog(LOG_INFO, "#----------hamonizeUpdt------------------###############.\n");
	// int ret = system("/bin/bash /home/gonpc/jobs/2023/newHamonize/src/hamonizeCtl/shell/agentJobs/updtjob.sh");
	// int ret = system("/etc/hamonize/agentJobs/updtjob.sh");
	int ret = system("/usr/local/hamonize-connect/hamonizeCtl --updt");
	// int ret = system("/bin/bash /etc/hamonize/agentJobs/updtjob.sh");

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
	syslog(LOG_INFO, "--------hamonizeBlock---------ret : %d \n", ret);
	return 0;
}

char *hamonizeDevice()
{
	syslog(LOG_INFO, "#----------hamonizeDevice------------------###############.\n");
	int ret = system("/usr/local/hamonize-connect/hamonizeCtl --devicepolicy");
	WEXITSTATUS(ret);
	syslog(LOG_INFO, "--------hamonizeDevice---------ret : %d \n", ret);
	return 0;
}

char *hamonizeDeviceSendLog()
{
	syslog(LOG_INFO, "#-------------------hamonizeDeviceSendLog-------------------------###############.\n");
	int ret = system("/usr/local/hamonize-connect/hamonizeCtl --devicepolicySend");
	WEXITSTATUS(ret);
	syslog(LOG_INFO, "--------hamonizeDeviceSendLog---------ret : %d \n", ret);
	return 0;
}

char *hamonizeUfw()
{
	syslog(LOG_INFO, "#-------------------hamonizeUfw-------------------------###############.\n");
	int ret = system("/usr/local/hamonize-connect/hamonizeCtl --ufw");
	WEXITSTATUS(ret);
	syslog(LOG_INFO, "--------hamonizeUfw---------ret : %d \n", ret);
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
char *sendInfo()
{
	syslog(LOG_INFO, "-----------sendinfo() =============>호출  \n");
	CURL *curl;
	CURLcode res;
	json_object *json, *events, *event;
	time_t now = time(NULL);
	struct curl_slist *headers = NULL;
	char *data;
	char str_time[20];
	char machine_id[MAX_ID_LENGTH];
	char tanent_id[MAX_ID_LENGTH];

	struct tm *t = localtime(&now);
	strftime(str_time, sizeof(str_time), "%Y-%m-%d %H:%M:%S", t);

	FILE *hamonizeInfoFile = fopen(FILE_PATH, "r");

	char line[MAX_ID_LENGTH];
	char *center_url = NULL;

	while (fgets(line, sizeof(line), hamonizeInfoFile) != NULL)
	{
		if (strstr(line, "CENTERURL=") != NULL)
		{
			// "CENTERURL=" 문자열을 찾았을 때, 값을 추출
			center_url = strdup(line + strlen("CENTERURL="));
			// 개행 문자 제거
			center_url[strcspn(center_url, "\n")] = '\0';
			break;
		}
	}

	fclose(hamonizeInfoFile);
	char *url_with_http = NULL;
	url_with_http = (char *)malloc(strlen(center_url) + 8);
	sprintf(url_with_http, "http://%s%s", center_url,"/hmsvc/prcssKill");
	syslog(LOG_INFO, "-----####center_url-------------- [%s] --> [%s] \n", center_url, url_with_http);
	

	// char url[] = "http://61.32.208.27:8083/hmsvc/prcssKill";
	// char url[] = center_url; //"http://192.168.0.240:8083/hmsvc/prcssKill";

	// Get Machine_id  --------------------------//
	FILE *fp = fopen("/etc/machine-id", "r");
	if (!fp)
	{
		syslog(LOG_INFO, "-----####Failed to open /etc/machine-id");
		exit(1);
	}

	// 파일에서 ID 값을 읽어와서 변수에 저장
	if (fgets(machine_id, MAX_ID_LENGTH, fp))
	{
		machine_id[strcspn(machine_id, "\n")] = 0;
	}
	fclose(fp);
	syslog(LOG_INFO, "-----#######Machine ID: %s\n", machine_id);

	// Get tanent id  --------------------------//
	FILE *fpTanent = fopen("/etc/hamonize/hamonize_tanent", "r");
	if (!fpTanent)
	{
		syslog(LOG_INFO, "-----####Failed to open /etc/hamonize/hamonize_tanent ");
		exit(1);
	}

	// 파일에서 ID 값을 읽어와서 변수에 저장
	if (fgets(tanent_id, MAX_ID_LENGTH, fpTanent))
	{
		tanent_id[strcspn(tanent_id, "\n")] = 0;
	}
	fclose(fpTanent);
	syslog(LOG_INFO, "-----#######tanent_ ID: %s\n", tanent_id);

	/* Create JSON object */
	json = json_object_new_object();
	events = json_object_new_array();
	json_object_object_add(json, "events", events);
	event = json_object_new_object();
	json_object_object_add(event, "datetime", json_object_new_string(str_time));
	json_object_object_add(event, "uuid", json_object_new_string(machine_id));
	json_object_object_add(event, "domain", json_object_new_string("aaa"));
	json_object_object_add(event, "name", json_object_new_string("htop"));
	json_object_array_add(events, event);
	data = (char *)json_object_to_json_string(json);
	syslog(LOG_INFO, "-----#######333----------_> json_object_to_json_string is [%s]", data);
	/* Initialize curl */
	curl = curl_easy_init();
	if (curl)
	{
		/* Set headers */
		headers = curl_slist_append(headers, "Content-Type: application/json");
		headers = curl_slist_append(headers, "Accept: application/json");
		/* Set options */
		curl_easy_setopt(curl, CURLOPT_URL, url_with_http);
		curl_easy_setopt(curl, CURLOPT_POST, 1L);
		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
		/* Perform request */
		res = curl_easy_perform(curl);
		syslog(LOG_INFO, "----#########--curl request---------_> data is [%d]", res);
		/* Check for errors */
		if (res != CURLE_OK)
		{
			syslog(LOG_ERR, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
			syslog(LOG_INFO, "--@@@@@@@@@@@@@@@@curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
		}
		else
		{
			syslog(LOG_ERR, "curl_ okkkkkkkkkkkkkkkkkkkkkkkkkk\n");
		}
		/* Cleanup */
		curl_slist_free_all(headers);
		curl_easy_cleanup(curl);
	}
	/* Cleanup JSON object */
	json_object_put(json);
	free(url_with_http);
}

static void notify()
{
	/* send a message */
	/* Setup the notification stuff */
	char msg[256], *name = NULL;

	NotifyNotification *n = notify_notification_new(note, "해당프로그램은 Hamonize 관리자로 부터 실행 차단프로그램입니다.", NULL);
	notify_notification_set_urgency(n, NOTIFY_URGENCY_NORMAL);
	notify_notification_set_timeout(n, 3000); // 3 seconds
	notify_notification_show(n, NULL);
	g_object_unref(G_OBJECT(n));

	free(name);
	// sendInfo();
	syslog(LOG_INFO, "notify@@@@@@@@@@@@@@-----------------------execl호출  \n");
}

void wallNotify(const char *pnm)
{
	syslog(LOG_INFO, "wallNotifywallNotifywallNotifywallNotifywallNotifywallNotify@@@@@@@@@@@@@@-----------------------execl호출  \n");
	char command[1024];
	// const char* message = "해당프로그램은 Hamonize 관리자로 부터 실행 차단프로그램입니다.";
	const char *message = " is Block Program(Application) by Admin";
	// sprintf(command, "echo '%s' | iconv -t utf-8 | wall", message);

	sprintf(command, "printf ['%s']'%s' | iconv -t utf-8 | wall ", pnm, message);
	system(command);
	return;
}

/* This function shows how to dump a whole record's text */
static void dump_whole_record(auparse_state_t *au)
{
	syslog(LOG_INFO, "#### Audit Event Show #### %s: %s\n", audit_msg_type_to_name(auparse_get_type(au)), auparse_get_record_text(au));
	printf("\n");
	const char *keyname;
	const char *filename = NULL;
	const char *pid = NULL;
	const char *comm = NULL;
	pid = auparse_find_field(au, "pid");
	comm = auparse_find_field(au, "comm");
	keyname = auparse_find_field(au, "key");
	syslog(LOG_INFO, "####  Check pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", pid, comm, keyname, auparse_interpret_realpath(au));

	// 프로그램 설치 및 삭제 정책 시
	if (keyname && strcmp(keyname, "\"hamonizeUpdt\"") == 0)
	{
		if (strcmp(comm, "\"rm\"") != 0)
		{
			syslog(LOG_INFO, "BLOCK---------------  key : [%s] , comm = [%s]", keyname, comm);
			hamonizeUpdt();
		}
	}

	// 프로그램 차단 정책 시
	if (keyname && strcmp(keyname, "\"hamonizeBlock\"") == 0)
	{
		if (strcmp(comm, "\"rm\"") != 0)
		{
			syslog(LOG_INFO, "BLOCK---------------  key : [%s] , comm = [%s]", keyname, comm);
			hamonizeBlock();
		}
	}

	// Device
	if (keyname && strcmp(keyname, "\"hamonizeDevice\"") == 0)
	{
		if (strcmp(comm, "\"rm\"") != 0)
		{
			syslog(LOG_INFO, "BLOCK---------------  key : [%s] , comm = [%s]", keyname, comm);
			hamonizeDevice();
		}
	}

	// Device Send Log
	if (keyname && strcmp(keyname, "\"hamonizeUssb\"") == 0)
	{
		if (strcmp(comm, "\"rm\"") != 0)
		{
			syslog(LOG_INFO, "BLOCK---------------  key : [%s] , comm = [%s]", keyname, comm);
			hamonizeDeviceSendLog();
		}
	}

	// Ufw
	if (keyname && strcmp(keyname, "\"hamonizeUfw\"") == 0)
	{
		if (strcmp(comm, "\"rm\"") != 0)
		{
			syslog(LOG_INFO, "BLOCK---------------  key : [%s] , comm = [%s]", keyname, comm);
			hamonizeUfw();
		}
	}

	if (keyname && strcmp(keyname, "\"hamonizeBlockRules\"") == 0)
	{
		pid_t pidt = atoi(pid);
		syslog(LOG_INFO, "hamonizeBlockRules----------------- [%d] \n", pidt);
		kill(pidt, SIGKILL);
		notify();
		// wallNotify(comm);
		sendInfo();
	}
}

/* This function shows how to iterate through the fields of a record
 * and print its name and raw value and interpreted value. */
// static void dump_fields_of_record(auparse_state_t *au)
// {
// 	syslog(LOG_INFO," 999000000000000record type %d(%s) has %d fields\n", auparse_get_type(au),
// 		audit_msg_type_to_name(auparse_get_type(au)),
// 		auparse_get_num_fields(au));

// 	printf("line=%d file=%s\n", auparse_get_line_number(au),
// 		auparse_get_filename(au) ? auparse_get_filename(au) : "stdin");

// 	const au_event_t *e = auparse_get_timestamp(au);
// 	if (e == NULL) {
// 		printf("Error getting timestamp - aborting\n");
// 		return;
// 	}
// 	/* Note that e->sec can be treated as time_t data if you want
// 	 * something a little more readable */
// 	printf("event time: %u.%u:%lu, host=%s\n", (unsigned)e->sec,
// 		e->milli, e->serial, e->host ? e->host : "?");
// 		auparse_first_field(au);

// 	do {
// 		printf("field: %s=%s (%s)\n",
// 		auparse_get_field_name(au),
// 		auparse_get_field_str(au),
// 		auparse_interpret_field(au));
// 	} while (auparse_next_field(au) > 0);
// 	printf("\n");
// }

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
		// case AUDIT_AVC:
		// 	dump_fields_of_record(au);
		// 	break;
		case AUDIT_SYSCALL:
			dump_whole_record(au);
			break;
		case AUDIT_USER_LOGIN:
			break;
		case AUDIT_ANOM_ABEND:
			break;
		case AUDIT_MAC_STATUS:
			dump_whole_event(au);
			break;
		default:
			break;
		}
		num++;
	}
}

// rules : -a always,exit -F path=/usr/bin/htop -F perm=xarw  -k hamonizeBlockRules
/**
plugin

active = no
direction = out
path = /etc/hamonize/agentJobs/hamonizeBlock
type = always
args = hmProgramBlock
format = string


compile
gcc -o ./audisp-example audisp-example.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl


*/
