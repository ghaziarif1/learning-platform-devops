# 🎓 Learning Platform — Master DevOps & Cloud M1

> Plateforme d'apprentissage en ligne basée sur une **architecture microservices**, intégrant une **IA Tutor locale** (Ollama), un **workflow automatisé de feedback** (n8n), et déployée avec **Docker Compose**.

![Architecture](docs/diagrams/uml-deployment.md)

---

## 📋 Table des Matières

- [Architecture](#architecture)
- [Microservices](#microservices)
- [Bases de données](#bases-de-données)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Tests API](#tests-api)
- [Diagrammes](#diagrammes)

---

## 🏗️ Architecture

```
Browser → Nginx (Port 80)
           ├── /              → Learning Portal (Next.js :3000)
           ├── /api/auth      → User Service (Node.js :8002)
           ├── /api/courses   → Course Service (FastAPI :8001)
           ├── /api/events    → Analytics Service (FastAPI :8003)
           ├── /api/chat      → AI Tutor Service (FastAPI :8004)
           └── /api/feedback  → Feedback Service (FastAPI :8005)
```

---

## 🔧 Microservices

| Service | Techno | Port | Rôle |
|---|---|---|---|
| **API Gateway** | Nginx | 80 | Reverse proxy, routage |
| **Learning Portal** | Next.js + shadcn/ui | 3000 | Interface utilisateur |
| **User Service** | Node.js/Express | 8002 | Auth JWT, profils, rôles |
| **Course Service** | FastAPI | 8001 | Cours, leçons, inscriptions |
| **Analytics Service** | FastAPI | 8003 | Vues, événements, dashboard |
| **AI Tutor Service** | FastAPI + Ollama | 8004 | Q&A, quiz, recommandations |
| **Feedback Service** | FastAPI | 8005 | Collecte et analyse feedbacks |
| **n8n Automation** | n8n | 5678 | Workflow feedback automatisé |

---

## 🗄️ Bases de données

| Base | Image | Port | Usage |
|---|---|---|---|
| **PostgreSQL** | postgres:16-alpine | 5432 | Cours, leçons, analytics |
| **MongoDB** | mongo:7.0 | 27017 | Utilisateurs, profils, feedbacks |
| **Redis** | redis:7-alpine | 6379 | Cache, sessions JWT |
| **MinIO** | minio/minio | 9000/9001 | Stockage médias |
| **Ollama** | ollama/ollama | 11434 | LLM local (tinyllama) |

---

## ✅ Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (avec WSL2)
- [Git](https://git-scm.com/)
- 8 GB RAM minimum (pour Ollama)
- 10 GB espace disque libre

---

## 🚀 Installation

### 1. Cloner le repo

```bash
git clone https://github.com/TON_USERNAME/learning-platform-devops.git
cd learning-platform-devops
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Édite .env si nécessaire
```

### 3. Lancer toute l'infrastructure

```bash
docker compose up -d
```

### 4. Télécharger le modèle IA (première fois seulement)

```bash
docker exec lp_ollama ollama pull tinyllama
```

### 5. Importer le workflow n8n

1. Ouvre http://localhost:5678
2. Login : `admin` / `admin123`
3. Import → `services/n8n-automation/workflows/feedback_workflow.json`
4. Activer le workflow

### 6. Ouvrir l'application

| URL | Description |
|---|---|
| http://localhost | 🎓 Learning Portal |
| http://localhost:5678 | ⚙️ n8n Automation |
| http://localhost:9001 | 📦 MinIO Console |
| http://localhost:8001/docs | 📚 Course API Docs |
| http://localhost:8002/health | ❤️ User Service |
| http://localhost:8003/docs | 📊 Analytics API Docs |
| http://localhost:8004/docs | 🤖 AI Tutor API Docs |
| http://localhost:8005/health | 💬 Feedback Service |

---

## 🧪 Tests API rapides

```powershell
# Créer un compte
$bytes = [System.Text.Encoding]::UTF8.GetBytes('{"email":"test@test.com","password":"password123","firstName":"Jean","lastName":"Dupont"}')
Invoke-RestMethod -Uri "http://localhost/api/auth/register" -Method POST -Body $bytes -ContentType "application/json; charset=utf-8"

# Lister les cours
Invoke-RestMethod -Uri "http://localhost/api/courses/"

# Dashboard analytics
Invoke-RestMethod -Uri "http://localhost/api/dashboard/stats"
```

---

## 📊 Diagrammes

Tous les diagrammes sont disponibles dans [`docs/diagrams/`](docs/diagrams/) :

| Fichier | Description |
|---|---|
| `c4-context.md` | C4 Niveau 1 — Vue globale du système |
| `c4-container.md` | C4 Niveau 2 — Conteneurs et technologies |
| `c4-component.md` | C4 Niveau 3 — Composants internes |
| `uml-usecase.md` | UML — Cas d'utilisation |
| `uml-class.md` | UML — Diagramme de classes |
| `uml-sequence.md` | UML — Séquence flux complet |
| `uml-deployment.md` | UML — Déploiement Docker |

---

## 👤 Auteur

**Ghazi Arif** — Master DevOps & Cloud M1  
Projet d'intégration de compétences — 2026