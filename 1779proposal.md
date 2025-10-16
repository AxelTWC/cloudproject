# 1779proposal

### **1. Motivation**

Nowadays, cloud storage and online collaboration platforms such as Google Drive, OneDrive or Dropbox are very common for both study and work. However, they usually come with some clear limitations. Most of them have strict storage limits for free users, like Google Drive, as a user, every time our club holds an event, we have to create a new account for more space and upgrading to higher storage plans can be quite expensive and unaffordable. In addition, these commercial platforms are controlled by large companies, which means users have little control over their own data. Many users or organizations who care about privacy or who want to host their own data cannot easily do so. In addition, the products of these large companies all have certain uncontrollable issues to some extent. For instance, users sometimes complain that their stored data messages have been lost, or the data has been compressed without permission, resulting in data distortion. The products of large companies have their own business logic, so these undisclosed and uncontrollable issues are almost impossible to be resolved.

Our project is motivated by this problem. We want to build a simple and practical content-sharing and collaboration platform that users can self-host on their own cloud environment. In this way, users can fully control their data and decide their own policies for storage and access. The platform will allow file uploading, version control, and collaborative sharing within a private group, which can be useful for both small organizations and student project teams.

We believe this project is meaningful because there is a growing need for private and cost-effective storage solutions, especially for small and medium businesses that do not want to depend on big cloud providers. Also, for university students who work together on shared assignments or course projects, a self-hosted system can give them more flexibility and privacy.

Existing solutions like Google Drive are powerful, but they are not suitable for people who prefer self-hosting and data control. They also become costly when users need to scale up storage or add more members. Therefore, our project aims to fill this gap by providing a lightweight and customizable alternative for small teams who value independence, privacy, and collaboration. Compared with the products of large companies, it is more transparent and more controllable.

### **2. Objectives and Key Features**

The main objective of our project is to build a cloud-based content sharing and collaboration platform that allows users to upload, manage, and share their files easily in a private environment while maintaining full control over their data.  Our platform will be self-hosted on DigitalOcean, which gives users the freedom to manage their own storage, access policies, and system configuration. We aim to make the system simple but practical, with a focus on data privacy, version control, and collaboration. Users will be able to create accounts, upload files, share them with others, and add comments or tags for better organization. The system will also keep track of file versions, so users can see the update history or restore previous versions. The system will support multiple users with different roles and permissions, such as Owner, Collaborator, and Viewer. The platform aims to provide a simple and secure way for small teams or students to work together.

#### **Core Features**

1. **User Authentication and Role Management**
   We will implement a basic authentication system where users can register and log in. Each user will have a specific role to define their permissions, such as uploading, editing, viewing, or commenting on files. This function will make the data more controllable.
2. **File Upload and Version Control**
   Users can upload files, and each uploaded file will be stored with version history. This helps users keep track of previous changes and allows restoring older versions if needed which is quite important in a group work.
3. **Metadata and Tag System **
   File information, user data, and collaboration details will be stored in PostgreSQL. We will design a relational schema for users, files, versions, and tags. Persistent storage will be managed using DigitalOcean Volumes, so even if containers are restarted or redeployed, data will remain safe.
4. **Containerization and Deployment**
   The whole application will be containerized using Docker so that users can use it easily. For local development, we will use Docker Compose to run multiple containers such as the backend app and database together. For deployment, we plan to use DigitalOcean and adopt Docker Swarm as our orchestration approach. This allows service replication, load balancing, and easier scaling if the number of users increases.
5. **Monitoring and Observability**
   We will use DigitalOcean’s monitoring tools to track metrics such as CPU, memory, and disk usage. This helps us understand system performance and detect any potential problems.

#### **Advanced Features **

1. **Security and HTTPS Support**
   We will configure HTTPS for secure data transfer and protect user credentials. Environment variables and secrets (such as database passwords) will be managed properly in the deployment environment to ensure security.
2. **Automated Database Backup and Recovery**
    To ensure data safety, we will implement an automated backup system for PostgreSQL. The system will schedule regular backups and store them in cloud storage (such as DigitalOcean Spaces). In case of data loss or corruption, the backup files can be restored easily. This feature improves the reliability and robustness of our platform.

The following table summarizes the main features and technologies used in our project.

| **Feature**                | **Main Function**                         | **Technology**                     |
| -------------------------- | ----------------------------------------- | ---------------------------------- |
| User Authentication        | Login, register, and role-based access    | Node.js, PostgreSQL                |
| File Upload & Versioning   | Upload files with version history         | Node.js, PostgreSQL                |
| Persistent Storage         | Keep data after restart or redeploy       | DigitalOcean Volumes               |
| Deployment & Orchestration | Cloud deployment with load balancing      | Docker, Docker Swarm, DigitalOcean |
| Monitoring                 | Track resource usage and performance      | DigitalOcean Monitoring            |
| Security                   | HTTPS and secrets management              | Docker secrets, HTTPS              |
| Database Backup & Recovery | Regular automated backup to cloud storage | PostgreSQL, DigitalOcean Spaces    |

#### Fulfillment with Course Requirements

Our project fulfills the main technical goals of the course. It is a full-stack web application that connects the frontend, built with React and Tailwind, and the backend, developed using Next.js, Prisma, and PostgreSQL. This shows that we understand how different parts of a web system work together. For data management, we implement CRUD functions for papers and authors, which means we can design and handle persistent data properly using database modeling and ORM tools. The use of Server Components and Actions allows smoother data flow between client and server, which follows the modern structure encouraged by the course. In terms of interface design, we use shadcn/ui and responsive layouts to make the system easier to use and more professional, meeting the requirement for frontend quality and user experience. Finally, our code structure is modular and easy to maintain, which means the project can be scaled or improved in the future. Showing our project is not only capable of running, but also can have additional functions or improvements added in the future.

#### **Scope and Feasibility**

We believe the project is achievable within the course timeline. As a complete beginner, I am confident that this project will cover all the new knowledge I have acquired this semester. The overall scope is focused — not too complex but sufficient to cover all core technologies required by the course. By using Docker, PostgreSQL, and DigitalOcean, we can demonstrate our understanding of cloud-native development, orchestration, and deployment. Our goal is to deliver a working system that is functional, secure, and well-documented. At the same time, further familiarize and master the new knowledge learned in this class.

### **3. Tentative Plan**

Our team has two members, and we will work closely together to complete the project in several steps. We plan to divide the work based on our strengths but still collaborate and help each other when needed. The main goal is to make sure the project can be developed smoothly and deployed successfully to the cloud.

#### **Team Responsibilities**

**Member 1 (Backend and Database)**
This member will mainly focus on the backend system using Node.js and Express. The responsibilities include designing REST APIs for user authentication, file upload, and version control. This member will also handle database schema design and integration with PostgreSQL. Persistent storage will be set up using DigitalOcean Volumes to make sure data is not lost during restarts. In addition, this member will help implement the authentication logic and access control for different user roles.

**Member 2 (Frontend, and Deployment)**
This member will take charge of the frontend interface and overall system deployment. The frontend will provide a simple and clear interface for users to upload and manage files. This member will also handle Docker containerization and configure Docker Compose for local testing. For deployment, this member will set up the application on DigitalOcean using Docker Swarm and ensure that the system runs properly with load balancing and persistent storage. 

#### **Collaboration and Timeline**

Both members will communicate frequently through WeChat, GitHub and online and offline meetings. 

To achieve our project objective within a few weeks, we plan to follow a clear and step-by-step development process. First, we will set up the local development environment using Docker and Docker Compose, and initialize the Git repository with proper branch management. Next, we will design and implement the PostgreSQL database schema, including tables for users, files, versions, and tags, and configure persistent storage using DigitalOcean Volumes to ensure data safety. After that, the backend development will start, focusing on REST API implementation for user authentication, file uploading, version control, and permission management, with continuous testing to ensure correctness. Meanwhile, the frontend will be developed to provide user interface for file upload, file list display, login and registration, and permission visualization, calling backend APIs and showing data properly. Once the core functions are implemented, we will containerize the application locally using Docker Compose and then deploy it to DigitalOcean with Docker Swarm, configuring load balancing for better performance. After deployment, we will implement advanced features including Security with HTTPS and secrets management, and Database Backup & Recovery for regular automated backups to cloud storage (PostgreSQL + DigitalOcean Spaces). By following this plan, each step is clear, responsibilities are manageable, and we are confident that the project can be completed successfully within the course timeline.

We believe that with this plan and clear division of responsibilities, we can complete the project on time with good quality. The scope is manageable for two people, and we will make sure the application demonstrates all required cloud technologies from the course.







