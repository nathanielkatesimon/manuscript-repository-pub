# API Contract: Admin Manuscripts Management

## Endpoints

- `GET /api/v1/admins/manuscripts`
- `GET /api/v1/admins/manuscripts/:id`

## Description

Allows administrators to list and view all manuscripts in the system. Both endpoints require admin authentication.

---

## GET /api/v1/admins/manuscripts

### Request

#### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

#### Query Parameters

| Parameter    | Type    | Required | Description                                     |
| ------------ | ------- | -------- | ----------------------------------------------- |
| `page`       | integer | No       | Page number (default: 1)                        |
| `per_page`   | integer | No       | Results per page, max 100 (default: 20)         |
| `q[title_cont]` | string | No    | Filter by title (ransack)                       |
| `q[status_eq]`  | string | No    | Filter by status (ransack)                      |

### Responses

#### 200 OK

Returned when the manuscripts list is successfully retrieved.

```json
{
  "data": [
    {
      "id": 1,
      "title": "Introduction to AI",
      "abstract": "A study of artificial intelligence fundamentals.",
      "authors": "John Doe, Jane Smith",
      "completion_date": "2026-01-15",
      "program_or_track": "Computer Science",
      "research_type": "Quantitative",
      "status": "pending",
      "student_id": 1,
      "adviser_id": 2,
      "instructor": "Jane Smith",
      "pdf_url": "/rails/active_storage/blobs/redirect/.../sample.pdf",
      "cover_img_url": "/rails/active_storage/blobs/redirect/.../sample-cover.jpg",
      "created_at": "2026-04-08T00:00:00.000Z",
      "updated_at": "2026-04-08T00:00:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 42,
    "per_page": 20
  }
}
```

#### 401 Unauthorized

Returned when no valid JWT is provided.

```json
{
  "errors": ["Unauthorized"]
}
```

#### 403 Forbidden

Returned when the authenticated user is not an admin.

```json
{
  "errors": ["Forbidden"]
}
```

---

## GET /api/v1/admins/manuscripts/:id

### Request

#### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

#### URL Parameters

| Parameter | Type    | Required | Description        |
| --------- | ------- | -------- | ------------------ |
| `id`      | integer | Yes      | Manuscript ID      |

### Responses

#### 200 OK

Returned when the manuscript is found.

```json
{
  "data": {
    "id": 1,
    "title": "Introduction to AI",
    "abstract": "A study of artificial intelligence fundamentals.",
    "authors": "John Doe, Jane Smith",
    "completion_date": "2026-01-15",
    "program_or_track": "Computer Science",
    "research_type": "Quantitative",
    "status": "pending",
    "student_id": 1,
    "adviser_id": 2,
    "instructor": "Jane Smith",
    "student_name": "John Doe",
    "pdf_url": "/rails/active_storage/blobs/redirect/.../sample.pdf",
    "cover_img_url": "/rails/active_storage/blobs/redirect/.../sample-cover.jpg",
    "created_at": "2026-04-08T00:00:00.000Z",
    "updated_at": "2026-04-08T00:00:00.000Z"
  }
}
```

#### 401 Unauthorized

Returned when no valid JWT is provided.

```json
{
  "errors": ["Unauthorized"]
}
```

#### 403 Forbidden

Returned when the authenticated user is not an admin.

```json
{
  "errors": ["Forbidden"]
}
```

#### 404 Not Found

Returned when the manuscript does not exist.

```json
{
  "errors": ["Manuscript not found"]
}
```
