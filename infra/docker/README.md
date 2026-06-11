# Docker Infrastructure - Navi

Este diretório contém configurações para execução local simplificada utilizando Docker.

## Estrutura

* `docker-compose.yml`: Define os serviços de banco de dados PostgreSQL (`db`) e backend em Rails (`api`).

## Como utilizar

Para subir o banco de dados PostgreSQL local rapidamente via Docker:

```bash
# Navegue para a pasta de infra/docker
cd infra/docker

# Inicie apenas o banco de dados em segundo plano (background)
docker-compose up -d db
```

Se desejar executar toda a stack Rails + PostgreSQL via Docker:

```bash
# Inicie todos os serviços
docker-compose up --build
```

O backend estará acessível em `http://localhost:3000`.
