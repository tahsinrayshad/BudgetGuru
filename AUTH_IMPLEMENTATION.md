# User Authentication Backend Implementation

## Overview
This implementation provides complete JWT-based authentication for the BudgetGuru application with user registration, login, and protected routes.

## Files Created

### Types (`types/auth.ts`)
- `User`: User entity type
- `JWTPayload`: JWT token payload
- `AuthResponse`: Standard auth response format
- `LoginRequest`: Login request body
- `RegisterRequest`: Registration request body
- `VerifyTokenResponse`: Token verification response

### Services (`services/auth.service.ts`)
- `registerUser()`: Create new user with password hashing
- `loginUser()`: Authenticate user and generate JWT token
- `getUserById()`: Fetch user by ID
- `updateUser()`: Update user information

### Libraries

#### JWT (`lib/jwt.ts`)
- `generateToken()`: Create JWT token with 7-day expiry
- `verifyToken()`: Validate and decode JWT token
- `getTokenFromHeader()`: Extract Bearer token from Authorization header

#### Prisma Client (`lib/prisma-client.ts`)
- Singleton Prisma instance with proper connection pooling

#### Auth Middleware (`lib/auth-middleware.ts`)
- `authenticate()`: Higher-order function for protecting routes
- Validates JWT tokens and attaches user context

#### Client Utilities (`lib/auth-client.ts`)
- `setToken()`: Store token in localStorage
- `getToken()`: Retrieve token from localStorage
- `register()`: Client-side registration
- `login()`: Client-side login
- `logout()`: Clear token
- `getCurrentUser()`: Fetch authenticated user
- `isAuthenticated()`: Check auth status

### API Routes

#### POST `/api/auth/register`
Register new user
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "password123",
  "name": "John Doe" // optional
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user (requires Bearer token)
```
Authorization: Bearer <token>
```

#### POST `/api/auth/logout`
Logout user (requires Bearer token)

## Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/budgetguru
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRY=7d
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Security Features
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT-based stateless authentication
- ✅ Token expiry management (7 days default)
- ✅ Input validation and email format checking
- ✅ Password strength requirements (minimum 6 characters)
- ✅ Unique constraints on email and username
- ✅ Bearer token extraction and validation

## Installation
Run the following command to install dependencies:
```bash
npm install
```

## Next Steps
1. Set up environment variables in `.env.local`
2. Run `npm run dev` to start the development server
3. Test the API endpoints using Postman or similar tools
4. Create login/register pages in the `(auth)` folder
