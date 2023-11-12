import { env } from '@/app/env'
import { r2 } from '@/lib/r2'
import { redis } from '@/lib/redis'
import { ListObjectsCommand } from '@aws-sdk/client-s3'
import { Document } from 'langchain/dist/document'
import { S3Loader } from 'langchain/document_loaders/web/s3'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { RedisVectorStore } from 'langchain/vectorstores/redis'
import { NextResponse } from 'next/server'


export async function POST(request: Request) {
    const objects = await r2.send(
        new ListObjectsCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
        }),
      )
    
    const keys = objects.Contents?.map(content => content.Key).filter(k => k) as string[] || []


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

    await RedisVectorStore.fromDocuments(splittedDocuments, new OpenAIEmbeddings({
        openAIApiKey: env.OPENAI_API_KEY,
    }), {
        indexName: 'lesson-embeddings',
        redisClient: redis,
        keyPrefix: 'lessons:'
    })


    await redis.disconnect()

    return NextResponse.json({
        splittedDocuments
    })
}
