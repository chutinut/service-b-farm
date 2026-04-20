# BA and Frontend Handoff Guide

## Purpose

เอกสารนี้สรุป contract สำคัญของ service ในรูปแบบที่ BA และ Frontend ใช้อ้างอิงได้เร็ว โดยไม่ต้องไล่อ่านทีละ endpoint แบบละเอียด

Base path:

- `/api/v1`

## Key Naming Convention

- API request/response keys ใช้ `camelCase`
- Database document keys ใช้ `snake_case`
- Environment variables และ constants ใช้ `SNAKE_UPPER_CASE`

## Screen to API Mapping

| Screen / Feature       | Method   | Endpoint              | Auth       | Notes                                              |
| ---------------------- | -------- | --------------------- | ---------- | -------------------------------------------------- |
| Create Admin (Postman) | `POST`   | `/auth/admin`         | No         | ⚠️ ไม่มี auth ควรปิดใน production                  |
| Admin Login            | `POST`   | `/auth/login`         | No         | รับ JWT token สำหรับใช้งานหลังบ้าน                 |
| Admin Article Table    | `GET`    | `/articles/admin`     | Bearer JWT | รองรับ filter `status`, `keyword`, `page`, `limit` |
| Admin Article Detail   | `GET`    | `/articles/admin/:id` | Bearer JWT | ใช้เปิดดูรายละเอียดใน CMS                          |
| Admin Create Article   | `POST`   | `/articles`           | Bearer JWT | ใช้สร้างบทความใหม่                                 |
| Admin Update Article   | `PUT`    | `/articles/:id`       | Bearer JWT | ใช้แก้ไขบทความ                                     |
| Admin Soft Delete      | `DELETE` | `/articles/:id`       | Bearer JWT | เปลี่ยนสถานะเป็น `deleted`                         |
| User Article Card List | `GET`    | `/articles`           | No         | คืนเฉพาะบทความ `published`                         |
| User Article Detail    | `GET`    | `/articles/:id`       | No         | คืนได้เฉพาะบทความ `published`                      |

## Shared Contracts

### 1. Login Request

```json
{
  "username": "admin",
  "password": "admin12345"
}
```

### 2. Login Response

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": "1d"
}
```

### 3. Article Item Contract

ใช้เป็น response หลักของ article detail, create, update, delete และภายใน list response

| Field         | Type   | Nullable | Example                      | Notes                                         |
| ------------- | ------ | -------- | ---------------------------- | --------------------------------------------- |
| `id`          | string | No       | `68062f2a8d5db8834f67d0b1`   | MongoDB ObjectId                              |
| `title`       | string | No       | `NestJS CMS Guide`           | ความยาวไม่เกิน 200                            |
| `excerpt`     | string | No       | `Short summary`              | ความยาวไม่เกิน 500                            |
| `content`     | string | No       | `<p>HTML content</p>`        | เป็น HTML string ได้                          |
| `status`      | string | No       | `published`                  | `published`, `draft`, `deleted`               |
| `bannerImage` | string | Yes      | `data:image/jpeg;base64,...` | base64 image (max 2MB), `null` ถ้าไม่ได้กำหนด |
| `createdBy`   | string | No       | `admin`                      | username ของผู้สร้าง                          |
| `createdDate` | string | No       | `2026-04-21T10:00:00.000Z`   | ISO date string                               |
| `updatedBy`   | string | No       | `admin`                      | username ของผู้แก้ล่าสุด                      |
| `updatedDate` | string | No       | `2026-04-21T10:15:00.000Z`   | ISO date string                               |

### 4. Paginated Article List Contract

```json
{
  "items": [
    {
      "id": "68062f2a8d5db8834f67d0b1",
      "title": "NestJS CMS Guide",
      "excerpt": "Short summary",
      "content": "<p>HTML content</p>",
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

| Field        | Type            | Notes              |
| ------------ | --------------- | ------------------ |
| `items`      | `ArticleItem[]` | รายการบทความ       |
| `page`       | number          | หน้าปัจจุบัน       |
| `limit`      | number          | จำนวนรายการต่อหน้า |
| `total`      | number          | จำนวนรายการทั้งหมด |
| `totalPages` | number          | จำนวนหน้ารวม       |

## Request Contracts by Action

### Admin Create Article

| Field         | Type   | Required | Example                      |
| ------------- | ------ | -------- | ---------------------------- |
| `title`       | string | Yes      | `NestJS CMS`                 |
| `excerpt`     | string | No       | `Intro text for card`        |
| `content`     | string | Yes      | `<h1>Hello</h1><p>Body</p>`  |
| `status`      | string | Yes      | `draft`                      |
| `bannerImage` | string | No       | `data:image/jpeg;base64,...` |

Example:

```json
{
  "title": "NestJS CMS",
  "excerpt": "Intro text for card",
  "content": "<h1>Hello</h1><p>Body</p>",
  "status": "draft",
  "bannerImage": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

### Admin Update Article

ทุก field เป็น optional

| Field         | Type   | Required | Example                     |
| ------------- | ------ | -------- | --------------------------- |
| `title`       | string | No       | `NestJS CMS Updated`        |
| `excerpt`     | string | No       | `Updated intro`             |
| `content`     | string | No       | `<p>Updated body</p>`       |
| `status`      | string | No       | `published`                 |
| `bannerImage` | string | No       | `data:image/png;base64,...` |

Example:

```json
{
  "title": "NestJS CMS Updated",
  "status": "published",
  "bannerImage": "data:image/png;base64,iVBOR..."
}
```

### Admin Article List Filters

| Field     | Type   | Required | Default | Used By                                   |
| --------- | ------ | -------- | ------- | ----------------------------------------- |
| `status`  | string | No       | -       | Admin only                                |
| `keyword` | string | No       | -       | Admin and User (ค้นหาด้วย title เท่านั้น) |
| `page`    | number | No       | `1`     | Admin and User                            |
| `limit`   | number | No       | `10`    | Admin and User                            |

Example:

```http
GET /api/v1/articles/admin?status=draft&keyword=cms&page=1&limit=20
```

## Response Handling Rules for Frontend

### Success Handling

| Use Case       | Expected Status | Frontend Action                                |
| -------------- | --------------- | ---------------------------------------------- |
| Login success  | `200`           | เก็บ `accessToken` แล้ว redirect ไปหน้า CMS    |
| List success   | `200`           | render table หรือ card list                    |
| Detail success | `200`           | render detail form หรือ article page           |
| Create success | `201`           | แสดง success message และ redirect/list refresh |
| Update success | `200`           | แสดง success message และ refresh detail/list   |
| Delete success | `200`           | ลบออกจาก UI list หรือ refresh table            |

### Error Handling

| Status | Meaning           | Frontend Recommendation                      |
| ------ | ----------------- | -------------------------------------------- |
| `400`  | validation error  | แสดง validation message ใต้ field หรือ toast |
| `401`  | unauthorized      | ล้าง token และพาผู้ใช้กลับหน้า login         |
| `404`  | article not found | แสดง not found page หรือ toast แล้ว redirect |

### Standard Error Contract

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

หรือกรณี validation:

```json
{
  "message": ["title should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Frontend Data Usage Recommendation

### Admin Table Columns

แนะนำใช้ fields ต่อไปนี้ในตาราง admin:

- `title`
- `status`
- `createdBy`
- `createdDate`
- `updatedBy`
- `updatedDate`

### User Card Fields

แนะนำใช้ fields ต่อไปนี้ใน card view:

- `title`
- `excerpt`
- `updatedDate`
- `id` สำหรับลิงก์ไปหน้า detail

### User Detail Fields

แนะนำใช้ fields ต่อไปนี้ในหน้า detail:

- `title`
- `content`
- `updatedDate`
- `createdBy` หรือ `updatedBy` ถ้าต้องการแสดงผู้เขียน

## Business Rules Summary

- User มองเห็นเฉพาะบทความสถานะ `published`
- Admin มองเห็นบทความได้ทุกสถานะผ่าน endpoint ฝั่ง admin
- การลบบทความเป็น soft delete โดยเปลี่ยน `status` เป็น `deleted`
- `content` รองรับ HTML string และ frontend ควร sanitize ตอน render หากแสดงแบบ raw HTML
- audit fields ถูกเติมให้อัตโนมัติจากผู้ใช้งาน admin ที่ล็อกอินอยู่

## Suggested Questions for BA

1. ต้องการ field `slug` สำหรับ URL บทความหรือไม่
2. ต้องการ field `thumbnail` สำหรับ article card หรือไม่
3. ต้องการแยก `publishedDate` ออกจาก `updatedDate` หรือไม่
4. ต้องการ workflow review/approve ก่อน publish หรือไม่

## Related Documents

- `docs/API_DOCUMENTATION.md`
- `docs/SCHEMA_DESIGN.md`
- `docs/SERVICE_EXPLANATION.md`
