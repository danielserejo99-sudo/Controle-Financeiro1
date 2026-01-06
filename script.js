let dados = JSON.parse(localStorage.getItem("dados")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || {};
let categorias = ["Geral", "Alimentação", "Moradia", "Transporte", "Lazer"];

const lista = document.getElementById("lista");
const categoriaSelect = document.getElementById("categoria");
const rankingEl = document.getElementById("ranking");

const mesFiltro = document.getElementById("mesFiltro");
const anoFiltro = document.getElementById("anoFiltro");

categorias.forEach(c => categoriaSelect.innerHTML += `<option>${c}</option>`);

// FILTRO DATA
const hoje = new Date();
for (let m = 0; m < 12; m++) mesFiltro.innerHTML += `<option value="${m}">${m + 1}</option>`;
for (let a = hoje.getFullYear() - 1; a <= hoje.getFullYear() + 1; a++) anoFiltro.innerHTML += `<option>${a}</option>`;
mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// LANÇAMENTO
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

// METAS
function salvarMetas() {
  metas.gasto = Number(metaGasto.value);
  localStorage.setItem("metas", JSON.stringify(metas));
  atualizar();
}
window.salvarMetas = salvarMetas;

// EDITAR / EXCLUIR
function excluir(id) {
  dados = dados.filter(d => d.id !== id);
  salvar();
}
window.excluir = excluir;

// ATUALIZAR
function atualizar() {
  lista.innerHTML = "";
  rankingEl.innerHTML = "";

  let entradas = 0, saidas = 0;
  let mapa = {};

  const atual = dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() == mesFiltro.value && dt.getFullYear() == anoFiltro.value;
  });

  atual.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${d.desc} - R$ ${d.valor}
      <button onclick="excluir(${d.id})">🗑️</button>
    `;
    lista.appendChild(li);

    if (d.tipo === "entrada") entradas += d.valor;
    else {
      saidas += d.valor;
      mapa[d.categoria] = (mapa[d.categoria] || 0) + d.valor;
    }
  });

  totalEntradas.textContent = entradas;
  totalSaidas.textContent = saidas;
  saldo.textContent = entradas - saidas;
  percentual.textContent = entradas ? ((saidas / entradas) * 100).toFixed(1) : 0;

  if (metas.gasto) {
    barraMeta.style.width = Math.min((saidas / metas.gasto) * 100, 100) + "%";
  }

  Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, v]) => {
      const li = document.createElement("li");
      li.textContent = `${c}: R$ ${v}`;
      rankingEl.appendChild(li);
    });
}

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

atualizar();
