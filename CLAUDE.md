# CLAUDE.md — Copilot Conventions Guide

This file documents the conventions and patterns used in this project. All AI-assisted code generation and review should follow these guidelines.

---

## API Contracts

Every controller **must** have a corresponding API contract markdown file in the `contracts/` directory at the project root.

### Naming Convention

Contract files follow the pattern: `{namespace}_{resource}.md`

Examples:
- `contracts/students_registrations.md` → `Api::V1::Students::RegistrationsController`
- `contracts/students_sessions.md` → `Api::V1::Students::SessionsController`
- `contracts/advisers_registrations.md` → `Api::V1::Advisers::RegistrationsController`
- `contracts/admins_sessions.md` → `Api::V1::Admins::SessionsController`

### Contract Format

All contract files must follow this exact structure:

```markdown
# API Contract: <Human-Readable Title>

## Endpoint

`METHOD /api/v1/path`

## Description

One or two sentences describing what the endpoint does.

## Request

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| Content-Type   | application/json   | Yes      |

### Body

\`\`\`json
{
  "resource": {
    "field": "type"
  }
}
\`\`\`

### Parameters

| Field   | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| `field` | string | Yes/No   | Description |

## Responses

### <HTTP Status Code> <Status Text>

Description of when this response is returned.

\`\`\`json
{
  "data": { ... },
  "token": "<jwt_token>"
}
\`\`\`

### <HTTP Status Code> <Status Text>

Description of when this response is returned.

\`\`\`json
{
  "errors": ["Error message"]
}
\`\`\`
```

---

## Controllers

- All controllers live under `app/controllers/api/v1/` and are namespaced accordingly.
- Controllers inherit from `ApplicationController`.
- Use `render json: { data: ..., token: ... }, status: :created` for successful creation (201).
- Use `render json: { data: ..., token: ... }, status: :ok` for successful retrieval/login (200).
- Use `render json: { errors: [...] }, status: :unprocessable_entity` for validation failures (422).
- Use `render json: { errors: [...] }, status: :unauthorized` for authentication failures (401).
- Each controller action that returns a resource should serialize it using its corresponding serializer via `.new(object).as_json`.

---

## Serializers

- Serializers live under `app/serializers/api/v1/` and follow `class Api::V1::<Model>Serializer < ActiveModel::Serializer`.
- Declare attributes explicitly; never expose `password_digest` or other sensitive fields.

---

## JWT Authentication

- Tokens are generated via `JwtService.encode({ user_id: record.id, role: record.role })`.
- Tokens are returned in the `token` key of the JSON response.
- Always pass the payload hash explicitly: `JwtService.encode({ key: val })`.

---

## Tests

- Integration tests live under `test/controllers/api/v1/` mirroring the controller structure.
- Each controller should have a corresponding `*_controller_test.rb` file.
- Tests use `ActionDispatch::IntegrationTest`.
- Test all success and failure cases.
