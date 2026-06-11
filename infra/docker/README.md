# Docker Infrastructure - Navi

This directory contains configurations for simplified local environment execution using Docker.

## Structure

* `docker-compose.yml`: Defines the PostgreSQL database (`db`) and Rails backend (`api`) services.

## How to Use

To spin up only the local PostgreSQL database instance quickly:

```bash
# Navigate to the infra/docker folder
cd infra/docker

# Start only the database service in the background
docker compose up -d db
```

If you prefer to run the entire backend stack (Rails API + PostgreSQL 18) via Docker:

```bash
# Start all services
docker compose up --build
```

The Rails backend API will be accessible at `http://localhost:3000`.
