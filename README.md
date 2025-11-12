## Introduction to Cloud Computing - Final Project


## 📖 Overview

A cloud-based file storage and collaboration platform that enables users to upload, manage, and collaborate on files with version control, automated backups, and secure access control.

### Key Features

- **User Authentication & Role Management** - Secure login with role-based permissionsOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **File Upload & Version Control** - Track file changes and restore previous versions

- **Metadata & Tagging System** - Organize files with tags and commentsYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Automated Database Backups** - Regular backups to DigitalOcean Spaces

- **Containerized Deployment** - Docker & Docker Compose for easy deploymentThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **HTTPS & Security** - Encrypted data transfer and secure credential management

- **Monitoring & Observability** - Performance tracking and system health monitoring## Learn More

### Run Tests Locally
```bash
docker compose up --build -d
```

## 🤝 Contributing

This is a course project for Introduction to Cloud Computing.

**Team Members:**
- Astra
- Axel
---

## 🧰 Tech Stack

### Frontend
- **Next.js** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **HTML5 & CSS3** - Modern web standards

### Backend
- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **JWT** - JSON Web Tokens for authentication

### Database
- **PostgreSQL** - Relational database
- **Prisma Migrate** - Database migration tool

### Storage & Backups
- **DigitalOcean Spaces** - S3-compatible object storage
- **AWS SDK v3** - S3 client for Spaces API
- **pg_dump/pg_restore** - PostgreSQL backup utilities

### DevOps & Deployment
- **Docker** - Container runtime
- **Docker Compose** - Multi-container orchestration
- **Docker Swarm** - Container orchestration (production)
- **Kubernetes** - Container orchestration (optional)
- **Fly.io** - Platform-as-a-Service deployment
- **Nginx** - Reverse proxy

### Development Tools
- **Git & GitHub** - Version control
- **VS Code** - Code editor
- **ESLint** - Code linting
- **npm** - Package manager

### Cloud Platform
- **DigitalOcean** - Cloud infrastructure
  - Droplets (Virtual Machines)
  - Spaces (Object Storage)
  - Volumes (Block Storage)
  - Monitoring & Alerts

## 🔗 Links

- **Repository**: [https://github.com/AxelTWC/cloudproject](https://github.com/AxelTWC/cloudproject)
- **Live Demo**: [https://cloudproject-empty-thunder-8441.fly.dev/](https://cloudproject-empty-thunder-8441.fly.dev/)

---



