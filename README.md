Dayflow — Human Resource Management System

Dayflow is a full-stack Human Resource Management System developed for the NMIT Hackathon 2026. The platform brings employee self-service and HR administration into one digital workspace, covering authentication, employee information, attendance, leave, payroll, notifications, and HR operations.

The project is designed with a role-based architecture where Employees and HR Administrators receive different experiences and permissions while sharing the same core HR data.

---

🚀 Project Overview

Dayflow aims to replace fragmented HR processes with a centralized, easy-to-use system.

Employee Side

Employees can:

- Securely log in
- View their employee dashboard
- View and manage their profile
- Track attendance
- View attendance information
- Apply for and monitor leave
- View leave balance
- View payroll and salary information
- Receive notifications
- Access their HR-related information from a single dashboard

HR Side

HR administrators can:

- Log in through the HR interface
- Manage employee information
- Access employee records
- Monitor attendance
- Manage leave requests
- Manage payroll-related information
- View HR dashboards
- Handle employee administration
- Use role-based access to separate HR functionality from employee functionality

---

🔐 Authentication & Authorization

The application uses JWT-based authentication.

Authentication flow

User
  ↓
Login Form
  ↓
POST /api/auth/login
  ↓
Flask Backend
  ↓
Email + Password Verification
  ↓
JWT Token
  ↓
Role + Employee Information
  ↓
Frontend Local Storage
  ↓
Protected API Requests

Passwords are stored using Werkzeug password hashing rather than plain text.

The login response contains:

- JWT token
- User role
- Employee ID
- Employee code
- Name
- Department

The frontend stores the authentication information and automatically attaches the JWT token as a Bearer token to protected requests.

---

👥 Role-Based Access

Dayflow supports two primary roles:

Employee

Employees have access to employee-specific functionality such as:

- Dashboard
- Profile
- Attendance
- Leave
- Payroll
- Notifications

HR

HR administrators have access to HR-specific management functionality and employee records.

Role information is included in the JWT and returned during authentication, allowing the frontend to determine the appropriate application experience.

---

📊 Employee Dashboard

The employee dashboard provides a centralized overview of important HR information.

It brings together:

- Employee information
- Attendance status
- Leave balance
- Payroll/salary information
- Notifications
- Quick access to HR functions

The dashboard is designed to give employees a clear view of their current workplace information without requiring multiple systems.

---

🕐 Attendance Management

The attendance module provides functionality for tracking employee attendance.

The project also contains supporting backend/core services for attendance and location-related functionality.

The system is structured to support:

- Attendance records
- Attendance status
- Employee-specific attendance information
- Location-aware attendance functionality
- Attendance history

---

🏖️ Leave Management

The leave module allows employees and HR to work with leave information.

Features include:

- Leave requests
- Leave status
- Leave balance
- Sick leave information
- Paid leave information
- HR-side leave management

The employee dashboard can display remaining leave balances and related information.

---

💰 Payroll Management

The payroll module provides employees with access to their salary-related information.

The current system supports information such as:

- Salary
- Net salary
- Payroll records
- Employee-specific payroll information

Payroll functionality is separated into its own page so that employees can easily access compensation information.

---

👤 Employee Profile

The profile module provides employees with their personal and organizational information.

Information includes fields such as:

- Employee ID
- Employee code
- Name
- Email
- Department
- Role
- Other employee-related details

---

🔔 Notifications

Dayflow includes a notification system to provide users with relevant HR updates.

The frontend contains a reusable notification bell component that can be integrated into the application layout and dashboards.

Notifications can be used for events such as:

- Leave updates
- HR announcements
- Attendance-related information
- Payroll-related updates
- Other employee events

---

🏢 HR Management

The HR side is designed around centralized employee administration.

HR functionality includes:

- Employee management
- Employee records
- Attendance monitoring
- Leave management
- Payroll-related administration
- HR dashboard functionality
- Role-based access

The architecture allows HR functionality to be separated from the employee experience while still communicating through APIs.

---

🖥️ Frontend

The frontend is built using React and uses reusable components and page-based organization.

Main frontend pages

src/
├── api/
│   ├── auth.js
│   ├── client.js
│   ├── hrAuth.js
│   └── hrClient.js
│
├── components/
│   ├── Layout
│   ├── NotificationBell
│   └── reusable UI components
│
├── pages/
│   ├── Login.jsx
│   ├── EmployeeDashboard.jsx
│   ├── Attendance.jsx
│   ├── Leave.jsx
│   ├── Payroll.jsx
│   └── Profile.jsx
│
├── App.jsx
├── App.css
├── index.css
└── main.jsx

Axios is used for API communication.

The frontend uses API clients/interceptors to automatically attach authentication tokens to requests.

---

⚙️ Backend

The backend is implemented using Flask with SQLAlchemy.

The backend handles:

- Authentication
- Employee records
- Attendance
- Leave
- Payroll
- HR operations
- JWT generation and validation
- Database access
- Supporting HR/business services

The employee backend runs as a Flask development server and exposes REST APIs.

Example authentication endpoint:

POST /api/auth/login

Example employee endpoint:

GET /api/employee/me

---

🗄️ Database

The project currently uses SQLite with SQLAlchemy.

The database contains employee information including:

- Employee ID
- Employee code
- Name
- Email
- Department
- Role
- Password hash
- Salary
- Leave information
- Other HR records

A seeded database is provided for development/demo purposes.

---

🌱 Demo Accounts

Employee

Email: employee@dayflow.com
Password: password123
Employee ID: EMP1024
Name: Sneha
Department: Data Science
Role: employee

HR

Email: hr@dayflow.com
Password: password123
Employee ID: HR001
Name: HR Admin
Department: Human Resources
Role: hr

The demo HR account was successfully verified directly against the Flask backend, confirming that the backend authentication and password hashing are functioning correctly.

---

🔌 API Architecture

The project uses REST APIs to communicate between the React frontend and Flask backend.

Authentication

POST /api/auth/login

Returns:

token
role
employee

Employee Information

GET /api/employee/me

Protected using:

Authorization: Bearer <JWT>

The authenticated employee information returned by the backend includes details such as:

emp_id
name
salary
leave_balance

and other employee-specific information.

---

🧩 Core Services

The backend architecture also contains supporting core services for HR operations.

These include functionality related to:

- Attendance
- Location
- QR-based services
- Blockchain-related service integration
- Business logic
- HR data processing

The service-oriented structure makes it possible to extend individual HR capabilities without rebuilding the entire application.

---

📍 Location & Attendance Support

The project includes location-related backend functionality to support attendance workflows.

This provides a foundation for implementing controlled attendance based on workplace/location requirements, including configurable attendance radius logic.

---

🔗 Blockchain Integration

The backend project also contains a blockchain service component.

This provides a foundation for maintaining tamper-resistant or verifiable HR/attendance-related records and demonstrates how blockchain technology can be incorporated into an HR management platform.

---

🛠️ Technologies Used

Technology| Purpose
React| Frontend application
JavaScript| Frontend logic
Axios| API communication
CSS / Tailwind| UI styling
Python| Backend development
Flask| REST API
SQLAlchemy| ORM/database management
SQLite| Development database
JWT| Authentication
Werkzeug| Password hashing
QR Services| Attendance support
Location Services| Location-based attendance
Blockchain Service| Record verification/integrity

---

📁 Project Structure

odoo-nmit-hackathon-2026/
│
├── core/
│   └── Core/backend services
│
├── employee-backend/
│   ├── app.py
│   ├── instance/
│   │   └── dayflow.db
│   ├── requirements.txt
│   ├── venv/
│   └── __pycache__/
│
├── employee-frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── ...
│
└── README.md

---

▶️ Running the Backend

From the backend directory:

cd employee-backend

Activate the virtual environment:

.\venv\Scripts\Activate.ps1

Run the Flask application:

python -m flask --app app run

The development backend runs on:

http://127.0.0.1:5000

---

▶️ Running the Frontend

From the frontend directory:

cd employee-frontend
npm install
npm run dev

The frontend can then be opened through the local development URL provided by Vite.

---

🧪 Backend Authentication Testing

The backend was tested directly using PowerShell REST requests.

Example:

$body = @{
    email = "hr@dayflow.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod `
    -Method POST `
    -Uri "http://127.0.0.1:5000/api/auth/login" `
    -ContentType "application/json" `
    -Body $body

The HR account successfully returned:

role: hr
emp_id: HR001
name: HR Admin
department: Human Resources
token: <JWT>

This confirmed that the HR credentials and backend authentication are working.

---

🔍 Frontend / Backend Architecture Note

The frontend currently contains separate API client logic for employee and HR functionality.

The HR client was configured to use:

http://localhost:5001/api

while the verified employee backend is running on:

http://127.0.0.1:5000

Therefore, if a separate HR backend is not running on port "5001", the HR frontend API configuration must be aligned with the actual backend architecture.

This separation was identified and tested during development.

---

🔒 Security

Dayflow implements several basic security practices:

- Password hashing using Werkzeug
- JWT-based authentication
- Protected API requests
- Bearer token authentication
- Role-based authorization
- Passwords are never stored directly in plain text
- Sensitive authentication information is handled through tokens

For production deployment, additional security measures such as HTTPS, secure cookies/token storage, environment-based secrets, stronger validation, rate limiting, and production-grade database infrastructure should be added.

---

🎯 Hackathon Objective

Dayflow was developed as a practical HR technology solution for the NMIT Hackathon 2026.

The goal is to demonstrate how a modern HR platform can combine:

Employee Self-Service + HR Administration + Attendance + Leave + Payroll + Notifications + Secure Authentication + Location Services + Blockchain Concepts

into a unified digital platform.

---

🚀 Future Enhancements

Potential future improvements include:

- Complete HR-specific backend deployment
- Advanced HR analytics
- Attendance reports
- Payroll automation
- Automated payslip generation
- Email notifications
- Push notifications
- Advanced leave approval workflows
- Employee search and filtering
- Role/permission management
- Production PostgreSQL database
- Cloud deployment
- HTTPS and production security
- Audit logs
- Enhanced blockchain verification
- Mobile application
- AI-assisted HR insights

---

👨‍💻 Development

Dayflow was developed as a collaborative hackathon project with a focus on integrating frontend, backend, database, authentication, HR workflows, and supporting services into a single working system.

The project demonstrates an end-to-end HR management workflow from login → authentication → employee data → HR operations → attendance → leave → payroll → notifications.

---

📌 Current Status

Completed / Working

- ✅ React frontend
- ✅ Flask backend
- ✅ SQLite database
- ✅ Employee authentication
- ✅ HR authentication at backend level
- ✅ JWT token generation
- ✅ Password hashing
- ✅ Employee profile
- ✅ Employee dashboard
- ✅ Attendance module
- ✅ Leave module
- ✅ Payroll module
- ✅ Notification component
- ✅ Role-based login
- ✅ Employee API
- ✅ HR account/database seeding
- ✅ Direct API testing
- ✅ Location/attendance service foundation
- ✅ QR service foundation
- ✅ Blockchain service foundation

Integration To Verify

- ⚠️ HR frontend API configuration versus the actual HR backend port/service
- ⚠️ Full end-to-end HR frontend → HR backend integration

---

⭐ Conclusion

Dayflow provides a complete foundation for a modern digital HR ecosystem. It combines employee self-service with HR administration while providing secure authentication, structured APIs, database-backed employee records, attendance, leave, payroll, notifications, and extensible core services.

Built for NMIT Hackathon 2026 with the goal of making everyday HR operations simpler, faster, and more accessible.