import { redis, redisVectorStore } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    redis.connect()
    
    const documents = await redisVectorStore.similaritySearchWithScore(
        'O que é pseudocódigo?',
        5
    )

    await redis.disconnect()

    return NextResponse.json({
        documents
    })
}
