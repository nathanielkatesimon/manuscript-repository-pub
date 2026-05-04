# API Contract: Admin Students Management

## Endpoints

`GET /api/v1/admins/students`
`GET /api/v1/admins/students/:id`
`GET /api/v1/admins/students/export`
`POST /api/v1/admins/students`
`PATCH /api/v1/admins/students/:id`
`DELETE /api/v1/admins/students/:id`

## Description

Allows admins to list, view, create, update, delete, and export student accounts. `auth_id` is set at creation and is immutable.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |
| Content-Type  | application/json | Yes      |

### Body (POST)

```json
{
  "student": {
    "auth_id": "20240000001",
    "first_name": "John",
    "middle_name": "B",
    "last_name": "Smith",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "program_or_track": "BS Computer Science",
    "year_level": "1st Year"
  }
}
```

### Body (PATCH)

Same as POST but without `auth_id`.

### Parameters

| Field                   | Type   | Required      | Description                               |
| ----------------------- | ------ | ------------- | ----------------------------------------- |
| `auth_id`               | string | Yes (POST)    | 11–13 digit student ID (immutable)        |
| `first_name`            | string | Yes           | Student's first name                      |
| `middle_name`           | string | No            | Student's middle name                     |
| `last_name`             | string | Yes           | Student's last name                       |
| `email`                 | string | Yes           | Unique email address                      |
| `password`              | string | Yes (POST)    | Account password                          |
| `password_confirmation` | string | Yes (POST)    | Must match password                       |
| `program_or_track`      | string | Yes           | Program, track, or strand name            |
| `year_level`            | string | Yes           | Year or grade level                       |

## Responses

### 200 OK (GET /api/v1/admins/students)

```json
{
  "data": [
    {
      "id": 1,
      "auth_id": "20240000001",
      "first_name": "John",
      "middle_name": "B",
      "last_name": "Smith",
      "email": "john@example.com",
      "role": "student",
      "program_or_track": "BS Computer Science",
      "year_level": "1st Year",
      "avatar_url": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 200 OK (GET /api/v1/admins/students/:id)

```json
{
  "data": {
    "id": 1,
    "auth_id": "20240000001",
    "first_name": "John",
    "middle_name": "B",
    "last_name": "Smith",
    "email": "john@example.com",
    "role": "student",
    "program_or_track": "BS Computer Science",
    "year_level": "1st Year",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 201 Created (POST)

Same structure as index item, with `status: 201`.

### 200 OK (PATCH)

Same structure as index item, with `status: 200`.

### 200 OK (DELETE)

```json
{
  "message": "Student deleted successfully"
}
```

### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

### 403 Forbidden

```json
{
  "errors": ["Forbidden"]
}
```

### 404 Not Found

```json
{
  "errors": ["Student not found"]
}
```

### 422 Unprocessable Entity

```json
{
  "errors": ["Email has already been taken"]
}
```

### 200 OK (GET /api/v1/admins/students/export)

Returns a binary `.xlsx` file attachment containing all students ordered by creation date descending.

| Column         | Description                        |
| -------------- | ---------------------------------- |
| Student ID     | `auth_id`                          |
| Name           | Full name (first middle last)      |
| Email          | Email address                      |
| Program / Track| Program, track, or strand          |
| Year Level     | Year or grade level                |
| Role           | Always `student`                   |
| Created At     | `YYYY-MM-DD HH:MM:SS`              |

Response headers:
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="students_YYYYMMDD.xlsx"`
