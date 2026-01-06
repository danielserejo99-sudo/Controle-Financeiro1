let dados = JSON.parse(localStorage.getItem("dados")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || {};

const hoje = new Date();
const mesFiltro = document.getElementById("mesFiltro");
const anoFiltro = document.getElementById("anoFiltro");

for (let m = 0; m < 12; m++) {
  mesFiltro.innerHTML += `<option value="${m}">${new Date(0,m).toLocaleString("pt-BR",{month:"long"})}</option>`;
}
for (let a = hoje.getFullYear()-1; a <= hoje.getFullYear()+1; a++) {
  anoFiltro.innerHTML += `<option value="${a}">${a}</option>`;
}

mesFiltro.value = hoje.getMonth();
anoFiltro.value = hoje.getFullYear();

mesFiltro.onchange = atualizar;
anoFiltro.onchange = atualizar;

function salvarMetas() {
  metas = {
    gasto: Number(metaGasto.value),
    economia: Number(metaEconomia.value)
  };
  localStorage.setItem("metas", JSON.stringify(metas));
  atualizar();
}

function filtrarDados(m, a) {
  return dados.filter(d => {
    const dt = new Date(d.data);
    return dt.getMonth()==m && dt.getFullYear()==a;
  });
}

let graficoComparacao, graficoCategoria;

function atualizar() {
  const atual = filtrarDados(mesFiltro.value, anoFiltro.value);
  const anterior = filtrarDados(mesFiltro.value-1, anoFiltro.value);

  let entrada=0, saida=0, previsto=0, categorias={};

  atual.forEach(d=>{
    if(d.tipo=="entrada") entrada+=d.valor;
    else saida+=d.valor;

    if(d.status=="previsto") previsto+=d.valor;

    if(d.tipo=="saida")
      categorias[d.categoria]=(categorias[d.categoria]||0)+d.valor;
  });

  saldoDashboard.textContent=(entrada-saida).toFixed(2);
  gastosDashboard.textContent=saida.toFixed(2);
  previsaoDashboard.textContent=previsto.toFixed(2);
  percentualRenda.textContent=entrada?((saida/entrada)*100).toFixed(1):0;

  if(metas.gasto){
    barraGasto.style.width=Math.min((saida/metas.gasto)*100,100)+"%";
  }

  // Gráfico comparação
  let eAnt=0,sAnt=0;
  anterior.forEach(d=>{
    d.tipo=="entrada"?eAnt+=d.valor:sAnt+=d.valor;
  });

  if(graficoComparacao) graficoComparacao.destroy();
  graficoComparacao=new Chart(graficoComparacao,{
    type:"bar",
    data:{
      labels:["Mês Anterior","Mês Atual"],
      datasets:[
        {label:"Entradas",data:[eAnt,entrada]},
        {label:"Saídas",data:[sAnt,saida]}
      ]
    }
  });

  if(graficoCategoria) graficoCategoria.destroy();
  graficoCategoria=new Chart(graficoCategoria,{
    type:"pie",
    data:{labels:Object.keys(categorias),datasets:[{data:Object.values(categorias)}]}
  });
}

const descricao = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const tipoSelect = document.getElementById("tipo");
const statusSelect = document.getElementById("status");
const categoriaSelect = document.getElementById("categoria");

// Categorias básicas (se ainda não existir)
let categorias = JSON.parse(localStorage.getItem("categorias")) || ["Geral"];
categoriaSelect.innerHTML = categorias.map(c => `<option>${c}</option>`).join("");

function adicionarLancamento() {
  if (!descricao.value || !valorInput.value || !dataInput.value) {
    alert("Preencha descrição, valor e data");
    return;
  }

  dados.push({
    desc: descricao.value,
    valor: Number(valorInput.value),
    data: dataInput.value,
    tipo: tipoSelect.value,
    status: statusSelect.value,
    categoria: categoriaSelect.value
  });

  localStorage.setItem("dados", JSON.stringify(dados));

  descricao.value = "";
  valorInput.value = "";
  atualizar();
}

atualizar();
