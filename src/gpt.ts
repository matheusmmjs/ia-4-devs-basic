import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { PromptTemplate } from 'langchain/prompts'
import { redis, redisVectorStore } from './redis-store'

const openAiChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.3,
}) 

const prompt = new PromptTemplate({
  template: `
    Use o conteudo abaixo para responder a pergunta do usuario.
    Se a resposta nao tiver no conteudo, responda que voce nao sabe, nao tente inventar uma resposta!
    Se possivel, inclua exemplos de codigo. 
    
    Conteudo: 
    {context}
    
    Pergunta: 
    {question}
  `.trim(),
  inputVariables: ['context', 'question']
})

const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(2), {
  prompt,
  // returnSourceDocuments: true,
  // verbose: true
})

async function main() {
  await redis.connect()

  const response = await chain.call({
    query: 'Me explique o conceito de teste?'
  })

  console.log(response)
  
  await redis.disconnect()
}

main()