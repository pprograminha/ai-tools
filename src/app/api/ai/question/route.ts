import { redis, redisVectorStore } from '@/lib/redis'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { PromptTemplate } from 'langchain/prompts'
import { NextResponse } from 'next/server'
import { env } from '@/app/env'
import { z } from 'zod'
import chalk from 'chalk'

export async function POST(request: Request) {
    const { question, template } = await request.json()

    z.string().min(2).parse(question)
    z.string().min(2).refine(string => string.includes('{context}') && string.includes('{question}')).parse(template)

    const openAiChat = new ChatOpenAI({
        openAIApiKey: env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.4,
    })

    const prompt = new PromptTemplate({
        template: template.trim(),
        inputVariables: ['context', 'question']
    })

    console.log(chalk.yellow(`Connecting Redis DB`))
    await redis.connect()
    console.log(chalk.yellow(`Connected Redis DB`))
    
    const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(), {
        prompt,
        returnSourceDocuments: true,
    })
    
    console.log(chalk.yellow(`Calling chain`))
    const response = await chain.call({
        query: question
    })
    console.log(chalk.yellow(`Called chain`))

    console.log(chalk.yellow(`Disconnecting Redis DB`))
    await redis.disconnect()
    console.log(chalk.yellow(`Disconnected Redis DB`))

    return NextResponse.json({
        document: response
    })
}
