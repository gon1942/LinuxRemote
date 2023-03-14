#include <stdio.h>
#include <auparse.h>

int main(int argc, char *argv[])
{
        auparse_state_t *au;
        printf("=============You need to be root\n");

        if (argc == 2)
                au = auparse_init(AUSOURCE_FILE, argv[1]);
        else
                au = auparse_init(AUSOURCE_LOGS, NULL);
        if (au == NULL)
        {
                printf("You need to be root\n");
                return 1;
        }

        
        auparse_first_record(au);
        do
        {
                do
                {
                        char buf[32];
                        const char *type = auparse_get_type_name(au);
                        if (type == NULL)
                        {
                                snprintf(buf, sizeof(buf), "%d",  auparse_get_type(au));
                                type = buf;
                        }
                        printf("Record type: %s - ", type);
                        do
                        {
                                const char *name = auparse_get_field_name(au);
                                printf("%s,", name);
                        } while (auparse_next_field(au) > 0);
                        printf("\b \n");
                } while (auparse_next_record(au) > 0);
        } while (auparse_next_event(au) > 0);

        auparse_destroy(au);

        return 0;
}
