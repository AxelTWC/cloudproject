# Final Report

> **Project name:** CloudSahre
>
> **Short purpose:** A task management / file upload example application based on Next.js + Node + PostgreSQL, demonstrating containerization, Kubernetes orchestration and persistent storage, as well as cloud deployment and monitoring.

------

## 1. Team Information

- **Member 1:** Astra Yu — Student ID: 1011466423 — Email: miing.yu@mail.utoronto.ca
- **Member 2:** Axel Tang — Student ID: 1006832144 — Email: axel.tang@mail.utoronto.ca

------

## 2. Motivation
Nowadays, cloud storage and online collaboration platforms such as Google Drive, OneDrive or Dropbox are very common for both study and work. However, they usually come with some clear limitations. Most of them have strict storage limits for free users, like Google Drive, as a user, every time our club holds an event, we have to create a new account for more space and upgrading to higher storage plans can be quite expensive and unaffordable. In addition, these commercial platforms are controlled by large companies, which means users have little control over their own data. Many users or organizations who care about privacy or who want to host their own data cannot easily do so. In addition, the products of these large companies all have certain uncontrollable issues to some extent. For instance, users sometimes complain that their stored data messages have been lost, or the data has been compressed without permission, resulting in data distortion. The products of large companies have their own business logic, so these undisclosed and uncontrollable issues are almost impossible to be resolved.

Our project is motivated by this problem. We want to build a simple and practical content-sharing and collaboration platform that users can self-host on their own cloud environment. In this way, users can fully control their data and decide their own policies for storage and access. The platform will allow file uploading, version control, and collaborative sharing within a private group, which can be useful for both small organizations and student project teams.

We believe this project is meaningful because there is a growing need for private and cost-effective storage solutions, especially for small and medium businesses that do not want to depend on big cloud providers. Also, for university students who work together on shared assignments or course projects, a self-hosted system can give them more flexibility and privacy.

Existing solutions like Google Drive are powerful, but they are not suitable for people who prefer self-hosting and data control. They also become costly when users need to scale up storage or add more members. Therefore, our project aims to fill this gap by providing a lightweight and customizable alternative for small teams who value independence, privacy, and collaboration. Compared with the products of large companies, it is more transparent and more controllable.

------

## 3. Objectives

The main objective of our project is to build a cloud-based content sharing and collaboration platform that allows users to upload, manage, and share their files easily in a private environment while maintaining full control over their data. Our platform will be self-hosted on DigitalOcean, which gives users the freedom to manage their own storage, access policies, and system configuration. Specifically, our project aims to (broken down into simple points) :
   1. Enable secure file upload and storage
   2. Implement Version Control for Uploaded Files
   3. Offer a fully self-hosted and customizable solution
   4. Ensure Cost-Efficiency and Scalability
   5. Create a simple and user-friendly interface

------

## 4. Technical Stack

- Runtime: Node.js 22
- Frontend: Next.js 16
- ORM: Prisma v6.x
- Database: PostgreSQL 15
- Container: Docker, image pushed to DockerHub (lanskette/cloudproject:latest)
- Local Orchestration: Minikube (for development/testing)
- Cloud Orchestration: DigitalOcean Kubernetes (DOKS) (exposed via LoadBalancer)
- Cloud Backup: Fly.io (used for early testing/metrics—migrated to DO)
- Persistence: Kubernetes PersistentVolume + PersistentVolumeClaim

------

## 5. Features

- Users can register/login (based on JWT).
- File management (create/view/modify/delete files).
- File upload (upload and save to persistent volume / Fly mount or DO storage).
- Backend provides RESTful API (Prisma + PostgreSQL).
- Deployment: runs on local Minikube, runs on cloud DOKS and is publicly accessible.
- Persistence: Postgres data exists in PVC, data remains after Pod restart/deletion.
- Monitoring/Logging: use kubectl logs, kubectl top (cluster side) and Fly.io fly logs (previously used for testing) to view logs and basic metrics.

------

## 6. User Guide

### Access

- Cloud: http://146.190.189.176

### Common Operations

1. **Register**: Click Register, enter email/password → Submit.
2. **Login**: Login with registered account (session uses JWT stored in cookie/localStorage).
3. **Create New File**: Click "Upload File", upload the file you want to share.
4. **Edit File**: Click "View Versions", you can view the file's history versions, and add TAG or COMMENT.
5. **Delete File**: Click Delete in the file list.

------

## 7. Development Guide (Local Reproduction)

### Prerequisites

- Node.js 22+, npm
- Docker Desktop or local Docker (for building images)
- kubectl, minikube (if doing local k8s)
- Prisma CLI: npm i -D prisma (already included in project dependencies)

### Local Running (without k8s)

```bash
git clone https://github.com/AxelTWC/cloudproject.git
cd cloudproject
npm install

# Set environment variables (example)
DATABASE_URL="postgresql://postgres:123@localhost:5432/cloudproject"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
JWT_SECRET="super_secret_key"

# Prisma migrate & generate
npx prisma migrate dev --name init
npx prisma generate

# Development mode
npm run dev
```

### Testing on Minikube (local k8s)

1. Switch docker environment to minikube:

   Windows PowerShell:

     ```powershell
     minikube -p minikube docker-env --shell powershell | Invoke-Expression
     ```

2. Build image to minikube's docker:

   ```bash
   docker build -t cloudproject-app:latest .
   ```

3. Apply k8s configuration (repository k8s/ folder):

   ```bash
   kubectl apply -f k8s/postgres-pv.yaml       
   kubectl apply -f k8s/postgres-deployment.yaml
   kubectl apply -f k8s/app-deployment.yaml
   ```

4. Check Pods / Service:

   ```bash
   kubectl get pods -o wide
   kubectl get svc
   minikube service cloudproject-app-service --url
   ```

### Deploy on DigitalOcean Kubernetes (DOKS) (Cloud)

1. Create Kubernetes cluster in DO console (note down kubeconfig).

2. Use doctl or directly download kubeconfig to local and merge into ~/.kube/config:

   ```bash
   doctl auth init
   doctl kubernetes cluster kubeconfig save <cluster-id-or-name>
   ```

3. Ensure DO cluster can pull your image from DockerHub

4. Modify the image in k8s/app-deployment.yaml to lanskette/cloudproject:latest and imagePullPolicy: Always.

5. Apply on DO cluster:

   ```bash
   kubectl apply -f k8s/postgres-volume.yaml    
   kubectl apply -f k8s/postgres-deployment.yaml
   kubectl apply -f k8s/app-deployment.yaml
   kubectl get svc
   ```

   Wait for LoadBalancer EXTERNAL-IP to be ready, access that public IP.

------

## 8. Deployment Information

- **DigitalOcean**: http://146.190.189.176/
- **Fly.io (testing/early)**: https://cloudproject-empty-thunder-8441.fly.dev/ (used before modifying to meet project website requirements)

> Note: The course requirement is local Minikube + cloud-hosted Kubernetes (this project uses DigitalOcean Kubernetes). Fly.io is only used for early testing and log collection, not as a substitute for meeting K8s requirements.

------

## 9. Monitoring & Observability

The course requires at least integrating provider tool's logs or metrics, and setting up basic alerts / dashboards. We implemented/documented the following workflow:

### 1) Fly.io Logs (during early deployment)

- View real-time logs:

  ```bash
  fly logs -a cloudproject-empty-thunder-8441fly logs -a cloudproject-empty-thunder-8441 --machine <machine-id>
  ```

### 2) Kubernetes Logs / Monitoring (Minikube / DOKS)

- Pod logs:

  ```bash
  kubectl logs deployment/cloudproject-app
  kubectl logs deployment/cloudproject-postgres
  ```

- Pod/Node resources (requires metrics-server enabled):

  ```bash
  kubectl top pod
  kubectl top node
  ```

- DO panel monitoring

------

## 10. Individual Contributions

- Member 1 Astra Yu
  - Local development and code implementation, including completing the main backend and frontend framework code development locally.
  - Implemented the five core functions of the project, such as Docker build and debugging and all containerization operations, local Kubernetes (Minikube) environment setup and debugging, multi-cloud deployment: migration from Fly.io → DigitalOcean, database and storage configuration, etc.
  - Scripting the documents needed to be presented.
- Member 2 Axel Tang
   - Development on the UI , two adavanced features of HTTPS security and DigitalOcean Backup and Recovery of user file data
   - Development of previously noted core feature - File Versioning 
   - Development of routing such as login/logout and home page.
------

## 11. Lessons Learned & Conclusion


Astra: During coding, I repeatedly switched between development mode and production mode, because sometimes to solve some bugs that suddenly appeared, I switched modes after searching for information, but this repeated switching is very easy to cause new problems, leading to new bugs. Mistakenly using development mode (next dev) for production will cause unexpected issues (such as automatically redirecting to https://0.0.0.0:3000, etc.). In production images, you need to ensure using next start (or standalone server.js) after next build.

Axel: Dealt with uncertainty, implementing brand new features that were untouched are no joke and needed time to figure out and iteratively test out. Although, we initially started out with fly.io, through Astra's guidance on changing to DigitalOcean, my implemented features have came across numerous bugs and failures, it is a lesson learnt for me as different platforms gives different results and new implementations are needed even if it on paper sounds similar (in terms of coding). At the end, I do find valuable lessons on communication and skillsets, being able to successfully implement a usable UI and creating something forefront gives a good engineer education experience for my behalf of my career. 



