# Blog editor

Open **Admin → Blog**. Published posts and drafts have separate tabs with counts.
Drafts can only be read through the authenticated admin endpoints. Public list,
ID, and slug endpoints hide them, including when a published post is changed
back into a draft.

## Creating and editing

1. Choose **New Post**, or edit an existing post.
2. Fill in the title, excerpt, category, and slug.
3. Choose a featured image for the public listing and admin thumbnail.
4. Add text and image blocks. Use the up/down buttons to reorder them.
5. Set text/image alignment to left, center, or right. Images also support
   small (40%), medium (70%), and full width, descriptions, and captions.
6. Use **Preview** to see the public article layout, then return to the editor.
7. Leave **Publish post** unchecked to save a draft, or check it to publish.

The featured image has its own movable block. Removing that block hides the
image inside the article while retaining the listing thumbnail. Removing the
featured image itself clears the thumbnail too.

Images are uploaded when saving. Supported formats are JPG, PNG, WebP, and GIF,
up to 5 MB each. A failed save keeps the editor contents so you can retry.
Previously uploaded files are not deleted from R2 when a block or post is removed.

## Themes

Use the sidebar's **Light mode / Dark mode** button (inside the menu on mobile).
The login page also has a theme button. The initial theme follows your device;
an explicit selection is saved in this browser and synchronized across tabs.

## Configuration and compatibility

- Set `VITE_API_URL` using `.env.example` when the API is not at localhost:5000.
- The backend still uses the existing Cloudflare R2 configuration. `R2_PUBLIC_URL`
  must point to a publicly accessible bucket domain so visitors can load images.
- No database migration is needed. Ordered content is a versioned JSON document
  stored in the existing `content` string. Legacy plain-text posts render with
  their existing featured image and can be edited normally.
- Public slug reads use `GET /api/blog/slug/:slug`. Admin reads use
  `GET /api/admin/blog` and `GET /api/admin/blog/:id` with a bearer token.

## Checks

- Frontend: `npm run build`, `npm run lint`, `npm test` (Node 24 or later).
- Backend: `npm test` builds the backend and checks real HTTP routes against
  an isolated in-memory database stub, without accessing your database.
- Optional UI checks: start Vite on port 5178, then run `node tests/browser-check.cjs`
  with Playwright available. `PLAYWRIGHT_MODULE` can point to a shared Playwright
  installation, `TEST_BROWSER_PATH` can select an installed browser, and
  `TEST_BASE_URL` / `TEST_OUTPUT_DIR` override the URL / screenshots directory.
  The UI checks stub API responses and image storage; they never publish real posts
  or upload to your R2 account.
