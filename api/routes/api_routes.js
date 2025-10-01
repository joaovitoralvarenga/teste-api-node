const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
let apiRouter = express.Router()  // ← EXPRESS ROUTER PARA ORGANIZAR ROTAS

// ... resto do código permanece igual ...

const endpoint = '/'

// Configuração do Knex
const knex = require('knex')({
    client: 'pg',
    debug: false,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

// Middlewares de autenticação
let checkToken = (req, res, next) => {
    let authToken = req.headers["authorization"]
    if (!authToken) {
        res.status(401).json({ message: 'Token de acesso requerida' })
        return
    }
    
    let token = authToken.split(' ')[1]
    req.token = token
    
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
        if (err) {
            res.status(401).json({ message: 'Acesso negado'})
            return
        }
        req.usuarioId = decodeToken.id
        next()
    })
}

let isAdmin = (req, res, next) => {
    knex.select('*').from('usuario').where({ id: req.usuarioId })
    .then((usuarios) => {
        if (usuarios.length) {
            let usuario = usuarios[0]
            let roles = usuario.roles.split(';')
            let adminRole = roles.find(i => i === 'ADMIN')
            if (adminRole === 'ADMIN') {
                next()
                return
            }
        }
        res.status(403).json({ message: 'Role de ADMIN requerida' })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao verificar roles de usuário - ' + err.message 
        })
    })
}

// === ROTAS DE SEGURANÇA ===

// Registro de usuário
apiRouter.post(endpoint + 'seguranca/register', (req, res) => {
    knex('usuario')
    .insert({
        nome: req.body.nome,
        login: req.body.login,
        senha: bcrypt.hashSync(req.body.senha, 8),
        email: req.body.email
    }, ['id'])
    .then((result) => {
        let usuario = result[0]
        res.status(200).json({"id": usuario.id })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao registrar usuario - ' + err.message 
        })
    })
})

// Login
apiRouter.post(endpoint + 'seguranca/login', (req, res) => {
    knex.select('*').from('usuario').where({ login: req.body.login })
    .then(usuarios => {
        if(usuarios.length){
            let usuario = usuarios[0]
            let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha)
            if (checkSenha) {
                var tokenJWT = jwt.sign({ id: usuario.id },
                    process.env.SECRET_KEY, {
                        expiresIn: 3600
                    })
                res.status(200).json({
                    id: usuario.id,
                    login: usuario.login,
                    nome: usuario.nome,
                    roles: usuario.roles,
                    token: tokenJWT
                })
                return
            }
        }
        res.status(401).json({ message: 'Login ou senha incorretos' })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao verificar login - ' + err.message 
        })
    })
})

// === ROTAS DE PRODUTOS ===

// Listar produtos (USER)
apiRouter.get(endpoint + 'produtos', checkToken, (req, res) => {
    knex.select('*').from('produto')
    .then(produtos => res.status(200).json(produtos))
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao recuperar produtos - ' + err.message 
        })
    })
})


apiRouter.get(endpoint + 'produtos/:id', checkToken, (req, res) => {
    knex.select('*').from('produto').where({ id: req.params.id })
    .then(produtos => {
        if (produtos.length > 0) {
            res.status(200).json(produtos[0])
        } else {
            res.status(404).json({ message: 'Produto não encontrado' })
        }
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao recuperar produto - ' + err.message 
        })
    })
})


apiRouter.post(endpoint + 'produtos', checkToken, isAdmin, (req, res) => {
    knex('produto')
    .insert({
        descricao: req.body.descricao,
        valor: req.body.valor,
        marca: req.body.marca
    }, ['id'])
    .then(result => {
        let produto = result[0]
        res.status(201).json({ id: produto.id })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao criar produto - ' + err.message 
        })
    })
})

// Atualizar produto (ADMIN)
apiRouter.put(endpoint + 'produtos/:id', checkToken, isAdmin, (req, res) => {
    knex('produto')
    .where({ id: req.params.id })
    .update({
        descricao: req.body.descricao,
        valor: req.body.valor,
        marca: req.body.marca
    })
    .then(() => {
        res.status(200).json({ message: 'Produto atualizado com sucesso' })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao atualizar produto - ' + err.message 
        })
    })
})

// Deletar produto (ADMIN)
apiRouter.delete(endpoint + 'produtos/:id', checkToken, isAdmin, (req, res) => {
    knex('produto')
    .where({ id: req.params.id })
    .del()
    .then(() => {
        res.status(200).json({ message: 'Produto deletado com sucesso' })
    })
    .catch(err => {
        res.status(500).json({
            message: 'Erro ao deletar produto - ' + err.message 
        })
    })
})

module.exports = apiRouter