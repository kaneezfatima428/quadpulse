# ClinicPulse — Frontend Client

A responsive, medical-themed Single Page Application (SPA) built for the **Clinic Appointment Management System** hackathon project with **React 19, Vite, Tailwind CSS, Axios, and React Router v7**.

---

## 🚀 Features & Role-Based Routing

### 1. Public Pages
- **`/`**: Clinic landing page introducing key features and services.
- **`/login`**: Multi-role login screen with quick 1-click Admin autofill for evaluator testing.
- **`/register`**: Patient & Doctor registration with dynamic specialization/experience fields for doctors.

### 2. Patient Portal (`role: patient`)
- **`/patient-dashboard`**: Metrics overview, recent bookings, quick booking CTA.
- **`/book-appointment`**: Live search by doctor name or specialty, conflict prevention, past-date restriction, and time slot selection.
- **`/my-appointments`**: Live status badges (Pending, Approved, Rejected, Cancelled) with cancellation action for pending requests.

### 3. Doctor Portal (`role: doctor`)
- **`/doctor-dashboard`**: Doctor profile overview, consultation count cards, pending requests quick review.
- **`/appointment-requests`**: Filterable table of assigned consultations with 1-click **Approve** and **Reject** buttons.

### 4. Admin Portal (`role: admin`)
- **`/admin-dashboard`**: Live aggregate metrics (`totalPatients`, `totalDoctors`, `totalAppointments`, breakdown by status).
- **`/manage-users`**: Full user directory, search & role filters, **Add Doctor Account** modal, toggle active/inactive status, delete user.
- **`/all-appointments`**: Master consultation schedule across the entire hospital system with populated patient & doctor info.

---

## 🛠️ Setup & Running

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```
The client runs on `http://localhost:5173`. Ensure the backend server is running on `http://localhost:5000`.

### 4. Build for Production
```bash
npm run build
```
The production bundle is generated in `client/dist/`.
