'use server'

import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3"
import { r2 } from "./r2"
import { cache } from "react"
import { env } from "@/app/env"

export const getTranscriptions = cache(async () => {
  const objects = await r2.send(
    new ListObjectsCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
    }),
  )

  const keys = objects.Contents?.map(content => content.Key).filter(k => k) as string[] || []
      
  const transcriptions: Map<string, string> = new Map()
  
  for (const Key of keys) {
    const transcriptionObject = await r2.send(
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET_NAME,
        Key
      }),
    )
    const transcriptionString = await transcriptionObject.Body?.transformToString()

    if(transcriptionString) {
      transcriptions.set(Key, transcriptionString)
    }
  }

  return transcriptions
})