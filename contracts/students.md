# API Contract: Students Show

## Endpoint

`GET /api/v1/students/:id`

## Description

Returns the details of a single student by ID. Accessible to any authenticated user (students, advisers, admins).

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer `<token>` | Yes      |

## Responses

### 200 OK

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

### 401 Unauthorized

Returned when the `Authorization` header is missing or the token is invalid/expired.

```json
{
  "errors": ["Unauthorized"]
}
```

### 404 Not Found

Returned when the student with the given ID does not exist.

```json
{
  "errors": ["Student not found"]
}
```
