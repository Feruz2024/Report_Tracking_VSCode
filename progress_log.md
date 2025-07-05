# Progress Log

## July 3, 2025

- Implemented a global MessageContext for instant unread message badge updates in the navigation bar.
- The unread message badge now only appears on the "Messages" tab/button, not on the right side of the TopNavBar.
- The badge count updates instantly when messages are read, using the refreshUnreadCount function from the context.
- Improved assignment and campaign tab layouts for consistent width and stable UI.
- Added and fixed advanced filtering and reset buttons for assignment tabs.
- General UI/UX improvements and bug fixes for assignment, campaign, and client management.

---

## July 5, 2025

- Completed robust Dockerization for Django backend, React frontend, and Postgres database with environment variable support.
- Fixed CORS and credentialed cross-origin requests for secure frontend-backend API communication.
- Patched React frontend to use backend API base URL from environment variables for all API calls.
- Implemented and debugged user registration API, ensuring correct group assignment and role display.
- Ensured user group names sent from frontend match backend group names exactly (e.g., "Analysts").
- Added and ran management command to initialize all required user groups in the database.
- Verified registration, login, and user listing workflows now display correct roles and groups.
