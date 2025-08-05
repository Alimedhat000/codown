
# API Documentation

## 🔐 Auth Routes (`/api/auth`)

| Method | Endpoint    | Description                       | Auth Required  | Body Schema          |
| ------ | ----------- | --------------------------------- | -------------- | -------------------- |
| POST   | `/register` | Register a new user               | ❌ No           | `RegisterUserSchema` |
| POST   | `/login`    | Log in a user                     | ❌ No           | `LoginUserSchema`    |
| POST   | `/logout`   | Log out current user              | ✅ Yes          | —                    |
| POST   | `/refresh`  | Refresh access token using cookie | ✅ Yes (cookie) | —                    |

---

## 👤 User Routes (`/api/user`)

| Method | Endpoint | Description      | Auth Required |
| ------ | -------- | ---------------- | ------------- |
| GET    | `/`      | Get current user | ✅ Yes         |

---

## 📄 Document Routes (`/api/document`)

All routes require authentication (`Bearer <token>`)

### 📁 Basic Document Operations

| Method | Endpoint | Description                    |
| ------ | -------- | ------------------------------ |
| POST   | `/`      | Create a new document          |
| GET    | `/`      | Get all documents for the user |
| GET    | `/:id`   | Get a specific document        |
| PUT    | `/:id`   | Update a document              |
| DELETE | `/:id`   | Delete a document              |

### ⚙️ Document Settings

| Method | Endpoint        | Description                                     |
| ------ | --------------- | ----------------------------------------------- |
| PATCH  | `/:id/settings` | Update document settings (e.g. `allowSelfJoin`) |

### 🔗 Share & Join via Share ID

| Method | Endpoint          | Description                          |
| ------ | ----------------- | ------------------------------------ |
| GET    | `/share/:shareId` | Join or request access via `shareId` |

### 👥 Collaborators

| Method | Endpoint                     | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/:id/collaborators`         | List all collaborators on a document |
| POST   | `/:id/collaborators`         | Add a collaborator (Owner only)      |
| DELETE | `/:id/collaborators/:userId` | Remove a collaborator                |

### 📥 Collaboration Requests

| Method | Endpoint                           | Description                        |
| ------ | ---------------------------------- | ---------------------------------- |
| GET    | `/:id/requests`                    | Get pending collaboration requests |
| POST   | `/:id/requests/:requestId/approve` | Approve a collaboration request    |
| DELETE | `/:id/requests/:requestId/reject`  | Reject a collaboration request     |

---

## ✅ Example Setup for Frontend

### Auth Flow

1. `POST /api/auth/register` → Register
2. `POST /api/auth/login` → Get `accessToken` (for headers) + `refreshToken` (cookie)
3. Include `Authorization: Bearer <accessToken>` for all authenticated routes
4. To refresh token: `POST /api/auth/refresh` (include cookie)

---

## 🧪 Notes

* All `document` routes are behind auth middleware.
* `shareId` is used for public/semipublic collaboration.
* Make sure frontend handles both `200 OK` and `202 Accepted` for joining a document.
