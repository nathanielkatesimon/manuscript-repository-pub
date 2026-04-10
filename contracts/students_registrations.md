# API Contract: Student Registration

## Endpoint

`POST /api/v1/students/registration`

## Description

Registers a new Student account. Returns the created student data and a JWT token upon success.

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
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "password": "string",
    "password_confirmation": "string",
    "program_or_track": "string",
    "year_level": "string"
  }
}
```

### Parameters

| Field                  | Type   | Required | Description                                      |
| ---------------------- | ------ | -------- | ------------------------------------------------ |
| `auth_id`              | string | Yes      | Student ID number (11, 12, or 13 digits)         |
| `first_name`           | string | Yes      | Student's first name                             |
| `middle_name`          | string | No       | Student's middle name                            |
| `last_name`            | string | Yes      | Student's last name                              |
| `password`             | string | Yes      | Account password                                 |
| `password_confirmation`| string | No       | Password confirmation                            |
| `program_or_track`     | string | Yes      | Academic program or track                        |
| `year_level`           | string | Yes      | Current year level                               |

## Responses

### 201 Created

Registration was successful.

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

### 422 Unprocessable Entity

Validation failed.

```json
{
  "errors": [
    "Auth can't be blank",
    "Program or track can't be blank"
  ]
}
```
