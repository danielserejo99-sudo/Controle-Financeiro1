// ================= ESTADO =================
let dados = JSON.parse(localStorage.getItem("dados")) || [];
let categorias = ["Geral", "Alimentação", "Moradia", "Transporte", "Lazer"];

// ================= ELEMENTOS =================
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

// ================= SELECTS =================
categoria.innerHTML = "";
categorias.forEach(c => categoria.innerHTML += `<option>${c}</option>`);

const hoje = new Date();
for (let m = 0; m < 12; m++) mesFiltro.innerHTML += `<option value="${m}">${m + 1}</option>`;
for (let a = hoje.getFullYear() - 1; a <= hoje.getFullYear() + 1; a++) anoFiltro.innerHTML += `<option>${a}</option>`;
mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// ================= ADICIONAR =================
document.getElementById("btnAdicionar").onclick = () => {
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

  salvar();
  descricao.value = "";
  valor.value = "";
};

// ================= EDITAR / EXCLUIR =================
function editarLancamento(id) {
  const l = dados.find(d => d.id === id);
  if (!l) return;

  descricao.value = l.desc;
  valor.value = l.valor;
  data.value = l.data;
  tipo.value = l.tipo;
  categoria.value = l.categoria;

  dados = dados.filter(d => d.id !== id);
  salvar();
}

function excluirLancamento(id) {
  if (!confirm("Deseja excluir este lançamento?")) return;
  dados = dados.filter(d => d.id !== id);
  salvar();
}

window.editarLancamento = editarLancamento;
window.excluirLancamento = excluirLancamento;

// ================= GRÁFICOS =================
let graficoCategoria, graficoResumo, graficoLinha;

function atualizarGraficos(entradas, saidas, categoriasMapa, evolucao) {

  if (graficoCategoria) graficoCategoria.destroy();
  graficoCategoria = new Chart(document.getElementById("graficoCategoria"), {
    type: "pie",
    data: {
      labels: Object.keys(categoriasMapa),
      datasets: [{ data: Object.values(categoriasMapa) }]
    }
  });

  if (graficoResumo) graficoResumo.destroy();
  graficoResumo = new Chart(document.getElementById("graficoResumo"), {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{ data: [entradas, saidas] }]
    }
  });

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

  let entradas = 0, saidas = 0, saldo = 0;
  let categoriasMapa = {};
  let evolucao = [];

  const atual = dados
    .filter(d => {
      const dt = new Date(d.data);
      return dt.getMonth() == mesFiltro.value && dt.getFullYear() == anoFiltro.value;
    })
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  atual.forEach(d => {
    if (d.tipo === "entrada") entradas += d.valor;
    else {
      saidas += d.valor;
      categoriasMapa[d.categoria] = (categoriasMapa[d.categoria] || 0) + d.valor;
    }

    saldo += d.tipo === "entrada" ? d.valor : -d.valor;
    evolucao.push({ dia: d.data.split("-")[2], saldo });

    const li = document.createElement("li");
    li.innerHTML = `
      ${d.desc} - R$ ${d.valor.toFixed(2)}
      <button onclick="editarLancamento(${d.id})">✏️</button>
      <button onclick="excluirLancamento(${d.id})">🗑️</button>
    `;
    lista.appendChild(li);
  });

  totalEntradas.textContent = entradas.toFixed(2);
  totalSaidas.textContent = saidas.toFixed(2);
  saldoEl.textContent = (entradas - saidas).toFixed(2);
  percentual.textContent = entradas ? ((saidas / entradas) * 100).toFixed(1) : 0;

  atualizarGraficos(entradas, saidas, categoriasMapa, evolucao);
}

// ================= SALVAR =================
function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

atualizar();
