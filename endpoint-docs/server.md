# Server Endpoint

The Server endpoint manages Discord server registrations, enabling the bot to support multiple Discord servers with isolated club data.

## Base URL

```
POST   /functions/v1/server
GET    /functions/v1/server
PUT    /functions/v1/server
DELETE /functions/v1/server
```

## Authentication

All requests require a valid JWT token:

```
Authorization: Bearer YOUR_TOKEN
```

---

## GET - Retrieve Server Details

Retrieves information about Discord servers, either all servers or a specific server with its clubs.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | No | The Discord server ID (omit to get all servers) |

### Request Examples

**Get all servers:**
```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/server" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

**Get specific server:**
```bash
curl --request GET \
  --url "https://your-api.supabase.co/functions/v1/server?id=1039326367428395038" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response - All Servers

```json
{
  "servers": [
    {
      "id": "1039326367428395038",
      "name": "Production Server",
      "clubs": [
        { "id": "club-1", "name": "Freaks & Geeks", "discord_channel": "987654321098765432" },
        { "id": "club-2", "name": "Blingers Pilingers", "discord_channel": "876543210987654321" }
      ]
    }
  ]
}
```

### Response - Specific Server

```json
{
  "id": "1039326367428395038",
  "name": "Production Server",
  "clubs": [
    {
      "id": "club-1",
      "name": "Freaks & Geeks",
      "discord_channel": "987654321098765432",
      "member_count": 5,
      "latest_session": {
        "id": "session-1",
        "due_date": "2025-04-15",
        "books": { "title": "The Republic", "author": "Plato" }
      }
    }
  ]
}
```

### Error Responses

**404 Not Found**
```json
{ "error": "Server not found" }
```

---

## POST - Register New Server

Registers a new Discord server in the system.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | The name of the Discord server |
| `id` | string | No | Discord server ID (recommended: use the actual Discord snowflake) |

### Request Example

```bash
curl --request POST \
  --url "https://your-api.supabase.co/functions/v1/server" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{ "id": "1234567890123456789", "name": "My Discord Server" }'
```

### Response

```json
{
  "success": true,
  "message": "Server created successfully",
  "server": { "id": "1234567890123456789", "name": "My Discord Server" }
}
```

### Error Responses

**400 Bad Request**
```json
{ "error": "Server name is required" }
```

---

## PUT - Update Server

Updates server information (currently only the name).

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The Discord server ID to update |
| `name` | string | No | New name for the server |

### Request Example

```bash
curl --request PUT \
  --url "https://your-api.supabase.co/functions/v1/server" \
  --header "Authorization: Bearer YOUR_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{ "id": "1234567890123456789", "name": "Updated Server Name" }'
```

### Response

```json
{
  "success": true,
  "message": "Server updated successfully",
  "server": { "id": "1234567890123456789", "name": "Updated Server Name" }
}
```

### Error Responses

**400 Bad Request** — No fields to update
```json
{ "error": "No fields to update" }
```

**404 Not Found**
```json
{ "error": "Server not found" }
```

---

## DELETE - Delete Server

Permanently deletes a server registration. **Requires the server to have no clubs.**

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The Discord server ID to delete |

### Request Example

```bash
curl --request DELETE \
  --url "https://your-api.supabase.co/functions/v1/server?id=1234567890123456789" \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{ "success": true, "message": "Server deleted successfully" }
```

### Error Responses

**400 Bad Request** — Server has existing clubs
```json
{ "error": "Cannot delete server with existing clubs. Please delete all clubs first.", "clubs_count": 3 }
```

**404 Not Found**
```json
{ "error": "Server not found" }
```

---

## Notes

### Server IDs

Discord server IDs are snowflakes (large 64-bit integers). The API stores and returns them as strings to prevent precision loss in JavaScript environments. Example: `"1039326367428395038"`.

### Data Isolation

Each club belongs to exactly one server. Members can belong to clubs across multiple servers. Clubs with identical names can exist on different servers.

### Deletion Protection

Servers cannot be deleted if they have associated clubs. Delete all clubs first, then delete the server.

### Views: Summary vs Detailed

- **List all** (`GET /server`) — returns server ID, name, and a basic club list
- **Get one** (`GET /server?id=X`) — returns full club details including member count and latest session
