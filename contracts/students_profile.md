# API Contract: Student Profile

## Endpoint

`GET /api/v1/students/profile`

## Description

Returns the profile of the currently authenticated student.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

### Body

None.

## Responses

### 200 OK

Returned when the student is authenticated.

```json
{
  "data": {
    "id": 1,
    "auth_id": "12345678901",
    "first_name": "Alice",
    "middle_name": null,
    "last_name": "Reyes",
    "email": "alice.reyes@example.com",
    "role": "student",
    "program_or_track": "BS Computer Science",
    "year_level": "3",
    "avatar_url": "/rails/active_storage/blobs/...",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

### 401 Unauthorized

Returned when no valid token is provided.

```json
{
  "errors": ["Unauthorized"]
}
```

---

## Endpoint

`PATCH /api/v1/students/profile`

## Description

Updates the profile of the currently authenticated student. Supports updating personal info, role-specific fields, avatar, and password.

## Request

### Headers

| Header        | Value              | Required |
| ------------- | ------------------ | -------- |
| Authorization | Bearer \<token\>   | Yes      |
| Content-Type  | multipart/form-data or application/json | Yes |

### Body

```json
{
  "student": {
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "email": "string",
    "program_or_track": "string",
    "year_level": "string",
    "avatar": "<file>",
    "current_password": "string",
    "password": "string",
    "password_confirmation": "string"
  }
}
```

### Parameters

| Field                  | Type   | Required                        | Description                                    |
| ---------------------- | ------ | ------------------------------- | ---------------------------------------------- |
| `first_name`           | string | No                              | Student's first name                           |
| `middle_name`          | string | No                              | Student's middle name                          |
| `last_name`            | string | No                              | Student's last name                            |
| `email`                | string | No                              | Student's email address                        |
| `program_or_track`     | string | No                              | Student's program or track                     |
| `year_level`           | string | No                              | Student's year level                           |
| `avatar`               | file   | No                              | Avatar image file                              |
| `current_password`     | string | Required when changing password | Current password for verification              |
| `password`             | string | No                              | New password                                   |
| `password_confirmation`| string | No                              | New password confirmation                      |

## Responses

### 200 OK

Returned when the profile is updated successfully.

```json
{
  "data": {
    "id": 1,
    "auth_id": "12345678901",
    "first_name": "Alice",
    "middle_name": null,
    "last_name": "Reyes",
    "email": "alice.updated@example.com",
    "role": "student",
    "program_or_track": "BS Information Technology",
    "year_level": "4",
    "avatar_url": "/rails/active_storage/blobs/...",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

### 422 Unprocessable Entity

Returned when validation fails or current password is incorrect.

```json
{
  "errors": ["Current password is incorrect"]
}
```

### 401 Unauthorized

Returned when no valid token is provided.

```json
{
  "errors": ["Unauthorized"]
}
```

### 403 Forbidden

Returned when a non-student attempts to access this endpoint.

```json
{
  "errors": ["Forbidden"]
}
```
