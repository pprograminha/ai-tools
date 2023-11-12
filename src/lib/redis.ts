import { env } from "@/app/env";
import { createClient } from "redis";
import { RedisVectorStore } from 'langchain/vectorstores/redis'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export const redis = createClient({
    url: env.REDIS_DATABASE_URL
})

export const redisVectorStore = new RedisVectorStore(
    new OpenAIEmbeddings({
        openAIApiKey: env.OPENAI_API_KEY,
    }), 
    {
        indexName: 'lesson-embeddings',
        redisClient: redis,
        keyPrefix: 'lessons:'
    }
)
