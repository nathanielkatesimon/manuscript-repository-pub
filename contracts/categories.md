# API Contract: Categories Listing

## Endpoint

`GET /api/v1/categories`

## Description

Returns all manuscript categories used for program/track filtering and upload selection.

## Request

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer \<token\> | Yes      |
| Content-Type  | application/json | No       |

### Body

```json
{}
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| N/A   | N/A  | No       | No request parameters. |

## Responses

### 200 OK

Returned when the authenticated user requests categories successfully.

```json
{
  "data": [
    {
      "id": 1,
      "title": "Bachelor Degrees",
      "name": "BS Computer Science",
      "created_at": "2026-04-20T10:30:00.000Z",
      "updated_at": "2026-04-20T10:30:00.000Z"
    }
  ]
}
```

### 401 Unauthorized

Returned when the request has no valid access token.

```json
{
  "errors": ["Unauthorized"]
}
```
