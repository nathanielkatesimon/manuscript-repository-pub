# API Contract: Admin Categories Management

## Endpoint

`GET /api/v1/admins/categories`
`GET /api/v1/admins/categories/:id`
`POST /api/v1/admins/categories`
`PATCH /api/v1/admins/categories/:id`
`DELETE /api/v1/admins/categories/:id`

## Description

Allows admins to list, view, create, update, and delete manuscript categories used by student/admin category filtering and manuscript uploads.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |
| Content-Type  | application/json | Yes      |

### Body

```json
{
  "category": {
    "title": "Bachelor Degrees",
    "name": "BS Computer Science"
  }
}
```

### Parameters

| Field   | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| `title` | string | Yes      | Parent category/group name shown in the categories page. |
| `name`  | string | Yes      | Program or track name used for filtering manuscripts. |

## Responses

### 200 OK

Returned for successful `GET` and `PATCH` requests.

```json
{
  "data": {
    "id": 1,
    "title": "Bachelor Degrees",
    "name": "BS Computer Science",
    "created_at": "2026-04-20T10:30:00.000Z",
    "updated_at": "2026-04-20T10:30:00.000Z"
  }
}
```

### 201 Created

Returned when a category is created successfully.

```json
{
  "data": {
    "id": 19,
    "title": "Graduate Programs",
    "name": "MS Computer Science",
    "created_at": "2026-04-20T10:30:00.000Z",
    "updated_at": "2026-04-20T10:30:00.000Z"
  }
}
```

### 401 Unauthorized

Returned when the request has no valid access token.

```json
{
  "errors": ["Unauthorized"]
}
```

### 403 Forbidden

Returned when a non-admin user accesses admin category endpoints.

```json
{
  "errors": ["Forbidden"]
}
```

### 404 Not Found

Returned when the target category does not exist.

```json
{
  "errors": ["Category not found"]
}
```

### 422 Unprocessable Entity

Returned when validation fails.

```json
{
  "errors": ["Name has already been taken"]
}
```

### 200 OK (DELETE)

Returned when a category is deleted successfully.

```json
{
  "message": "Category deleted successfully"
}
```
