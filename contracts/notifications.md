# API Contract: Notifications

## Endpoint

`GET /api/v1/notifications`

## Description

Returns the latest notifications for the currently authenticated user, including unread count metadata.

## Request

### Headers

| Header         | Value            | Required |
| -------------- | ---------------- | -------- |
| Content-Type   | application/json | Yes      |
| Authorization  | Bearer \<jwt\>   | Yes      |

### Body

```json
{}
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| N/A   | N/A  | No       | No body parameters required. |

## Responses

### 200 OK

Returned when notifications are successfully fetched.

```json
{
  "data": [
    {
      "id": 1,
      "notification_type": "manuscript_feedback",
      "message": "Your manuscript \"Introduction to AI\" received new feedback.",
      "metadata": {
        "manuscript_id": 1,
        "feedback_id": 4
      },
      "read": false,
      "read_at": null,
      "created_at": "2026-04-20T14:00:00.000Z"
    }
  ],
  "meta": {
    "unread_count": 1
  }
}
```

### 401 Unauthorized

Returned when the request is missing a valid authentication token.

```json
{
  "errors": ["Unauthorized"]
}
```
