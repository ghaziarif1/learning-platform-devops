# 🎓 Learning Platform — DevOps & Cloud M1

Plateforme d'apprentissage en ligne basée sur une architecture microservices.

## 🏗️ Architecture

| Service | Technologie | Port |
|---------|-------------|------|
| API Gateway | Nginx | 80/443 |
| Learning Portal | Next.js + shadcn/ui | 3000 |
| Course Service | FastAPI + PostgreSQL | 8001 |
| User Service | Node.js/Express + MongoDB | 8002 |
| Analytics Service | FastAPI + PostgreSQL | 8003 |
| AI Tutor Service | FastAPI + LLM | 8004 |
| n8n Automation | n8n | 5678 |

## 🗄️ Bases de données

| Base | Usage | Port |
|------|-------|------|
| PostgreSQL | Cours, Analytics | 5432 |
| MongoDB | Utilisateurs | 27017 |
| Redis | Cache | 6379 |
| MinIO | Médias | 9000 |

## 🚀 Lancement rapide

```bash
docker compose up -d
```

## 📋 Prérequis

- Docker Desktop
- Node.js 20+
- Python 3.11+

## 📁 Structure

```
├── services/
│   ├── course-service/
│   ├── user-service/
│   ├── analytics-service/
│   ├── ai-tutor-service/
│   └── n8n-automation/
├── frontend/
│   └── learning-portal/
├── infrastructure/
│   ├── nginx/
│   ├── postgres/
│   └── mongodb/
└── docs/
```