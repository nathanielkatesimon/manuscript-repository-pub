# API Contract: Adviser Profile

## Endpoint

`GET /api/v1/advisers/profile`

## Description

Returns the profile of the currently authenticated adviser.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

### Body

None.

## Responses

### 200 OK

Returned when the adviser is authenticated.

```json
{
  "data": {
    "id": 1,
    "auth_id": "12-3456-789",
    "first_name": "Maria",
    "middle_name": null,
    "last_name": "Santos",
    "email": "maria.santos@example.com",
    "role": "adviser",
    "department": "STEM",
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

`PATCH /api/v1/advisers/profile`

## Description

Updates the profile of the currently authenticated adviser. Supports updating personal info, department, avatar, and password.

## Request

### Headers

| Header        | Value                                    | Required |
| ------------- | ---------------------------------------- | -------- |
| Authorization | Bearer \<token\>                         | Yes      |
| Content-Type  | multipart/form-data or application/json  | Yes      |

### Body

```json
{
  "adviser": {
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "email": "string",
    "department": "string",
    "avatar": "<file>",
    "current_password": "string",
    "password": "string",
    "password_confirmation": "string"
  }
}
```

### Parameters

| Field                  | Type   | Required                        | Description                           |
| ---------------------- | ------ | ------------------------------- | ------------------------------------- |
| `first_name`           | string | No                              | Adviser's first name                  |
| `middle_name`          | string | No                              | Adviser's middle name                 |
| `last_name`            | string | No                              | Adviser's last name                   |
| `email`                | string | No                              | Adviser's email address               |
| `department`           | string | No                              | Adviser's department                  |
| `avatar`               | file   | No                              | Avatar image file                     |
| `current_password`     | string | Required when changing password | Current password for verification     |
| `password`             | string | No                              | New password                          |
| `password_confirmation`| string | No                              | New password confirmation             |

## Responses

### 200 OK

Returned when the profile is updated successfully.

```json
{
  "data": {
    "id": 1,
    "auth_id": "12-3456-789",
    "first_name": "Maricel",
    "middle_name": null,
    "last_name": "Santos",
    "email": "maricel.updated@example.com",
    "role": "adviser",
    "department": "ABM",
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

Returned when a non-adviser attempts to access this endpoint.

```json
{
  "errors": ["Forbidden"]
}
```
