# API Contract: Adviser Login

## Endpoint

`POST /api/v1/advisers/session`

## Description

Authenticates an Adviser using their `auth_id` and `password`. Returns the adviser data and a JWT token upon success.

## Request

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| Content-Type   | application/json   | Yes      |

### Body

```json
{
  "adviser": {
    "auth_id": "string",
    "password": "string"
  }
}
```

### Parameters

| Field      | Type   | Required | Description                                  |
| ---------- | ------ | -------- | -------------------------------------------- |
| `auth_id`  | string | Yes      | Adviser employee ID (format: XX-XXXX-XXX)    |
| `password` | string | Yes      | Account password                             |

## Responses

### 200 OK

Login was successful.

```json
{
  "data": {
    "id": 1,
    "auth_id": "01-2345-678",
    "first_name": "Jane",
    "middle_name": null,
    "last_name": "Smith",
    "role": "adviser",
    "department": "Engineering",
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
