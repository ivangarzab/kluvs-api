# Member Endpoint

The Member endpoint manages individual member data, including books read, club associations, and authentication integration.

## Base URL

```
POST   /functions/v1/member
GET    /functions/v1/member
PUT    /functions/v1/member
DELETE /functions/v1/member
```

## Authentication

All requests require a valid JWT token:

```
Authorization: Bearer YOUR_TOKEN
```

---

## GET - Retrieve Member Details

Retrieves complete information about a specific member, including club memberships.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Conditional* | The internal member ID |
| `user_id` | uuid | Conditional* | The auth user ID |

**\*Note:** Provide either `id` OR `user_id` (not both).

### Request Examples

**Get member by internal ID:**
```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/member?id=1" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

**Get member by auth user ID:**
```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/member?user_id=550e8400-e29b-41d4-a716-446655440000" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "id": 1,
  "name": "Ivan Garza",
  "books_read": 20,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "handle": "ivangarza",
  "avatar_path": "1/avatar.png",
  "created_at": "2024-01-15T10:30:00+00:00",
  "clubs": [
    {
      "id": "club-1",
      "name": "Freaks & Geeks",
      "discord_channel": "987654321098765432",
      "server_id": "1039326367428395038",
      "role": "owner"
    },
    {
      "id": "club-2",
      "name": "Blingers Pilingers",
      "discord_channel": "876543210987654321",
      "server_id": "1039326367428395038",
      "role": "admin"
    }
  ],
  "shame_clubs": [
    {
      "id": "club-1",
      "name": "Freaks & Geeks",
      "discord_channel": "987654321098765432",
      "server_id": "1039326367428395038"
    }
  ]
}
```

**Note:** `role` in each club reflects the member's role **in that club** (`owner`, `admin`, or `member`). Roles are per-club, not global.

### Error Responses

**400 Bad Request**
```json
{ "success": false, "error": "Either Member ID or User ID is required" }
```

**404 Not Found**
```json
{ "success": false, "error": "Member not found" }
```

---

## POST - Create New Member

Creates a new member with optional club associations.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | The member's display name |
| `id` | integer | No | Custom member ID (auto-generated if not provided) |
| `user_id` | uuid | No | Auth user ID for authentication integration |
| `books_read` | integer | No | Initial books read count (defaults to 0) |
| `handle` | string | No | Discord handle or username |
| `avatar_path` | string | No | Storage path to member's avatar (e.g., "123/avatar.png") |
| `clubs` | array | No | Club IDs to associate the member with (role defaults to `member`) |

**Note:** New members always start with the `member` role. Use `PUT /member` with `club_roles` to promote to `admin`.

### Request Example

```bash
curl --request POST \
  --url "https://your-api.supabase.co/functions/v1/member" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "New Member",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "books_read": 3,
    "handle": "newmember",
    "avatar_path": "7/avatar.png",
    "clubs": ["club-1", "club-2"]
  }'
```

### Response

```json
{
  "id": 7,
  "name": "New Member",
  "books_read": 3,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "handle": "newmember",
  "avatar_path": "7/avatar.png",
  "created_at": "2025-11-30T20:59:15.123456+00:00",
  "clubs": ["club-1", "club-2"]
}
```

### Error Responses

**400 Bad Request** — Missing name
```json
{ "success": false, "error": "Member name is required" }
```

**400 Bad Request** — Invalid club IDs (validated upfront; entire request fails)
```json
{ "success": false, "error": "The following clubs do not exist: club-3, club-4" }
```

---

## PUT - Update Member

Updates member information and/or club associations.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Yes | The ID of the member to update |
| `name` | string | No | New display name |
| `books_read` | integer | No | New books read count |
| `handle` | string | No | Updated handle or username |
| `avatar_path` | string | No | Updated avatar storage path |
| `clubs` | array | No | Complete club ID list (replaces all associations) |
| `club_roles` | object | No | Map of `club_id → role` to update per-club roles |

### Update Behavior

- **clubs**: Full replacement — adds new, removes old
- **club_roles**: Valid values are `admin` or `member`. Cannot assign or change `owner`
- Providing `clubs: []` removes all club memberships

### Request Example

```bash
curl --request PUT \
  --url "https://your-api.supabase.co/functions/v1/member" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "id": 1,
    "books_read": 25,
    "clubs": ["club-1", "club-3"],
    "club_roles": { "club-1": "admin" }
  }'
```

### Response

```json
{
  "success": true,
  "message": "Member updated successfully",
  "member": { "id": 1, "name": "Ivan Garza", "books_read": 25 },
  "clubs_updated": true,
  "roles_updated": true
}
```

### Error Responses

**400 Bad Request**
```json
{ "success": false, "error": "Member ID is required" }
```

**404 Not Found**
```json
{ "success": false, "error": "Member not found" }
```

---

## DELETE - Delete Member

Permanently deletes a member and all associated data.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The ID of the member to delete |

### Cascading Behavior

Deleting a member automatically removes: all shame list entries, all club associations, the avatar file from storage (if set), and the member record itself.

### Request Example

```bash
curl --request DELETE \
  --url "https://your-api.supabase.co/functions/v1/member?id=1" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{ "success": true, "message": "Member deleted successfully" }
```

### Error Responses

**400 Bad Request**
```json
{ "success": false, "error": "Member ID is required" }
```

**404 Not Found**
```json
{ "success": false, "error": "Member not found" }
```

---

## Notes

### Authentication Integration

The `user_id` field links members with authenticated users, enabling:
- **Unified identity**: Same member record for both Discord bot and web app
- **Auth-based queries**: Look up members by their auth UUID via `GET /member?user_id=...`

When a new user signs up, a bare member record is automatically created. The full member profile can then be populated via this endpoint.

### Avatar Storage

The `avatar_path` field stores a path within the `member-avatars` storage bucket.

**Recommended format:** `{member_id}/avatar.png`

Full URL: `{SUPABASE_URL}/storage/v1/object/public/member-avatars/{avatar_path}`

**Lifecycle:**
1. Upload the avatar to storage first
2. Set `avatar_path` via POST or PUT
3. On member deletion, the avatar file is automatically removed from storage
