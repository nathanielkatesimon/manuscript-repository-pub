# API Contract: Admin Reports

## Endpoint

`GET /api/v1/admins/report`

## Description

Returns a summary and detailed list of manuscripts grouped by status (approved, rejected, for revision). Requires admin authentication.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

### Body

None.

## Responses

### 200 OK

Returned when the report data is successfully retrieved.

```json
{
  "data": {
    "summary": {
      "approve": 18,
      "rejected": 2,
      "revision": 5
    },
    "manuscripts": {
      "approve": [
        {
          "id": 1,
          "title": "Introduction to AI",
          "authors": "John Doe",
          "program_or_track": "Computer Science",
          "research_type": "Quantitative",
          "status": "approve",
          "completion_date": "2026-01-15",
          "student_id": 1,
          "adviser_id": 1,
          "created_at": "2026-01-01T00:00:00.000Z",
          "updated_at": "2026-01-02T00:00:00.000Z"
        }
      ],
      "rejected": [],
      "revision": []
    }
  }
}
```

### 401 Unauthorized

Returned when no valid JWT is provided.

```json
{
  "errors": ["Unauthorized"]
}
```

### 403 Forbidden

Returned when the authenticated user is not an admin.

```json
{
  "errors": ["Forbidden"]
}
```
