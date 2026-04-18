const URL_API = "https://script.google.com/macros/s/AKfycbweJwPpf76RkR6ZIFYm2hf6xMSQaJNC5vavFyFkaXF555gDaTw3wYTbsj8y-y-kAA6_pQ/exec";

// Captura dos elementos para uso global
const camposAssunto = document.querySelectorAll('input[name="assunto"]');
const inputBairro = document.getElementById('bairro');
const campoOutros = document.getElementById('campo-outros');
const inputEspecifico = document.getElementById('localidade_especifica');

// 1. FUNÇÃO PARA MOSTRAR/ESCONDER O CAMPO "OUTROS"
function verificarOutros(valor) {
    if (valor === "Outros") {
        campoOutros.style.display = 'block';
        inputEspecifico.required = true;
    } else {
        campoOutros.style.display = 'none';
        inputEspecifico.required = false;
        inputEspecifico.value = "";
    }
}

// 2. FUNÇÃO PARA ENVIAR OS DADOS DO FORMULÁRIO
document.getElementById('form-os').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const btn = document.getElementById('btn-enviar');
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const bairroSelecionado = inputBairro.value;
    const localidadeDigitada = inputEspecifico.value;

    let localidadeFinal = (bairroSelecionado === "Outros") ? localidadeDigitada : bairroSelecionado;

    const dadosParaEnviar = {
        uc: document.getElementById('uc').value,
        os: document.getElementById('os').value,
        nome: document.getElementById('nome').value,
        assunto: document.querySelector('input[name="assunto"]:checked').value,
        bairro: localidadeFinal, 
        descricao: document.getElementById('descricao').value
    };

    try {
        await fetch(URL_API, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnviar)
        });

        alert("Ordem de serviço enviada com sucesso!");
        e.target.reset(); 
        campoOutros.style.display = 'none'; 
    } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("Erro ao conectar com o servidor.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Encaminhar Demanda";
    }
});

// 3. FUNÇÃO ÚNICA PARA ATUALIZAR MONITOR E AVISOS
async function atualizarMonitor() {
    try {
        const response = await fetch(URL_API + "?t=" + new Date().getTime());
        const data = await response.json();

        // Dentro de atualizarMonitor...
        const mural = document.getElementById('mural-supervisor');
        const titulo = document.getElementById('titulo-comunicado');
        const textoMsg = document.getElementById('texto-comunicado');

        if (data.mural && data.mural.length > 0) {
            mural.style.display = 'block';
            if(titulo) titulo.style.display = 'block';

            textoMsg.innerHTML = data.mural.map(item => `
                <div class="item-comunicado">
                    <div style="margin-bottom: 8px;">
                        <span style="background: #ffc107; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold;">
                            POSTADO ÀS ${item.hora}
                        </span>
                    </div>
                    <div style="font-size: 1.1em; line-height: 1.5; color: #ffffff;">${item.texto}</div>
                </div>
            `).join("");
        } else {
            mural.style.display = 'none';
            if(titulo) titulo.style.display = 'none';
        }

        // Parte do Monitor de Bairros (Mesma lógica)
        const painel = document.getElementById('status-rede');
        const msg = document.getElementById('mensagem-status');

        if (data.ocorrencias && data.ocorrencias.length > 0) {
            painel.className = "mural-vermelho";
            msg.innerHTML = data.ocorrencias.slice().reverse().map(reg => `
                <div style="background-color: rgba(255, 255, 255, 0.15); margin-bottom: 6px; padding: 8px; border-radius: 8px; border-left: 5px solid #fff;">
                    <span style="color: #fff; font-weight: 700; text-transform: uppercase; font-size: 0.95em;">${reg.bairro}</span>
                    <br><small style="font-size: 0.85em;">${reg.horario}</small>
                </div>
            `).join("");
        } else {
            painel.className = "status-estavel";
            msg.innerHTML = "Nenhuma O.S de falta de energia encaminhada";
        }

    } catch (error) {
            console.log("Erro:", error);
        }
    }

// 4. INICIALIZAÇÃO
atualizarMonitor();
setInterval(atualizarMonitor, 5000); // Atualiza tudo a cada 5 segundos

// Lógica de obrigatoriedade e cores dos rádios
camposAssunto.forEach(radio => {
    radio.addEventListener('change', () => {
        const asterisco = document.getElementById('asterisco-bairro');
        if (radio.value === "Risco de vida" || radio.value === "Falta de Energia") {
            inputBairro.required = true;
            if(asterisco) asterisco.style.display = "inline";
            inputBairro.style.backgroundColor = "#fff9c4"; 
        } else {
            inputBairro.required = false;
            if(asterisco) asterisco.style.display = "none";
            inputBairro.style.backgroundColor = "#fff"; 
        }
    });
});