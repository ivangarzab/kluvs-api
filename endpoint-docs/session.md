# Session Endpoint

The Session endpoint manages reading sessions, including books, due dates, and associated discussions for book clubs.

## Base URL

```
POST   /functions/v1/session
GET    /functions/v1/session
PUT    /functions/v1/session
DELETE /functions/v1/session
```

## Authentication

All requests require a valid JWT token:

```
Authorization: Bearer YOUR_TOKEN
```

---

## GET - Retrieve Session Details

Retrieves complete information about a specific reading session, including the book, discussions, and shame list.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The unique identifier of the session |

### Request Example

```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/session?id=session-1" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "id": "session-1",
  "club_id": "club-1",
  "book_id": 1,
  "due_date": "2025-04-15",
  "club": {
    "id": "club-1",
    "name": "Freaks & Geeks",
    "discord_channel": "987654321098765432",
    "server_id": "1039326367428395038"
  },
  "book": {
    "id": 1,
    "title": "The Republic",
    "author": "Plato",
    "edition": "Reeve Edition",
    "year": -380,
    "isbn": "978-0872207363",
    "page_count": 416
  },
  "discussions": [
    {
      "id": "disc-1",
      "session_id": "session-1",
      "title": "Looking outside of the Cave",
      "date": "2025-04-15",
      "location": "Discord Voice Channel"
    }
  ]
}
```

### Error Responses

**400 Bad Request**
```json
{ "success": false, "error": "Session ID is required" }
```

**404 Not Found**
```json
{ "success": false, "error": "Session not found" }
```

---

## POST - Create New Session

Creates a new reading session with a book and optional discussions.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `club_id` | string | Yes | The ID of the club this session belongs to |
| `book_id` | integer | Conditional* | ID of an already-registered book (preferred) |
| `book` | object | Conditional* | Inline book data (legacy; use `book_id` when possible) |
| `id` | string | No | Custom session ID (UUID generated if not provided) |
| `due_date` | string (date) | No | Session due date (ISO 8601: YYYY-MM-DD) |
| `discussions` | array | No | Discussion objects to create with the session |

**\*Note:** Provide either `book_id` (preferred) or `book` object. Using `book_id` links to an existing registered book and avoids duplication.

#### Book Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Book title |
| `author` | string | Yes | Book author |
| `edition` | string | No | Edition name |
| `year` | integer | No | Publication year |
| `isbn` | string | No | ISBN number |
| `page_count` | integer | No | Number of pages |

#### Discussion Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Discussion title |
| `date` | string (date) | Yes | Discussion date (ISO 8601: YYYY-MM-DD) |
| `id` | string | No | Custom discussion ID |
| `location` | string | No | Discussion location or platform |

All discussions in the request are validated upfront. If any is invalid, the entire request fails.

### Request Example

```bash
curl --request POST \
  --url "https://your-api.supabase.co/functions/v1/session" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "club_id": "club-1",
    "book_id": 7,
    "due_date": "2025-06-01",
    "discussions": [
      { "title": "Part 1: Arrakis", "date": "2025-05-15", "location": "Discord Voice Channel" },
      { "title": "Part 2: Muad'\''Dib", "date": "2025-06-01", "location": "Discord Voice Channel" }
    ]
  }'
```

### Response

```json
{
  "success": true,
  "message": "Session created successfully",
  "session": { "id": "generated-uuid", "club_id": "club-1", "book_id": 7, "due_date": "2025-06-01" },
  "discussions": [
    { "id": "generated-uuid-1", "session_id": "generated-uuid", "title": "Part 1: Arrakis", "date": "2025-05-15" }
  ]
}
```

### Error Responses

**400 Bad Request**
```json
{ "success": false, "error": "Club ID and book information are required" }
```

**404 Not Found**
```json
{ "success": false, "error": "Club not found" }
```

---

## PUT - Update Session

Updates session information, book details, and/or discussions.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The ID of the session to update |
| `club_id` | string | No | Move session to a different club |
| `due_date` | string (date) | No | Updated due date |
| `book` | object | No | Book fields to update (partial updates allowed) |
| `discussions` | array | No | Discussions to update or add |
| `discussion_ids_to_delete` | array | No | Discussion IDs to remove |

**Discussion update behavior:**
- Include `id` to update an existing discussion
- Omit `id` to add a new discussion
- Use `discussion_ids_to_delete` to remove discussions

**Book update note:** Updating a book affects all sessions that reference it (books are shared).

### Request Example

```bash
curl --request PUT \
  --url "https://your-api.supabase.co/functions/v1/session" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "id": "session-1",
    "due_date": "2025-04-30",
    "discussions": [
      { "id": "disc-1", "location": "Discord Stage Channel" },
      { "title": "New Discussion", "date": "2025-04-25" }
    ],
    "discussion_ids_to_delete": ["disc-old-1"]
  }'
```

### Response

```json
{
  "success": true,
  "message": "Session updated successfully",
  "updated": { "session": true, "book": false, "discussions": true },
  "session": { "id": "session-1", "club_id": "club-1", "book_id": 1, "due_date": "2025-04-30" }
}
```

### Error Responses

**400 Bad Request**
```json
{ "error": "Session ID is required" }
```

**404 Not Found**
```json
{ "error": "Session not found" }
```

---

## DELETE - Delete Session

Permanently deletes a session and its associated data.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the session to delete |

### Cascading Behavior

Deleting a session automatically removes all discussions. The associated book is also deleted **if no other sessions reference it**.

### Request Example

```bash
curl --request DELETE \
  --url "https://your-api.supabase.co/functions/v1/session?id=session-1" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{ "success": true, "message": "Session deleted successfully" }
```

If the book is still referenced by other sessions:
```json
{
  "success": true,
  "message": "Session deleted but could not delete associated book",
  "warning": "Book is used by other sessions"
}
```

### Error Responses

**400 Bad Request**
```json
{ "success": false, "error": "Session ID is required" }
```

**404 Not Found**
```json
{ "success": false, "error": "Session not found" }
```

---

## Notes

### Book Reuse

Books are stored independently from sessions. Multiple sessions can reference the same book. Updating a book via PUT session affects all sessions using it. Use `GET /book?id=N` or `POST /book` to manage books directly.

### Discussions

Discussions are sorted by date ascending when retrieved.

### Active vs Past Sessions

Sessions are categorized as active or past by your application logic (typically based on the due date). The club endpoint automatically categorizes them when retrieving club details.
