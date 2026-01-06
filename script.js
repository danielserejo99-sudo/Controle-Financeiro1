// ================= ESTADO =================
let dados = JSON.parse(localStorage.getItem("dados")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || {};
let categorias = ["Geral", "Alimentação", "Moradia", "Transporte", "Lazer"];

// ================= ELEMENTOS =================
const lista = document.getElementById("lista");
const rankingEl = document.getElementById("ranking");
const categoriaSelect = document.getElementById("categoria");

const mesFiltro = document.getElementById("mesFiltro");
const anoFiltro = document.getElementById("anoFiltro");

// ================= SELECTS =================
categorias.forEach(c => categoriaSelect.innerHTML += `<option>${c}</option>`);

const hoje = new Date();
for (let m = 0; m < 12; m++) mesFiltro.innerHTML += `<option value="${m}">${m + 1}</option>`;
for (let a = hoje.getFullYear() - 1; a <= hoje.getFullYear() + 1; a++) anoFiltro.innerHTML += `<option>${a}</option>`;
mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// ================= LANÇAMENTO =================
function adicionarLancamento() {
  const l = {
    id: Date.now(),
    desc: descricao.value,
    valor: Number(valor.value),
    data: data.value,
    tipo: tipo.value,
    status: status.value,
    categoria: categoria.value,
    recorrente: recorrente.checked
  };
  dados.push(l);
  salvar();
}
window.adicionarLancamento = adicionarLancamento;

// ================= EXCLUIR =================
function excluir(id) {
  dados = dados.filter(d => d.id !== id);
  salvar();
}
window.excluir = excluir;

// ================= GRÁFICOS =================
let graficoCategoria, graficoResumo, graficoLinha;

function atualizarGraficos(entradas, saidas, mapaCategoria, evolucao) {

  // --- Pizza Categoria ---
  if (graficoCategoria) graficoCategoria.destroy();
  graficoCategoria = new Chart(document.getElementById("graficoCategoria"), {
    type: "pie",
    data: {
      labels: Object.keys(mapaCategoria),
      datasets: [{ data: Object.values(mapaCategoria) }]
    }
  });

  // --- Barras Entradas x Saídas ---
  if (graficoResumo) graficoResumo.destroy();
  graficoResumo = new Chart(document.getElementById("graficoResumo"), {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{ data: [entradas, saidas] }]
    }
  });

  // --- Linha Evolução ---
  if (graficoLinha) graficoLinha.destroy();
  graficoLinha = new Chart(document.getElementById("graficoLinha"), {
    type: "line",
    data: {
      labels: evolucao.map(e => e.dia),
      datasets: [{ label: "Saldo", data: evolucao.map(e => e.saldo) }]
    }
  });
}

// ================= ATUALIZAR =================
function atualizar() {
  lista.innerHTML = "";
  rankingEl.innerHTML = "";

  let entradas = 0, saidas = 0;
  let mapaCategoria = {};
  let saldo = 0;
  let evolucao = [];

  const atual = dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() == mesFiltro.value && dt.getFullYear() == anoFiltro.value;
  });

  atual.sort((a, b) => new Date(a.data) - new Date(b.data));

  atual.forEach(d => {
    if (d.tipo === "entrada") entradas += d.valor;
    else {
      saidas += d.valor;
      mapaCategoria[d.categoria] = (mapaCategoria[d.categoria] || 0) + d.valor;
    }

    saldo += d.tipo === "entrada" ? d.valor : -d.valor;
    evolucao.push({ dia: d.data.split("-")[2], saldo });

    const li = document.createElement("li");
    li.innerHTML = `${d.desc} - R$ ${d.valor} <button onclick="excluir(${d.id})">🗑️</button>`;
    lista.appendChild(li);
  });

  totalEntradas.textContent = entradas;
  totalSaidas.textContent = saidas;
  saldoEl.textContent = entradas - saidas;
  percentual.textContent = entradas ? ((saidas / entradas) * 100).toFixed(1) : 0;

  atualizarGraficos(entradas, saidas, mapaCategoria, evolucao);

  Object.entries(mapaCategoria)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, v]) => {
      const li = document.createElement("li");
      li.textContent = `${c}: R$ ${v.toFixed(2)}`;
      rankingEl.appendChild(li);
    });
}

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

atualizar();
