# Final Report

> **Project name:** CloudShare
>
> **Short purpose:** A task management / file upload example application based on Next.js + Node + PostgreSQL, demonstrating containerization, Kubernetes orchestration and persistent storage, as well as cloud deployment and monitoring.
>
> **Deployment URL:** http://146.190.189.176

------

## Video Demo: 

https://youtu.be/NVQojuh_lUs

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

The main objective of our project is to build a cloud-based content sharing and collaboration platform that allows users to upload, manage, and share their files easily in a private environment while maintaining full control over their data. In today's digital landscape, where data privacy and security have become paramount concerns for both individuals and organizations, there is an increasing demand for solutions that offer robust functionality without compromising user autonomy. Our platform addresses this critical need by providing a comprehensive solution that prioritizes user sovereignty over their digital assets.

Our platform will be self-hosted on DigitalOcean, which gives users the freedom to manage their own storage, access policies, and system configuration. By leveraging DigitalOcean's reliable and scalable infrastructure, we ensure that users benefit from our great performance and availability while retaining complete administrative control. This self-hosted approach stands in stark contrast to traditional cloud storage services where users must entrust their sensitive data to third-party providers and accept predetermined terms of service. Instead, our solution empowers users to establish their own data governance frameworks, customize security protocols according to their specific requirements, and maintain transparency in how their information is stored and processed.

Specifically, our project aims to (broken down into simple points):

1. Enable secure file upload and storage
2. Implement Version Control for Uploaded Files
3. Offer a fully self-hosted and customizable solution
4. Ensure Cost-Efficiency and Scalability
5. Create a simple and user-friendly interface

------

## 4. Technical Stack

**Core Technologies:**

- **Runtime:** Node.js 22
- **Framework:** Next.js 16.0.1 (React-based full-stack framework)
- **Language:** TypeScript 5
- **UI Library:** React 19.1.0
- **Database ORM:** Prisma 5.22.0
- **Database:** PostgreSQL 15
- **Styling:** Tailwind CSS 3.4

**Container & Orchestration:**

- **Containerization:** Docker (image: lanskette/cloudproject:latest on DockerHub)
- **Local Kubernetes:** Minikube (for development and testing)
- **Production Kubernetes:** DigitalOcean Kubernetes (DOKS)
- **Load Balancing:** Kubernetes LoadBalancer service
- **Storage:** Kubernetes PersistentVolume + PersistentVolumeClaim

**Cloud Services:**

- **File Storage:** DigitalOcean Spaces (S3-compatible object storage via AWS SDK 3.929.0)
- **Monitoring:** DigitalOcean Kubernetes Insights + Custom health endpoints

**Authentication & Security:**

- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcrypt 6.0.0
- **Session Management:** Cookie-based sessions (cookie 1.0.2)
- **Security Headers:** Custom middleware for HTTP security headers

**Development Tools:**

- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Database Management:** Prisma Studio
- **CSS Processing:** PostCSS 8.5 + Autoprefixer 10.4

**Note:** Fly.io was used for early testing and log collection but is not part of the final production deployment.

------

## 5. Features

### User Management

- **User Registration:** Create new accounts with email and password
- **User Authentication:** Secure login system using JWT tokens
- **Session Management:** Cookie-based session handling with configurable security settings
- **Password Security:** Passwords hashed using bcrypt algorithm

### File Management

- **File Upload:** Upload files to persistent storage
- **File Listing:** View all uploaded files with metadata (name, upload date)
- **File Download:** Download previously uploaded files
- **File Deletion:** Remove files from storage
- **File Versioning:** Track and restore previous versions of files
- **File Tagging:** Organize files with custom tags
- **File Comments:** Add comments and notes to files

### Database Backup & Restore

- **User Backup** Create manual backup with timestamp and listed onto the Available Backup List
- **User Restore** Restore the manual backup with timestamp through S3-compatible storage on DigitalOcean Spaces

### Deployment & Orchestration

- **Local Development:** Run on Minikube for testing
- **Production Deployment:** Deployed on DigitalOcean Kubernetes (DOKS)
- **Public Access:** Accessible via LoadBalancer at http://146.190.189.176
- **Container Management:** Automated pod restart on failure
- **Rolling Updates:** Zero-downtime deployment with rolling update strategy

### Data Persistence

- **Database Persistence:** PostgreSQL data stored in PersistentVolumeClaim
- **Data Durability:** Data survives pod restarts and deletions
- **File Storage:** Uploaded files stored in DigitalOcean Spaces 
- **Backup Storage:** Database backups persisted in cloud storage

### Monitoring & Observability

- **Health Checks:** Custom `/api/health` endpoint for application status monitoring
- **Application Metrics:** Prometheus-compatible metrics at `/api/metrics` endpoint
- **Kubernetes Probes:** Liveness and readiness probes for automatic pod health management
- **Platform Monitoring:** DigitalOcean Insights dashboard for CPU, memory, disk, and network metrics
- **Automated Alerts:** Configured alerts for high resource usage (CPU >80%, Memory >85%, Disk >90%)
- **Log Management:** Access logs via `kubectl logs` for troubleshooting

### API Endpoints

- **RESTful API:** Well-structured REST API for all operations
- **Authentication APIs:** `/api/register`, `/api/login`
- **File APIs:** `/api/files`, `/api/upload`, `/api/download/[filename]`
- **Backup APIs:** `/api/backup/create`, `/api/backup/restore`, `/api/backup/list`
- **Monitoring APIs:** `/api/health`, `/api/metrics`

### Security Features
- JWT-based authentication with token expiration
- HTTPS enforcement with automatic redirects
- TLS/SSL Configuration (TLS 1.2/1.3) - nginx.conf

------

## 6.User Guide

### Deployment Access

**URL:** http://146.190.189.176

**Note:** The application uses HTTP (not HTTPS) for this deployment. In a production environment, HTTPS should be configured for security.

### Troubleshooting

If the application becomes unresponsive:

1. **Check pod status:**

```bash
   kubectl get pods
```

2. **restart it:**

```bash
   kubectl delete pod <pod-name>
   # Kubernetes will automatically create a new pod
```

3. **Wait for the new pod to be ready, after the pod restarts, just refresh the webpage.**

### Getting Started

#### 1. User Registration

1. Navigate to http://146.190.189.176/register
2. Enter your email address and password
3. Click "Register" to create your account
4. You will be redirected to the login page

#### 2. User Login

1. Go to http://146.190.189.176/login
2. Enter your registered email and password
3. Click "Login"
4. Upon successful login, you'll be redirected to the dashboard
5. Session is managed via JWT token stored in browser cookies

#### 3. File Upload

1. From the dashboard, click "Choose File" and select a file from your computer
2. Click "Upload" will navigate to the upload section to save the file
3. The file will be stored in persistent storage and appear in your file list

#### 4. File Management

1. **View Files:** All your uploaded files are displayed in the dashboard
2. **Download Files:** Click on a file to download it
3. **Delete Files:** Click the "Delete" button next to any file to remove it
4. **Add Tags:** Click "Add Tag" to add custom tags for organizing files
5. **Add Comments:** Click "Add Comments" to add comments or notes to files

#### 5. File Versioning

1. Click "View Versions" on any file
2. See the complete history of file modifications
3. Restore a previous version if needed
4. View when made changes

### Tips for Best Experience

1. **Supported File Types:** All file types are supported
2. **Network:** Stable internet connection recommended for file uploads

### Known Limitations

- The application currently uses HTTP instead of HTTPS (for demonstration purposes)
- Large file uploads may take some time depending on network speed
- Pod restarts may cause brief service interruptions

------

## 7. Development Guide

### Prerequisites

Required software and tools:

- Node.js 22+ and npm
- Docker Desktop
- kubectl and minikube (for local Kubernetes testing)
- Prisma CLI: `npm i -D prisma` (already included in project dependencies)
- doctl (DigitalOcean CLI, for cloud deployment)
- PostgreSQL 15 +(for local database)

### Local Development Setup

#### Step 1: Clone the Repository

```bash
git clone https://github.com/AxelTWC/cloudproject.git
cd cloudproject/cloudproject
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Prisma 5.22.0.

#### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
SPACES_KEY=DO00ABEDTKZQZTQA39AN 
SPACES_SECRET=JFySfaRlPqZHJu4C+fgx0uS5MSjMlhpv3qKobOJVriw 
SPACES_BUCKET=cloudproject 
SPACES_ENDPOINT=https://tor1.digitaloceanspaces.com 
SPACES_REGION=tor1 
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
```

**Important:** Replace database password and other values as needed.

#### Step 4: Setup Database

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

#### Step 5: Start Development Server

```bash
# Start in development mode
npm run dev
```

The application will be available at `http://localhost:3000`

#### Step 6: View Database

Open Prisma Studio to view and manage database:

```bash
npx prisma studio
```

### Testing on Minikube (Local Kubernetes)

#### Step 1: Start Minikube

```bash
minikube start
```

#### Step 2: Switch Docker Environment to Minikube

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

#### Step 3: Build Docker Image

```bash
# Build image in minikube's Docker environment
docker build -t cloudproject-app:latest .
```

#### Step 4: Apply Kubernetes Configuration

```bash
kubectl apply -f k8s
```

#### Step 5: Check Deployment Status

```bash
# Check pods
kubectl get pods -o wide

# Check services
kubectl get svc

# Get service URL
minikube service cloudproject-app-service --url
```

Visit the URL provided by the last command to access your application.

### Deploy on DigitalOcean Kubernetes

#### Step 1: Create Kubernetes Cluster

1. Login to DigitalOcean console
2. Navigate to Kubernetes
3. Click "Create Kubernetes Cluster"
4. Choose configuration
5. Wait for cluster creation

#### Step 2: Configure kubectl Access

**Using doctl:**

```bash
# Authenticate with DigitalOcean
doctl auth init
# Enter your API token when prompted
# Download kubeconfig
doctl kubernetes cluster kubeconfig save <cluster-name>
```

#### Step 3: Build and Push Docker Image

```bash
# Build image
docker build -t lanskette/cloudproject:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push lanskette/cloudproject:latest
```

#### Step 4: Update Kubernetes Configuration

Ensure the image field is set correctly:

```yaml
spec:
  containers:
  - name: app
    image: lanskette/cloudproject:latest
    imagePullPolicy: Always
```

#### Step 5: Apply Configuration to DO Cluster

```bash
# Apply configuration
kubectl apply -f k8s

# Check deployment status
kubectl get pods -w
```

#### Step 6: Get External IP

```bash
kubectl get svc
```

Look for `cloudproject-app-service` with type `LoadBalancer`. The `EXTERNAL-IP` column shows your public IP address.

#### Step 7: Access Application

Visit `http://<EXTERNAL-IP>` in your browser.

**Current deployment:** http://146.190.189.176/

### Environment Variables

#### Required Variables

| Variable               | Description                   | Example                               |
| ---------------------- | ----------------------------- | ------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string  | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`           | Secret key for JWT tokens     | `super_secret_key`                    |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the application | `http://localhost:3000`               |
| `NODE_ENV`             | Environment mode              | `development` or `production`         |

#### Optional Variables

| Variable                 | Description                        | Default           |
| ------------------------ | ---------------------------------- | ----------------- |
| `PORT`                   | Application port                   | `3000`            |
| `COOKIE_SECURE`          | Enable secure cookies (HTTPS only) | `false` for local |
| `DISABLE_HTTPS_REDIRECT` | Disable HTTP to HTTPS redirect     | `true` for local  |

### Testing Your Setup

#### Test 1: Health Check

```bash
curl http://146.190.189.176/api/health
```

#### Test 2: Application Metrics

```bash
curl http://146.190.189.176/api/metrics
```

#### Test 3: User Registration and Login

1. **Open browser and navigate to your application URL**
2. **Register a new user:**
   - Go to `/register`
   - Fill in email and password
   - Submit form
3. **Login:**
   - Go to `/login`
   - Enter credentials
   - Should redirect to `/dashboard`
4. **Upload a file:**
   - In dashboard, click "Upload"
   - Select a file
   - Submit

### Deployment Information

#### Current Deployments

**DigitalOcean Kubernetes (Production):**

- URL: http://146.190.189.176/
- Cluster: DigitalOcean Kubernetes
- Purpose: Main production deployment

**Fly.io (Early Testing):**

- URL: https://cloudproject-empty-thunder-8441.fly.dev/
- Purpose: Early testing and log collection only
- Note: Not used for meeting Kubernetes requirements

------

## 8. Deployment Information

- **DigitalOcean:** http://146.190.189.176/
- **Fly.io (testing/early):** https://cloudproject-empty-thunder-8441.fly.dev/ (used before modifying to meet project website requirements)

> **Note:** The course requirement is local Minikube + cloud-hosted Kubernetes (this project uses DigitalOcean Kubernetes). Fly.io is only used for early testing and log collection, not as a substitute for meeting K8s requirements. Also this is so expensive and it already cost me more than $50, I don't know exactly when will we finish grading, so it might be stopped if it takes so long and costs too much.

------

## 9. Monitoring & Observability

Our monitoring and observability implementation meets course requirements by integrating provider tools and custom health endpoints. The system provides comprehensive visibility into both infrastructure and application performance.

We implemented a multi-layered monitoring approach: 

1. Infrastructure Monitoring - DigitalOcean Kubernetes Insights 
2. Application Monitoring - Custom health and metrics endpoints 
3. Container Monitoring - Kubernetes logs and resource monitoring

### 1) Fly.io Logs (during early deployment)

View real-time logs:

```bash
fly logs -a cloudproject-empty-thunder-8441
fly logs -a cloudproject-empty-thunder-8441 --machine <machine-id>
```

### 2) Kubernetes Logs / Monitoring (Minikube / DOKS)

Pod logs:

```bash
kubectl logs deployment/cloudproject-app
kubectl logs deployment/cloudproject-postgres
```

Pod/Node resources (requires metrics-server enabled):

```bash
kubectl top pod
kubectl top node
```

DO panel monitoring

In our project, we use several monitoring methods together to make sure the system runs normally. The main idea is to check both the infrastructure (DigitalOcean) and the application itself, so we can know the system status quickly and fix problems fast.

First, we use DigitalOcean Kubernetes Insights. It gives us real-time and historical data about CPU, memory, disk I/O, and network traffic. This tool is already built into DigitalOcean, so we don't need to install anything. It is very useful for checking if the cluster is healthy, and we can easily see if there are unusual spikes that might cause problems.

For the application level, we created two important endpoints. The first one is the health check endpoint `/api/health`. It returns the system status, database connection, response time, uptime, and memory usage. For example, if we want to check the health manually, we can run:

```bash
# Check application health
curl http://146.190.189.176/api/health
```

The second one is the metrics endpoint `/api/metrics`. It outputs data, including total users, total uploaded files, Node.js memory usage, and uptime. This helps us observe long-term performance trends. We can view these metrics with:

```bash
# View metrics
curl http://146.190.189.176/api/metrics
```

In daily work, we usually open DigitalOcean Insights to check the charts, then call the `/api/health` endpoint to see if the system is healthy, look at the metrics to understand current usage, and use Kubernetes commands to see pod status. This process helps us find problems early. For example, if CPU usage is high, we can check pod logs or see if any query is too slow. If the application becomes unhealthy, we check the health output and logs to find the cause. If memory keeps increasing for a long time, it may mean a memory leak.

Overall, our monitoring setup gives us clear visibility into the system behavior. It helps us detect problems early, fix bugs quickly, and keep the service stable. During the project, the system usually responds in 15–30 ms, resource usage stays low, and the service runs reliably. This shows our monitoring and observability design works well.

------

## 10. Individual Contributions

### Member 1: Astra Yu

- Local Development: Developed full-stack application with Next.js, implementing authentication, file management, and database integration
- Implemented the five core functions of the project, including containerization: dockerized application and configured Docker Compose for multi-container setup (app + PostgreSQL) / state management: implemented PostgreSQL with Prisma ORM and configured DigitalOcean Volumes for persistent storage; resolved connection pooling issues / kubernetes orchestration: set up Minikube locally and deployed to DigitalOcean Kubernetes with Deployments, Services, and PersistentVolumes / deployment: Migrated infrastructure from Fly.io to DigitalOcean, integrating AWS S3 for file storage / monitoring: Integrated DigitalOcean metrics monitoring and implemented custom health check endpoints
- Documentation.

### Member 2: Axel Tang

- Development on the UI, two advanced features of HTTPS security and DigitalOcean Backup and Recovery of user file data
- Development of previously noted core feature - File Versioning
- Development of routing such as login/logout and home page.

------

## 11. Lessons Learned & Conclusion

**Astra:** Throughout this project, I encountered numerous technical challenges that deepened my understanding of cloud deployment and containerization. One significant lesson was learning the critical differences between development and production environments. During coding, I repeatedly switched between development mode and production mode, because sometimes to solve some bugs that suddenly appeared, I switched modes after searching for information, but this repeated switching is very easy to cause new problems, leading to new bugs. Mistakenly using development mode (next dev) for production will cause unexpected issues (such as automatically redirecting to https://0.0.0.0:3000, etc.). In production images, you need to ensure using next start (or standalone server.js) after next build. Another major challenge was managing database connections in a containerized environment. I discovered that improper Prisma Client initialization led to connection pool exhaustion, causing the application to fail intermittently. This taught me the importance of singleton patterns and proper resource management in production applications. Additionally, dealing with version conflicts between Prisma packages highlighted how critical dependency management is in cloud deployments—a single version mismatch can cause complete application failures that are difficult to diagnose. The migration from Fly.io to DigitalOcean also presented unexpected complexities. Each platform has different networking configurations, environment variable handling, and storage solutions. Learning to adapt the same application to different cloud providers gave me practical insight into cloud-agnostic design principles and the importance of understanding provider-specific implementations. This is the first time I worked with cloud technology. In my undergraduate study I never learned anything related to cloud, so everything in this course was totally new for me. Because of that, this course became a really big challenge. It was also my first time doing a course project in only two person team, so during the whole process I felt a lot of pressure. I was always worried that I could not do it well, and sometimes I even felt I might fail the project. To be honest, this is the first time I really needed to take the main responsibility in a project. I always think that my coding skills are not very good compared to my classmates, and cloud and deployment are completely different things, so I was very stressed. Luckily, after many days of trying, searching, and fixing problems one by one, I finally finished the project at the end. Even though the process was difficult, I learned a lot and I feel a strong sense of achievement. For me, this project was not easy at all, but I really put in a lot of effort, and completing it made me feel proud of myself.

**Axel:** Dealt with uncertainty, implementing brand new features that were untouched are no joke and needed time to figure out and iteratively test out. Although, we initially started out with fly.io, through Astra's guidance on changing to DigitalOcean, my implemented features have came across numerous bugs and failures, it is a lesson learnt for me as different platforms gives different results and new implementations are needed even if it on paper sounds similar (in terms of coding). At the end, I do find valuable lessons on communication and skillsets, being able to successfully implement a usable UI and creating something forefront gives a good engineer education experience for my behalf of my career.



