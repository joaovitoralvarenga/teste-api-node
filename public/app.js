console.log('🎯 Frontend carregado!')

window.addEventListener('load', function() {
    alert('🎉 Bem-vindo à API Node.js!')
    loadAPIStatus()
})

async function loadAPIStatus() {
    const statusDiv = document.getElementById('status')
    
    try {
        statusDiv.innerHTML = '<p class="loading">🔄 Verificando status da API...</p>'
        
        const response = await fetch('/')
        const data = await response.json()
        
        statusDiv.innerHTML = `
            <h3>✅ API Status: Online</h3>
            <p><strong>Mensagem:</strong> ${data.message}</p>
            <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString('pt-BR')}</p>
            <p><strong>Versão:</strong> ${data.version}</p>
        `
        
        const healthResponse = await fetch('/health')
        const healthData = await healthResponse.json()
        
        statusDiv.innerHTML += `
            <h3>❤️ Health Check</h3>
            <p><strong>Status:</strong> ${healthData.status}</p>
            <p><strong>Uptime:</strong> ${healthData.uptime} segundos</p>
        `
        
    } catch (error) {
        console.error('Erro ao carregar status:', error)
        statusDiv.innerHTML = `
            <div class="error">
                <h3>❌ Erro ao conectar com a API</h3>
                <p>${error.message}</p>
            </div>
        `
    }
}

console.log('✅ JavaScript carregado com sucesso!')