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
    Voce responde perguntas sobre programacao.
    O usuario esta assistindo um curso com varias aulas.
    Use o conteudo das transcricoes das aulas abaixo para responde
    a pergunta do usuario.
    Se a resposta nao for encontrada nas transcricoes, responda que
    voce nao sabe, nao tente inventar uma resposta.
    Se possivel, inclua exemplos de codigo. 
    Transcricoes: {context}
    Pergunta: {question}
  `.trim(),
  inputVariables: ['context', 'question']
})

const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(3), {
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