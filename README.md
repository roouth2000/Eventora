# Eventora - Event Privilege Manager (EPM) Console

Eventora is a premium event privilege management and attendee verification console. It features scannable QR code check-ins, vendor stall privilege redemptions, badge printing, and dynamic analytics.

---

## 🗺️ System Architecture

The application is structured into two decoupled environments:

### 1. **Frontend Web App (Client)**
* **Domain**: `https://eventry.heavenwebtechnologies.com` (Staging/Production) or local `http://localhost:5173`
* **Technology**: React, Vite, Vanilla CSS
* **Purpose**: Serves the user interface, console dashboard, vendor scanners, profile manager, and event registration forms.

### 2. **Backend API Server (Database REST Gateway)**
* **Domain**: `https://eventora.heavenwebtechnologies.com` (Staging/Production) or local `http://localhost:5000`
* **Technology**: Node.js, Express, Sequelize ORM, MySQL
* **Purpose**: Stores records for users, physical events, and attendee registrations. Serves REST endpoints under `/api/v1`.

---

## 🔗 Event Registration Link Structure

When organizers create an event, the backend automatically generates a unique URL-safe **slug** from the title before saving (via the model validate hook).

The registration link matches the following dynamic format:
```
[Frontend-Web-App-Origin]/events/[event-slug]
```

### Examples:
* **Production**: `https://eventry.heavenwebtechnologies.com/events/rocking-web-concert-c3`
* **Local Development**: `http://localhost:5173/events/rocking-web-concert-c3`

### QR Code Value Mapping:
The QR code shown in the Event Access modal encodes this exact registration URL. Scanning the QR code directs the user's phone browser to load the registration form on the frontend app rather than fetching raw JSON tables from the backend REST server.

---

## 📱 QR Code Integration Details

| QR Type | Value Encoded | Scanned By | Outcome |
| :--- | :--- | :--- | :--- |
| **Event Access QR** | `[Frontend-Origin]/events/[slug]` | General Users | Navigates user to registration checkout page |
| **Attendee ID Badge QR** | `EPM-[Attendee-Code]` (e.g. `EPM-1002`) | Entrance Gates / Stall Staff | Validates gate entry or redeems privileges |
| **Stall Redemption QR** | `[Stall-Name]` (e.g. `Tea Break`) | Staff Scanners | Binds vendor scanner terminal to the specified counter |

---

## 🚀 Running the Application

### 1. Backend Server Setup
From the project root:
```bash
# Install dependencies
npm install

# Run database migrations and seeding
npm run db:migrate
npm run db:seed

# Start backend server (Port 5000)
npm run start
```

### 2. Frontend React Setup
From the `frontend` folder:
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Build static production bundle
npm run build

# Start local development server (Port 5173)
npm run dev
```
