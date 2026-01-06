// ================== ESTADO ==================
let dados = JSON.parse(localStorage.getItem("dados")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || {};
let categorias = JSON.parse(localStorage.getItem("categorias")) || ["Geral"];

// ================== ELEMENTOS ==================
const descricao = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const tipoSelect = document.getElementById("tipo");
const statusSelect = document.getElementById("status");
const categoriaSelect = document.getElementById("categoria");

const mesFiltro = document.getElementById("mesFiltro");
const anoFiltro = document.getElementById("anoFiltro");

const lista = document.getElementById("lista");
const rankingEl = document.getElementById("ranking");

// ================== FILTROS ==================
const hoje = new Date();

for (let m = 0; m < 12; m++) {
  mesFiltro.innerHTML += `<option value="${m}">${new Date(0, m).toLocaleString("pt-BR", { month: "long" })}</option>`;
}
for (let a = hoje.getFullYear() - 1; a <= hoje.getFullYear() + 1; a++) {
  anoFiltro.innerHTML += `<option value="${a}">${a}</option>`;
}

mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// ================== CATEGORIAS ==================
function carregarCategorias() {
  categoriaSelect.innerHTML = "";
  categorias.forEach(c => categoriaSelect.innerHTML += `<option>${c}</option>`);
}
carregarCategorias();

// ================== LANÇAMENTO ==================
function adicionarLancamento() {
  if (!descricao.value || !valorInput.value || !dataInput.value) {
    alert("Preencha descrição, valor e data");
    return;
  }

  dados.push({
    id: Date.now(),
    desc: descricao.value,
    valor: Number(valorInput.value),
    data: dataInput.value,
    tipo: tipoSelect.value,
    status: statusSelect.value,
    categoria: categoriaSelect.value,
    recorrente: false
  });

  salvar();
  descricao.value = "";
  valorInput.value = "";
}

window.adicionarLancamento = adicionarLancamento;

// ================== EDITAR / EXCLUIR ==================
function excluirLancamento(id) {
  if (!confirm("Excluir este lançamento?")) return;
  dados = dados.filter(d => d.id !== id);
  salvar();
}

function editarLancamento(id) {
  const l = dados.find(d => d.id === id);
  descricao.value = l.desc;
  valorInput.value = l.valor;
  dataInput.value = l.data;
  tipoSelect.value = l.tipo;
  statusSelect.value = l.status;
  categoriaSelect.value = l.categoria;

  excluirLancamento(id);
}

window.excluirLancamento = excluirLancamento;
window.editarLancamento = editarLancamento;

// ================== RECORRÊNCIA ==================
function aplicarRecorrentes() {
  const mesAtual = Number(mesFiltro.value);
  const anoAtual = Number(anoFiltro.value);

  dados.forEach(d => {
    if (d.recorrente) {
      const dt = new Date(d.data);
      if (dt.getMonth() !== mesAtual || dt.getFullYear() !== anoAtual) {
        dados.push({
          ...d,
          id: Date.now() + Math.random(),
          data: `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-05`
        });
      }
    }
  });
}

// ================== FILTRAGEM ==================
function dadosDoMes(m, a) {
  return dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() === Number(m) && dt.getFullYear() === Number(a);
  });
}

// ================== ATUALIZAÇÃO ==================
function atualizar() {
  aplicarRecorrentes();
  const atual = dadosDoMes(mesFiltro.value, anoFiltro.value);

  lista.innerHTML = "";
  rankingEl.innerHTML = "";

  let ranking = {};

  atual.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${d.desc} - R$ ${d.valor.toFixed(2)} (${d.categoria})
      <button onclick="editarLancamento(${d.id})">✏️</button>
      <button onclick="excluirLancamento(${d.id})">🗑️</button>
    `;
    lista.appendChild(li);

    if (d.tipo === "saida") {
      ranking[d.categoria] = (ranking[d.categoria] || 0) + d.valor;
    }
  });

  Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, val]) => {
      const li = document.createElement("li");
      li.textContent = `${cat}: R$ ${val.toFixed(2)}`;
      rankingEl.appendChild(li);
    });
}

// ================== SALVAR ==================
function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

atualizar();
