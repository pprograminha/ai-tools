'use client'

import { useVideos } from '@/hooks/useVideos'
import { getTranscriptions } from '@/lib/server'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UploadVideos } from './UploadVideos'
import { Button } from './ui/button'
import { ToastAction } from './ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { toast } from './ui/use-toast'
import { env } from '@/app/env'

const defaultTranscriptionPrompt = [
  env.NEXT_PUBLIC_DEFAULT_PROMPT,
].join('\n')

// const defaultSummaryPrompt = [
//   'Você é um programador especialista em Node.js, JavaScript, arquitetura de software e Domain-Driven design.',
//   'Você é professor e está gravando um curso sobre domain-driven design com Node.js.',
//   'Com base na transcrição do vídeo, crie um resumo em primeira pessoa.',
//   'Se possível, inclua exemplos de código com base nos exemplos do texto.',
//   'A transcrição de uma das aulas do curso está contida na mensagem abaixo.',
// ].join('\n')

const formSchema = z.object({
  transcriptionPrompt: z.string(),
})

export type AiToolsSchema = z.infer<typeof formSchema>

export function MainForm() {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptions, setTranscriptions] = useState<Map<string, string>>(new Map())
  const { videos, removeVideo, startAudioConversion } = useVideos()

  const { register, handleSubmit, control, getValues } = useForm<AiToolsSchema>(
    {
      resolver: zodResolver(formSchema),
      defaultValues: {
        transcriptionPrompt: defaultTranscriptionPrompt,
      },
      mode: 'all',
    },
  )

  // useEffect(() => {
  //   getTranscriptions().then((transcriptions) => {
  //     setTranscriptions(transcriptions)
  //   })
  // }, [])

  async function handleGenerate({
    transcriptionPrompt
  }: AiToolsSchema) {
    setIsTranscribing(true)

    const videosId = Array.from(videos.keys())

    try {
      await startAudioConversion(videos)
    } catch {
      toast({
        title: 'Erro ao tentar converter vídeo para aúdio!',
        action: <ToastAction altText='Tente novamente'>Tente novamente</ToastAction>,
        variant: 'destructive'
      })
    }

    try {
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          transcriptionPrompt,
          videosId,
        }),
      })

      if(response.ok === false) {
        throw new Error(JSON.stringify(response))
      }
      // const transcriptions = await getTranscriptions()

      // setTranscriptions(transcriptions)
      
      toast({
        title: 'Sucesso ao transcrever o vídeo',
      })
    } catch (error) {
      toast({
        title: 'Ocorreu um erro ao transcrever o vídeo!',
        description: 'Verifique suas chaves de acesso',
        variant: 'destructive'
      })

      console.log('Video Transcription Failure', error)
    } finally {
      setIsTranscribing(false)
  
      videosId.map(videoId => removeVideo(videoId))
    }
  }

  const downloadTranscription = (blobname: string, transcription: string) => {
    const transcriptionBlob = new Blob([transcription], {
      type: 'plain/text'
    })

    const url = window.URL.createObjectURL(transcriptionBlob);

    const link = document.createElement('a');

    link.href = url;

    link.download = blobname;
    
    link.click();
  }

  return (
    <form onSubmit={handleSubmit(handleGenerate)}>
      <div className='flex gap-2 items-center flex-wrap my-2'>
        {Array.from(transcriptions.entries()).map(([key, transcription]) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button size="icon" onClick={() => downloadTranscription(key, transcription)}>
                    <Download />
                  </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Baixar transcrição: {key}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="transcription_prompt">
          Prompt de transcrição
        </label>
        <textarea
          id="transcription_prompt"
          defaultValue={defaultTranscriptionPrompt}
          spellCheck={false}
          className="min-h-[160px] w-full flex-1 rounded border border-zinc-200 px-4 py-3 leading-relaxed text-zinc-900"
          {...register('transcriptionPrompt')}
        />
        <span className="text-xs text-zinc-500">
          Adicione o contexto dos vídeos contendo palavras-chave sobre o
          conteúdo apresentado.
        </span>

        <UploadVideos isTranscribing={isTranscribing}  />
      </div>
    </form>
  )
}
