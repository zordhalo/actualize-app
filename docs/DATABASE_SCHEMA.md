# Database Schema Documentation

## Overview

This document describes the MongoDB database schema for the **Actualize** wellness application. The database is hosted on MongoDB Atlas and uses the `wellness_auth_db` database.

**Database Name:** `wellness_auth_db`  
**Connection:** MongoDB Atlas (mongodb+srv://)

---

## Collections

### 1. `users`

Stores core user account information for authentication.

**Schema:**
```typescript
{
  _id: ObjectId,                    // MongoDB generated ID
  name: string | null,               // User's display name
  email: string,                     // User's email (unique, indexed)
  emailVerified: Date | null,        // Email verification timestamp
  image: string | null,              // Profile image URL
  createdAt: Date,                   // Account creation timestamp
  updatedAt: Date                    // Last update timestamp
}
```

**Indexes:**
- `email` (unique) - Ensures email uniqueness

**Relationships:**
- One-to-many with `accounts` (via `userId`)
- One-to-one with `user_profiles` (via `user_id`)

**Usage:**
- Created during user signup
- Updated when user profile changes
- Used for authentication lookups

---

### 2. `accounts`

Stores authentication provider accounts linked to users. Supports multiple authentication methods per user.

**Schema:**
```typescript
{
  _id: ObjectId,                     // MongoDB generated ID
  userId: string,                    // Reference to users._id (as hex string)
  provider: string,                  // Provider name (e.g., "credentials", "google", "github")
  type: string,                      // Account type (e.g., "credentials")
  providerAccountId: string,         // Provider-specific account ID
  password: string | null,           // Hashed password (for credentials provider only)
  access_token: string | null,       // OAuth access token
  expires_at: number | null,         // Token expiration timestamp
  refresh_token: string | null,      // OAuth refresh token
  id_token: string | null,           // OAuth ID token
  scope: string | null,             // OAuth scope
  session_state: string | null,      // OAuth session state
  token_type: string | null,         // Token type (e.g., "Bearer")
  createdAt: Date                   // Account linking timestamp
}
```

**Indexes:**
- `userId` - For quick user account lookups
- `provider` + `providerAccountId` - For provider account lookups

**Relationships:**
- Many-to-one with `users` (via `userId`)

**Usage:**
- Created when user signs up with credentials
- Created when user links OAuth account
- Used for password verification during login
- Stores hashed passwords using Argon2

**Password Storage:**
- Passwords are hashed using Argon2 before storage
- Never stored in plain text
- Only present for `provider: "credentials"` accounts

---

### 3. `sessions`

Stores active user sessions for maintaining authentication state.

**Schema:**
```typescript
{
  _id: ObjectId,                     // MongoDB generated ID
  sessionToken: string,              // Unique session token
  userId: string,                    // Reference to users._id (as hex string)
  expires: Date,                     // Session expiration timestamp
  createdAt: Date                    // Session creation timestamp
}
```

**Indexes:**
- `sessionToken` (unique) - For session lookups
- `userId` - For user session queries

**Relationships:**
- Many-to-one with `users` (via `userId`)

**Usage:**
- Created on successful login
- Deleted on logout or expiration
- Used to maintain authenticated state

---

### 4. `verification_tokens`

Stores email verification and password reset tokens.

**Schema:**
```typescript
{
  _id: ObjectId,                     // MongoDB generated ID
  identifier: string,                 // Email or user identifier
  token: string,                     // Verification token (hashed)
  expires: Date                      // Token expiration timestamp
}
```

**Indexes:**
- `identifier` + `token` - For token lookups

**Usage:**
- Created for email verification
- Created for password reset requests
- Deleted after use (one-time use tokens)

---

### 5. `assessments`

Stores user wellness assessment results across five dimensions.

**Schema:**
```typescript
{
  _id: ObjectId,                     // MongoDB generated ID
  user_id: string,                   // Reference to users._id (as hex string)
  overall_score: number,            // Average score across all dimensions (0-100)
  spiritual_score: number,           // Spiritual wellness score (0-100)
  physical_score: number,            // Physical wellness score (0-100)
  mental_score: number,              // Mental wellness score (0-100)
  educational_score: number,         // Educational wellness score (0-100)
  financial_score: number,           // Financial wellness score (0-100)
  responses: Object,                 // Map of questionId -> response (1-5)
  completed_at: Date                // Assessment completion timestamp
}
```

**Indexes:**
- `user_id` + `completed_at` - For user assessment history queries

**Relationships:**
- Many-to-one with `users` (via `user_id`)

**Usage:**
- Created when user completes an assessment
- Used to track wellness progress over time
- Used for profile statistics and history

**Scoring:**
- Each dimension score: 0-100 (normalized from raw responses)
- Overall score: Average of all five dimension scores
- Responses: 1-5 scale (some questions are reverse-coded)

---

### 6. `questions`

Stores assessment questions organized by wellness dimensions.

**Schema:**
```typescript
{
  _id: ObjectId,                     // MongoDB generated ID
  question_text: string,              // The question text
  dimension: string,                  // Dimension: "Spiritual" | "Physical" | "Mental" | "Educational" | "Financial"
  is_reverse_coded: boolean,         // Whether response should be reversed (1->5, 2->4, etc.)
  is_active: boolean,                 // Whether question is currently active
  order_index: number                 // Display order within dimension
}
```

**Indexes:**
- `dimension` + `order_index` - For ordered question retrieval
- `is_active` - For filtering active questions

**Usage:**
- Used to generate assessment forms
- Questions are grouped by dimension
- Reverse-coded questions are handled during scoring

**Dimensions:**
- **Spiritual**: Questions about spiritual wellness and purpose
- **Physical**: Questions about physical health and fitness
- **Mental**: Questions about mental health and emotional well-being
- **Educational**: Questions about learning and personal growth
- **Financial**: Questions about financial health and security

---

### 7. `user_profiles`

Stores extended user profile information beyond basic auth data.

**Schema:**
```typescript
{
  _id: ObjectId,                     // MongoDB generated ID
  user_id: string,                   // Reference to users._id (as hex string)
  full_name: string | null,           // User's full name
  age: number | null,                 // User's age
  focus_area: string | null,          // Primary wellness focus area
  onboarding_completed: boolean,      // Whether user completed onboarding
  created_at: Date,                   // Profile creation timestamp
  updated_at: Date                    // Last update timestamp
}
```

**Indexes:**
- `user_id` (unique) - One profile per user

**Relationships:**
- One-to-one with `users` (via `user_id`)

**Usage:**
- Created automatically when user first accesses profile
- Updated through profile settings
- Used for personalized dashboard content

---

### 8. `auth_users` (Legacy/Unused)

**Status:** Empty collection, appears to be legacy from previous auth system.

**Note:** This collection is not currently used. The application uses the `users` collection for authentication.

---

### 9. `auth_accounts` (Legacy/Unused)

**Status:** Empty collection, appears to be legacy from previous auth system.

**Note:** This collection is not currently used. The application uses the `accounts` collection for authentication.

---

## Authentication Flow

### Sign Up Process

1. **Email Check**: System checks if email exists in `users` collection
   - If exists → Error: "EmailCreateAccount" (email already registered)
   - If not exists → Continue

2. **User Creation**: Create new document in `users` collection
   ```javascript
   {
     name: string | null,
     email: string,
     emailVerified: null,
     image: string | null,
     createdAt: Date,
     updatedAt: Date
   }
   ```

3. **Account Creation**: Create credentials account in `accounts` collection
   ```javascript
   {
     userId: string,
     provider: "credentials",
     type: "credentials",
     providerAccountId: string,
     password: string, // Argon2 hashed
     createdAt: Date
   }
   ```

4. **Session Creation**: Create session in `sessions` collection (handled by Auth.js)

### Sign In Process

1. **Email Lookup**: Find user by email in `users` collection
2. **Account Lookup**: Find credentials account in `accounts` collection
3. **Password Verification**: Verify password using Argon2
4. **Session Creation**: Create session if verification succeeds

---

## Data Relationships

```
users (1) ──< (many) accounts
users (1) ──< (many) sessions
users (1) ──< (many) assessments
users (1) ── (1) user_profiles
assessments (many) ──> (1) questions (via question_id in responses)
```

---

## Indexes Summary

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| `users` | `email` | Unique | Prevent duplicate emails |
| `accounts` | `userId` | Index | Fast user account lookups |
| `accounts` | `provider` + `providerAccountId` | Index | Provider account lookups |
| `sessions` | `sessionToken` | Unique | Session authentication |
| `sessions` | `userId` | Index | User session queries |
| `assessments` | `user_id` + `completed_at` | Index | User assessment history |
| `questions` | `dimension` + `order_index` | Index | Ordered question retrieval |
| `user_profiles` | `user_id` | Unique | One profile per user |

---

## Security Considerations

1. **Password Storage**: All passwords are hashed using Argon2 before storage
2. **Email Uniqueness**: Enforced at database level via unique index
3. **Session Tokens**: Cryptographically secure random tokens
4. **Verification Tokens**: One-time use, expire after set time
5. **Data Validation**: Input validation occurs at application level

---

## Migration Notes

- The `auth_users` and `auth_accounts` collections appear to be legacy from a previous authentication system
- Current system uses `users` and `accounts` collections
- These legacy collections can be safely ignored or removed if not needed

---

## Environment Variables

Required environment variables for database connection:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/wellness_auth_db
# OR
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_DATABASE=wellness_auth_db
```

---

## API Endpoints Using Collections

| Endpoint | Collections Used | Operation |
|----------|------------------|-----------|
| `POST /api/auth/signup` | `users`, `accounts` | Create user and account |
| `POST /api/auth/signin` | `users`, `accounts` | Authenticate user |
| `GET /api/questions` | `questions` | Get assessment questions |
| `POST /api/assessments` | `assessments`, `questions` | Create assessment |
| `GET /api/assessments` | `assessments` | Get user assessments |
| `GET /api/profile` | `user_profiles`, `assessments` | Get user profile |
| `PUT /api/profile` | `user_profiles` | Update user profile |

---

## Future Considerations

1. **Email Verification**: `emailVerified` field exists but verification flow not yet implemented
2. **Password Reset**: `verification_tokens` collection ready for password reset flow
3. **OAuth Providers**: `accounts` collection supports OAuth but not yet implemented
4. **Assessment History**: Consider adding indexes for time-based queries
5. **Data Archival**: Consider archival strategy for old assessments

---

## Database Statistics (Current)

Based on current database state:

- **users**: 1 document
- **accounts**: 1 document  
- **assessments**: 2 documents
- **questions**: 35 documents
- **user_profiles**: 0 documents (created on-demand)
- **sessions**: Variable (created/deleted dynamically)
- **verification_tokens**: Variable (created/deleted dynamically)

---

*Last Updated: Based on current database schema analysis*
