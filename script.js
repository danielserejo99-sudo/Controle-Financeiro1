// ================= DADOS =================
let dados = JSON.parse(localStorage.getItem("dados")) || [];

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

// ================= FILTROS =================
const hoje = new Date();
mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// ================= ADICIONAR =================
document.getElementById("btnAdicionar").addEventListener("click", () => {
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
});

// ================= EVENT DELEGATION =================
lista.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = Number(btn.dataset.id);

  if (btn.classList.contains("editar")) editarLancamento(id);
  if (btn.classList.contains("excluir")) excluirLancamento(id);
});

// ================= EDITAR =================
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

// ================= EXCLUIR =================
function excluirLancamento(id) {
  if (!confirm("Deseja excluir este lançamento?")) return;
  dados = dados.filter(d => d.id !== id);
  salvar();
}

// ================= GRÁFICOS =================
let gCategoria, gResumo;

function atualizarGraficos(entradas, saidas, mapa) {

  if (gCategoria) gCategoria.destroy();
  gCategoria = new Chart(document.getElementById("graficoCategoria"), {
    type: "doughnut",
    data: {
      labels: Object.keys(mapa),
      datasets: [{ data: Object.values(mapa) }]
    },
    options: {
      cutout: "70%"
    }
  });

  if (gResumo) gResumo.destroy();
  gResumo = new Chart(document.getElementById("graficoResumo"), {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{ data: [entradas, saidas] }]
    }
  });
}

// ================= ATUALIZAR =================
function atualizar() {
  lista.innerHTML = "";

  let entradas = 0, saidas = 0;
  let categorias = {};

  const filtrados = dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() == mesFiltro.value && dt.getFullYear() == anoFiltro.value;
  });

  filtrados.forEach(d => {
    if (d.tipo === "entrada") entradas += d.valor;
    else {
      saidas += d.valor;
      categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
    }

    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <span>${d.desc}</span>
      <strong>R$ ${d.valor.toFixed(2)}</strong>
      <button class="editar" data-id="${d.id}">✏️</button>
      <button class="excluir" data-id="${d.id}">🗑️</button>
    `;
    lista.appendChild(li);
  });

  totalEntradas.textContent = entradas.toFixed(2);
  totalSaidas.textContent = saidas.toFixed(2);
  saldoEl.textContent = (entradas - saidas).toFixed(2);
  percentual.textContent = entradas ? ((saidas / entradas) * 100).toFixed(1) : 0;

  atualizarGraficos(entradas, saidas, categorias);
}

// ================= SALVAR =================
function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

atualizar();

// ================= PATCH EDITAR / EXCLUIR =================
document.addEventListener("click", function (e) {

  // EDITAR
  if (e.target.closest(".btn-editar")) {
    const id = e.target.closest(".btn-editar").dataset.id;
    const item = dados.find(d => d.id == id);
    if (!item) return;

    descricao.value = item.desc;
    valor.value = item.valor;
    data.value = item.data;
    tipo.value = item.tipo;
    categoria.value = item.categoria;

    dados = dados.filter(d => d.id != id);
    salvar();
  }

  // EXCLUIR
  if (e.target.closest(".btn-excluir")) {
    const id = e.target.closest(".btn-excluir").dataset.id;
    if (!confirm("Deseja excluir este lançamento?")) return;

    dados = dados.filter(d => d.id != id);
    salvar();
  }

});
