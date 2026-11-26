# Mini-LMS -- Consultation Management System

A lightweight Learning Management System (LMS) built with **Next.js,
TypeScript and Supabase**. Students can manage their own consultations,
while administrators have a read-only view of all students and their
consultations.

## 1. Tech Stack

| Technology | Purpose |
|---|---|
| Next.js (App Router) | Frontend and API Route Handlers |
| React | User interface |
| TypeScript | Type safety |
| Supabase Auth | User authentication |
| Supabase PostgreSQL | Database |
| Supabase SSR | Server-side authentication and session management |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |

## 2. Features

### Authentication

-   Student registration, login and logout.
-   Session management using Supabase Auth.
-   Role-based access for students and administrators.

### Student Dashboard

-   View the authenticated student's consultations.
-   Book a consultation.
-   Reschedule an existing consultation.
-   Cancel a consultation. Cancellation is represented through the consultation status 
    field rather than deleting the database record.
-   Mark each consultation complete.

### Consultation statuses

-   Scheduled
-   Completed
-   Cancelled

### Admin Dashboard

-   View all students and their consultation details.
-   Sort the view according to student name and status.
-   Read-only access: administrators cannot create, reschedule, cancel
    or otherwise modify consultations through the admin dashboard for now.

### Security

-   Server-side authentication and authorization checks protect restricted operations.
-   Supabase Row Level Security (RLS) protects access to user and consultation records.
    API endpoints validate incoming data.
-   The authenticated user's ID is obtained from the server-side session rather than 
    trusted from the request payload.
-   Students can access only their own consultations.
-   Admin access is restricted to users with the admin role.
-   Public registration assigns the student role by default; users
    cannot grant themselves admin access.
-   API routes validate request data and enforce ownership and
    permissions.

### Assumptions

- Each consultation is associated with one student.
- Students are responsible for managing their own consultation bookings.
- Consultation dates and times are stored using PostgreSQL TIMESTAMPTZ.
- The application uses the browser's/local environment's timezone for displaying dates and times, unless otherwise configured.
- Consultation cancellation retains the record for historical reference.
- Administrators require visibility of all students and their consultation statuses but do not need editing capabilities.

## 3. Prerequisites

Install the following:

-   Node.js (LTS version)
-   npm
-   Git
-   Docker Desktop
-   Supabase CLI

Check your installations:

``` bash
node -v
npm -v
git --version
docker --version
```

## 4. Getting Started

### Step 1: Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd mini-lms
```

### Step 2: Install dependencies

``` bash
npm install
```

### Step 3: Start local Supabase

Start Docker Desktop first.

If Supabase has not been initialized in the project:

``` bash
npx supabase init
```

Start the local Supabase services:

``` bash
npx supabase start
```

Display the local service URLs and credentials:

``` bash
npx supabase status
```

The default local service URLs typically include:

  Service           URL
  ----------------- ------------------------
  Supabase API      http://127.0.0.1:54321
  Supabase Studio   http://127.0.0.1:54323
  Mailpit           http://127.0.0.1:54324

### Step 4: Configure environment variables

Create a `.env.local` file in the project root.

``` env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<YOUR_LOCAL_PUBLISHABLE_KEY>
```

Get the local publishable key from:

``` bash
npx supabase status
```

### Step 5: Apply database migrations

``` bash
npx supabase db reset
```

This resets the local database and applies the migrations in
`supabase/migrations/`.

### Step 6: To provide a user admin role

``` bash
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

New registrations are assigned the student role by default.
To test the admin dashboard, an existing user must be assigned the admin role through a trusted database operation.
For local development, this can be done through Supabase Studio by updating the relevant record in the profiles table.

### Step 7: Run the application

``` bash
npm run dev
```

Open <http://localhost:3000>.

## 5. Database Design

### Profiles

Stores application-specific information associated with a Supabase Auth
user.

  ### Profiles Table

| Column | Type | Description |
|---|---|---|
| `id` | UUID | References the Supabase Auth user ID |
| `first_name` | TEXT | User's first name |
| `last_name` | TEXT | User's last name |
| `role` | TEXT | Application role, such as `student` or `admin` |
| `created_at` | TIMESTAMPTZ | Profile creation timestamp |

### Consultations

Stores consultation bookings.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Consultation primary key |
| `student_id` | UUID | References the student's profile |
| `reason` | TEXT | Reason for the consultation |
| `scheduled_at` | TIMESTAMPTZ | Scheduled consultation date and time |
| `status` | TEXT | Consultation status (e.g. `scheduled`, `completed`, `cancelled`) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## 6. API Endpoints

### Student Consultation APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/consultations` | Retrieve the authenticated student's consultations |
| `POST` | `/api/consultations` | Book a new consultation |
| `PATCH` | `/api/consultations/[id]` | Update or reschedule an existing consultation, including permitted status changes |

### Admin API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/consultations` | Retrieve all students and their consultations for the admin read-only dashboard |

## 7. Authentication and Authorization

Supabase Auth handles user authentication. The application uses the
authenticated user's ID to determine which student records they can
access.

When a user registers:

1.  Supabase creates the authentication record.
2.  A database trigger creates the associated profile.
3.  The profile receives the default `student` role.
4.  Admin privileges are assigned separately through a trusted process.

### Access Control

| Capability | Student | Admin |
|---|---|---|
| View own consultations | Yes | Not applicable |
| View all students and their consultations | No | Yes |
| Book a consultation | Yes | No |
| Reschedule own consultation | Yes | No |
| Cancel own consultation | Yes | No |
| Update own consultation status | Yes | No |
| Modify other students' consultations | No | No |

The admin dashboard provides read-only access to all students and their consultations. Administrators cannot create, reschedule, cancel or modify consultation records.

## 8. Useful Commands

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run lint checks, if configured |
| `npx supabase start` | Start local Supabase |
| `npx supabase stop` | Stop local Supabase |
| `npx supabase status` | Display local Supabase service information |
| `npx supabase db reset` | Reset the local database and apply migrations |
