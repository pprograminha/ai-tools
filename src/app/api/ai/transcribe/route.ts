import { env } from '@/app/env'
import { r2 } from '@/lib/r2'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import axios, { AxiosResponse } from 'axios'
import chalk from 'chalk'
import FormData from 'form-data'
import { NextResponse } from 'next/server'

type RequestData = {
  videoId?: string
  videosId?: string[]
  transcriptionPrompt: string
}
export async function POST(request: Request) {
  const data = await request.json()

  const { videoId, videosId = [], transcriptionPrompt } = data as RequestData

  if (videoId) {
    videosId.push(videoId)
  }

  try {
    const transcriptions = new Map<string, string>()
    
    for (const videoId of videosId) {
      console.log(chalk.yellow(`Retrieving audio from R2: ${videoId}`))

      const videoAudio = await r2.send(
        new GetObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: `${videoId}.mp3`,
        }),
      )


      const formData = new FormData()

      formData.append('file', videoAudio.Body, {
        contentType: videoAudio.ContentType,
        knownLength: videoAudio.ContentLength,
        filename: `${videoId}.mp3`,
      })

      formData.append('model', 'whisper-1')

      if(transcriptionPrompt) {
        formData.append('prompt', transcriptionPrompt)
      }
      
      formData.append('language', 'pt')

      console.log(chalk.yellow(`Generating Transcription: ${videoId}`))

      let response: AxiosResponse<{ text: string }>

      try {
        response = await axios.post(
          'https://api.openai.com/v1/audio/transcriptions',
          formData,
          {
            headers: {
              Authorization: `Bearer ${env.OPENAI_API_KEY}`,
              ...formData.getHeaders(),
            },
          },
        )

      } catch (error) {
        return NextResponse.json({
          error: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, {
          status: 400
        })
      }

      console.log(chalk.yellow(`Deleting audio: ${videoId}`))

      await r2.send(
        new DeleteObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: `${videoId}.mp3`,
        }),

      )

      const transcriptionKey = `${videoId}.txt`

      console.log(chalk.yellow(`Uploading Transcription: ${transcriptionKey}`))

      await r2.send(
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: transcriptionKey,
          Body: response.data.text,
        }),
      )

      const { text } = response.data


      transcriptions.set(videoId, text)

      console.log(chalk.green(`Transcription succeeded!`))
    }

    return NextResponse.json({ ok: 1 })
  } catch (error) {
    console.log('error', error)

    return NextResponse.json({
      error: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }, {
      status: 500
    })
  }
}
