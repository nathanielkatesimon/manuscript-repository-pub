# API Contract: Admin Login

## Endpoint

`POST /api/v1/admins/session`

## Description

Authenticates an Admin using their `auth_id` and `password`. Returns the admin data and a JWT token upon success.

## Request

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| Content-Type   | application/json   | Yes      |

### Body

```json
{
  "admin": {
    "auth_id": "string",
    "password": "string"
  }
}
```

### Parameters

| Field      | Type   | Required | Description                                            |
| ---------- | ------ | -------- | ------------------------------------------------------ |
| `auth_id`  | string | Yes      | Admin ID (alphanumeric, max 16 characters)             |
| `password` | string | Yes      | Account password                                       |

## Responses

### 200 OK

Login was successful.

```json
{
  "data": {
    "id": 1,
    "auth_id": "admin001",
    "first_name": "Super",
    "middle_name": null,
    "last_name": "Admin",
    "role": "admin",
    "created_at": "2026-04-08T00:00:00.000Z",
    "updated_at": "2026-04-08T00:00:00.000Z"
  },
  "token": "<jwt_token>"
}
```

### 401 Unauthorized

Invalid credentials.

```json
{
  "errors": [
    "Invalid auth_id or password"
  ]
}
```
