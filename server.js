const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');

const c = cors();
const app = express();
const port = 3000;

app.use(express.json());

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('Deus', 'uscs1234'));

app.get('/filmes', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (filme:Filme) RETURN filme');
    const filmes = result.records.map(record => record.get('filme').properties);
    res.json(filmes);
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.post('/filmes', async (req, res) => {
  const { titulo, ano } = req.body;
  const session = driver.session();
  try {
    const result = await session.run('CREATE (:Filme {titulo: $titulo, ano: $ano})', { titulo, ano });
    res.status(201).send('Filme adicionado com sucesso.');
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.post('/filmes/:id/atores', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (filme:Filme) WHERE ID(filme) = $id ' +
      'MERGE (ator:Ator {nome: $nome}) ' +
      'MERGE (ator)-[:ATUOU_EM]->(filme)',
      { id: parseInt(id), nome }
    );
    res.status(201).send('Ator adicionado ao filme com sucesso.');
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.get('/filmes/:id', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();
  try {
    const result = await session.run('MATCH (filme:Filme) WHERE ID(filme) = $id RETURN filme', { id: parseInt(id) });
    const filme = result.records[0]?.get('filme')?.properties;
    if (filme) {
      res.json(filme);
    } else {
      res.status(404).send('Filme não encontrado.');
    }
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
