let dados = JSON.parse(localStorage.getItem("financeiro")) || [];

const ctx = document.getElementById("grafico").getContext("2d");
let grafico;

function salvar() {
  localStorage.setItem("financeiro", JSON.stringify(dados));
}

function atualizar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let entrada = 0;
  let saida = 0;

  dados.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.descricao} - R$ ${item.valor}
      <button onclick="remover(${index})">X</button>
    `;
    lista.appendChild(li);

    if (item.tipo === "entrada") entrada += item.valor;
    else saida += item.valor;
  });

  document.getElementById("totalEntrada").innerText = entrada.toFixed(2);
  document.getElementById("totalSaida").innerText = saida.toFixed(2);
  document.getElementById("saldo").innerText = (entrada - saida).toFixed(2);

  gerarGrafico(entrada, saida);
  salvar();
}

function adicionar() {
  const descricao = document.getElementById("descricao").value;
  const valor = Number(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  const tipo = document.getElementById("tipo").value;

  if (!descricao || !valor) return alert("Preencha tudo");

  dados.push({ descricao, valor, categoria, tipo });
  atualizar();
}

function remover(index) {
  dados.splice(index, 1);
  atualizar();
}

function gerarGrafico(entrada, saida) {
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{
        data: [entrada, saida]
      }]
    }
  });
}

atualizar();
