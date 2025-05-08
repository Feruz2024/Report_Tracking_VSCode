

**1\. Software Requirements Specification (SRS) \- Web-Based Task Tracker & To-Do App**

**1\. Introduction**  
1.1. **Purpose:** This document specifies the requirements for a web-based task tracker and to-do application designed for managing advertising campaign reconciliation workflows. It facilitates client and campaign creation, assignment to media analysts, tracking of reconciliation report creation, acceptance of signed monitoring reports from stations, and planning/tracking via an interactive calendar.  
1.2. **Scope:** The system will manage clients, campaigns (with defined monitoring periods), stations, media analysts, and their associated tasks and deadlines. It includes status tracking, in-app notifications, and contextual messaging. Data from external "automated monitoring systems" and "campaign plans" are referenced externally by users; this system tracks the outcomes and progress.  
1.3. **Target Users:** Media Managers, Media Analysts.

**2\. Overall Description**  
2.1. **Product Perspective:** A new, standalone web application.  
2.2. **Product Functions (Summary):**  
\* User Management (Media Manager, Media Analyst roles).  
\* Entity Management: Create, Read, Update, Delete (CRUD) for Clients, Campaigns (with Monitoring Periods), Stations.  
\* Task Management & Workflow:  
\* Campaign assignment to Analysts.  
\* Reconciliation report tracking (Manager initiates "Work In Progress", Analyst inputs spot data, Analyst "Submits").  
\* Station authenticated report acceptance tracking (by Manager).  
\* Final report sharing with client tracking (by Manager).  
\* Compensation request tracking.  
\* Interactive Calendar: Visual planning and tracking of campaign monitoring periods, tasks, and deadlines.  
\* In-App Notifications: Deadline reminders for Analysts and Managers. Managers can view Analyst deadline notifications.  
\* Contextual Messaging: In-app messaging between Manager and Analysts, linked to specific campaigns/tasks.  
2.3. **User Characteristics:**  
\* **Media Manager:** Manages system setup, assignments, oversees workflow, approves reports, communicates with clients.  
\* **Media Analyst:** Performs reconciliation, inputs data, submits reports to Manager.  
2.4. **Constraints:**  
\* Web-based application accessible via modern browsers.  
\* Data from external monitoring systems and plans are *not* imported/managed by this system directly but are inputs to user tasks tracked by the system.

**3\. Specific Requirements**

     \*\*3.1. Functional Requirements\*\*

    \*\*3.1.1. User Management & Authentication (FR1)\*\*  
        \*   FR1.1: System shall allow user registration/creation with two roles: Media Manager, Media Analyst.  
        \*   FR1.2: Secure login/logout for registered users.  
        \*   FR1.3: Role-based access control (RBAC) for features.

    \*\*3.1.2. Client Management (FR2) \- Media Manager\*\*  
        \*   FR2.1: Create, view, edit, delete Clients with relevant attributes (e.g., name, contact info).

    \*\*3.1.3. Campaign Management (FR3) \- Media Manager\*\*  
        \*   FR3.1: Create, view, edit, delete Campaigns, associated with a Client.  
        \*   FR3.2: Attributes: name, client, objectives.  
        \*   FR3.3: Define multiple "Monitoring Periods" for each campaign (e.g., monthly, weekly, user-defined start/end dates). Each period is a distinct unit for tracking.  
        \*   FR3.4: Assign Stations to a Campaign.

    \*\*3.1.4. Station Management (FR4) \- Media Manager\*\*  
        \*   FR4.1: Create, view, edit, delete Stations with relevant attributes (e.g., name, type).

    \*\*3.1.5. Media Analyst Management (FR5) \- Media Manager\*\*  
        \*   FR5.1: Create, view, edit, (de)activate Media Analyst user accounts.

    \*\*3.1.6. Campaign & Task Assignment (FR6) \- Media Manager\*\*  
        \*   FR6.1: Assign specific Campaign Monitoring Periods to Media Analysts.  
        \*   FR6.2: Set deadlines for key tasks within a Monitoring Period.

    \*\*3.1.7. Reconciliation Report Workflow (FR7)\*\*  
        \*   FR7.1: \*\*Media Manager:\*\* Initiate reconciliation for a Campaign Monitoring Period by assigning it to a Media Analyst AND setting its status to "Work In Progress."  
        \*   FR7.2: \*\*Media Analyst:\*\* Access assigned "Work In Progress" reconciliation tasks.  
        \*   FR7.3: \*\*Media Analyst:\*\* Input data for the reconciliation report for each assigned station within the campaign monitoring period: Campaign Name (pre-filled/selected), Station Name (selectable), Missed Spots (numeric), Transmitted Spots (numeric), Gained Spots (numeric).  
        \*   FR7.4: \*\*Media Analyst:\*\* Submit the completed reconciliation data by changing the task status to "Submitted (to Media Manager)."  
        \*   FR7.5: \*\*Media Manager:\*\* View submitted reconciliation data.

    \*\*3.1.8. Station Authenticated Report Tracking (FR8) \- Media Manager\*\*  
        \*   FR8.1: Track the status of "Authenticated Reports from Stations" (e.g., Awaiting Report, Report Received, Sent for Authentication, Work in Progress (Authentication), Accepted, Rejected).  
        \*   FR8.2: Media Manager sets these statuses.

    \*\*3.1.9. Client Report Sharing Tracking (FR9) \- Media Manager\*\*  
        \*   FR9.1: Track the status of sharing the final report with the Client (e.g., Work in Progress, Submitted/Shared).  
        \*   FR9.2: Media Manager sets these statuses.

    \*\*3.1.10. Compensation Request Tracking (FR10) \- Media Manager\*\*  
        \*   FR10.1: Track status of compensation requests (e.g., Checking, Reconciliation, Authentication, Shared to Client).

    \*\*3.1.11. Interactive Calendar (FR11)\*\*  
        \*   FR11.1: Display Campaign Monitoring Periods (start/end).  
        \*   FR11.2: Display deadlines for: Analyst reconciliation submission, Manager station report acceptance, Manager client report sharing.  
        \*   FR11.3: Visually indicate task statuses on the calendar.  
        \*   FR11.4: Allow filtering by client, analyst, campaign status.  
        \*   FR11.5: Provide month, week, day views.  
        \*   FR11.6: Clicking calendar items shows details and allows navigation to the item.

    \*\*3.1.12. In-App Notifications (FR12)\*\*  
        \*   FR12.1: System shall generate in-app notifications for upcoming deadlines.  
        \*   FR12.2: Notification lead times (days prior) shall be pre-configurable system-wide.  
        \*   FR12.3: \*\*Media Analyst Notifications:\*\* Reminders for their reconciliation report submission deadlines.  
        \*   FR12.4: \*\*Monitoring Manager Notifications:\*\*  
            \*   Reminders for their station report acceptance deadlines.  
            \*   Reminders for their client report sharing deadlines / monitoring period conclusion.  
            \*   \*\*Visibility:\*\* The Monitoring Manager shall also see/receive copies of notifications sent to Media Analysts regarding their deadlines.  
        \*   FR12.5: Notifications shall be accessible via a dedicated UI element (e.g., bell icon with count) and list.  
        \*   FR12.6: Clicking a notification navigates to the relevant item.

    \*\*3.1.13. Contextual Messaging (FR13)\*\*  
        \*   FR13.1: Provide a simple messaging feature for communication between Media Manager and Media Analysts.  
        \*   FR13.2: Messages shall be attached contextually to specific Campaign Monitoring Periods or reconciliation tasks.  
        \*   FR13.3: Messages display sender and timestamp.  
        \*   FR13.4: Posting a new message shall trigger an in-app notification to the relevant user(s) (Manager or assigned Analyst).

    \*\*3.1.14. File Uploads (FR14) \- Implicit in Station Report Acceptance\*\*  
        \*   FR14.1: Allow upload of files (e.g., signed monitoring reports from stations). Associate these files with the relevant campaign monitoring period/station report task.

\*\*3.2. Non-Functional Requirements\*\*

    \*\*3.2.1. Performance (NFR1)\*\*  
        \*   NFR1.1: Pages should load within 3 seconds under normal load.  
        \*   NFR1.2: Calendar rendering and filtering should be responsive.

    \*\*3.2.2. Usability (NFR2)\*\*  
        \*   NFR2.1: Intuitive and consistent user interface.  
        \*   NFR2.2: Clear visual cues for statuses and deadlines.

    \*\*3.2.3. Reliability (NFR3)\*\*  
        \*   NFR3.1: System uptime of 99.5%.  
        \*   NFR3.2: Data integrity must be maintained (e.g., through database transactions).

    \*\*3.2.4. Security (NFR4)\*\*  
        \*   NFR4.1: Protection against common web vulnerabilities (XSS, CSRF, SQL Injection).  
        \*   NFR4.2: Secure storage of user credentials.  
        \*   NFR4.3: Role-based access to ensure data visibility and modification rights are enforced.

    \*\*3.2.5. Maintainability (NFR5)\*\*  
        \*   NFR5.1: Codebase should be modular and well-documented.

    \*\*3.2.6. Scalability (NFR6)\*\*  
        \*   NFR6.1: System architecture should support a growing number of users, campaigns, and data points without significant degradation in performance (e.g., up to 50 concurrent users, 1000s of campaigns over time).

\*\*3.3. Interface Requirements\*\*  
    \*   \*\*User Interface (UI):\*\* Web browser-based. Responsive design for common desktop screen sizes.  
    \*   \*\*System Interfaces:\*\* No external system integrations required for MVP other than standard web protocols.  
   

**4\. Data Model (Conceptual)**  
\* **Users:** (UserID, Name, Email, PasswordHash, Role)  
\* **Clients:** (ClientID, Name, ContactDetails, ...)  
\* **Campaigns:** (CampaignID, ClientID, Name, Objectives, ...)  
\* **MonitoringPeriods:** (MonitoringPeriodID, CampaignID, StartDate, EndDate, AnalystUserID, ReconciliationDeadline, StationReportDeadline, ClientShareDeadline, Statuses...)  
\* **Stations:** (StationID, Name, Type, ...)  
\* **CampaignStations:** (Link table for Many-to-Many between Campaigns and Stations)  
\* **ReconciliationData:** (ReconDataID, MonitoringPeriodID, StationID, MissedSpots, TransmittedSpots, GainedSpots, SubmittedByAnalystID, SubmissionTimestamp)  
\* **StationAuthenticatedReports:** (StationReportID, MonitoringPeriodID, StationID, FilePath, Status, AcceptanceTimestamp, AcceptedByManagerID)  
\* **Messages:** (MessageID, ContextID (e.g., MonitoringPeriodID), UserID, Content, Timestamp)  
\* **Notifications:** (NotificationID, UserID, Message, Link, ReadStatus, Timestamp, DeadlineDate)

**5\. Glossary**  
\* **Monitoring Period:** A specific timeframe within a campaign for which reconciliation and reporting are performed.  
\* **Reconciliation Report:** Internal report/data compiled by Media Analyst detailing spot counts (missed, transmitted, gained).  
\* **Authenticated Report:** Report from a Station, verified/accepted, serving as proof of performance.

