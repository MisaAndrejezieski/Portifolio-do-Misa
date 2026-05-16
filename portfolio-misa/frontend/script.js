// ===== PORTFÓLIO DO MISA - SCRIPT PRINCIPAL =====

// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initPortfolio();
    initGame();
    initContactForm();
    initSmoothScroll();
});

// ===== MENU MOBILE =====
function initMobileMenu() {
    const btnMobile = document.getElementById('btn-mobile');
    const menuMobile = document.getElementById('menu-mobile');
    const overlayMenu = document.getElementById('overlay-menu');
    
    if (!btnMobile || !menuMobile || !overlayMenu) return;
    
    function toggleMenu() {
        menuMobile.classList.toggle('abrir');
        overlayMenu.classList.toggle('ativo');
    }
    
    btnMobile.addEventListener('click', toggleMenu);
    overlayMenu.addEventListener('click', toggleMenu);
    
    // Fecha ao clicar em um link
    document.querySelectorAll('.menu-mobile a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}

// ===== PORTFÓLIO (carrega projetos do backend ou local) =====
async function initPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    // Projetos locais (fallback)
    const projetos = [
        {
            titulo: "🌙 Cotton Candy Kabukicho",
            imagem: "assets/images/banner.png",
            link: "https://misaandrejezieski.github.io/Cotton-Candy-Kabukicho/"
        },
        {
            titulo: "📥 BaixarYou Downloader",
            imagem: "assets/images/baixaryou-banner.jpg",
            link: "https://MisaAndrejezieski.github.io/Site-BaixarYou"
        },
        {
            titulo: "🍜 NEKOLAMEN Yakisoba",
            imagem: "assets/images/Yakisoba, japanese Street Food!!!.jpg",
            link: "https://misaandrejezieski.github.io/NekoLamen/"
        }
    ];
    
    // Tenta buscar do backend (se estiver rodando)
    try {
        const response = await fetch('http://localhost:3000/api/projetos');
        if (response.ok) {
            const data = await response.json();
            if (data.length) {
                renderizarProjetos(data);
                return;
            }
        }
    } catch (error) {
        console.log('Backend offline, usando projetos locais');
    }
    
    renderizarProjetos(projetos);
}

function renderizarProjetos(projetos) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    grid.innerHTML = projetos.map(proj => `
        <div class="portfolio-item" onclick="window.open('${proj.link}', '_blank')">
            <img src="${proj.imagem}" alt="${proj.titulo}">
            <div class="portfolio-overlay">
                <h3>${proj.titulo}</h3>
                <p>Clique para visitar →</p>
            </div>
        </div>
    `).join('');
}

// ===== JOGO PHASER =====
let game = null;
let currentScore = 0;

function initGame() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // Configuração do jogo
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 500,
        parent: 'game-container',
        backgroundColor: '#0a0a2a',
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    function preload() {
        // Criar gráficos proceduralmente
        const graphics = this.make.graphics({ add: false });
        
        // Player (xícara de café)
        graphics.fillStyle(0x00ff08);
        graphics.fillCircle(20, 20, 18);
        graphics.generateTexture('player', 40, 40);
        
        // Bug (inimigo)
        graphics.clear();
        graphics.fillStyle(0xff4444);
        graphics.fillCircle(20, 20, 15);
        graphics.generateTexture('bug', 40, 40);
    }
    
    function create() {
        // Placar
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Bugs exterminados: 0', {
            fontSize: '20px',
            color: '#00ff08',
            fontFamily: 'monospace'
        });
        
        // Jogador
        this.player = this.add.sprite(400, 450, 'player');
        this.player.setInteractive();
        
        // Bugs
        this.bugs = [];
        
        // Spawn de bugs a cada 1 segundo
        this.time.addEvent({
            delay: 1000,
            callback: spawnBug,
            callbackScope: this,
            loop: true
        });
        
        // Movimento do mouse
        this.input.on('pointermove', (pointer) => {
            this.player.x = Phaser.Math.Clamp(pointer.x, 30, 770);
        });
        
        function spawnBug() {
            const x = Phaser.Math.Between(40, 760);
            const y = Phaser.Math.Between(40, 350);
            const bug = this.add.sprite(x, y, 'bug');
            bug.setInteractive();
            
            bug.on('pointerdown', () => {
                bug.destroy();
                this.score += 10;
                this.scoreText.setText(`Bugs exterminados: ${this.score}`);
                currentScore = this.score;
                document.getElementById('game-score').innerText = this.score;
                
                // Efeito de shake no player
                this.tweens.add({
                    targets: this.player,
                    scale: 1.3,
                    duration: 100,
                    yoyo: true
                });
            });
            
            // Movimento aleatório
            this.tweens.add({
                targets: bug,
                x: Phaser.Math.Between(40, 760),
                y: Phaser.Math.Between(40, 350),
                duration: 2000,
                repeat: -1,
                yoyo: true
            });
            
            this.bugs.push(bug);
        }
    }
    
    function update() {
        // Lógica adicional se necessário
    }
    
    game = new Phaser.Game(config);
    
    // Botão de reset
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (game) {
                game.destroy(true);
                currentScore = 0;
                document.getElementById('game-score').innerText = '0';
                initGame();
            }
        });
    }
}

// ===== FORMULÁRIO DE CONTATO =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const messageDiv = document.getElementById('form-message');
        const submitBtn = form.querySelector('.btn-submit');
        
        // Desabilita botão durante envio
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';
        
        try {
            // Tenta enviar para o backend (se estiver rodando)
            const response = await fetch('http://localhost:3000/api/contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                messageDiv.innerHTML = '✅ Mensagem enviada! Responderei em até 24h. ☕';
                messageDiv.className = 'form-message success';
                form.reset();
            } else {
                throw new Error('Erro no servidor');
            }
        } catch (error) {
            // Fallback: mostra mensagem para contato direto
            messageDiv.innerHTML = '⚠️ Servidor offline. Me chame no WhatsApp: (XX) XXXXX-XXXX ou email: misaelandrejezieski130982@outlook.com.br';
            messageDiv.className = 'form-message error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-send"></i> Enviar mensagem 🚀';
            
            // Esconde mensagem após 5 segundos
            setTimeout(() => {
                messageDiv.innerHTML = '';
                messageDiv.className = 'form-message';
            }, 5000);
        }
    });
}

// ===== SCROLL SUAVE =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}