# Book Endpoint

The Book endpoint manages book data. It provides Google Books search and ISBN lookup, plus local book registration.

## Base URL

```
GET    /functions/v1/book
POST   /functions/v1/book
```

## Authentication

All requests require a valid JWT token:

```
Authorization: Bearer YOUR_TOKEN
```

---

## GET - Search or Retrieve a Book

Three modes, selected by query parameter:

| Param | Description | Data Source |
|-------|-------------|-------------|
| `?q=<query>` | Search by title, author, or keywords | Google Books API |
| `?isbn=<isbn>` | Look up a specific book by ISBN | Google Books API |
| `?id=<n>` | Get a locally registered book by its ID | Local database |

Optional: `?limit=N` (default 10, max 40) — applies to `?q=` searches only.

### Request Examples

```bash
# Search
curl "https://your-api.supabase.co/functions/v1/book?q=dune" \
  --header "Authorization: Bearer YOUR_TOKEN"

# ISBN lookup
curl "https://your-api.supabase.co/functions/v1/book?isbn=978-0441013593" \
  --header "Authorization: Bearer YOUR_TOKEN"

# Local lookup
curl "https://your-api.supabase.co/functions/v1/book?id=7" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Responses

**Search (`?q=` or `?isbn=`)**
```json
{
  "success": true,
  "books": [
    {
      "external_google_id": "B1hSG45JCX4C",
      "title": "Dune",
      "author": "Frank Herbert",
      "year": 1965,
      "isbn": "978-0441013593",
      "page_count": 688,
      "image_url": "https://books.google.com/books/content?id=..."
    }
  ],
  "total": 10
}
```

**Local lookup (`?id=`)**
```json
{
  "success": true,
  "book": {
    "id": 7,
    "title": "Dune",
    "author": "Frank Herbert",
    "edition": "Paperback",
    "year": 1965,
    "isbn": "978-0441013593",
    "page_count": 688,
    "image_url": null,
    "external_google_id": null
  }
}
```

### Error Codes

| Status | Meaning |
|--------|---------|
| 400 | No recognized query param, or search query too short |
| 404 | Book not found (local `?id=` or `?isbn=` lookup) |
| 500 | Google Books API key not configured, or database error |

---

## POST - Register a Book

Registers a book in the local database. Typically called after the user selects a result from `GET /book?q=`.

**Idempotent:** If `external_google_id` is provided and already exists, returns the existing record with `created: false`.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Book title |
| `author` | string | Yes | Book author |
| `external_google_id` | string | No | Google Books volume ID (enables idempotent registration) |
| `edition` | string | No | Edition name |
| `year` | integer | No | Publication year |
| `isbn` | string | No | ISBN-10 or ISBN-13 |
| `page_count` | integer | No | Number of pages |
| `image_url` | string | No | Cover image URL (HTTPS) |

### Request Example

```bash
curl --request POST \
  --url "https://your-api.supabase.co/functions/v1/book" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "external_google_id": "B1hSG45JCX4C",
    "title": "Dune",
    "author": "Frank Herbert",
    "year": 1965,
    "isbn": "978-0441013593",
    "page_count": 688,
    "image_url": "https://books.google.com/..."
  }'
```

### Response

**New book:**
```json
{
  "success": true,
  "message": "Book registered successfully",
  "book": {
    "id": 9,
    "title": "Dune",
    "author": "Frank Herbert",
    "year": 1965,
    "isbn": "978-0441013593",
    "page_count": 688,
    "image_url": "https://books.google.com/...",
    "external_google_id": "B1hSG45JCX4C"
  },
  "created": true
}
```

**Already registered:**
```json
{
  "success": true,
  "message": "Book already registered",
  "book": { ... },
  "created": false
}
```

### Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Missing `title` or `author` |
| 500 | Database error |

---

## Typical Workflow

1. **Search** — `GET /book?q=dune` — user browses results
2. **Register** — `POST /book` with the selected result — get back a local `book.id`
3. **Create session** — use that `book_id` when calling `POST /session` or `POST /club`

Using `book_id` in sessions links to the shared book record and avoids duplication.
