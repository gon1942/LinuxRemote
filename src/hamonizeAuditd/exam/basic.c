#include <stdio.h>
#include <stdlib.h>
 
int main()
{
    int ret = system("/home/gonpc/jobs/2023/blockchain/demo-server/agent.sh");
 
    printf("ret : %d \n", ret);
 
    return 0;
}