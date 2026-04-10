# API Contract: Manuscript Download Request Status

## Endpoint

`GET /api/v1/manuscripts/:id/my_download_request`

## Description

Returns the current student user's download request for a specific manuscript, if one exists.

## Request

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| Content-Type    | application/json   | Yes      |
| Authorization   | Bearer \<jwt\>     | Yes      |

## Responses

### 200 OK

Returned when the request is found.

```json
{
  "data": {
    "id": 1,
    "student_id": 1,
    "manuscript_id": 1,
    "status": "pending",
    "rejection_reason": null,
    "created_at": "2026-04-09T12:00:00.000Z",
    "updated_at": "2026-04-09T12:00:00.000Z"
  }
}
```

### 200 OK (no request found)

Returned when no download request exists for the current user.

```json
{
  "data": null
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
