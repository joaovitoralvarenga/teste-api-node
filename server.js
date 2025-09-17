require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/app', express.static(path.join(__dirname, '/public')))

const apiRouter = require('./api/routes/api_routes')
app.use('/api', apiRouter)

// ✅ CORREÇÃO: Use a porta do Railway ou 3000 como fallback
const port = process.env.PORT || 3000

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`)
})