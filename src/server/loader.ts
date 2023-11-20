import { env } from "@/app/env"
import { redis } from "@/lib/redis"
import chalk from "chalk"
import { Document } from "langchain/dist/document"
import { S3Loader } from "langchain/document_loaders/web/s3"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { TokenTextSplitter } from "langchain/text_splitter"
import { RedisVectorStore } from "langchain/vectorstores/redis"

export const loader = async (key: string | string[]) => {
    const keys: string[] = Array.isArray(key) ? key : [key]

    if(keys.length === 0) {
        return []
    }
    
    const documents: Document<Record<string, string>>[] = []

    for (const key of keys) {
        const loader = new S3Loader({
            unstructuredAPIURL: `${env.NEXT_PUBLIC_APP_URL}/api/ai/loader/text`,
            unstructuredAPIKey: '',

            bucket: env.CLOUDFLARE_BUCKET_NAME,
            key,
            
            s3Config: {
                region: 'auto',
                endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                  accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
                  secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
                },
            }
            
        })
        
        const docs = await loader.load()

        documents.push(docs[0])
    }

    const splitter = new TokenTextSplitter({
        encodingName: 'cl100k_base',
        chunkSize: 600,
        chunkOverlap: 0,
    })

    const splittedDocuments = await splitter.splitDocuments(documents)

    redis.connect()

    console.log(chalk.yellow('Starting storage in Redis'))

    await RedisVectorStore.fromDocuments(splittedDocuments, new OpenAIEmbeddings({
        openAIApiKey: env.OPENAI_API_KEY,
    }), {
        indexName: 'lesson-embeddings',
        redisClient: redis,
        keyPrefix: 'lessons:'
    })

    console.log(chalk.yellow('Embeddings successfully stored in Redis'))


    await redis.disconnect()


    return splittedDocuments
}