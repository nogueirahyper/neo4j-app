const formFilme = document.getElementById('formFilme');
const formAtor = document.getElementById('formAtor');
const formDetalhes = document.getElementById('formDetalhes');
const filmesList = document.getElementById('filmesList');

formFilme.addEventListener('submit', async (event) => {
  event.preventDefault();
  const titulo = document.getElementById('titulo').value;
  const ano = document.getElementById('ano').value;
  await fetch('/filmes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, ano }),
  });
  location.reload();
});

formAtor.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nome = document.getElementById('nomeAtor').value;
  const idFilme = document.getElementById('idFilme').value;
  await fetch(`/filmes/${idFilme}/atores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  location.reload();
});

formDetalhes.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = document.getElementById('idDetalhes').value;
  const response = await fetch(`/filmes/${id}`);
  const filme = await response.json();
  alert(`Detalhes do Filme:\nTítulo: ${filme.titulo}\nAno: ${filme.ano}`);
});

async function carregarFilmes() {
  const response = await fetch('/filmes');
  const filmes = await response.json();
  filmes.forEach(filme => {
    const li = document.createElement('li');
    li.textContent = `${filme.titulo} (${filme.ano})`;
    filmesList.appendChild(li);
  });
}

carregarFilmes();
