# Development Guide

## Prerequisites

Required software and tools:

- **Node.js 22+** and npm
- **Docker Desktop** 
- **kubectl** and **minikube** (for local Kubernetes testing)
- **Prisma CLI**: `npm i -D prisma` (already included in project dependencies)
- **doctl** (DigitalOcean CLI, for cloud deployment)
- **PostgreSQL** (for local database)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/AxelTWC/cloudproject.git
cd cloudproject
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Prisma.

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:123@localhost:5432/cloudproject?schema=public"

# Application Settings
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
JWT_SECRET="super_secret_key"
NODE_ENV="development"
PORT=3000

# Cookie Settings (for local development)
COOKIE_SECURE="false"
DISABLE_HTTPS_REDIRECT="true"

# DigitalOcean Spaces (Optional - for file storage)
DO_SPACES_ENDPOINT=""
DO_SPACES_BUCKET=""
DO_SPACES_ACCESS_KEY=""
DO_SPACES_SECRET_KEY=""
```

**Important:** Replace database password and other values as needed.

### Step 4: Setup Database

**Create PostgreSQL database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cloudproject;

# Exit
\q
```

**Run Prisma migrations:**

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Step 5: Start Development Server

```bash
# Start in development mode
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 6: View Database

Open Prisma Studio to view and manage database:

```bash
npx prisma studio
```

---

## Testing on Minikube (Local Kubernetes)

### Step 1: Start Minikube

```bash
minikube start
```

### Step 2: Switch Docker Environment to Minikube

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### Step 3: Build Docker Image

```bash
# Build image in minikube's Docker environment
docker build -t cloudproject-app:latest .
```

### Step 4: Apply Kubernetes Configuration

```bash
kubectl apply -f k8s
```

### Step 5: Check Deployment Status

```bash
# Check pods
kubectl get pods -o wide

# Check services
kubectl get svc

# Get service URL
minikube service cloudproject-app-service --url
```

Visit the URL provided by the last command to access your application.

---

## Deploy on DigitalOcean Kubernetes

### Step 1: Create Kubernetes Cluster

1. Login to DigitalOcean console
2. Navigate to Kubernetes
3. Click "Create Kubernetes Cluster"
4. Choose configuration
5. Wait for cluster creation

### Step 2: Configure kubectl Access

**Using doctl**

```bash
# Authenticate with DigitalOcean
doctl auth init
# Enter your API token when prompted

# Download kubeconfig
doctl kubernetes cluster kubeconfig save <cluster-name>
```

**Verify onnection:**

```bash
kubectl config current-context
kubectl get nodes
```

### Step 3: Build and Push Docker Image

```bash
# Build image
docker build -t lanskette/cloudproject:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push lanskette/cloudproject:latest
```

### Step 4: Update Kubernetes Configuration

Ensure the image field is set correctly:

```yaml
spec:
  containers:
  - name: app
    image: lanskette/cloudproject:latest
    imagePullPolicy: Always
```

### Step 5: Apply Configuration to DO Cluster

```bash
# Apply configuration
kubectl apply -f k8s

# Check deployment status
kubectl get pods -w
```

### Step 6: Get External IP

```bash
kubectl get svc
```

Look for `cloudproject-app-service` with type `LoadBalancer`.
The `EXTERNAL-IP` column shows your public IP address.

### Step 7: Access Application

Visit `http://<EXTERNAL-IP>` in your browser.

**Current deployment:** http://146.190.189.176/

---

## Environment Variables

### Required Variables

| Variable               | Description                   | Example                               |
| ---------------------- | ----------------------------- | ------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string  | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`           | Secret key for JWT tokens     | `super_secret_key`                    |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the application | `http://localhost:3000`               |
| `NODE_ENV`             | Environment mode              | `development` or `production`         |

### Optional Variables

| Variable                 | Description                        | Default           |
| ------------------------ | ---------------------------------- | ----------------- |
| `PORT`                   | Application port                   | `3000`            |
| `COOKIE_SECURE`          | Enable secure cookies (HTTPS only) | `false` for local |
| `DISABLE_HTTPS_REDIRECT` | Disable HTTP to HTTPS redirect     | `true` for local  |

---

## Testing Your Setup

### Test 1: Health Check

```bash
curl http://146.190.189.176/api/health
```

### Test 2: Application Metrics

```bash
curl http://146.190.189.176/api/metrics
```

### Test 3: User Registration and Login

**1. Open browser and navigate to your application URL**

**2. Register a new user:**

- Go to `/register`
- Fill in email and password
- Submit form

**3. Login:**

- Go to `/login`
- Enter credentials
- Should redirect to `/dashboard`

**4. Upload a file:**

- In dashboard, click "Upload"
- Select a file
- Submit

---

## Deployment Information

### Current Deployments

**DigitalOcean Kubernetes (Production):**

- URL: http://146.190.189.176/
- Cluster: DigitalOcean Kubernetes 
- Purpose: Main production deployment

**Fly.io (Early Testing):**

- URL: https://cloudproject-empty-thunder-8441.fly.dev/
- Purpose: Early testing and log collection only
- Note: Not used for meeting Kubernetes requirements

