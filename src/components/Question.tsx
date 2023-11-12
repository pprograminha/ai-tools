'use client'

import { env } from '@/app/env'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileMinus, Loader2, RefreshCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'


const questionSchema = z.object({
  template: z.string({
    required_error: 'Obrigatório'
  }).min(2),
  question: z.string({
    required_error: 'Obrigatório'
  }).min(2),
})

type SourceDocument = {
  pageContent: string
}
type QuestionResponse = {
  document: {
    text: string
    sourceDocuments: SourceDocument[]
  }
}

export type QuestionSchema = z.infer<typeof questionSchema>

export function Question() {
  const [isAnswing, setIsAnswing] = useState(false)
  const [answer, setAnswer] = useState('')
  const [documents, setDocuments] = useState<SourceDocument[]>([])
  const form = useForm<QuestionSchema>(
    {
      resolver: zodResolver(questionSchema),
      defaultValues: {
        template: env.NEXT_PUBLIC_DEFAULT_QUESTION_PROMPT
      },
      mode: 'onSubmit',
    },
  )

  async function handleQuestion({
    template,
    question
  }: QuestionSchema) {
    setIsAnswing(true)

    try {
      const response = await fetch('/api/ai/question', {
        method: 'POST',
        body: JSON.stringify({
          template,
          question,
        }),
      })

      if(response.ok === false) {
        throw new Error(JSON.stringify(response))
      }

      const { document: { text, sourceDocuments } } = await response.json() as QuestionResponse

      setAnswer(text)
      setDocuments(sourceDocuments)
    } catch  {
      toast({
        title: 'Ocorreu um erro ao tentar responder',
        description: 'Verifique suas chaves de acesso da Open AI se necessário',
        variant: 'destructive'
      })
    } finally {
      setIsAnswing(false)
    }
  }

  const resetForm = () => {
    form.reset()
    form.setValue('question', '')
    setDocuments([])
    setAnswer('')
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleQuestion)} >
        <div className='flex items-center justify-between mb-3'>
          
          {documents.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon">
                  <FileMinus className='w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='max-h-[800px] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>
                    Transcrições
                  </DialogTitle>

                </DialogHeader>
                {documents.map((document ,index) => (
                  <>
                    <h2 className='mt-2'><Badge>{index + 1}</Badge> - Transcrição</h2>
                  <ScrollArea key={index} className='max-h-[200px] border-2 rounded-lg'>
                    <div className='p-5'>
                      {document.pageContent}
                    </div>
                  </ScrollArea>
                  </>
                ))}

              </DialogContent>
            </Dialog>

          )}

          <Button size="icon" className='ml-auto'  onClick={resetForm}>
            <RefreshCcw className='w-4' />
          </Button>

        </div>
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insira sua pergunta:</FormLabel>
                <FormControl>
                <Input placeholder='Do que se trata as transcrições?' {...field} />

                </FormControl>
                <FormDescription>Elabore perguntas relacionadas as transcrições</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="template"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template:</FormLabel>
                <FormControl>
                  <Textarea   {...field}/>
                </FormControl>
                <FormDescription>Adicione contexto para a AI responder as suas perguntas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
        <div className='flex flex-col gap-2'>
          {answer ? (
            <div className='flex gap-2 items-start'>
              <Avatar className='border border-pink-600'>
                <AvatarFallback>
                  AI
                </AvatarFallback>
              </Avatar>
              <p className='text-sm my-auto'>{answer}</p>
            </div>
          ) : (
            <>
              <Separator />
              <span className="text-xs text-zinc-500">
                Não há nenhuma resposta ainda
              </span>
            </>
          )}
        </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={isAnswing}
          >
            {isAnswing ? <Loader2 className='w-4 animate-spin' /> : <Search className="h-4 w-4 text-white" />}
            
          </Button>
        </div>
      </form>
    </Form>
  )
}
