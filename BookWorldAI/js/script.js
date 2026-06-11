/**
 * BookScript AI - Engine de Recomendação Instantânea
 */

const BookScript = {
    catalogo: [],
    inputDelay: null,

    // 1. Inicialização do Sistema
    async init() {
        await this.carregarDados();
        this.configurarListeners();
    },

    // 2. Carregar o arquivo JSON
    async carregarDados() {
        try {
            const response = await fetch("dados/dados.json");
            if (!response.ok) throw new Error("Erro ao carregar banco de dados.");
            
            this.catalogo = await response.json();

            // Renderiza conteúdos iniciais estáticos
            this.renderizarLivroDoDia();
            this.renderizarTop10();
        } catch (error) {
            console.error("Falha na IA:", error);
            document.getElementById("resultado").innerHTML = "<p class='aviso'>Erro ao conectar com a biblioteca.</p>";
        }
    },

    // 3. Template de Card (Art Déco)
    // Centraliza o HTML para evitar repetições
    criarCardHTML(livro, especial = false) {
        const classeDestaque = especial ? 'livro-destaque' : '';
        return `
            <div class="livro ${classeDestaque}">
                <img src="${livro.capa}" alt="${livro.nome}" loading="lazy">
                <div class="livro-conteudo">
                    ${especial ? '<h3>✨ DESTAQUE DO DIA</h3>' : ''}
                    <h3>${livro.nome}</h3>
                    <p><span>👤</span> ${livro.autor}</p>
                    <p><span>📚</span> ${livro.genero} | <span>📅</span> ${livro.ano}</p>
                    <p><span>⭐</span> <strong>Nota: ${livro.nota}</strong></p>
                    <p class="descricao">${livro.descricao}</p>
                </div>
            </div>
        `;
    },

    // 4. Lógica de Busca Instantânea
    buscar() {
        const termo = document.getElementById("pesquisa").value.toLowerCase();
        const genero = document.getElementById("genero").value;
        const container = document.getElementById("resultado");

        // Se o usuário apagar tudo, podemos mostrar uma mensagem ou limpar
        if (termo.length < 2 && !genero) {
            container.innerHTML = "<p class='aviso'>Digite o nome de um livro para começar...</p>";
            return;
        }

        // Filtro Inteligente
        const filtrados = this.catalogo.filter(livro => {
            const matchesNome = livro.nome.toLowerCase().includes(termo) || 
                               livro.autor.toLowerCase().includes(termo);
            const matchesGenero = !genero || livro.genero === genero;
            return matchesNome && matchesGenero;
        });

        // Ordenação por Nota (IA prioriza os melhores)
        filtrados.sort((a, b) => b.nota - a.nota);

        // Renderização Instantânea
        if (filtrados.length > 0) {
            container.innerHTML = filtrados.map(l => this.criarCardHTML(l)).join('');
        } else {
            container.innerHTML = "<p class='aviso'>Nenhuma obra encontrada na nossa biblioteca.</p>";
        }
    },

    // 5. Livro do Dia (Baseado na data atual)
    renderizarLivroDoDia() {
        const container = document.getElementById("livro-dia");
        if (!container) return;

        const dia = new Date().getDate();
        const livro = this.catalogo[dia % this.catalogo.length];

        container.innerHTML = this.criarCardHTML(livro, true);
    },

    // 6. Top 10 Ranking
    renderizarTop10() {
        const container = document.getElementById("top10");
        if (!container) return;

        const top10 = [...this.catalogo]
            .sort((a, b) => b.nota - a.nota)
            .slice(0, 10);

        container.innerHTML = top10.map((l, i) => `
            <div class="card">
                <small>RANKING #${i + 1}</small>
                <h3>${l.nome}</h3>
                <p>⭐ ${l.nota}</p>
            </div>
        `).join('');
    },

    // 7. Configuração de Eventos
    configurarListeners() {
        const campoBusca = document.getElementById("pesquisa");
        const selectGenero = document.getElementById("genero");

        // Escuta a digitação (Input é melhor que keyup pois pega colar/apagar)
        campoBusca.addEventListener("input", () => {
            clearTimeout(this.inputDelay);
            // Aguarda 250ms após parar de digitar para processar (Debounce)
            this.inputDelay = setTimeout(() => this.buscar(), 250);
        });

        // Escuta a mudança de gênero
        selectGenero.addEventListener("change", () => this.buscar());
    }
};

// Ligar os motores quando a página carregar
document.addEventListener("DOMContentLoaded", () => BookScript.init());
