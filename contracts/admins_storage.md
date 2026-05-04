# API Contract: Admin Storage Usage Report

## Endpoint

`GET /api/v1/admins/storage`

## Description

Returns a detailed storage usage report for the system, including total storage consumed by all Active Storage blobs, a breakdown by file type (PDFs, images, others), largest file information, and system-level metadata. Requires admin authentication.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

### Body

None.

## Responses

### 200 OK

Returned when the storage report is successfully retrieved.

```json
{
  "data": {
    "storage": {
      "total_size_bytes": 10485760,
      "total_size_mb": 10.0,
      "total_size_gb": 0.0098,
      "total_files": 5,
      "average_size_bytes": 2097152.0,
      "average_size_mb": 2.0
    },
    "breakdown": {
      "pdfs": {
        "count": 3,
        "size_bytes": 9437184,
        "size_mb": 9.0
      },
      "images": {
        "count": 2,
        "size_bytes": 1048576,
        "size_mb": 1.0
      },
      "others": {
        "count": 0,
        "size_bytes": 0,
        "size_mb": 0.0
      }
    },
    "largest_file": {
      "filename": "my-thesis.pdf",
      "size_bytes": 5242880,
      "size_mb": 5.0,
      "content_type": "application/pdf",
      "created_at": "2026-04-10T12:00:00.000Z"
    },
    "system": {
      "service_name": "local",
      "manuscripts_count": 3,
      "storage_per_manuscript_mb": 3.0
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
