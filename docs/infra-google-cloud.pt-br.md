# Google Cloud Deployment Guide - Navi

Este diretório armazena scripts, documentações e configurações relacionadas ao provisionamento e implantação no **Google Cloud Platform (GCP)**.

A arquitetura do backend do Navi consiste em executar uma instância Rails API conteinerizada de forma contínua em uma máquina virtual (VM) no **Compute Engine**.

---

## 1. Setup da VM no Compute Engine

### Recomendação de Instância (24/7)
* **Família de Máquina**: `e2-micro` (para testes iniciais, qualificada no Free Tier) ou `e2-small` / `e2-medium` (recomendado para produção inicial).
* **Sistema Operacional**: Ubuntu Server 22.04 LTS ou Debian 12.
* **Disco**: 20GB a 50GB SSD (Balanced Persistent Disk).

### Provisionamento da VM (via gcloud CLI)
```bash
gcloud compute instances create navi-api-production \
    --project="SEU_PROJETO_GCP" \
    --zone="us-central1-a" \
    --machine-type="e2-small" \
    --image-family="ubuntu-2204-lts" \
    --image-project="ubuntu-os-cloud" \
    --boot-disk-size="30GB" \
    --boot-disk-type="pd-balanced" \
    --tags=http-server,https-server \
    --address="ENDERECO_IP_ESTATICO_RESERVADO"
```

---

## 2. Firewall e Rede
Para permitir acesso à API externa, você deve expor as portas HTTP e HTTPS na VM.

1. **IP Estático**: Reserve um IP externo estático no GCP console (`Rede VPC > Endereços IP externos`) para garantir que o IP da VM não mude ao reiniciar.
2. **Regras de Firewall**: Garanta que as tags `http-server` (porta 80) e `https-server` (porta 443) estão ativas e permitidas.

---

## 3. Estratégia de Deploy: Kamal (Padrão Rails 8)

O Rails 8 vem configurado nativamente com o **Kamal** para deploys direto em VMs limpas sem necessidade de PaaS (como Heroku). O Kamal envia imagens Docker via SSH e configura o servidor web automaticamente com SSL embutido.

### Passos de Deploy com Kamal:

1. **Configurar as credenciais** em `services/api/.kamal/secrets` (este arquivo está no `.gitignore`):
   ```bash
   KAMAL_REGISTRY_PASSWORD="sua-senha-do-docker-registry"
   API_DATABASE_PASSWORD="sua-senha-db-producao"
   DATABASE_URL="postgres://usuario:senha@neon-host/db_name?sslmode=require"
   ```
2. **Configurar o deploy** em `services/api/config/deploy.yml` com o IP externo reservado e repositório Docker.
3. **Executar o setup inicial** a partir do diretório `services/api`:
   ```bash
   # Configura a VM e realiza o primeiro deploy
   kamal setup
   ```
4. **Próximos deploys**:
   ```bash
   kamal deploy
   ```
