# Service Explanation

## Overview

This service is built for a CMS that supports:

- Admin login with username and password
- Article listing for admin table (with filters)
- Article listing for users as cards (published only)
- Article detail for user page and admin edit page
- Create, update, and soft delete article

## Architecture Approach

The code follows clean and maintainable boundaries:

- `Controller` layer: receives HTTP requests and maps to use cases
- `Service` layer: business logic and policy validation
- `Repository` layer: database operations and query building
- `Schema` layer: persistence model
- `DTO` layer: request validation

## Naming Convention

- API request/response keys use `camelCase`
- MongoDB document keys use `snake_case`
- Environment variables/constants use `SNAKE_UPPER_CASE`
- Utility for conversion: `src/common/utils/case-converter.util.ts`

## Modules

### Auth Module

- Login endpoint: `POST /auth/login`
- JWT strategy for token validation
- JWT guard to protect admin-only routes
- Auto-seed admin account from environment if it does not exist

### Articles Module

- Public endpoints for users
- Protected endpoints for admin CMS operations
- Soft delete by changing status to `deleted`
- Common audit fields in API response:
  - `createdBy`
  - `createdDate`
  - `updatedBy`
  - `updatedDate`
- Common audit fields in database:
  - `created_by`
  - `created_date`
  - `updated_by`
  - `updated_date`

## Data Model: Article

Fields stored in MongoDB:

- `title`: article title
- `excerpt`: short intro text
- `content`: article body (stored as string, supports HTML tags)
- `status`: `published`, `draft`, `deleted`
- `banner_image`: base64 image for banner
- `created_by`, `created_date`, `updated_by`, `updated_date`

Detailed schema design:

- `docs/SCHEMA_DESIGN.md`

## Security

- JWT required for admin endpoints
- Password hashed with bcrypt
- Request payload validation using class-validator

## Suggested Production Enhancements

1. Add role-based authorization if there will be multiple admin roles.
2. Add refresh token flow for improved session management.
3. Add API rate limiting for login endpoint.
4. Add content sanitization before rendering on frontend if HTML is displayed directly.
5. Add automated tests (unit + e2e).
