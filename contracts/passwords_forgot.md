# API Contract: Forgot Password

## Endpoint

`POST /api/v1/passwords/forgot`

## Description

Accepts a user's email address and sends a password reset link if the email exists in the system. Always returns a success response to prevent email enumeration.

## Request

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| Content-Type   | application/json   | Yes      |

### Body

```json
{
  "user": {
    "email": "string"
  }
}
```

### Parameters

| Field         | Type   | Required | Description                  |
| ------------- | ------ | -------- | ---------------------------- |
| `user.email`  | string | Yes      | Email address of the account |

## Responses

### 200 OK

Always returned, regardless of whether the email exists (to prevent email enumeration).

```json
{
  "message": "If that email exists in our system, a reset link has been sent."
}
```
