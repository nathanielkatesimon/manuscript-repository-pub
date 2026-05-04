# API Contract: Admin Advisers Management

## Endpoints

`POST /api/v1/admins/advisers`
`PATCH /api/v1/admins/advisers/:id`
`DELETE /api/v1/admins/advisers/:id`
`GET /api/v1/admins/advisers/export`

## Description

Allows admins to create, update, delete, and export adviser accounts. `auth_id` is set at creation and is immutable.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |
| Content-Type  | application/json | Yes      |

### Body (POST)

```json
{
  "adviser": {
    "auth_id": "12-3456-789",
    "first_name": "Jane",
    "middle_name": "A",
    "last_name": "Doe",
    "email": "jane@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "department": "Computer Studies"
  }
}
```

### Body (PATCH)

Same as POST but without `auth_id`.

### Parameters

| Field                   | Type   | Required      | Description                            |
| ----------------------- | ------ | ------------- | -------------------------------------- |
| `auth_id`               | string | Yes (POST)    | Format: XX-XXXX-XXX (immutable)        |
| `first_name`            | string | Yes           | Adviser's first name                   |
| `middle_name`           | string | No            | Adviser's middle name                  |
| `last_name`             | string | Yes           | Adviser's last name                    |
| `email`                 | string | Yes           | Unique email address                   |
| `password`              | string | Yes (POST)    | Account password                       |
| `password_confirmation` | string | Yes (POST)    | Must match password                    |
| `department`            | string | Yes           | One of the valid department values     |

## Responses

### 201 Created (POST)

```json
{
  "data": {
    "id": 1,
    "auth_id": "12-3456-789",
    "first_name": "Jane",
    "middle_name": "A",
    "last_name": "Doe",
    "email": "jane@example.com",
    "role": "adviser",
    "department": "Computer Studies",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 200 OK (PATCH)

Same structure as 201, with `status: 200`.

### 200 OK (DELETE)

```json
{
  "message": "Adviser deleted successfully"
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
  "errors": ["Adviser not found"]
}
```

### 422 Unprocessable Entity

```json
{
  "errors": ["Email has already been taken"]
}
```

### 200 OK (GET /api/v1/admins/advisers/export)

Returns a binary `.xlsx` file attachment containing all advisers ordered by creation date descending.

| Column     | Description                    |
| ---------- | ------------------------------ |
| Adviser ID | `auth_id`                      |
| Name       | Full name (first middle last)  |
| Email      | Email address                  |
| Department | Department name                |
| Role       | Always `adviser`               |
| Created At | `YYYY-MM-DD HH:MM:SS`          |

Response headers:
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="advisers_YYYYMMDD.xlsx"`
