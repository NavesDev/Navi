#!/bin/bash

# Cores para o output do terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

show_help() {
    echo -e "${BLUE}=== Script de Inicialização - Navi ===${NC}"
    echo "Uso: ./navi.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  db       - Inicia apenas o container do banco de dados (PostgreSQL)"
    echo "  backend  - Garante o banco iniciado e inicia o backend Rails (pnpm dev:api)"
    echo "  app      - Garante o banco iniciado e inicia o aplicativo Expo Mobile (pnpm dev:mobile)"
    echo "  all      - Garante o banco iniciado e inicia o backend e o app em paralelo"
    echo "  help     - Mostra esta tela de ajuda"
    echo ""
    echo "Se nenhum comando for fornecido, a ajuda será exibida."
}

start_db() {
    echo -e "${YELLOW}Iniciando banco de dados PostgreSQL no Docker...${NC}"
    docker compose -f ./infra/docker/docker-compose.yml up -d db
    echo -e "${GREEN}Banco de dados online!${NC}"
}

case "$1" in
    db)
        start_db
        ;;
    backend)
        start_db
        echo -e "${YELLOW}Iniciando backend Rails em: http://localhost:3000${NC}"
        pnpm dev:api
        ;;
    app|mobile)
        start_db
        echo -e "${YELLOW}Iniciando aplicativo Expo Mobile (Metro Bundler)...${NC}"
        pnpm dev:mobile
        ;;
    all)
        start_db
        echo -e "${YELLOW}Iniciando Backend e Mobile App simultaneamente...${NC}"
        # Roda o backend e o mobile app concorrentemente no terminal
        # Redireciona interrupções (Ctrl+C) de forma limpa
        trap 'kill 0' EXIT
        pnpm dev:api &
        pnpm dev:mobile &
        wait
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Erro: Comando '$1' inválido.${NC}"
        show_help
        exit 1
        ;;
esac
