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
const char *note = "Hamonize  Alert";

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

int getLength(char str[])
{
    int len = 0;
    for (int i = 0; str[i] != '\0'; i++)
        len++;
    return len;
}

char *concat(char strto[], const char strfrom[])
{
    int tlen = getLength(strto);
    int i = 0;
    for (i = 0; strfrom[i] != '\0'; i++)
        strto[tlen + i] = strfrom[i];
    strto[tlen + i] = '\0';
    return strto;
}
char *my_strcat(char *d, const char *s)
{

    syslog(LOG_INFO, "te***************111111111111111**********d : [%s][%s] \n", d, s);
    char *p = d;
    while (*d)
        d++;
    while (*s)
        *d++ = *s++;
    *d = '\0';
    syslog(LOG_INFO, "te************222222222222222*************d : [%s] \n", p);

    return p;
}

char *sendInfo()
{
    CURL *curl;
    CURLcode res;
    struct curl_slist *headers = NULL;
    char url[] = "http://61.32.208.27:8083/hmsvc/prcssKill";
    char *data;
    json_object *json, *events, *event;

    time_t now = time(NULL);
    struct tm *t = localtime(&now);

    char str_time[20];
    strftime(str_time, sizeof(str_time), "%Y-%m-%d %H:%M:%S", t);

    printf("현재 한국 날짜와 시간: %s\n", str_time);

    /* Create JSON object */
    json = json_object_new_object();
    events = json_object_new_array();
    json_object_object_add(json, "events", events);
    event = json_object_new_object();
    json_object_object_add(event, "datetime", json_object_new_string(str_time));
    json_object_object_add(event, "uuid", json_object_new_string("44fd419f6c54b56ad461d4f386d7373"));
    json_object_object_add(event, "domain", json_object_new_string("orgtest"));
    json_object_object_add(event, "name", json_object_new_string("htop"));
    json_object_array_add(events, event);
    data = (char *)json_object_to_json_string(json);

    /* Initialize curl */
    curl = curl_easy_init();
    if (curl)
    {
        /* Set headers */
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, "Accept: application/json");
        /* Set options */
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        /* Perform request */
        res = curl_easy_perform(curl);
        /* Check for errors */
        if (res != CURLE_OK)
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        /* Cleanup */
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }
    /* Cleanup JSON object */
    json_object_put(json);
}
char *test3(const char *d)
{

    const char *data = d;
    syslog(LOG_INFO, "test2] ----------------------------> d : [%s], data: [%s], lens:[%ld] \n", d, data, strlen(d));

    // *((char *)(data)) = ' ';
    // *((char *)(data + (strlen(d) - 1))) = ' ';

    // int i,j;
    char *str = (char *)malloc(sizeof(data));
    int i, k = 0;

    for (i = 0; i < strlen(data); i++)
        if (data[i] != ' ')
            str[k++] = data[i];

    str[k] = '\0';

    /* send a message */
    /* Setup the notification stuff */
    char msg[256], *name = NULL;

    NotifyNotification *n = notify_notification_new(note, "해당프로그램은 Hamonize 관리자로 부터 실행 차단프로그램입니다.", NULL);
    notify_notification_set_urgency(n, NOTIFY_URGENCY_NORMAL);
    notify_notification_set_timeout(n, 3000); // 3 seconds
    notify_notification_show(n, NULL);
    g_object_unref(G_OBJECT(n));

    free(name);

    syslog(LOG_INFO, "test@@@@@@@@@@@@@@-----------------------execl호출 %s \n", data);
    // execl("/bin/sudo", "sudo", "kill", "-9", data, NULL);

    // kill 함수를 사용하여 프로세스를 종료
    kill(atoi(data), SIGKILL);

    sendInfo();
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

    notify_init(note);
    snprintf(bus, sizeof(bus), "unix:path=/run/user/%d/bus", MY_ACCOUNT);
    setenv("DBUS_SESSION_BUS_ADDRESS", bus, 1);
    if (setresuid(MY_ACCOUNT, MY_ACCOUNT, MY_ACCOUNT))
    {
        syslog(LOG_INFO, "setresuid failed");
        return 1;
    }

    while (auparse_next_event(au) > 0)
    {
        pid = auparse_find_field(au, "pid");
        comm = auparse_find_field(au, "comm");
        keyname = auparse_find_field(au, "key");

        if (keyname && strcmp(keyname, "\"hamonizeBlock\"") == 0)
        {

            // do
            // {
            filename = auparse_find_field(au, "name");
            if (filename && strcmp(filename, "(null)"))
            {
                // syslog(LOG_INFO, "----------------------------> Check filename : [%s], pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", filename, pid, comm, keyname, auparse_interpret_realpath(au));
                syslog(LOG_INFO, "-----------------> Check pid :[%s], comm: [%s] : keyname [%s], realpath : [%s] \n", pid, comm, keyname, auparse_interpret_realpath(au));
                test3(pid);
            }

            // } while (auparse_next_record(au) > 0);
        }
    };

    closelog();
    return 0;
}