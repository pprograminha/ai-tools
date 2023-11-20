import { env } from '@/app/env'
import { r2 } from '@/lib/r2'
import { loader } from '@/server/loader'
import { ListObjectsCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { z } from 'zod'


export async function POST(request: Request) {
    const { keys: $keys } = await request.json()

    const parsedKeys = z.array(z.string()).optional().default([]).parse($keys)

    let keys = parsedKeys

    if(parsedKeys.length === 0) {
        const objects = await r2.send(
            new ListObjectsCommand({
              Bucket: env.CLOUDFLARE_BUCKET_NAME,
            }),
        )
        
        keys = objects.Contents?.map(content => content.Key).filter(k => k) as string[] || []
    }

    const splittedDocuments = await loader(keys)

    return NextResponse.json({
        splittedDocuments
    })
}
