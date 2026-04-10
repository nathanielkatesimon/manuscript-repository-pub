# API Contract: Manuscript Feedbacks

## Endpoints

| Method | Path                                          | Description                      |
| ------ | --------------------------------------------- | -------------------------------- |
| `GET`  | `/api/v1/manuscripts/:manuscript_id/feedbacks` | List feedbacks for a manuscript  |
| `POST` | `/api/v1/manuscripts/:manuscript_id/feedbacks` | Add feedback to a manuscript     |

> **All endpoints require authentication.** Include a valid JWT in the `Authorization` header as `Bearer <token>`.

---

## GET /api/v1/manuscripts/:manuscript_id/feedbacks

## Description

Returns all feedbacks associated with the specified manuscript.

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
  "data": [
    {
      "id": 1,
      "content": "Please revise the abstract section.",
      "user_id": 2,
      "manuscript_id": 1,
      "created_at": "2026-04-09T00:00:00.000Z",
      "updated_at": "2026-04-09T00:00:00.000Z"
    }
  ]
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

Returned when the manuscript does not exist.

```json
{
  "errors": ["Manuscript not found"]
}
```

---

## POST /api/v1/manuscripts/:manuscript_id/feedbacks

## Description

Adds a new feedback to the specified manuscript. The authenticated user is recorded as the author of the feedback.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer `<token>` | Yes      |

### Body

```json
{
  "feedback": {
    "content": "string"
  }
}
```

### Parameters

| Field     | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| `content` | string | Yes      | The feedback text content |

## Responses

### 201 Created

```json
{
  "data": {
    "id": 2,
    "content": "Great work on the introduction.",
    "user_id": 2,
    "manuscript_id": 1,
    "created_at": "2026-04-09T00:00:00.000Z",
    "updated_at": "2026-04-09T00:00:00.000Z"
  }
}
```

### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

### 404 Not Found

```json
{
  "errors": ["Manuscript not found"]
}
```

### 422 Unprocessable Entity

```json
{
  "errors": ["Content can't be blank"]
}
```
