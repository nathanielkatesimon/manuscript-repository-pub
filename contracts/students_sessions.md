# API Contract: Student Login

## Endpoint

`POST /api/v1/students/session`

## Description

Authenticates a Student using their `auth_id` and `password`. Returns the student data and a JWT token upon success.

## Request

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| Content-Type   | application/json   | Yes      |

### Body

```json
{
  "student": {
    "auth_id": "string",
    "password": "string"
  }
}
```

### Parameters

| Field      | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `auth_id`  | string | Yes      | Student ID number (11, 12, or 13 digits) |
| `password` | string | Yes      | Account password                         |

## Responses

### 200 OK

Login was successful.

```json
{
  "data": {
    "id": 1,
    "auth_id": "12345678901",
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "role": "student",
    "program_or_track": "Computer Science",
    "year_level": "3",
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
