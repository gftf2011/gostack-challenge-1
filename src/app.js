const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

const validateUuid = (request, response, next) => {
  const { id } = request.params;
  if (!id) {
    return response.status(400).json();
  }
  if (!isUuid(id)) {
    return response.status(400).json();
  }
  return next();
}

const repositoryExists = (request, response, next) => {
  const { id } = request.params;
  const index = repositories.findIndex(repository => (repository.id === id));
  if (index < 0) {
    return response.status(400).json()
  }
  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const newRepository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };
  repositories.push(newRepository);
  
  return response.status(201).json(newRepository);
});

app.put("/repositories/:id", validateUuid, repositoryExists, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const index = repositories.findIndex(repository => (repository.id === id));
  
  repositories[index] = {
    ...repositories[index],
    title,
    url,
    techs,
  };

  return response.json(repositories[index]);
});

app.delete("/repositories/:id", validateUuid, repositoryExists, (request, response) => {
  const { id } = request.params;
  const index = repositories.findIndex(repository => (repository.id === id));
  repositories.splice(index, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", validateUuid, repositoryExists, (request, response) => {
  const { id } = request.params;
  repositories.forEach(repository => {
    if (repository.id === id) {
      repository.likes++;
    }
  });
  const index = repositories.findIndex(repository => (repository.id === id));
  
  const { likes } = repositories[index];

  return response.json({ likes });
});

module.exports = app;