require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/app', express.static(path.join(__dirname, '/public')))


app.get('/', (req, res) => {
    res.json({
        message: '🚀 API Node.js está funcionando!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            frontend: '/app/',
            login: '/api/seguranca/login',
            produtos: '/api/produtos',
            health: '/health'
        }
    })
})

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage()
    })
})

// Carregar rotas da API (se existir)
try {
    const apiRouter = require('./api/routes/api_routes')
    app.use('/api', apiRouter)
    console.log('✅ API Router carregado')
} catch (error) {
    console.log('⚠️ API Router não encontrado - executando sem API completa')
    
    // Rota temporária de teste para API
    app.get('/api/test', (req, res) => {
        res.json({ 
            message: 'API Test funcionando!', 
            timestamp: new Date().toISOString() 
        })
    })
}

// Configurar porta
const port = process.env.PORT || 3000

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`📍 URL: http://localhost:${port}`)
    
    // Debug das variáveis de ambiente
    console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurada ✅' : 'Não configurada ❌'}`)
    console.log(`🔐 SECRET_KEY: ${process.env.SECRET_KEY ? 'Configurada ✅' : 'Não configurada ❌'}`)
    
    console.log('✅ Servidor iniciado com sucesso!')
})

// Tratamento básico de erros
process.on('uncaughtException', (err) => {
    console.error('❌ Erro não capturado:', err.message)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    console.error('❌ Promise rejeitada:', err.message)
    process.exit(1)
})