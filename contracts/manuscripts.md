# API Contract: Manuscripts CRUD

## Endpoints

| Method   | Path                      | Description            |
| -------- | ------------------------- | ---------------------- |
| `GET`    | `/api/v1/manuscripts`     | List all manuscripts   |
| `GET`    | `/api/v1/manuscripts/:id` | Get a single manuscript|
| `POST`   | `/api/v1/manuscripts`     | Create a manuscript    |
| `PATCH`  | `/api/v1/manuscripts/:id` | Update a manuscript    |
| `DELETE` | `/api/v1/manuscripts/:id` | Delete a manuscript    |

> **All endpoints require authentication.** Include a valid JWT in the `Authorization` header as `Bearer <token>`.

---

## GET /api/v1/manuscripts

### Description

Returns a list of manuscripts. Supports search and filtering via Ransack using the `q` query parameter.

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| Content-Type    | application/json   | Yes      |
| Authorization   | Bearer `<token>`   | Yes      |

### Query Parameters

All filtering is done through the `q` parameter using [Ransack](https://github.com/activerecord-hackery/ransack) predicates.

| Parameter              | Type    | Description                                             |
| ---------------------- | ------- | ------------------------------------------------------- |
| `q[title_cont]`        | string  | Filter by title containing the given string             |
| `q[status_eq]`         | string  | Filter by exact status (`pending`, `approve`, `revision`, `rejected`) |
| `q[authors_cont]`      | string  | Filter by authors containing the given string           |
| `q[program_or_track_eq]` | string | Filter by exact program or track                     |
| `q[research_type_eq]`  | string  | Filter by exact research type                           |
| `q[student_id_eq]`     | integer | Filter by student ID                                   |
| `q[adviser_id_eq]`     | integer | Filter by adviser ID                                   |
| `page`                 | integer | Page number (default: `1`)                              |
| `per_page`             | integer | Number of items per page (default: `20`)                |

### Example

`GET /api/v1/manuscripts?q[title_cont]=AI&q[status_eq]=pending`

### Responses

#### 200 OK

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
      "pdf_url": "/rails/active_storage/blobs/redirect/.../sample.pdf",
      "cover_img_url": "/rails/active_storage/blobs/redirect/.../sample-cover.jpg",
      "created_at": "2026-04-08T00:00:00.000Z",
      "updated_at": "2026-04-08T00:00:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 92,
    "per_page": 20
  }
}
```

#### 401 Unauthorized

Returned when the `Authorization` header is missing or the token is invalid/expired.

```json
{
  "errors": ["Unauthorized"]
}
```

---

## GET /api/v1/manuscripts/:id

### Description

Returns a single manuscript by ID.

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| Content-Type    | application/json   | Yes      |
| Authorization   | Bearer `<token>`   | Yes      |

### Responses

#### 200 OK

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
    "pdf_url": "/rails/active_storage/blobs/redirect/.../sample.pdf",
    "cover_img_url": "/rails/active_storage/blobs/redirect/.../sample-cover.jpg",
    "created_at": "2026-04-08T00:00:00.000Z",
    "updated_at": "2026-04-08T00:00:00.000Z"
  }
}
```

#### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

#### 404 Not Found

```json
{
  "errors": ["Manuscript not found"]
}
```

---

## POST /api/v1/manuscripts

### Description

Creates a new manuscript. Accepts a PDF file attachment via multipart form data.

### Headers

| Header          | Value                     | Required |
| --------------- | ------------------------- | -------- |
| Content-Type    | multipart/form-data       | Yes      |
| Authorization   | Bearer `<token>`          | Yes      |

### Body

```
manuscript[title]=string
manuscript[abstract]=string
manuscript[authors]=string
manuscript[completion_date]=date
manuscript[program_or_track]=string
manuscript[research_type]=string
manuscript[status]=string
manuscript[student_id]=integer
manuscript[adviser_id]=integer
manuscript[pdf]=<file>
```

### Parameters

| Field              | Type    | Required | Description                                          |
| ------------------ | ------- | -------- | ---------------------------------------------------- |
| `title`            | string  | Yes      | Title of the manuscript                              |
| `abstract`         | string  | No       | Abstract or summary of the manuscript                |
| `authors`          | string  | No       | Comma-separated list of authors                      |
| `completion_date`  | date    | No       | Date the manuscript was completed (YYYY-MM-DD)       |
| `program_or_track` | string  | No       | Academic program or track                            |
| `research_type`    | string  | No       | Type of research (e.g., Quantitative, Qualitative)   |
| `status`           | string  | No       | Status: `pending`, `approve`, `revision`, `rejected` |
| `student_id`       | integer | Yes      | ID of the student who authored the manuscript        |
| `adviser_id`       | integer | Yes      | ID of the adviser assigned to the manuscript         |
| `pdf`              | file    | Yes      | PDF file attachment (required)                       |

### Responses

#### 201 Created

```json
{
  "data": {
    "id": 2,
    "title": "New Research Paper",
    "abstract": "An abstract.",
    "authors": null,
    "completion_date": null,
    "program_or_track": null,
    "research_type": null,
    "status": "pending",
    "student_id": 1,
    "adviser_id": 2,
    "pdf_url": "/rails/active_storage/blobs/redirect/.../paper.pdf",
    "cover_img_url": "/rails/active_storage/blobs/redirect/.../paper-cover.jpg",
    "created_at": "2026-04-08T00:00:00.000Z",
    "updated_at": "2026-04-08T00:00:00.000Z"
  }
}
```

#### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

#### 422 Unprocessable Entity

```json
{
  "errors": ["Title can't be blank", "Pdf must be attached"]
}
```

---

## PATCH /api/v1/manuscripts/:id

### Description

Updates an existing manuscript.

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| Content-Type    | application/json   | Yes      |
| Authorization   | Bearer `<token>`   | Yes      |

### Body

```json
{
  "manuscript": {
    "title": "string",
    "status": "string"
  }
}
```

### Parameters

| Field              | Type    | Required | Description                                          |
| ------------------ | ------- | -------- | ---------------------------------------------------- |
| `title`            | string  | No       | Title of the manuscript                              |
| `abstract`         | string  | No       | Abstract or summary                                  |
| `authors`          | string  | No       | Comma-separated list of authors                      |
| `completion_date`  | date    | No       | Completion date (YYYY-MM-DD)                         |
| `program_or_track` | string  | No       | Academic program or track                            |
| `research_type`    | string  | No       | Type of research                                     |
| `status`           | string  | No       | Status: `pending`, `approve`, `revision`, `rejected` |
| `student_id`       | integer | No       | ID of the student                                    |
| `adviser_id`       | integer | No       | ID of the adviser                                    |
| `pdf`              | file    | No       | Updated PDF file attachment                          |

### Responses

#### 200 OK

```json
{
  "data": {
    "id": 1,
    "title": "Updated Title",
    "status": "approve",
    ...
  }
}
```

#### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

#### 404 Not Found

```json
{
  "errors": ["Manuscript not found"]
}
```

#### 422 Unprocessable Entity

```json
{
  "errors": ["Title can't be blank"]
}
```

---

## DELETE /api/v1/manuscripts/:id

### Description

Deletes a manuscript by ID.

### Headers

| Header          | Value              | Required |
| --------------- | ------------------ | -------- |
| Content-Type    | application/json   | Yes      |
| Authorization   | Bearer `<token>`   | Yes      |

### Responses

#### 200 OK

```json
{
  "message": "Manuscript deleted successfully"
}
```

#### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

#### 404 Not Found

```json
{
  "errors": ["Manuscript not found"]
}
```

