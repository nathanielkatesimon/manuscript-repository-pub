# API Contract: Reset Password

## Endpoint

`POST /api/v1/passwords/reset`

## Description

Validates the reset token and updates the user's password. On success, the user is automatically signed in and a JWT token is returned.

## Request

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| Content-Type   | application/json   | Yes      |

### Body

```json
{
  "user": {
    "token": "string",
    "password": "string",
    "password_confirmation": "string"
  }
}
```

### Parameters

| Field                        | Type   | Required | Description                                  |
| ---------------------------- | ------ | -------- | -------------------------------------------- |
| `user.token`                 | string | Yes      | Password reset token from the email link     |
| `user.password`              | string | Yes      | The new password                             |
| `user.password_confirmation` | string | Yes      | Must match `password`                        |

## Responses

### 200 OK

Password successfully reset. User is signed in automatically.

```json
{
  "data": {
    "id": 1,
    "auth_id": "12345678901",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "student"
  },
  "token": "<jwt_token>"
}
```

### 422 Unprocessable Entity

Returned when the token is invalid or expired, or when passwords don't match.

```json
{
  "errors": ["Reset link is invalid or has expired."]
}
```
