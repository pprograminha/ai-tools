import { env } from '@/app/env'
import { createFFmpeg } from '@ffmpeg/ffmpeg'

export const ffmpeg = createFFmpeg({
  log: false,
  corePath: `${env.NEXT_PUBLIC_APP_URL}/ffmpeg-dist/ffmpeg-core.js`,
})
