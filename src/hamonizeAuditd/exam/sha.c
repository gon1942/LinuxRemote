#include <openssl/sha.h>
#include <stdio.h>
#include <stdlib.h>

// int main() {
//     unsigned char digest[SHA256_DIGEST_LENGTH];
//     const char* string = "hello world";

//     SHA256_CTX ctx;
//     SHA256_Init(&ctx);
//     SHA256_Update(&ctx, string, strlen(string));
//     SHA256_Final(digest, &ctx);

//     char mdString[SHA256_DIGEST_LENGTH*2+1];
//     for (int i = 0; i < SHA256_DIGEST_LENGTH; i++)
//         sprintf(&mdString[i*2], "%02x", (unsigned int)digest[i]);

//     printf("SHA256 digest: %s\n", mdString);


//     return 0;
// }


#include <openssl/evp.h>

// OpenSSL engine implementation
#define OPENSSL_ENGINE NULL

/**
 * Returns the SHA256 value of the input string
 *
 * @param string input string for which the hash to be calculated
 * @returns string (32 bytes) - SHA256 hash
 */
static const unsigned char *getShaSum(const unsigned char *string)
{
    EVP_MD_CTX *mdCtx = EVP_MD_CTX_new();
    unsigned char mdVal[EVP_MAX_MD_SIZE], *md;
    unsigned int mdLen, i;

    if (!EVP_DigestInit_ex(mdCtx, EVP_sha256(), OPENSSL_ENGINE))
    {
        printf("Message digest initialization failed.\n");
        EVP_MD_CTX_free(mdCtx);
        exit(EXIT_FAILURE);
    }

    // Hashes cnt bytes of data at d into the digest context mdCtx
    if (!EVP_DigestUpdate(mdCtx, string, strlen((const char *)string)))
    {
        printf("Message digest update failed.\n");
        EVP_MD_CTX_free(mdCtx);
        exit(EXIT_FAILURE);
    }

    if (!EVP_DigestFinal_ex(mdCtx, mdVal, &mdLen))
    {
        printf("Message digest finalization failed.\n");
        EVP_MD_CTX_free(mdCtx);
        exit(EXIT_FAILURE);
    }
    EVP_MD_CTX_free(mdCtx);

    printf("DEBUG: Digest is: ");
    for (i = 0; i < mdLen; i++)
        printf("%02x", mdVal[i]);
    printf("\n");

    md = mdVal;

    return md;
}

int main()
{
    // To calculate the hash of a file, read it and pass the pointer
    // getShaSum("Hello world");
    getShaSum("pool/main/a/albert/albert_0.17.2-0hamonikr4_amd64.deb");

    exit(EXIT_SUCCESS);
}