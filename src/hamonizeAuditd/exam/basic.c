#include <stdio.h>
#include <stdlib.h>
 
int main()
{
    int ret = system("/usr/local/hamonize-connect/hamonizeCtl --updt");
    WEXITSTATUS(ret);
    printf("ret : %d \n", ret);
 
    return 0;
}