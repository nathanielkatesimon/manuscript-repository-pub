# API Contract: Advisers

## Endpoints

`GET /api/v1/advisers`
`GET /api/v1/advisers/:id`

---

## GET /api/v1/advisers

### Description

Returns a list of all registered advisers. Used to populate the Research Instructor select field when submitting a manuscript.

### Request

#### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer `<token>` | Yes      |

### Responses

#### 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "auth_id": "01-2345-678",
      "first_name": "Jane",
      "middle_name": null,
      "last_name": "Smith",
      "role": "adviser",
      "department": "Engineering",
      "avatar_url": null,
      "created_at": "2026-04-08T00:00:00.000Z",
      "updated_at": "2026-04-08T00:00:00.000Z"
    }
  ]
}
```

#### 401 Unauthorized

```json
{
  "errors": ["Unauthorized"]
}
```

---

## GET /api/v1/advisers/:id

### Description

Returns the details of a single adviser by ID. Used to display adviser profile pages.

### Request

#### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer `<token>` | Yes      |

### Responses

#### 200 OK

```json
{
  "data": {
    "id": 1,
    "auth_id": "01-2345-678",
    "first_name": "Jane",
    "middle_name": null,
    "last_name": "Smith",
    "role": "adviser",
    "department": "Engineering",
    "avatar_url": null,
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
  "errors": ["Adviser not found"]
}
```
