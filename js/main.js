let lista_tarefas = []
let ver_tarefas_concluidas = true

window.onload = (event) => {
    animarBG()
    carregarTarefas()
    exibirTarefas()
    
    document.getElementById("input-tarefa").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            adicionarTarefa()
        }
    })
}

window.addEventListener('storage', function(event) {
    if (event.storageArea === localStorage) {
        carregarTarefas()
        exibirTarefas()
    }
})

function carregarTarefas(){
    let tarefas = JSON.parse(localStorage.getItem("lista_tarefas"))
    let ver_concluidas = JSON.parse(localStorage.getItem("info"))

    if (tarefas === null) {
        tarefas = []
        localStorage.setItem("info", JSON.stringify(tarefas))
    }
    
    if (ver_concluidas === null) {
        ver_concluidas = true
        localStorage.setItem("info", JSON.stringify({"ver_concluidas": true}))
    }
    
    lista_tarefas = tarefas
    ver_tarefas_concluidas = ver_concluidas["ver_concluidas"]
}

function salvarTarefas(){
    localStorage.setItem("lista_tarefas", JSON.stringify(lista_tarefas))
    localStorage.setItem("info", JSON.stringify({"ver_concluidas": ver_tarefas_concluidas}))
    carregarTarefas()
    exibirTarefas()
}

function criarTarefa(conteudo){
    let nova_tarefa = {
        "titulo": conteudo,
        "concluido": false,
        "importante": false,
        "deletado": false,
        "dataCriacao": Date.now()
    }

    let tarefa_existe = false

    lista_tarefas.forEach(item => {
        if(item["dataCriacao"] === nova_tarefa["data_criacao"])
            tarefa_existe = true
    })

    if (!tarefa_existe){
        lista_tarefas.push(nova_tarefa)
        salvarTarefas()
        exibirTarefas()
    }
}

function exibirTarefas(){
    let dom_lista_tarefas = document.getElementById("lista-tarefas")
    
    dom_lista_tarefas.innerHTML = ""
    let html_tarefa = ""
    
    lista_tarefas.sort(function (a, b) {
        return a["concluido"] - b["concluido"] || b["importante"] - a["importante"]
    })
    
    lista_tarefas.forEach(tarefa => {
        if(((tarefa["concluido"] && ver_tarefas_concluidas) || !tarefa["concluido"]) && !tarefa["deletado"])
            html_tarefa += `
            <div class="${tarefa["concluido"]? "bg-alpha-disabled":"bg-alpha"} rounded-3 p-3 mt-4 d-flex justify-content-between">
                <div class="cursor-pointer" onClick="alterarEstadoTarefa(${tarefa["dataCriacao"]})">
                    <label class="lead ${tarefa["concluido"]? "text-decoration-line-through":""}">
                        <i class="bi ${tarefa["concluido"]? "bi-check-circle-fill":"bi-circle"} me-2"></i>${tarefa["titulo"].charAt(0).toUpperCase() + tarefa["titulo"].slice(1)}
                    </label>
                </div>
    
                <div class="d-flex">
                    <div class="px-2 rounded my-auto cursor-pointer ${tarefa["importante"]? "text-warning":""}" onClick="mudarImportanciaTarefa(${tarefa["dataCriacao"]})"><i class="bi ${tarefa["importante"]? "bi-star-fill":"bi-star"}"></i></div>
                    <div class="dropdown">
                        <div class="${tarefa["concluido"]? "bg-alpha-disabled":"bg-alpha"} px-2 py-1 rounded dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots"></i>
                        </div>
                    
                        <ul class="dropdown-menu ${tarefa["concluido"]? "bg-alpha-disabled":"bg-alpha"}">
                            <li><a class="dropdown-item" href="#" onClick="editarTarefa(${tarefa["dataCriacao"]})"><i class="bi bi-pencil"></i> Editar</a></li>
                            <li><a class="dropdown-item" href="#" onClick="alterarEstadoTarefa(${tarefa["dataCriacao"]})"><i class="bi bi-check-circle"></i> Concluir</a></li>
                            <li><a class="dropdown-item" href="#" onClick="mudarImportanciaTarefa(${tarefa["dataCriacao"]})"><i class="bi bi-star"></i> Importante</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onClick="enviarTarefaLixeira(${tarefa["dataCriacao"]})"><i class="bi bi-trash3"></i> Enviar para a lixeira</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            `
    })
    
    dom_lista_tarefas.innerHTML = html_tarefa
}

function editarTarefa(tarefa_id){
    lista_tarefas.forEach(tarefa => {
        if(tarefa["dataCriacao"] === tarefa_id){
            tarefa["titulo"] = prompt("Atualizando uma tarefa", tarefa["titulo"])
            salvarTarefas()
        }
    })
}

function enviarTarefaLixeira(tarefa_id){
    lista_tarefas.forEach(tarefa => {
        if(tarefa["dataCriacao"] === tarefa_id){
            tarefa["deletado"] = true
            salvarTarefas()
        }
    })
}

function alterarEstadoTarefa(tarefa_id){
    lista_tarefas.forEach(tarefa => {
        if(tarefa["dataCriacao"] === tarefa_id){
            tarefa["concluido"] = ! tarefa["concluido"]
            salvarTarefas()
        }
    })
    
    verificarTodasTarefasConcluidas()
}

function mudarImportanciaTarefa(tarefa_id){
    lista_tarefas.forEach(tarefa => {
        if(tarefa["dataCriacao"] === tarefa_id){
            tarefa["importante"] = ! tarefa["importante"]
            salvarTarefas()
        }
    })
}

function verificarTodasTarefasConcluidas(){
    let dom_lista_alertas = document.getElementById("lista-alertas")
    let num_concluidas = 0
    
    lista_tarefas.forEach(tarefa => {
        if(tarefa["concluido"])
            num_concluidas += 1
    })
    
    dom_lista_alertas.innerHTML = ""
    
    let html_alerta = ""
    if(num_concluidas === lista_tarefas.length){
        html_alerta = `
        <div class="alert alert-light bg-alpha d-flex justify-content-between align-items-center rounded-3 shadow-sm" role="alert">
            <div>
                <i class="bi bi-bell me-2"></i>
                Parabéns você concluiu todas as tarefas! 🎉
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
        dom_lista_alertas.innerHTML = html_alerta
    }
}

function adicionarTarefa(){
    let dom_input_tarefa = document.getElementById("input-tarefa")
    
    if(dom_input_tarefa.value !== ""){
        criarTarefa(dom_input_tarefa.value)
        dom_input_tarefa.value = ""
    }
}

function alterarVisibilidadeTarefasConcluidas(){
    let dom_ver_concluidas = document.getElementById("ver_concluidas")

    ver_tarefas_concluidas = !ver_tarefas_concluidas
    
    if(ver_tarefas_concluidas){
        dom_ver_concluidas.innerHTML = `<i class="bi bi-slash-circle"></i> Esconder concluidas`

    }else
        dom_ver_concluidas.innerHTML = `<i class="bi bi-check-circle-fill"></i> Ver concluidas`

    salvarTarefas()
}

function baixarJSON(){
    let data = JSON.stringify({"tarefas": lista_tarefas})

    let a = document.createElement('a')
    a.href = "data:application/octet-stream," + encodeURIComponent(data)
    a.download = `checkie_backup_tarefas_${new Date().getMilliseconds()}.json`
    a.click()
}

function baixarMarkdown(){
    let markdown = "# Tarefas\n"
    
    lista_tarefas.forEach(tarefa => {
        markdown += `- [${tarefa["concluido"]? "x": " "}] ${tarefa["importante"]? "==": ""}${tarefa["titulo"]}${tarefa["importante"]? "==": ""}\n`
    })
    
    markdown += "> *Tarefas exportadas do [Checkie](https://deyvidandrades.github.io/Checkie)*"
    
    let a = document.createElement('a')
    a.href = "data:application/octet-stream," + encodeURIComponent(markdown)
    a.download = `checkie_backup_tarefas_${new Date().getMilliseconds()}.md`
    a.click()
}

function esvaziarLixeira(){
    let nova_lista = []
    lista_tarefas.forEach(tarefa => {
        if(!tarefa["deletado"])
            nova_lista.push(tarefa)
    })
    
    lista_tarefas = nova_lista
    salvarTarefas()
}

function randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

function tetradicColors() {
    let hex = randomColor()

    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }

    // Convert hex to RGB
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);

    // Calculate tetradic colors
    var t1 = '#' + ((r + 128) % 255).toString(16).padStart(2, '0') +
              ((g + 128) % 255).toString(16).padStart(2, '0') +
              ((b + 128) % 255).toString(16).padStart(2, '0');
    var t2 = '#' + ((r + 64) % 255).toString(16).padStart(2, '0') +
              ((g + 64) % 255).toString(16).padStart(2, '0') +
              ((b + 64) % 255).toString(16).padStart(2, '0');
    var t3 = '#' + ((r + 192) % 255).toString(16).padStart(2, '0') +
              ((g + 192) % 255).toString(16).padStart(2, '0') +
              ((b + 192) % 255).toString(16).padStart(2, '0');

    // Return an array containing the tetradic colors
    return [`#${hex}`, t1, t2, t3];
}

function triadicColors() {
    let hex = randomColor()

    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }

    // Convert hex to RGB
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);

    // Calculate triadic colors
    var t1 = '#' + ((r + 85) % 255).toString(16).padStart(2, '0') +
              ((g + 85) % 255).toString(16).padStart(2, '0') +
              ((b + 85) % 255).toString(16).padStart(2, '0');
    var t2 = '#' + ((r + 170) % 255).toString(16).padStart(2, '0') +
              ((g + 170) % 255).toString(16).padStart(2, '0') +
              ((b + 170) % 255).toString(16).padStart(2, '0');

    // Return an array containing the triadic colors
    return [`#${hex}`, t1, t2];
}

function animarBG() {
    let colors = triadicColors()
    //[randomColor(),randomColor(),randomColor()]
    //tetradicColors()
    var domBg = document.getElementById('background')

    domBg.style.background = `linear-gradient(-45deg, ${colors.join(", ")})`
    domBg.style.backgroundSize = "400% 400%"
    domBg.style.animation = "gradient 120s linear infinite"
}
