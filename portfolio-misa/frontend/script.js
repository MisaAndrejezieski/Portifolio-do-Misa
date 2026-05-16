// ===== CONFIGURAÇÃO =====
const API_URL = 'https://misa-backend.onrender.com'; // Será sua URL do Render

// ===== MODAL DE ORÇAMENTO =====
const modal = document.getElementById('modalOrcamento');
const btnOrcamento = document.getElementById('btn-abrir-orcamento');
const spanFechar = document.querySelector('.fechar-modal');

if (btnOrcamento) {
    btnOrcamento.addEventListener('click', () => {
        modal.style.display = 'block';
    });
}

if (spanFechar) {
    spanFechar.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Cálculo de orçamento via API
document.getElementById('btnCalcular')?.addEventListener('click', async () => {
    const tipo = document.getElementById('tipoServico').value;
    const complexidade = document.getElementById('complexidade').value;
    
    const resultadoDiv = document.getElementById('resultadoOrcamento');
    resultadoDiv.innerHTML = '⏳ Calculando...';
    
    try {
        const response = await axios.post(`${API_URL}/api/orcamento`, {
            tipo_servico: tipo,
            complexidade: complexidade
        });
        
        const dados = response.data;
        resultadoDiv.innerHTML = `
            <strong>💰 Valor estimado:</strong> ${dados.valor_estimado}<br>
            <strong>⏱️ Prazo médio:</strong> ${dados.prazo_dias} dias úteis<br>
            <small>⚠️ Valor sujeito a ajustes após análise detalhada.</small>
            <button id="btnSolicitarOrcamento" class="btn-cta">📞 Quero este orçamento</button>
        `;
        
        document.getElementById('btnSolicitarOrcamento')?.addEventListener('click', () => {
            window.location.href = '#contato';
            modal.style.display = 'none';
        });
    } catch (error) {
        resultadoDiv.innerHTML = '❌ Erro ao calcular. Tente novamente ou me chame no WhatsApp.';
        console.error(error);
    }
});

// ===== FORMULÁRIO DE CONTATO COM API =====
document.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const dados = {
        nome: form.querySelector('input[placeholder*="nome"]')?.value || '',
        email: form.querySelector('input[type="email"]')?.value || '',
        telefone: form.querySelector('input[type="tel"]')?.value || '',
        mensagem: form.querySelector('textarea')?.value || '',
        origem: 'site_misa_portfolio',
        data_envio: new Date().toISOString()
    };
    
    const btnEnviar = form.querySelector('.btn-enviar input');
    const textoOriginal = btnEnviar.value;
    btnEnviar.value = '⏳ Enviando...';
    btnEnviar.disabled = true;
    
    try {
        const response = await axios.post(`${API_URL}/api/contato`, dados);
        alert(response.data.mensagem || '✅ Mensagem enviada! Responderei em até 24h.');
        form.reset();
    } catch (error) {
        console.error('Erro detalhado:', error);
        alert('❌ Falha no envio. Por favor, me chame no WhatsApp: (XX) XXXXX-XXXX');
    } finally {
        btnEnviar.value = textoOriginal;
        btnEnviar.disabled = false;
    }
});

// ===== CARREGAR PROJETOS DO BACK-END (para não ficar fixo) =====
async function carregarProjetos() {
    try {
        const response = await axios.get(`${API_URL}/api/projetos`);
        const projetos = response.data;
        
        const container = document.querySelector('.portfolio .flex');
        if (container && projetos.length) {
            container.innerHTML = ''; // Limpa os fixos
            projetos.forEach(proj => {
                const div = document.createElement('div');
                div.className = 'img-port';
                div.style.backgroundImage = `url('${proj.imagem}')`;
                div.style.cursor = 'pointer';
                div.onclick = () => window.location.href = proj.link;
                div.innerHTML = `<div class="overlay">${proj.titulo}</div>`;
                container.appendChild(div);
            });
        }
    } catch (error) {
        console.log('Usando projetos estáticos (back-end indisponível)');
    }
}

// Executa ao carregar a página
carregarProjetos();