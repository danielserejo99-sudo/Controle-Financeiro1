// ===== ESTADO =====
let dados = JSON.parse(localStorage.getItem("dados")) || [];
let categorias = ["Geral", "Alimentação", "Moradia", "Transporte", "Lazer"];

// ===== ELEMENTOS =====
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const data = document.getElementById("data");
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");

const lista = document.getElementById("lista");
const mesFiltro = document.getElementById("mesFiltro");
const anoFiltro = document.getElementById("anoFiltro");

const totalEntradas = document.getElementById("totalEntradas");
const totalSaidas = document.getElementById("totalSaidas");
const saldoEl = document.getElementById("saldo");
const percentual = document.getElementById("percentual");

// ===== SELECTS =====
categorias.forEach(c => categoria.innerHTML += `<option>${c}</option>`);

const hoje = new Date();
for (let m = 0; m < 12; m++) mesFiltro.innerHTML += `<option value="${m}">${m + 1}</option>`;
for (let a = hoje.getFullYear() - 1; a <= hoje.getFullYear() + 1; a++) anoFiltro.innerHTML += `<option>${a}</option>`;
mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// ===== BOTÃO =====
document.getElementById("btnAdicionar").onclick = adicionarLancamento;

// ===== FUNÇÕES =====
function adicionarLancamento() {
  if (!descricao.value || !valor.value || !data.value) {
    alert("Preencha todos os campos");
    return;
  }

  dados.push({
    id: Date.now(),
    desc: descricao.value,
    valor: Number(valor.value),
    data: data.value,
    tipo: tipo.value,
    categoria: categoria.value
  });

  localStorage.setItem("dados", JSON.stringify(dados));

  descricao.value = "";
  valor.value = "";
  atualizar();
}

// ===== GRÁFICOS =====
let gCat, gResumo, gLinha;

function atualizarGraficos(entradas, saidas, mapa, evolucao) {
  if (gCat) gCat.destroy();
  gCat = new Chart(document.getElementById("graficoCategoria"), {
    type: "pie",
    data: { labels: Object.keys(mapa), datasets: [{ data: Object.values(mapa) }] }
  });

  if (gResumo) gResumo.destroy();
  gResumo = new Chart(document.getElementById("graficoResumo"), {
    type: "bar",
    data: { labels: ["Entradas", "Saídas"], datasets: [{ data: [entradas, saidas] }] }
  });

  if (gLinha) gLinha.destroy();
  gLinha = new Chart(document.getElementById("graficoLinha"), {
    type: "line",
    data: {
      labels: evolucao.map(e => e.dia),
      datasets: [{ label: "Saldo", data: evolucao.map(e => e.saldo) }]
    }
  });
}

// ===== ATUALIZAR =====
function atualizar() {
  lista.innerHTML = "";

  let entradas = 0, saidas = 0, saldo = 0;
  let mapa = {};
  let evolucao = [];

  const atual = dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() == mesFiltro.value && dt.getFullYear() == anoFiltro.value;
  }).sort((a, b) => new Date(a.data) - new Date(b.data));

  atual.forEach(d => {
    if (d.tipo === "entrada") entradas += d.valor;
    else {
      saidas += d.valor;
      mapa[d.categoria] = (mapa[d.categoria] || 0) + d.valor;
    }

    saldo += d.tipo === "entrada" ? d.valor : -d.valor;
    evolucao.push({ dia: d.data.split("-")[2], saldo });

    const li = document.createElement("li");
    li.textContent = `${d.desc} - R$ ${d.valor}`;
    lista.appendChild(li);
  });

  totalEntradas.textContent = entradas;
  totalSaidas.textContent = saidas;
  saldoEl.textContent = entradas - saidas;
  percentual.textContent = entradas ? ((saidas / entradas) * 100).toFixed(1) : 0;

  atualizarGraficos(entradas, saidas, mapa, evolucao);
}

atualizar();
