# Schema Design

## Overview

ระบบนี้ใช้ MongoDB จำนวน 2 collections หลัก:

- `admins`: เก็บข้อมูลผู้ดูแลระบบสำหรับ login
- `articles`: เก็บข้อมูลบทความที่ใช้ใน CMS และหน้าแสดงผลของผู้ใช้

## Naming Convention

- MongoDB document keys ใช้ `snake_case`
- API request/response keys ใช้ `camelCase`
- มี utility สำหรับแปลง key ที่ `src/common/utils/case-converter.util.ts`

## 1. Collection: admins

ใช้สำหรับเก็บข้อมูล admin ที่สามารถ login เข้าระบบหลังบ้าน

### Fields

| Field           | Type     | Required | Unique | Description                         |
| --------------- | -------- | -------- | ------ | ----------------------------------- |
| `_id`           | ObjectId | Yes      | Yes    | Primary key ของ MongoDB             |
| `username`      | string   | Yes      | Yes    | ชื่อผู้ใช้สำหรับ login              |
| `password_hash` | string   | Yes      | No     | รหัสผ่านที่ผ่านการ hash ด้วย bcrypt |
| `created_date`  | Date     | Yes      | No     | วันที่สร้างข้อมูล                   |
| `updated_date`  | Date     | Yes      | No     | วันที่แก้ไขล่าสุด                   |

### Example Document

```json
{
  "_id": "68062d1d8d5db8834f67d09a",
  "username": "admin",
  "password_hash": "$2b$10$H3KkTn5J2y2l4jQv7v5bVuxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "created_date": "2026-04-21T09:00:00.000Z",
  "updated_date": "2026-04-21T09:00:00.000Z"
}
```

### Notes

- `username` ถูกกำหนดให้ไม่ซ้ำกัน
- ระบบจะสร้าง admin เริ่มต้นจากค่าใน `.env` หากยังไม่มีข้อมูล
- ไม่ควรเก็บ password แบบ plain text

## 2. Collection: articles

ใช้สำหรับเก็บข้อมูลบทความทั้งหมดของระบบ CMS

### Fields

| Field          | Type     | Required | Indexed    | Description                                                     |
| -------------- | -------- | -------- | ---------- | --------------------------------------------------------------- |
| `_id`          | ObjectId | Yes      | Yes        | Primary key ของ MongoDB                                         |
| `title`        | string   | Yes      | Text Index | ชื่อบทความ ความยาวไม่เกิน 200 ตัวอักษร                          |
| `excerpt`      | string   | No       | No         | ข้อความเกริ่นนำ ความยาวไม่เกิน 500 ตัวอักษร (อนุญาตเป็นค่าว่าง) |
| `content`      | string   | Yes      | No         | เนื้อหาบทความ รองรับ HTML string                                |
| `status`       | enum     | Yes      | Yes        | สถานะบทความ: `published`, `draft`, `deleted`                    |
| `banner_image` | string   | No       | No         | base64 image สำหรับ banner (max 2MB) ค่าเริ่มต้นเป็น `null`     |
| `created_by`   | string   | Yes      | No         | ผู้สร้างบทความ                                                  |
| `created_date` | Date     | Yes      | No         | วันที่สร้างบทความ                                               |
| `updated_by`   | string   | Yes      | No         | ผู้แก้ไขล่าสุด                                                  |
| `updated_date` | Date     | Yes      | Yes        | วันที่แก้ไขล่าสุด                                               |

### Example Document

```json
{
  "_id": "68062f2a8d5db8834f67d0b1",
  "title": "NestJS CMS Guide",
  "excerpt": "Short summary for article card",
  "content": "<h1>Guide</h1><p>HTML content is allowed</p>",
  "status": "published",
  "banner_image": "data:image/jpeg;base64,/9j/4AAQ...",
  "created_by": "admin",
  "created_date": "2026-04-21T10:00:00.000Z",
  "updated_by": "admin",
  "updated_date": "2026-04-21T10:15:00.000Z"
}
```

### Status Definition

| Status      | Description                         |
| ----------- | ----------------------------------- |
| `published` | แสดงผลได้ทั้งฝั่ง user และ admin    |
| `draft`     | แสดงผลเฉพาะฝั่ง admin               |
| `deleted`   | เป็น soft delete ไม่แสดงผลฝั่ง user |

## Index Design

### admins

Recommended indexes:

```js
{
  username: 1;
}
```

Purpose:

- ใช้ค้นหา admin ตอน login ได้เร็ว
- บังคับ uniqueness ของ username

### articles

Indexes ที่ใช้อยู่ในโค้ด:

```js
{ status: 1, updated_date: -1 }
{ title: "text" }
```

Purpose:

- `status + updated_date`: ช่วย query หน้า admin และ public list ที่มีการ filter status และ sort ตาม `updated_date`
- `text index`: รองรับการค้นหาคำจาก `title`

## Logical Relationship

ระบบนี้ไม่มี foreign key จริงแบบ relational database แต่มีความสัมพันธ์เชิง logical ดังนี้:

- `articles.created_by` อ้างถึง `admins.username`
- `articles.updated_by` อ้างถึง `admins.username`

หมายเหตุ:

- ปัจจุบันเก็บเป็น string เพื่อความง่ายและตรงกับ requirement
- หากอนาคตต้องการ audit ที่แข็งแรงขึ้น แนะนำเปลี่ยนไปเก็บ `admin_id` เป็น ObjectId เพิ่มเติม

## Suggested Validation Rules

### admins

- `username` ต้องไม่ว่าง
- `password_hash` ต้องถูกสร้างจาก bcrypt hash เท่านั้น

### articles

- `title` ต้องไม่ว่าง และยาวไม่เกิน 200 ตัวอักษร
- `excerpt` ไม่บังคับส่งค่า แต่ถ้าส่งต้องยาวไม่เกิน 500 ตัวอักษร และอนุญาตค่าว่าง
- `content` ต้องไม่ว่าง
- `status` ต้องเป็นหนึ่งใน `published`, `draft`, `deleted`
- `created_by` และ `updated_by` ต้องไม่ว่าง

## Suggested Future Improvements

1. เพิ่ม field `slug` สำหรับทำ SEO-friendly URL ของบทความ
2. เพิ่ม field `thumbnail_url` สำหรับ card view ของผู้ใช้
3. เพิ่ม field `published_date` เพื่อแยกวันเผยแพร่จริงออกจาก `updated_date`
4. เพิ่ม field `tags` หรือ `categories` หากต้องการระบบค้นหาและจัดกลุ่มบทความ
5. เพิ่ม `admin_id` แบบ ObjectId เพื่อให้ audit relation ชัดเจนขึ้น
