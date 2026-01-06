const descricao = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const tipoSelect = document.getElementById("tipo");
const parcelasInput = document.getElementById("parcelas");

const entradaSpan = document.getElementById("entrada");
const saidaSpan = document.getElementById("saida");
const saldoSpan = document.getElementById("saldo");
let categorias = JSON.parse(localStorage.getItem("categorias")) || ["Geral"];
let dados = JSON.parse(localStorage.getItem("dados")) || [];

const categoriaSelect = document.getElementById("categoria");

function carregarCategorias() {
  categoriaSelect.innerHTML = "";
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.textContent = cat;
    categoriaSelect.appendChild(opt);
  });
}

function adicionarCategoria() {
  const nome = document.getElementById("novaCategoria").value;
  if (!nome) return;
  categorias.push(nome);
  localStorage.setItem("categorias", JSON.stringify(categorias));
  document.getElementById("novaCategoria").value = "";
  carregarCategorias();
}

function adicionarLancamento() {
  const desc = descricao.value;
  const valor = Number(valorInput.value);
  const tipo = tipoSelect.value;
  const cat = categoriaSelect.value;
  const parcelas = Number(parcelasInput.value) || 1;

  for (let i = 1; i <= parcelas; i++) {
    dados.push({
      desc: parcelas > 1 ? `${desc} (${i}/${parcelas})` : desc,
      valor: valor / parcelas,
      tipo,
      cat
    });
  }

  salvar();
}

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

function atualizar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let entrada = 0, saida = 0;

  dados.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.desc} - R$ ${d.valor.toFixed(2)} (${d.cat})`;
    lista.appendChild(li);

    d.tipo === "entrada" ? entrada += d.valor : saida += d.valor;
  });

  entradaSpan.textContent = entrada.toFixed(2);
  saidaSpan.textContent = saida.toFixed(2);
  saldoSpan.textContent = (entrada - saida).toFixed(2);

  gerarGrafico(entrada, saida);
}

let chart;
function gerarGrafico(entrada, saida) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafico"), {
    type: "doughnut",
    data: {
      labels: ["Gastos", "Disponível"],
      datasets: [{
        data: [saida, Math.max(entrada - saida, 0)]
      }]
    }
  });
}

carregarCategorias();
atualizar();
