require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir arquivos estáticos da pasta public
app.use('/app', express.static(path.join(__dirname, '/public')))

// ✅ ROTA PRINCIPAL - Resolver o "CANNOT GET /"
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API Node.js está funcionando!',
        timestamp: new Date().toISOString(),
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
        uptime: process.uptime()
    })
})

// Carregar rotas da API (se existir)
try {
    const apiRouter = require('./api/routes/api_routes')
    app.use('/api', apiRouter)
    console.log('✅ API Router carregado')
} catch (error) {
    console.log('⚠️ API Router não encontrado:', error.message)
}

// Rota catch-all para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    })
})

// Configurar porta
const port = process.env.PORT || 3000

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurada ✅' : 'Não configurada ❌'}`)
    console.log(`🔐 SECRET_KEY: ${process.env.SECRET_KEY ? 'Configurada ✅' : 'Não configurada ❌'}`)
})

// Tratamento de erros
process.on('uncaughtException', (err) => {
    console.error('Erro não capturado:', err)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    console.error('Promise rejeitada:', err)
    process.exit(1)
})