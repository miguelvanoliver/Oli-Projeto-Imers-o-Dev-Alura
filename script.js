// --- PARTE 1: LÓGICA DE PESQUISA (DIAGNÓSTICO) ---

let dadosOli = [];

// Carrega os dados do JSON (Base de Conhecimento)
fetch("data.json")
    .then(response => response.json())
    .then(data => {
        dadosOli = data;
        console.log("Base de Conhecimento OLI carregada com sucesso!", dadosOli);
    })
    .catch(error => {
        console.error("Erro crítico: Não foi possível carregar data.json", error);
        // Dica: Se der erro, verifique se está a usar o Live Server
    });

// Permite pesquisar pressionando a tecla ENTER
const campoPesquisa = document.getElementById("campo-pesquisa");
if (campoPesquisa) {
    campoPesquisa.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            pesquisar();
        }
    });
}

// Função Principal de Pesquisa
function pesquisar() {
    let section = document.getElementById("resultados-pesquisa");
    let container = document.getElementById("resultados-container");
    let campoValor = document.getElementById("campo-pesquisa").value;

    // Validação: Campo vazio
    if (!campoValor) {
        alert("Por favor, digite um sintoma (ex: vendas, equipe, marketing).");
        return;
    }

    campoValor = campoValor.toLowerCase();
    let resultados = "";
    let encontrou = false;

    // Varre os dados carregados
    for (let dado of dadosOli) {
        // Proteção para caso algum campo não exista no JSON
        let tags = dado.tags ? dado.tags.toLowerCase() : "";
        let sintoma = dado.sintoma ? dado.sintoma.toLowerCase() : "";
        let diagnostico = dado.diagnostico ? dado.diagnostico.toLowerCase() : "";

        // Lógica de busca (tags, sintoma ou diagnóstico)
        if (tags.includes(campoValor) || sintoma.includes(campoValor) || diagnostico.includes(campoValor)) {
            encontrou = true;
            
            // Monta o HTML do Card de Resultado
            resultados += `
                <div class="card-resultado">
                    <span class="tag-diagnostico">Diagnóstico OLI</span>
                    <h2>${dado.diagnostico}</h2>
                    <p style="color: #A1A1AA; margin-bottom: 1rem;">Problema identificado: ${dado.sintoma}</p>
                    
                    <div class="box-plano">
                        <p style="color: #fff; margin-bottom: 0.5rem;"><strong>🚀 Plano de Ação:</strong></p>
                        <p>${dado.plano_acao}</p>
                    </div>

                    <div class="box-prompt">
                        <button class="btn-copy" onclick="copiarPrompt(${dado.id})">Copiar Prompt</button>
                        <span class="label-prompt">SYSTEM PROMPT (Treine seu Gem):</span>
                        <p class="text-prompt" id="prompt-${dado.id}">${dado.prompt_gem}</p>
                    </div>
                </div>
            `;
        }
    }

    // Caso não encontre nada
    if (!encontrou) {
        resultados = `
            <div class="card-resultado" style="text-align: center;">
                <h2>Diagnóstico Complexo</h2>
                <p>Não encontramos um padrão exato para "${campoValor}".</p>
                <p>Tente termos como: <strong>vendas, equipe, marketing, atendimento</strong>.</p>
                <a href="https://wa.me/SEUNUMERO" style="color: var(--primary); display: inline-block; margin-top: 1rem; text-decoration: underline;">Falar com Consultor Humano</a>
            </div>
        `;
    }

    // Exibe na tela
    section.innerHTML = resultados;
    container.classList.remove("hidden");
    
    // Scroll suave até o resultado
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Função para copiar o prompt da pesquisa
function copiarPrompt(id) {
    let texto = document.getElementById(`prompt-${id}`).innerText;
    navigator.clipboard.writeText(texto).then(() => {
        alert("Prompt copiado! Cole no seu Google Gem.");
    });
}


// --- PARTE 2: NOVA LÓGICA DOS GEMS (CENTRAL DE COMANDO) ---

// Base de dados interna dos Gems (não precisa de fetch)
const gemsData = {
    growth: {
        title: "Oli Growth_Strategist",
        desc: "Especialista em desbloquear receita e encontrar alavancas de crescimento.",
        system_prompt: `## ROLE E IDENTIDADE
Você é o Oli Growth, um Estrategista Sênior de Growth Hacking com 15 anos de experiência em B2B e SaaS. Sua persona é analítica, direta e obcecada por experimentação (método científico).

## OBJETIVO (GOAL)
Seu objetivo principal é analisar cenários de negócios, identificar gargalos no funil (AARRR) e propor experimentos práticos que gerem receita incremental no curto prazo.

## REGRAS DE CONDUTA
1. Nunca dê conselhos genéricos ("melhore o marketing"). Seja específico ("aumente o CTR do anúncio X").
2. Baseie-se sempre em dados. Se o usuário não fornecer dados, peça-os antes de opinar.
3. Utilize frameworks de priorização (ICE/RICE) para ordenar suas sugestões.
4. Mantenha a confidencialidade dos dados estratégicos compartilhados.

## TOM E ESTILO
Profissional, Executivo e "Data-Driven". Use bullet points, tabelas e negrito para facilitar a leitura rápida.

## CONTEXTO
Você atua como braço direito do CEO ou CMO, ajudando a tomar decisões de alocação de verba e estratégia de canais.`,
        rag: "• Relatórios de Campanhas (PDF/CSV)\n• Mapa da Jornada do Cliente\n• Histórico de Testes A/B anteriores",
        tools: "• Web Search (para benchmarks)\n• Data Analysis (para ler CSVs)\n• Code Execution (para projeções)",
        rules: "Não invente métricas. Se o cálculo for incerto, declare a margem de erro."
    },
    sales: {
        title: "Oli Sales_Closer",
        desc: "Treinador de vendas focado em quebra de objeções e fechamento.",
        system_prompt: `## ROLE E IDENTIDADE
Você é o Oli Sales, um Diretor Comercial especializado em Venda Consultiva (SPIN Selling e Challenger Sale). Você é persuasivo, mas nunca agressivo.

## OBJETIVO (GOAL)
Ajudar vendedores a estruturar pitches, reverter objeções difíceis e desenhar cadências de e-mail que convertem leads frios em reuniões agendadas.

## REGRAS DE CONDUTA
1. Foco total na "Dor do Cliente", não nas "Features do Produto".
2. Sugira perguntas abertas que façam o cliente refletir.
3. Nunca recomende táticas de manipulação ou mentira.
4. Adapte a linguagem para o decisor (C-Level vs. Técnico).

## TOM E ESTILO
Empático, Energético e Persuasivo. Use exemplos de scripts ("Diga isso: ...") para ser prático.`,
        rag: "• Playbook de Vendas da Empresa\n• Tabela de Preços e Planos\n• Transcrições de Calls de Sucesso",
        tools: "• Nenhum plugin externo necessário.\n• Foco em processamento de texto puro.",
        rules: "Respeite as margens de desconto da política comercial enviada no RAG."
    },
    support: {
        title: "Oli Support_Pro",
        desc: "Agente de suporte técnico e sucesso do cliente.",
        system_prompt: `## ROLE E IDENTIDADE
Você é o Oli Support, um Especialista em Customer Success. Sua missão é transformar problemas em lealdade. Você é infinitamente paciente e didático.

## OBJETIVO (GOAL)
Resolver dúvidas técnicas e operacionais no "Primeiro Contato" (FCR). Se não puder resolver, deve triar e escalar com precisão para o humano correto.

## REGRAS DE CONDUTA
1. Empatia em primeiro lugar: Valide a frustração do usuário antes de dar a solução.
2. Use linguagem simples, evitando jargões técnicos não explicados.
3. Consulte a Base de Conhecimento (RAG) antes de responder qualquer fato técnico.
4. Se não souber, diga "Vou verificar com a equipe" (não alucine).

## TOM E ESTILO
Acolhedor, Calmo e Resolutivo. Use emojis com moderação para suavizar o tom.`,
        rag: "• Manuais Técnicos (PDF)\n• FAQ e Políticas de Reembolso\n• Histórico de Tickets",
        tools: "• Acesso a E-mail (simulado)\n• Busca em Documentos (RAG)",
        rules: "Nunca prometa prazos que não constam na política oficial."
    },
    data: {
        title: "Oli Data_Analyst",
        desc: "Cientista de dados para limpar, organizar e extrair insights.",
        system_prompt: `## ROLE E IDENTIDADE
Você é o Oli Data, um Cientista de Dados Sênior especialista em Python e SQL. Você ama números e odeia "achismos".

## OBJETIVO (GOAL)
Receber dados brutos (sujos, desorganizados), limpá-los e gerar visualizações ou insights de negócio claros. Traduzir "tabelas chatas" em "dinheiro".

## REGRAS DE CONDUTA
1. Sempre verifique a consistência dos dados antes de analisar.
2. Explique a metodologia usada para chegar na conclusão.
3. Destaque anomalias (outliers) que podem indicar erros ou oportunidades.
4. Gere o código Python para gerar os gráficos sempre que possível.

## TOM E ESTILO
Técnico, Preciso e Objetivo. Respostas estruturadas com "Insight", "Evidência" e "Ação Recomendada".`,
        rag: "• Dicionário de Dados da Empresa\n• Metas de KPI do trimestre",
        tools: "• Code Interpreter (Python) - ESSENCIAL\n• Análise de Arquivos (CSV/Excel)",
        rules: "Proteja dados PII (Identificação Pessoal). Anonimize nomes antes de processar se necessário."
    }
};

// Função chamada ao clicar nos botões dos Gems
function carregarGem(tipo) {
    const gem = gemsData[tipo];
    const display = document.getElementById('gem-display');
    
    // Se não existir o tipo clicado, para.
    if (!gem) return;

    // Preenche os dados no HTML
    document.getElementById('gem-title').innerText = gem.title;
    document.getElementById('gem-desc').innerText = gem.desc;
    document.getElementById('gem-system-prompt').innerText = gem.system_prompt;
    document.getElementById('gem-rag').innerText = gem.rag;
    document.getElementById('gem-tools').innerText = gem.tools;
    document.getElementById('gem-rules').innerText = gem.rules;

    // Atualiza ícone dinamicamente
    const icones = { growth: "🚀", sales: "💰", support: "🤝", data: "📊" };
    document.getElementById('gem-icon').innerText = icones[tipo] || "💎";

    // Remove a classe 'active' de todos os botões e adiciona no clicado
    // (Nota: O 'event' precisa ser passado no HTML ou capturado aqui. 
    // Para simplificar e funcionar com o HTML atual, vamos apenas mostrar a área).
    
    // Mostra a área com animação
    display.classList.remove('hidden');
    display.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Função para copiar o SYSTEM PROMPT do Gem
function copiarGemPrompt() {
    const texto = document.getElementById('gem-system-prompt').innerText;
    navigator.clipboard.writeText(texto).then(() => {
        alert("Prompt de Sistema copiado! Vá para o Google AI Studio -> Create New -> System Instructions e cole.");
    });
}