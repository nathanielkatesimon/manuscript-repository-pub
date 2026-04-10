# API Contract: Adviser Registration

## Endpoint

`POST /api/v1/advisers/registration`

## Description

Registers a new Adviser account. Returns the created adviser data and a JWT token upon success.

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
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "password": "string",
    "password_confirmation": "string",
    "department": "string"
  }
}
```

### Parameters

| Field                  | Type   | Required | Description                                    |
| ---------------------- | ------ | -------- | ---------------------------------------------- |
| `auth_id`              | string | Yes      | Adviser employee ID (format: XX-XXXX-XXX)      |
| `first_name`           | string | Yes      | Adviser's first name                           |
| `middle_name`          | string | No       | Adviser's middle name                          |
| `last_name`            | string | Yes      | Adviser's last name                            |
| `password`             | string | Yes      | Account password                               |
| `password_confirmation`| string | No       | Password confirmation                          |
| `department`           | string | Yes      | Department the adviser belongs to              |

## Responses

### 201 Created

Registration was successful.

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

### 422 Unprocessable Entity

Validation failed.

```json
{
  "errors": [
    "Auth can't be blank",
    "Department can't be blank"
  ]
}
```
