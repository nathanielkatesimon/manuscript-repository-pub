# API Contract: Download Requests

## Endpoint

`POST /api/v1/students/download_requests`

## Description

Creates a new download request for a student to download a manuscript. The request starts with a status of `pending`.

## Request

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| Content-Type    | application/json   | Yes      |
| Authorization   | Bearer \<jwt\>     | Yes      |

### Body

```json
{
  "download_request": {
    "manuscript_id": "integer"
  }
}
```

### Parameters

| Field           | Type    | Required | Description                        |
| --------------- | ------- | -------- | ---------------------------------- |
| `manuscript_id` | integer | Yes      | The ID of the manuscript to request download access for |

## Responses

### 201 Created

Returned when the download request is successfully created.

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

### 422 Unprocessable Entity

Returned when the request fails validation.

```json
{
  "errors": ["Manuscript must exist"]
}
```
