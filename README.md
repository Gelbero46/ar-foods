# 🍽️ AR Food Menu — Admin Dashboard

A Next.js admin panel for managing a restaurant's AR (Augmented Reality) menu. Allows restaurant owners to add, edit, and manage food items with 3D model support for both Android (GLB) and iOS (USDZ) AR experiences.

---

## Features

- **Add / Edit / Delete** menu items
- **File uploads** for thumbnail images, GLB models, and USDZ models with real-time progress bars
- **Toggle item status** (active / inactive) directly from the items table
- **Authentication** via [Clerk](https://clerk.com)
- **Cloud file storage** via pre-signed upload URLs (S3-compatible)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Auth | Clerk |
| Styling | Tailwind CSS |
| File Storage | S3-compatible (pre-signed URLs) |
| 3D / AR | Google `<model-viewer>`, USDZ (iOS Quick Look) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Clerk account and API keys
- An S3-compatible storage bucket (AWS S3, Cloudflare R2, etc.)
- Mongodb and Prisma
- A running `/api/menu-items` and `/api/upload` backend

### Installation

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database
DATABASE_URL= mongodb...

# Storage (S3-compatible)
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Run Locally

```bash
npx prisma generate
npm run dev
```

---

## Project Structure

```
app/
├── admin/
│   ├── page.tsx          # Server component — fetches initial items
│   └── AdminClient.tsx   # Client component — form, table, uploads
|
├── menu/               # AR view
|   ├── page.tsx
|
├── api/
│   ├── menu-items/
│   │   ├── route.ts      # GET, POST
│   │   └── [id]/
│   │       └── route.ts  # PUT, DELETE
│   └── upload/
│       └── route.ts      # Returns pre-signed S3 URL
```

---

## API Reference

### `GET /api/menu-items`

Returns menu items. Accepts optional query params:

| Param | Description |
|---|---|
| `restaurantId` | Filter by restaurant |
| `status` | `active` or `inactive` |

### `POST /api/menu-items`

Creates a new menu item.

**Body:**

```json
{
  "restaurantId": "string",
  "name": "string",
  "description": "string",
  "price": 9.99,
  "calories": 650,
  "ingredients": ["Beef", "Lettuce"],
  "thumbnailUrl": "https://...",
  "glbUrl": "https://...",
  "usdzUrl": "https://...",
  "status": "active"
}
```

### `PUT /api/menu-items/:id`

Updates an existing item. Accepts any partial body from the POST schema.

### `DELETE /api/menu-items/:id`

Deletes a menu item by ID.

### `POST /api/upload`

Returns a pre-signed URL for direct client-to-storage upload.

**Body:**

```json
{
  "fileName": "burger.glb",
  "fileType": "model/gltf-binary"
}
```

**Response:**

```json
{
  "signedUrl": "https://s3.amazonaws.com/...",
  "publicUrl": "https://cdn.your-domain.com/burger.glb"
}
```

---

## Supported File Types

| Field | Format | Platform |
|---|---|---|
| Thumbnail | JPG, PNG, WebP | All |
| GLB model | `.glb` | Android AR (Scene Viewer) |
| USDZ model | `.usdz` | iOS AR (Quick Look) |

---

## Notes

- The `RESTAURANT_ID` is currently hardcoded in `AdminClient.tsx`. Update this to be dynamic if supporting multiple restaurants.
- The hydration warning from browser extensions (e.g. `bis_skin_checked`) is harmless — add `suppressHydrationWarning` to your `<body>` tag to silence it.
- AR model rendering on the customer-facing menu uses [`@google/model-viewer`](https://modelviewer.dev/).

---

## License

MIT