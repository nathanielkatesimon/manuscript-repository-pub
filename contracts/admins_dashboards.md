# API Contract: Admin Dashboard Stats

## Endpoint

`GET /api/v1/admins/dashboard`

## Description

Returns system-wide aggregate counts for the admin overview. Requires admin authentication.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |

### Body

None.

## Responses

### 200 OK

Returned when the dashboard stats are successfully retrieved.

```json
{
  "data": {
    "students_count": 42,
    "advisers_count": 10,
    "manuscripts_count": 35,
    "manuscripts": {
      "total": 35,
      "pending": 10,
      "approve": 18,
      "revision": 5,
      "rejected": 2
    },
    "download_requests": {
      "total": 20,
      "pending": 5,
      "approved": 12,
      "rejected": 3
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
