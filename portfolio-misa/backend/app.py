from flask import Flask, request, jsonify
from flask_cors import CORS  # Permite seu site chamar a API
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Libera o front-end do GitHub Pages a chamar esta API

# Rota de teste (para ver se o back-end está no ar)
@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "mensagem": "Back-end do Misa está funcionando! 🚀",
        "versao": "1.0"
    })

# Rota para receber dados do formulário de contato (exemplo)
@app.route('/api/contato', methods=['POST'])
def receber_contato():
    try:
        dados = request.json
        nome = dados.get('nome')
        email = dados.get('email')
        telefone = dados.get('telefone')
        mensagem = dados.get('mensagem')
        
        # Aqui você pode:
        # 1. Salvar no banco de dados
        # 2. Enviar um e-mail para você
        # 3. Retornar uma confirmação
        
        print(f"Novo contato: {nome} - {email}")
        
        # Simula salvamento
        return jsonify({
            "success": True,
            "mensagem": "Recebido! Em breve responderei ☕"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "mensagem": f"Erro: {str(e)}"
        }), 400

# Rota para gerar um orçamento simples (exemplo para clientes)
@app.route('/api/orcamento', methods=['POST'])
def gerar_orcamento():
    dados = request.json
    tipo_servico = dados.get('tipo')  # 'site', 'dashboard', 'automacao'
    complexidade = dados.get('complexidade', 'media')  # 'baixa', 'media', 'alta'
    
    precos_base = {
        'site': 800,
        'dashboard': 500,
        'automacao': 300
    }
    multiplicador = {'baixa': 1, 'media': 1.5, 'alta': 2}
    
    valor = precos_base.get(tipo_servico, 500) * multiplicador.get(complexidade, 1)
    
    return jsonify({
        "servico": tipo_servico,
        "complexidade": complexidade,
        "valor_estimado": f"R$ {int(valor)}",
        "prazo_dias": 5 if complexidade == 'baixa' else 10 if complexidade == 'media' else 15
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)