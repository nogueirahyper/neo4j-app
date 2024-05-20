// Importação dos módulos necessários
const express = require('express'); // Framework web para Node.js
const neo4j = require('neo4j-driver'); // Driver para se comunicar com o banco de dados Neo4j
const cors = require('cors'); // Middleware para permitir requisições de diferentes origens
const path = require('path'); // Utilitário para lidar com caminhos de arquivos

// Criação de uma instância do aplicativo Express
const app = express();
const port = 3000; // Porta na qual o servidor será executado

// Middlewares para lidar com dados JSON e requisições de origens diferentes
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos na pasta 'public'

// Configuração do driver do Neo4j para se conectar ao banco de dados
const driver = neo4j.driver(
  'bolt://localhost:7687', // URL de conexão com o servidor Neo4j
  neo4j.auth.basic('neo4j', 'mw91391398'), // Credenciais de autenticação (substitua 'your_password_here' pela sua senha)
  {
    encrypted: 'ENCRYPTION_OFF', // Desativa a criptografia (para desenvolvimento)
   
    maxConnectionPoolSize: 50, // Número máximo de conexões no pool: 50
    connectionAcquisitionTimeout: 2 * 60 * 1000, // Tempo máximo para adquirir uma conexão: 2 minutos
  }
);

// Rota para testar a conexão com o banco de dados Neo4j
app.get('/test-connection', async (req, res) => {
  try {
    const session = driver.session();
    const result = await session.run('RETURN 1');
    await session.close();
    res.send('Conexão com o banco de dados Neo4j estabelecida com sucesso.');
  } catch (error) {
    res.status(500).send('Falha na conexão com o banco de dados Neo4j: ' + error.message);
  }
});

// Rota para obter todos os filmes do banco de dados
app.get('/filmes', async (req, res) => {
  try {
    const session = driver.session();
    const result = await session.run('MATCH (filme:Filme) RETURN filme');
    const filmes = result.records.map(record => record.get('filme').properties);
    await session.close();
    res.json(filmes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para adicionar um novo filme ao banco de dados
app.post('/filmes', async (req, res) => {
  const { titulo, ano } = req.body;
  try {
    const session = driver.session();
    await session.run('CREATE (:Filme {titulo: $titulo, ano: $ano})', { titulo, ano });
    await session.close();
    res.status(201).send('Filme adicionado com sucesso.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para adicionar um ator a um filme específico
app.post('/filmes/:id/atores', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const session = driver.session();
    await session.run(
      'MATCH (filme:Filme) WHERE ID(filme) = $id ' +
      'MERGE (ator:Ator {nome: $nome}) ' +
      'MERGE (ator)-[:ATUOU_EM]->(filme)',
      { id: parseInt(id), nome }
    );
    await session.close();
    res.status(201).send('Ator adicionado ao filme com sucesso.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para obter detalhes de um filme específico
app.get('/filmes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const session = driver.session();
    const result = await session.run('MATCH (filme:Filme) WHERE ID(filme) = $id RETURN filme', { id: parseInt(id) });
    const filme = result.records[0]?.get('filme')?.properties;
    await session.close();
    if (filme) {
      res.json(filme);
    } else {
      res.status(404).send('Filme não encontrado.');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});