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
#include <stdlib.h>

#include "unistd.h"
#include "fcntl.h"

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

void Eliminate(char *str, char ch)
{
        for (; *str != '\0'; str++) // 종료 문자를 만날 때까지 반복
        {
                if (*str == ch) // ch와 같은 문자일 때
                {
                        strcpy(str, str + 1);
                        str--;
                }
        }
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
        char *p = d;
        while (*d)
                d++;
        while (*s)
                *d++ = *s++;
        *d = '\0';
        return p;
}

char *test(const char *d)
{
        // syslog(LOG_INFO, "----------------------------> d : [%s] \n", d);

        // 파일 기술자
        FILE *fdr;

        // 단어수
        unsigned int wordCount = 0;

        // 라인 수
        unsigned int lineNumber = 0;

        // 찾을 문자열
        const char *searchword;

        // 파일에서 읽을 바이트
        char buf[1024];
        char *readByte;

        char *fileName;

        // 파일 이름
        fileName = "/home/gonpc/jobs/2023/blockchain/data.hm";
        // syslog(LOG_INFO, "----------------------------> fileName : [%s] \n", fileName);
        // 찾을 문자열
        searchword = d;

        syslog(LOG_INFO, "test]--###############3----> searchword : [%s] \n", searchword);

        // int resultNum = access(fileName, F_OK);
        // syslog(LOG_INFO, "---------------------------->접근 체크 결과 : %d\n", resultNum);

        // if ((fdr = fopen(fileName, "r")) == NULL) //읽기 모드로 해당 파일 열기
        // {
        // 	syslog(LOG_INFO, "---------------------------파일 %s를 열 수 없습니다.\n", fileName); //파일 관련 에러 출력
        // 	return 0;
        // }
        // while (fgets(buf, 256, fdr)) // 파일을 읽어서 256 길이만큼 버퍼에 담음
        // {
        //         lineNumber++; // 한 줄씩 읽음

        //         if (strstr(buf, searchword)) // 버퍼가 word에 포함되어 있는지를 대비해 봄
        //         {
        //                 syslog(LOG_INFO, "---------------------------->%d번째 줄 : 단어 %s이(가) 발견되었습니다.\n", lineNumber, searchword);
        //         }
        // }

        // 파일 기술자 열기
        fdr = fopen(fileName, "r");

        if (fdr == NULL)
        {
                syslog(LOG_INFO, "test]---------------------------->파일 열기 실패\n");
                exit(0);
        }
        // // 파일의 끝이면 1, 끝이 아니면 0을 반환
        while (feof(fdr) == 0)
        {

                lineNumber += 1;
                // 한줄읽기
                readByte = fgets(buf, sizeof(buf), fdr);
                // 복사를 위한 임시 문자열
                char *tempStr = malloc(sizeof(char) * 1024);
                // strcpy(tempStr, readByte);   // 읽은 한줄을 복사 =>  tempStr
                char *ptr = strtok(buf, ":"); // 읽은 한 줄을 " " 기준으로 하나씩 자르기
                syslog(LOG_INFO, "test]----------------------------> file line : [%s] \n", ptr);
                //---------------------------여기서부터
                // char *searchPtr = strchr(ptr, "t");
                // syslog(LOG_INFO, "-test]---#####3 : %s \n", searchPtr);

                // while (ptr != NULL)
                // {
                //         syslog(LOG_INFO, "---------------------------->자른 문자열 출력 : %s \n", ptr);
                //         int ret = strcmp(searchword, ptr);
                //         //         // 두 문자열이 같다.
                //         if (ret == 0)
                //         {
                //                 //                 // 찾은 단어수 + 1
                //                 wordCount += 1;
                //                 syslog(LOG_INFO, "---------------------------->%d line : %s \n", lineNumber, tempStr);
                //         }
                //         ptr = strtok(NULL, " "); // 다음 문자열을 잘라서 포인터를 반환
                // }
                free(tempStr);
        }
        syslog(LOG_INFO, "test]->>-->** 파일 %s 에서 찾은 %s 단어 수 총 %d 개\n", fileName, searchword, wordCount);
}


char *test2(const char *d)
{
        const char *data = d;
        syslog(LOG_INFO, "test2] ----------------------------> d : [%s], data: [%s], lens:[%ld] \n", d, data, strlen(d));

        *((char *)(data)) = ' ';
        *((char *)(data + (strlen(d) - 1))) = ' ';

        // int i = 0, c = 0; // 쌍따옴표 제거
        // for (; i < strlen(data); i++)
        // {
        //         // *((char *)(data + (strlen(d) - i))) = ' ';
        // }
        int index = 0;
        while (data[index] != '\0')
        {
                // syslog(LOG_INFO, "-------------------%c", data[index]);
                index++;
        }

        // data = rtrim(d);
        syslog(LOG_INFO, "test2] -strlen(data------------------%s, %ld\n", data, strlen(data));

        // int i,j;
        char *str = (char *)malloc(sizeof(data));
        int i, k = 0;

        for (i = 0; i < strlen(data); i++)
                if (data[i] != ' ')
                        str[k++] = data[i];

        str[k] = '\0';
        syslog(LOG_INFO, "test2] -file name controller Result ########################3-%s\n", str);
        test(str);
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

        /* Initialize the auparse library */
        au = auparse_init(AUSOURCE_FILE_POINTER, stdin);

        while (auparse_next_event(au) > 0)
        {
                pid = auparse_find_field(au, "pid");
                comm = auparse_find_field(au, "comm");

                do
                {
                        filename = auparse_find_field(au, "name");
                        if (filename && strcmp(filename, "(null)"))
                        {
                                // syslog(LOG_INFO, "----------------------------> filename : [%s] \n", filename);
                                syslog(LOG_INFO, "----------------------------> Check filename : [%s], pid :[%s], comm: [%s] \n", filename, pid, comm);
                                syslog(LOG_INFO, "----------------------------> Check real filename : [%s] \n", auparse_interpret_realpath(au));
                                
                                // test2(filename);
                        }

                } while (auparse_next_record(au) > 0);
        };

        closelog();
        return 0;
}