let dados = JSON.parse(localStorage.getItem("dados")) || [];
let categorias = JSON.parse(localStorage.getItem("categorias")) || ["Geral"];

const hoje = new Date();

// ====== FILTROS ======
const mesFiltro = document.getElementById("mesFiltro");
const anoFiltro = document.getElementById("anoFiltro");

for (let m = 0; m < 12; m++) {
  const opt = document.createElement("option");
  opt.value = m;
  opt.textContent = new Date(0, m).toLocaleString("pt-BR", { month: "long" });
  mesFiltro.appendChild(opt);
}
for (let a = hoje.getFullYear() - 2; a <= hoje.getFullYear() + 2; a++) {
  const opt = document.createElement("option");
  opt.value = a;
  opt.textContent = a;
  anoFiltro.appendChild(opt);
}

mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

// ====== LANÇAMENTO ======
function adicionarLancamento() {
  const item = {
    desc: descricao.value,
    valor: Number(valorInput.value),
    tipo: tipoSelect.value,
    categoria: categoriaSelect.value,
    data: dataInput.value,
    status: statusSelect.value
  };

  dados.push(item);
  salvar();
}

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
  atualizar();
}

// ====== FILTRAGEM ======
function dadosFiltrados() {
  return dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth() == mesFiltro.value &&
           dt.getFullYear() == anoFiltro.value;
  });
}

// ====== ATUALIZAÇÃO ======
let graficoResumo, graficoCategoria, graficoPrevisto;

function atualizar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let entrada = 0, saida = 0;
  let previstoEntrada = 0, previstoSaida = 0;
  let categoriasMapa = {};

  dadosFiltrados().forEach((d, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${d.desc} - R$ ${d.valor.toFixed(2)} (${d.categoria})
      <button onclick="editar(${i})">✏️</button>
    `;
    lista.appendChild(li);

    if (d.status === "real") {
      d.tipo === "entrada" ? entrada += d.valor : saida += d.valor;
    } else {
      d.tipo === "entrada" ? previstoEntrada += d.valor : previstoSaida += d.valor;
    }

    if (d.tipo === "saida") {
      categoriasMapa[d.categoria] = (categoriasMapa[d.categoria] || 0) + d.valor;
    }
  });

  entradaSpan.textContent = entrada.toFixed(2);
  saidaSpan.textContent = saida.toFixed(2);
  saldoSpan.textContent = (entrada - saida).toFixed(2);

  gerarGraficos(entrada, saida, previstoEntrada, previstoSaida, categoriasMapa);
}

// ====== GRÁFICOS ======
function gerarGraficos(e, s, pe, ps, cat) {
  if (graficoResumo) graficoResumo.destroy();
  graficoResumo = new Chart(graficoResumoEl, {
    type: "doughnut",
    data: { labels: ["Gastos", "Disponível"], datasets: [{ data: [s, e - s] }] }
  });

  if (graficoPrevisto) graficoPrevisto.destroy();
  graficoPrevisto = new Chart(graficoPrevistoEl, {
    type: "bar",
    data: {
      labels: ["Previsto"],
      datasets: [
        { label: "Ganhar", data: [pe] },
        { label: "Gastar", data: [ps] }
      ]
    }
  });

  if (graficoCategoria) graficoCategoria.destroy();
  graficoCategoria = new Chart(graficoCategoriaEl, {
    type: "pie",
    data: {
      labels: Object.keys(cat),
      datasets: [{ data: Object.values(cat) }]
    }
  });
}

// ====== EDITAR ======
function editar(index) {
  const d = dados[index];
  descricao.value = d.desc;
  valorInput.value = d.valor;
  dataInput.value = d.data;
  statusSelect.value = d.status;
  dados.splice(index, 1);
  salvar();
}

// ====== EXPORTAÇÃO ======
function exportarCSV() {
  let csv = "Descrição,Valor,Tipo,Categoria,Data,Status\n";
  dados.forEach(d => {
    csv += `${d.desc},${d.valor},${d.tipo},${d.categoria},${d.data},${d.status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "financeiro.csv";
  a.click();
}

atualizar();
