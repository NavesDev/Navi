# Google Cloud Deployment Guide - Navi

This directory stores scripts, documentations, and configurations related to provisioning and deployment on **Google Cloud Platform (GCP)**.

The Navi backend architecture runs a containerized Rails API instance continuously on a **Compute Engine** virtual machine (VM).

---

## 1. VM Provisioning in Compute Engine

### Instance Recommendations (24/7)
* **Machine Family**: `e2-micro` (for initial testing, qualifies for Free Tier) or `e2-small` / `e2-medium` (recommended for production).
* **Operating System**: Ubuntu Server 22.04 LTS or Debian 12.
* **Disk**: 20GB to 50GB SSD (Balanced Persistent Disk).

### Provision VM (via gcloud CLI)
```bash
gcloud compute instances create navi-api-production \
    --project="YOUR_GCP_PROJECT" \
    --zone="us-central1-a" \
    --machine-type="e2-small" \
    --image-family="ubuntu-2204-lts" \
    --image-project="ubuntu-os-cloud" \
    --boot-disk-size="30GB" \
    --boot-disk-type="pd-balanced" \
    --tags=http-server,https-server \
    --address="RESERVED_STATIC_IP_ADDRESS"
```

---

## 2. Firewall and Networking
To allow external API access, expose HTTP and HTTPS ports on the VM.

1. **Static IP**: Reserve a static external IP address in the GCP console (`VPC Network > External IP addresses`) to ensure the VM's IP doesn't change when restarted.
2. **Firewall Rules**: Ensure that the `http-server` (port 80) and `https-server` (port 443) tags are active and allowed.

---

## 3. Deployment Strategy: Kamal (Rails 8 Default)

Rails 8 is natively configured with **Kamal** for direct containerized deployments onto bare VMs without the need for a PaaS (like Heroku). Kamal deploys Docker images via SSH and configures the web server with built-in SSL.

### Deployment Steps with Kamal:

1. **Set secrets** in `services/api/.kamal/secrets` (this file is in `.gitignore`):
   ```bash
   KAMAL_REGISTRY_PASSWORD="your-docker-registry-password"
   API_DATABASE_PASSWORD="your-production-db-password"
   DATABASE_URL="postgres://user:password@neon-host/db_name?sslmode=require"
   ```
2. **Configure deploy settings** in `services/api/config/deploy.yml` with your reserved external IP and Docker repository.
3. **Run initial setup** from the `services/api` directory:
   ```bash
   # Configures the VM and performs the first deploy
   kamal setup
   ```
4. **Subsequent deployments**:
   ```bash
   kamal deploy
   ```
