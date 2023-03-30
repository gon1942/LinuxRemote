#include <stdio.h>
#include <curl/curl.h>
#include <json-c/json.h>
#include <time.h>

int main(void)
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
    return 0;
}
