# API Contract: Admin Download Requests

## Endpoints

`GET /api/v1/admins/download_requests`
`GET /api/v1/admins/download_requests/:id`
`PATCH /api/v1/admins/download_requests/:id`

## Description

Allows admins to list, view, and moderate (approve or reject) manuscript download requests.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |
| Content-Type  | application/json | Yes (PATCH only) |

### Body (PATCH)

```json
{
  "download_request": {
    "status": "approved"
  }
}
```

Or when rejecting:

```json
{
  "download_request": {
    "status": "rejected",
    "rejection_reason": "Reason for rejection"
  }
}
```

### Parameters

| Field              | Type   | Required                       | Description                            |
| ------------------ | ------ | ------------------------------ | -------------------------------------- |
| `status`           | string | Yes                            | One of: `approved`, `rejected`         |
| `rejection_reason` | string | Yes (when status is rejected)  | Reason for rejecting the request       |

## Responses

### 200 OK (index)

```json
{
  "data": [
    {
      "id": 1,
      "student_id": 5,
      "student_name": "John Doe",
      "manuscript_id": 3,
      "manuscript_title": "Sample Manuscript Title",
      "manuscript_cover_img_url": "/rails/active_storage/blobs/...",
      "manuscript_pdf_url": "/rails/active_storage/blobs/...",
      "status": "pending",
      "rejection_reason": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 200 OK (show / update)

```json
{
  "data": {
    "id": 1,
    "student_id": 5,
    "student_name": "John Doe",
    "manuscript_id": 3,
    "manuscript_title": "Sample Manuscript Title",
    "manuscript_cover_img_url": "/rails/active_storage/blobs/...",
    "manuscript_pdf_url": "/rails/active_storage/blobs/...",
    "status": "approved",
    "rejection_reason": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

### 403 Forbidden

```json
{
  "errors": ["Forbidden"]
}
```

### 404 Not Found

```json
{
  "errors": ["Download request not found"]
}
```

### 422 Unprocessable Entity

```json
{
  "errors": ["Rejection reason can't be blank"]
}
```
