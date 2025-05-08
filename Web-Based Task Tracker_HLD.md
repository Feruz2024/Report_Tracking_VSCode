

**2\. High-Level Design (HLD) Document \- Web-Based Task Tracker**

**1\. Introduction**  
1.1. **Purpose:** This document provides a high-level architectural overview of the Web-Based Task Tracker. It describes the system architecture, key components, their interactions, data management strategy, and technology stack considerations.  
1.2. **Scope:** Covers the server-side and client-side architecture necessary to meet the requirements outlined in the SRS.

**2\. System Architecture**  
2.1. **Architectural Style:** A **Monolithic Web Application Architecture** is proposed for the initial development due to the interconnected nature of the features and to simplify development and deployment for the specified scope. A future evolution to microservices can be considered if scalability demands it.  
2.2. **Tiered Architecture:** A standard **3-Tier Architecture** will be employed:  
\* **Presentation Tier (Client-Side):** User Interface, rendered in the user's web browser.  
\* **Application Tier (Server-Side):** Business logic, request processing, API endpoints.  
\* **Data Tier (Server-Side):** Database for persistent storage.

     \`\`\`  
\+----------------------+     \+-------------------------+     \+---------------------+  
|   User (Web Browser) |\<---\>|   Presentation Tier     |\<---\>|   Application Tier  |\<---\>|   Data Tier         |  
|   (Media Manager/    |     |   (Frontend: HTML, CSS, |     |   (Backend: API,    |     |   (Database:       |  
|    Media Analyst)    |     |    JavaScript Framework)|     |    Business Logic,  |     |    PostgreSQL/MySQL)|  
\+----------------------+     \+-------------------------+     |    Auth, Notifs)    |     \+---------------------+  
                                      ^                       \+---------------------+  
                                      |                                     |  
                                      \+-------- HTTP/HTTPS Requests \--------+  
\`\`\`  
   

**3\. Component Design**

     3.1. \*\*Frontend (Presentation Tier)\*\*  
    \*   \*\*UI Framework:\*\* A modern JavaScript framework (e.g., React, Vue.js, or Angular) for building a dynamic and interactive Single Page Application (SPA).  
        \*   \*\*Responsibilities:\*\* Rendering UI components, handling user interactions, client-side validation, making API calls to the backend.  
    \*   \*\*Key UI Modules:\*\*  
        \*   \*\*Dashboard/Home:\*\* Overview, quick links.  
        \*   \*\*Client Management Views:\*\* Forms and lists for Clients.  
        \*   \*\*Campaign Management Views:\*\* Forms and lists for Campaigns & Monitoring Periods.  
        \*   \*\*Station Management Views:\*\* Forms and lists for Stations.  
        \*   \*\*User (Analyst) Management Views:\*\* Forms for Media Managers.  
        \*   \*\*Calendar View:\*\* Interactive calendar component.  
        \*   \*\*Task/Reconciliation Detail Views:\*\* Forms for data entry by analysts, status updates by managers.  
        \*   \*\*Notification Panel:\*\* Displays in-app notifications.  
        \*   \*\*Messaging Interface:\*\* Contextual messaging UI within relevant entities.  
    \*   \*\*State Management:\*\* Client-side state management library (e.g., Redux, Vuex, Zustand) if complexity warrants.  
    \*   \*\*API Client:\*\* To handle communication with the backend API (e.g., Axios, Fetch API).

3.2. \*\*Backend (Application Tier)\*\*  
    \*   \*\*Web Framework:\*\* A robust backend framework (e.g., Django/Flask (Python), Express.js (Node.js), Spring Boot (Java), Ruby on Rails).  
        \*   \*\*Responsibilities:\*\* Exposing RESTful API endpoints, handling business logic, authentication, authorization, interacting with the Data Tier.  
    \*   \*\*Key Backend Modules/Services:\*\*  
        \*   \*\*Authentication Service:\*\* Manages user login, session management, token generation (e.g., JWT).  
        \*   \*\*Authorization Service:\*\* Enforces role-based access control (RBAC).  
        \*   \*\*Client Management Service:\*\* CRUD operations for Clients.  
        \*   \*\*Campaign Management Service:\*\* CRUD for Campaigns, Monitoring Periods; logic for assignments.  
        \*   \*\*Station Management Service:\*\* CRUD for Stations.  
        \*   \*\*User Management Service:\*\* CRUD for user accounts (especially Analysts by Manager).  
        \*   \*\*Reconciliation Service:\*\* Manages the workflow and data for reconciliation reports (status changes, data input).  
        \*   \*\*Notification Service:\*\*  
            \*   Generates notifications based on business rules and deadlines.  
            \*   Manages notification persistence and retrieval.  
            \*   Includes a \*\*Scheduler\*\* (e.g., cron-like, or built into the framework) to periodically check for upcoming deadlines and trigger notifications.  
        \*   \*\*Messaging Service:\*\* Handles storage and retrieval of contextual messages.  
        \*   \*\*File Handling Service:\*\* Manages uploads (e.g., station authenticated reports) and storage.  
        \*   \*\*Calendar Data Service:\*\* Provides data formatted for calendar display.  
    \*   \*\*API Design:\*\* RESTful APIs using JSON for data exchange. Clear, versioned endpoints.

3.3. \*\*Data Tier\*\*  
    \*   \*\*Database:\*\* A relational database (RDBMS) is recommended due to the structured nature of the data and relationships.  
        \*   \*\*Options:\*\* PostgreSQL (preferred for robustness and features), MySQL.  
    \*   \*\*ORM (Object-Relational Mapper):\*\* To simplify database interactions from the backend (e.g., SQLAlchemy for Python, TypeORM/Prisma for Node.js, Django ORM, Hibernate for Java).  
    \*   \*\*Data Schema:\*\* Based on the conceptual data model in the SRS (Users, Clients, Campaigns, MonitoringPeriods, Stations, ReconciliationData, StationAuthenticatedReports, Messages, Notifications).  
    \*   \*\*Backup and Recovery Strategy:\*\* Regular automated backups.  
     
IGNORE\_WHEN\_COPYING\_START  
content\_copy download  
Use code [with caution](https://support.google.com/legal/answer/13505487).  
IGNORE\_WHEN\_COPYING\_END

**4\. Data Management**  
4.1. **Data Flow:**  
\* User interacts with Frontend.  
\* Frontend sends API requests to Backend.  
\* Backend processes requests, applies business logic, interacts with Database via ORM.  
\* Backend sends responses back to Frontend.  
\* Frontend updates UI.  
4.2. **Data Persistence:** All core application data (clients, campaigns, tasks, statuses, messages, notifications) will be stored in the chosen RDBMS. Uploaded files will be stored on the server's file system or a dedicated cloud storage service (e.g., AWS S3, Google Cloud Storage), with references (paths/URLs) stored in the database.  
4.3. **Data Integrity:** Enforced via database constraints (primary keys, foreign keys, NOT NULL), transaction management in the backend, and input validation (client-side and server-side).

**5\. Technology Stack (Recommended Options)**  
\* **Frontend:** React or Vue.js (JavaScript/TypeScript)  
\* **Backend:**  
\* Python: Django or Flask  
\* Node.js: Express.js or NestJS (TypeScript)  
\* **Database:** PostgreSQL  
\* **Web Server:** Nginx (as a reverse proxy and for serving static files) or managed by the PaaS.  
\* **Deployment:** Docker containers for consistency across environments; PaaS (e.g., Heroku, AWS Elastic Beanstalk, Google App Engine) or IaaS (e.g., AWS EC2, DigitalOcean Droplets).  
\* **Version Control:** Git (e.g., GitHub, GitLab).

**6\. Security Considerations**  
\* **Authentication:** Strong password policies, secure session management (e.g., JWT with appropriate expiry and refresh mechanisms).  
\* **Authorization:** Implement RBAC strictly at the API level.  
\* **Input Validation:** Both client-side and server-side to prevent injection attacks (SQLi, XSS).  
\* **HTTPS:** Enforce HTTPS for all communication.  
\* **Dependency Management:** Regularly update libraries and frameworks to patch vulnerabilities.  
\* **Data at Rest:** Consider encryption for sensitive data if required by compliance, though not explicitly stated as critical for current scope.

**7\. Deployment Strategy (Conceptual)**  
1\. Development environment (local machines).  
2\. Staging environment (for testing, closely mirrors production).  
3\. Production environment (live application).  
4\. Use of Docker containers to package the application and its dependencies.  
5\. CI/CD pipeline (e.g., Jenkins, GitHub Actions, GitLab CI) for automated testing and deployment.

