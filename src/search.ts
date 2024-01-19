import { redis, redisVectorStore } from './redis-store' 

async function search() {
  await redis.connect()
  
  const response = await redisVectorStore.similaritySearchWithScore(
    'Qual o conceito de teste?',
    5
  )

  console.log(response)

  await redis.disconnect()
}

search()