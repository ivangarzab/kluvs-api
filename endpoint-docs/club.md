# Club Endpoint

The Club endpoint manages book club data across multiple Discord servers, including club information, members, sessions, and shame lists.

## Base URL

```
POST   /functions/v1/club
GET    /functions/v1/club
PUT    /functions/v1/club
DELETE /functions/v1/club
```

## Authentication

All requests require a valid JWT token:

```
Authorization: Bearer YOUR_TOKEN
```

---

## GET - Retrieve Club Details

Retrieves complete information about a specific club, including members, sessions, and shame list.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Conditional* | The unique identifier of the club |
| `server_id` | string | No** | Discord server ID |
| `discord_channel` | string | Conditional* | The Discord channel ID associated with the club |

**\*Note:** Provide either `id` OR `discord_channel` (not both).
**\*\*Note:** `server_id` is required when querying by `discord_channel`.

### Request Examples

**Get club by ID:**
```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/club?id=club-1&server_id=1039326367428395038" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

**Get club by Discord channel:**
```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/club?discord_channel=987654321098765432&server_id=1039326367428395038" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "id": "club-1",
  "name": "Freaks & Geeks",
  "discord_channel": "987654321098765432",
  "server_id": "1039326367428395038",
  "founded_date": "2024-01-15",
  "members": [
    {
      "id": 1,
      "name": "Ivan Garza",
      "role": "owner",
      "books_read": 20,
      "handle": "ivangarza",
      "avatar_path": null,
      "created_at": "2024-01-15T10:30:00+00:00"
    }
  ],
  "active_session": {
    "id": "session-1",
    "club_id": "club-1",
    "book_id": 1,
    "due_date": "2025-04-15",
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
  },
  "past_sessions": [],
  "shame_list": [{ "id": 2, "name": "Jorge Romo", "books_read": 8 }]
}
```

### Error Responses

**400 Bad Request**
```json
{ "error": "Either Club ID or Discord Channel is required" }
```

**404 Not Found**
```json
{ "error": "Server not found or not registered" }
```

---

## POST - Create New Club

Creates a new book club with optional initial members, session, and shame list.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | The name of the club |
| `server_id` | string | No | Discord server ID |
| `id` | string | No | Custom club ID (UUID generated if not provided) |
| `discord_channel` | string | No | Discord channel ID for the club |
| `founded_date` | string (date) | No | Club founding date (ISO 8601: YYYY-MM-DD) |
| `members` | array | No | Member objects to add to the club |
| `active_session` | object | No | Initial reading session |
| `shame_list` | array | No | Member IDs to add to shame list |

**Role assignment:** The first member in the array is automatically set as `owner`. All others receive `member`. Promote via `PUT /member` with `club_roles`.

### Request Example

```bash
curl --request POST \
  --url "https://your-api.supabase.co/functions/v1/club" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "Mystery Readers",
    "server_id": "1039326367428395038",
    "discord_channel": "555666777888999000",
    "members": [{ "id": 1, "name": "Ivan Garza", "books_read": 5 }],
    "active_session": {
      "due_date": "2025-05-01",
      "book": { "title": "Murder on the Orient Express", "author": "Agatha Christie", "year": 1934 }
    }
  }'
```

### Response

```json
{
  "success": true,
  "message": "Club created successfully",
  "club": {
    "id": "generated-uuid",
    "name": "Mystery Readers",
    "discord_channel": "555666777888999000",
    "server_id": "1039326367428395038"
  }
}
```

### Error Responses

**400 Bad Request**
```json
{ "error": "Club name is required" }
```

**404 Not Found**
```json
{ "error": "Server not found or not registered" }
```

---

## PUT - Update Club

Updates club information, including name, Discord channel, and shame list.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The ID of the club to update |
| `server_id` | string | No | Discord server ID (for validation) |
| `name` | string | No | New name for the club |
| `discord_channel` | string | No | New Discord channel ID |
| `founded_date` | string (date) | No | Club founding date (ISO 8601: YYYY-MM-DD) |
| `shame_list` | array | No | Complete member ID array (replaces existing list) |

### Request Example

```bash
curl --request PUT \
  --url "https://your-api.supabase.co/functions/v1/club" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{ "id": "club-1", "name": "Updated Club Name", "shame_list": [2, 5] }'
```

### Response

```json
{
  "success": true,
  "message": "Club updated successfully",
  "club": { "id": "club-1", "name": "Updated Club Name" },
  "shame_list_updated": true
}
```

### Error Responses

**400 Bad Request**
```json
{ "error": "No fields to update" }
```

**404 Not Found**
```json
{ "error": "Club not found" }
```

---

## DELETE - Delete Club

Permanently deletes a club and all associated data.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the club to delete |
| `server_id` | string | No | Discord server ID (for validation) |

### Cascading Behavior

Deleting a club automatically deletes: all discussions, all sessions, all shame list entries, all member-club associations, and the club itself.

### Request Example

```bash
curl --request DELETE \
  --url "https://your-api.supabase.co/functions/v1/club?id=club-1&server_id=1039326367428395038" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{ "success": true, "message": "Club deleted successfully" }
```

### Error Responses

**400 Bad Request**
```json
{ "error": "Club ID and Server ID are required" }
```

**404 Not Found**
```json
{ "error": "Club not found" }
```

---

## Notes

### Multi-Server Support

Clubs with the same name can exist on different servers. All operations accept `server_id` to ensure proper isolation.

### Shame List

Shame lists are club-wide. Updating via PUT completely replaces the existing list. Members on the shame list remain active club members.
