# API Documentation

Base path: `/api/v1`

## Common Conventions

### Authentication

- Admin endpoints require header `Authorization: Bearer <jwt_token>`
- Public endpoints do not require token

### Content Type

- Request header: `Content-Type: application/json`
- Response header: `Content-Type: application/json`

### Key Naming Convention

- API request/response keys ใช้ `camelCase`
- Database document keys ใช้ `snake_case`
- Environment variables และ constants ใช้ `SNAKE_UPPER_CASE`

### Article Status

- `published`: visible to public users
- `draft`: visible only in admin area
- `deleted`: soft-deleted and hidden from public area

### Common Article Response Shape

```json
{
  "id": "68062f2a8d5db8834f67d0b1",
  "title": "NestJS CMS Guide",
  "excerpt": "Short summary for article card",
  "content": "<h1>Title</h1><p>HTML content is allowed</p>",
  "status": "published",
  "bannerImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "createdBy": "admin",
  "createdDate": "2026-04-21T10:00:00.000Z",
  "updatedBy": "admin",
  "updatedDate": "2026-04-21T10:15:00.000Z"
}
```

> `bannerImage` จะเป็น `null` หากบทความนั้นไม่ได้กำหนด banner image

## 1. Create Admin

- Method: `POST`
- Path: `/auth/admin`
- Auth: No
- Purpose: ใช้สร้าง admin user ใหม่ (สำหรับ Postman / เครื่องมือภายใน เท่านั้น)

> ⚠️ **Security Note:** Endpoint นี้ไม่มีการ authenticate ควรจำกัดการเข้าถึงใน production environment (เช่น restrict by IP หรือปิด route ก่อน deploy)

### Request Body

| Field      | Type   | Required | Rules           | Description                |
| ---------- | ------ | -------- | --------------- | -------------------------- |
| `username` | string | Yes      | max length = 50 | ชื่อ admin ที่ต้องการสร้าง |
| `password` | string | Yes      | min length = 8  | รหัสผ่านของ admin          |

### Example Request

```http
POST /api/v1/auth/admin
Content-Type: application/json

{
  "username": "editor01",
  "password": "securePass1"
}
```

### Response 201

| Field      | Type   | Description                 |
| ---------- | ------ | --------------------------- |
| `message`  | string | ข้อความยืนยันการสร้างสำเร็จ |
| `username` | string | ชื่อ admin ที่สร้างสำเร็จ   |

### Example Response

```json
{
  "message": "Admin created successfully",
  "username": "editor01"
}
```

### Possible Errors

- `409 Conflict`: ชื่อ admin นี้มีอยู่แล้วในระบบ
- `400 Bad Request`: request body ไม่ผ่าน validation

---

## 2. Login Admin

- Method: `POST`
- Path: `/auth/login`
- Auth: No
- Purpose: ใช้สำหรับเข้าสู่ระบบของ admin เพื่อรับ JWT token

### Request Body

| Field      | Type   | Required | Rules             | Description         |
| ---------- | ------ | -------- | ----------------- | ------------------- |
| `username` | string | Yes      | must not be empty | ชื่อผู้ใช้ของ admin |
| `password` | string | Yes      | min length = 8    | รหัสผ่านของ admin   |

### Example Request

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin12345"
}
```

### Response 200

| Field         | Type   | Description                           |
| ------------- | ------ | ------------------------------------- |
| `accessToken` | string | JWT token สำหรับเรียก admin endpoints |
| `tokenType`   | string | ค่าเป็น `Bearer`                      |
| `expiresIn`   | string | อายุ token เช่น `1d`                  |

### Example Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": "1d"
}
```

### Possible Errors

- `401 Unauthorized`: username หรือ password ไม่ถูกต้อง
- `400 Bad Request`: request body ไม่ผ่าน validation

## 3. Get Public Articles

- Method: `GET`
- Path: `/articles`
- Auth: No
- Purpose: ใช้แสดงบทความเป็น card ในฝั่ง user
- Behavior: คืนเฉพาะบทความที่มีสถานะ `published`

### Query Parameters

| Field     | Type   | Required | Default | Description                     |
| --------- | ------ | -------- | ------- | ------------------------------- |
| `keyword` | string | No       | -       | ค้นหาจาก `title` เท่านั้น       |
| `page`    | number | No       | `1`     | หน้าปัจจุบัน                    |
| `limit`   | number | No       | `10`    | จำนวนรายการต่อหน้า สูงสุด `100` |

### Example Request

```http
GET /api/v1/articles?keyword=nest&page=1&limit=10
```

### Response 200

| Field        | Type   | Description        |
| ------------ | ------ | ------------------ |
| `items`      | array  | รายการบทความ       |
| `page`       | number | หน้าปัจจุบัน       |
| `limit`      | number | จำนวนรายการต่อหน้า |
| `total`      | number | จำนวนรายการทั้งหมด |
| `totalPages` | number | จำนวนหน้าทั้งหมด   |

### Example Response

```json
{
  "items": [
    {
      "id": "68062f2a8d5db8834f67d0b1",
      "title": "NestJS CMS Guide",
      "excerpt": "Short summary for article card",
      "content": "<h1>Guide</h1><p>HTML content is allowed</p>",
      "status": "published",
      "createdBy": "admin",
      "createdDate": "2026-04-21T10:00:00.000Z",
      "updatedBy": "admin",
      "updatedDate": "2026-04-21T10:15:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

## 4. Get Admin Articles

- Method: `GET`
- Path: `/articles/admin`
- Auth: Bearer JWT
- Purpose: ใช้แสดงบทความใน table ของหน้า admin

### Headers

```http
Authorization: Bearer <jwt_token>
```

### Query Parameters

| Field     | Type   | Required | Default | Description                             |
| --------- | ------ | -------- | ------- | --------------------------------------- |
| `status`  | string | No       | -       | กรองตาม `published`, `draft`, `deleted` |
| `keyword` | string | No       | -       | ค้นหาจาก `title` เท่านั้น               |
| `page`    | number | No       | `1`     | หน้าปัจจุบัน                            |
| `limit`   | number | No       | `10`    | จำนวนรายการต่อหน้า สูงสุด `100`         |

### Example Request

```http
GET /api/v1/articles/admin?status=draft&keyword=guide&page=1&limit=20
Authorization: Bearer <jwt_token>
```

### Response 200

รูปแบบ response เหมือน endpoint `GET /articles` แต่สามารถคืนทุกสถานะตาม filter ได้

### Example Response

```json
{
  "items": [
    {
      "id": "68062f2a8d5db8834f67d0b1",
      "title": "Draft CMS Article",
      "excerpt": "This article is still being edited",
      "content": "<p>Draft body</p>",
      "status": "draft",
      "createdBy": "admin",
      "createdDate": "2026-04-21T10:00:00.000Z",
      "updatedBy": "admin",
      "updatedDate": "2026-04-21T12:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1,
  "totalPages": 1
}
```

### Possible Errors

- `401 Unauthorized`: ไม่มี token หรือ token ไม่ถูกต้อง
- `400 Bad Request`: query params ไม่ผ่าน validation

## 5. Get Public Article By ID

- Method: `GET`
- Path: `/articles/:id`
- Auth: No
- Purpose: ใช้แสดงหน้ารายละเอียดบทความฝั่ง user
- Behavior: คืนข้อมูลเฉพาะบทความที่มีสถานะ `published`

### Path Parameters

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| `id`  | string | Yes      | MongoDB ObjectId ของบทความ |

### Example Request

```http
GET /api/v1/articles/68062f2a8d5db8834f67d0b1
```

### Response 200

```json
{
  "id": "68062f2a8d5db8834f67d0b1",
  "title": "NestJS CMS Guide",
  "excerpt": "Short summary for article card",
  "content": "<h1>Guide</h1><p>HTML content is allowed</p>",
  "status": "published",
  "createdBy": "admin",
  "createdDate": "2026-04-21T10:00:00.000Z",
  "updatedBy": "admin",
  "updatedDate": "2026-04-21T10:15:00.000Z"
}
```

### Possible Errors

- `404 Not Found`: ไม่พบบทความ หรือบทความไม่ใช่สถานะ `published`

## 6. Get Admin Article By ID

- Method: `GET`
- Path: `/articles/admin/:id`
- Auth: Bearer JWT
- Purpose: ใช้สำหรับหน้า edit/detail ใน CMS

### Headers

```http
Authorization: Bearer <jwt_token>
```

### Path Parameters

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| `id`  | string | Yes      | MongoDB ObjectId ของบทความ |

### Example Request

```http
GET /api/v1/articles/admin/68062f2a8d5db8834f67d0b1
Authorization: Bearer <jwt_token>
```

### Response 200

```json
{
  "id": "68062f2a8d5db8834f67d0b1",
  "title": "Draft CMS Article",
  "excerpt": "This article is still being edited",
  "content": "<p>Draft body</p>",
  "status": "draft",
  "createdBy": "admin",
  "createdDate": "2026-04-21T10:00:00.000Z",
  "updatedBy": "admin",
  "updatedDate": "2026-04-21T12:00:00.000Z"
}
```

### Possible Errors

- `401 Unauthorized`: ไม่มี token หรือ token ไม่ถูกต้อง
- `404 Not Found`: ไม่พบบทความ

## 7. Create Article

- Method: `POST`
- Path: `/articles`
- Auth: Bearer JWT
- Purpose: ใช้สร้างบทความใหม่ในระบบ CMS

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body

| Field         | Type   | Required | Rules                                              | Description                                    |
| ------------- | ------ | -------- | -------------------------------------------------- | ---------------------------------------------- |
| `title`       | string | Yes      | max length = 200                                   | ชื่อบทความ                                     |
| `excerpt`     | string | No       | max length = 500                                   | ข้อความเกริ่นนำ (ว่างได้ หรือส่งเป็น `""` ได้) |
| `content`     | string | Yes      | must not be empty                                  | เนื้อหาบทความ รองรับ HTML string               |
| `status`      | string | Yes      | `published`, `draft`, `deleted`                    | สถานะบทความ                                    |
| `bannerImage` | string | No       | base64 image (jpeg/jpg/png/gif/webp), max size 2MB | ภาพ banner ของบทความในรูปแบบ base64            |

> `bannerImage` รองรับ base64 แบบ raw หรือแบบ Data URI เช่น `data:image/jpeg;base64,...`

### Example Request

```http
POST /api/v1/articles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "NestJS CMS",
  "excerpt": "Intro text for article card",
  "content": "<h1>Hello</h1><p>Article body</p>",
  "status": "draft",
  "bannerImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Response 201

```json
{
  "id": "68062f2a8d5db8834f67d0b1",
  "title": "NestJS CMS",
  "excerpt": "Intro text for article card",
  "content": "<h1>Hello</h1><p>Article body</p>",
  "status": "draft",
  "bannerImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "createdBy": "admin",
  "createdDate": "2026-04-21T10:00:00.000Z",
  "updatedBy": "admin",
  "updatedDate": "2026-04-21T10:00:00.000Z"
}
```

### Possible Errors

- `401 Unauthorized`: ไม่มี token หรือ token ไม่ถูกต้อง
- `400 Bad Request`: body ไม่ผ่าน validation

## 8. Update Article

- Method: `PUT`
- Path: `/articles/:id`
- Auth: Bearer JWT
- Purpose: ใช้แก้ไขบทความเดิม

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| `id`  | string | Yes      | MongoDB ObjectId ของบทความ |

### Request Body

ทุก field เป็น optional แต่ต้องส่งอย่างน้อย 1 field ที่ต้องการแก้ไข

| Field         | Type   | Required | Rules                                              | Description                   |
| ------------- | ------ | -------- | -------------------------------------------------- | ----------------------------- |
| `title`       | string | No       | max length = 200                                   | ชื่อบทความใหม่                |
| `excerpt`     | string | No       | max length = 500                                   | ข้อความเกริ่นนำใหม่           |
| `content`     | string | No       | string                                             | เนื้อหาบทความใหม่ รองรับ HTML |
| `status`      | string | No       | `published`, `draft`, `deleted`                    | สถานะใหม่                     |
| `bannerImage` | string | No       | base64 image (jpeg/jpg/png/gif/webp), max size 2MB | อัปเดต banner image ของบทความ |

### Example Request

```http
PUT /api/v1/articles/68062f2a8d5db8834f67d0b1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "NestJS CMS Updated",
  "excerpt": "Updated intro text",
  "content": "<p>Updated content</p>",
  "status": "published",
  "bannerImage": "data:image/png;base64,iVBORw0KGgo..."
}
```

### Response 200

```json
{
  "id": "68062f2a8d5db8834f67d0b1",
  "title": "NestJS CMS Updated",
  "excerpt": "Updated intro text",
  "content": "<p>Updated content</p>",
  "status": "published",
  "bannerImage": "data:image/png;base64,iVBORw0KGgo...",
  "createdBy": "admin",
  "createdDate": "2026-04-21T10:00:00.000Z",
  "updatedBy": "admin",
  "updatedDate": "2026-04-21T11:00:00.000Z"
}
```

### Possible Errors

- `401 Unauthorized`: ไม่มี token หรือ token ไม่ถูกต้อง
- `400 Bad Request`: body ไม่ผ่าน validation
- `404 Not Found`: ไม่พบบทความ

## 9. Soft Delete Article

- Method: `DELETE`
- Path: `/articles/:id`
- Auth: Bearer JWT
- Purpose: ใช้ลบบทความแบบ soft delete โดยเปลี่ยน `status` เป็น `deleted`

### Headers

```http
Authorization: Bearer <jwt_token>
```

### Path Parameters

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| `id`  | string | Yes      | MongoDB ObjectId ของบทความ |

### Example Request

```http
DELETE /api/v1/articles/68062f2a8d5db8834f67d0b1
Authorization: Bearer <jwt_token>
```

### Response 200

```json
{
  "id": "68062f2a8d5db8834f67d0b1",
  "title": "NestJS CMS Updated",
  "excerpt": "Updated intro text",
  "content": "<p>Updated content</p>",
  "status": "deleted",
  "bannerImage": null,
  "createdBy": "admin",
  "createdDate": "2026-04-21T10:00:00.000Z",
  "updatedBy": "admin",
  "updatedDate": "2026-04-21T11:30:00.000Z"
}
```

### Possible Errors

- `401 Unauthorized`: ไม่มี token หรือ token ไม่ถูกต้อง
- `404 Not Found`: ไม่พบบทความ

## Standard Error Response Examples

### 400 Bad Request

```json
{
  "message": [
    "title should not be empty",
    "status must be one of the following values: published, draft, deleted"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 404 Not Found

```json
{
  "message": "Article not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 409 Conflict

```json
{
  "message": "Admin with username \"editor01\" already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

## Default Admin

On startup, service auto-creates admin user if not exists from environment:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

สามารถสร้าง admin เพิ่มเติมได้ผ่าน `POST /api/v1/auth/admin`

## Related Documents

- `docs/BA_FRONTEND_HANDOFF.md`
- `docs/SERVICE_EXPLANATION.md`
- `docs/SCHEMA_DESIGN.md`
