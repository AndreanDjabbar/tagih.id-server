import app from './app.js'
import { logger } from './config/logger.js'

app.get('/', async function handler (request, reply) {
    return { hello: 'world' }
})

try {
    logger.info(`SERVER IS RUNNING ON ${process.env.NODE_ENV} ENVIRONMENT`)
    await app.listen({ 
        port: process.env.HOST_PORT, 
        host: process.env.HOST,
    })
} catch (err) {
    logger.error(err)
    process.exit(1)
}