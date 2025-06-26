# Shift Management System

A complete all in one application for managing employee shifts with React frontend and Express.js backend.

## Project Structure

```
HCL/
├── backend/          # Express.js API server
├── frontend/         # React.js client application
└── README.md         # This file
```

## Features

- **User Authentication**: Simple username/password login
- **Employee Management**: CRUD operations for employees
- **Shift Management**: Create and manage work shifts
- **Shift Assignments**: Assign employees to shifts
- **Responsive Design**: Mobile-friendly interface
- **Search & Filter**: Find employees and shifts easily
- **Pagination**: Handle large datasets

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Session-based (no JWT)
- **Validation**: Express-validator

### Frontend
- **Framework**: React.js with Hooks
- **Routing**: React Router
- **Styling**: Material-UI components
- **HTTP Client**: Fetch API
- **State Management**: React Context API

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (with MongoDB Compass)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
1. Install MongoDB Compass
2. Create a database named `shift_management`
3. The collections will be created automatically when you first use the application

## API Documentation

### Base URL: `http://localhost:5000/api`

All routes require authentication except `/auth/login`. Include `credentials: 'include'` in frontend requests for session cookies.

---

## Authentication Routes

### POST /auth/login
**Description**: User login with username and password

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "username": "admin"
  }
}
```

### POST /auth/logout
**Description**: User logout (destroys session)

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /auth/me
**Description**: Get current authenticated user

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "admin"
  }
}
```

---

## User Management Routes

### GET /users
**Description**: Get all users (Admin only)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "username": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /users
**Description**: Create new user (Admin only)

**Request Body**:
```json
{
  "username": "newuser",
  "password": "password123"
}
```

### PUT /users/:id
**Description**: Update user (Admin only)

**Request Body**:
```json
{
  "username": "updateduser",
  "password": "newpassword"
}
```

### DELETE /users/:id
**Description**: Delete user (Admin only)

---

## Employee Management Routes

### GET /employees
**Description**: Get all employees with pagination and search

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or employee ID
- `department` (optional): Filter by department

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "employee_id",
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "department": "Engineering",
      "position": "Software Engineer",
      "hireDate": "2023-01-15T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /employees/:id
**Description**: Get employee by ID

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "employee_id",
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "department": "Engineering",
    "position": "Software Engineer",
    "hireDate": "2023-01-15T00:00:00.000Z"
  }
}
```

### POST /employees
**Description**: Create new employee

**Request Body**:
```json
{
  "employeeId": "EMP002",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "department": "Marketing",
  "position": "Marketing Manager",
  "hireDate": "2023-02-20"
}
```

### PUT /employees/:id
**Description**: Update employee

**Request Body**:
```json
{
  "name": "Jane Wilson",
  "department": "Sales"
}
```

### DELETE /employees/:id
**Description**: Delete employee

---

## Shift Management Routes

### GET /shifts
**Description**: Get all shifts with pagination and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "shift_id",
      "shiftName": "Morning Shift",
      "startTime": "08:00",
      "endTime": "16:00",
      "date": "2024-01-15T00:00:00.000Z",
      "location": "Main Office",
      "description": "Regular morning shift",
      "maxEmployees": 5,
      "assignedEmployees": 3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /shifts/:id
**Description**: Get shift by ID with assigned employees

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "shift_id",
    "shiftName": "Morning Shift",
    "startTime": "08:00",
    "endTime": "16:00",
    "date": "2024-01-15T00:00:00.000Z",
    "location": "Main Office",
    "description": "Regular morning shift",
    "maxEmployees": 5,
    "assignedEmployees": [
      {
        "_id": "employee_id",
        "name": "John Doe",
        "employeeId": "EMP001",
        "department": "Engineering",
        "assignmentStatus": "assigned",
        "assignmentId": "assignment_id"
      }
    ]
  }
}
```

### POST /shifts
**Description**: Create new shift

**Request Body**:
```json
{
  "shiftName": "Evening Shift",
  "startTime": "16:00",
  "endTime": "00:00",
  "date": "2024-01-15",
  "location": "Main Office",
  "description": "Regular evening shift",
  "maxEmployees": 3
}
```

### PUT /shifts/:id
**Description**: Update shift

**Request Body**:
```json
{
  "shiftName": "Updated Evening Shift",
  "maxEmployees": 4
}
```

### DELETE /shifts/:id
**Description**: Delete shift

---

## Shift Assignment Routes

### GET /shift-assignments
**Description**: Get all shift assignments with optional filtering

**Query Parameters**:
- `shiftId` (optional): Filter by shift ID
- `employeeId` (optional): Filter by employee ID
- `date` (optional): Filter by date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "assignment_id",
      "shiftId": {
        "_id": "shift_id",
        "shiftName": "Morning Shift",
        "date": "2024-01-15T00:00:00.000Z",
        "startTime": "08:00",
        "endTime": "16:00"
      },
      "employeeId": {
        "_id": "employee_id",
        "name": "John Doe",
        "employeeId": "EMP001"
      },
      "status": "assigned",
      "assignedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /shift-assignments/shift/:shiftId
**Description**: Get all assignments for a specific shift

### GET /shift-assignments/employee/:employeeId
**Description**: Get all assignments for a specific employee

### POST /shift-assignments
**Description**: Assign single employee to shift

**Request Body**:
```json
{
  "shiftId": "shift_id",
  "employeeId": "employee_id",
  "status": "assigned"
}
```

### POST /shift-assignments/bulk
**Description**: Bulk assign multiple employees to shift

**Request Body**:
```json
{
  "shiftId": "shift_id",
  "employeeIds": ["employee_id_1", "employee_id_2", "employee_id_3"]
}
```

### PUT /shift-assignments/:id
**Description**: Update assignment status

**Request Body**:
```json
{
  "status": "completed"
}
```

**Status Options**: `assigned`, `completed`, `cancelled`

### DELETE /shift-assignments/:id
**Description**: Remove assignment

---

## Error Responses

All routes return consistent error responses:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shift_management
SESSION_SECRET=your_session_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Default Login Credentials

After running the application for the first time, you can create a user through the API or use the default admin account:
- Username: `admin`
- Password: `admin123`

## Development

### Backend Development
```bash
cd backend
npm run dev  # For development with nodemon
```

### Frontend Development
```bash
cd frontend
npm start    # Starts development server
```

## Database Schema

### Users Collection
- `_id`: ObjectId
- `username`: String (unique)
- `password`: String (plain text)
- `createdAt`: Date
- `updatedAt`: Date

### Employees Collection
- `_id`: ObjectId
- `employeeId`: String (unique)
- `name`: String
- `email`: String
- `phone`: String
- `department`: String
- `position`: String
- `hireDate`: Date
- `createdAt`: Date
- `updatedAt`: Date

### Shifts Collection
- `_id`: ObjectId
- `shiftName`: String
- `startTime`: String (HH:MM)
- `endTime`: String (HH:MM)
- `date`: Date
- `location`: String
- `description`: String
- `maxEmployees`: Number
- `createdAt`: Date
- `updatedAt`: Date

### ShiftAssignments Collection
- `_id`: ObjectId
- `shiftId`: ObjectId (ref: Shifts)
- `employeeId`: ObjectId (ref: Employees)
- `assignedAt`: Date
- `status`: String (assigned/completed/cancelled)

## License

This project is a joint collaboration of Xitiz Verma, Harshita M, Yadhu. 
