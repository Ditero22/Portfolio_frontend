const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5178";
const output = process.env.TEST_OUTPUT_DIR || path.join(__dirname, "artifacts");
fs.mkdirSync(output, { recursive: true });
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7S8AAAAASUVORK5CYII=",
  "base64",
);
const cover = "https://images.test/cover.svg";
let posts = [
  {
    id: "public",
    title: "Published story",
    slug: "published-story",
    excerpt: "A public article",
    content: "Original published text",
    category: "Development",
    imageUrl: cover,
    link: null,
    published: true,
    createdAt: "2026-09-25T00:00:00Z",
    updatedAt: "2026-09-25T00:00:00Z",
  },
  {
    id: "draft",
    title: "Private draft",
    slug: "private-draft",
    excerpt: "A private article",
    content: "Original draft text",
    category: "Notes",
    imageUrl: cover,
    link: null,
    published: false,
    createdAt: "2026-09-25T00:00:00Z",
    updatedAt: "2026-09-25T00:00:00Z",
  },
];
let failNextUpdate = true;
let uploads = 0;
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.TEST_BROWSER_PATH || undefined,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("https://images.test/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="960" height="540" fill="#627b96"/><circle cx="710" cy="170" r="95" fill="#f0dbaa"/><path d="M0 540L300 180L610 540ZM430 540L760 260L960 540" fill="#314d48"/></svg>',
      }),
    );
    await page.route("**/api/**", async (route) => {
      const request = route.request(),
        url = new URL(request.url()),
        method = request.method();
      const respond = (body, status = 200) =>
        route.fulfill({
          status,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      if (url.pathname === "/api/auth/login")
        return respond({
          accessToken: "fixture-token",
          user: { role: "admin" },
        });
      if (url.pathname === "/api/blog/upload") {
        uploads++;
        return respond(
          { imageUrl: "https://images.test/upload-" + uploads + ".svg" },
          201,
        );
      }
      if (method === "PATCH") {
        if (failNextUpdate) {
          failNextUpdate = false;
          return respond({ message: "Simulated save failure" }, 500);
        }
        const id = url.pathname.split("/").pop();
        posts = posts.map((post) =>
          post.id === id ? { ...post, ...request.postDataJSON() } : post,
        );
        return respond(posts.find((post) => post.id === id));
      }
      if (method === "POST") {
        const post = {
          ...request.postDataJSON(),
          id: "new-post",
          createdAt: "2026-09-25T00:00:00Z",
          updatedAt: "2026-09-25T00:00:00Z",
        };
        posts.push(post);
        return respond(post, 201);
      }
      if (url.pathname === "/api/admin/blog") {
        assert.equal(request.headers().authorization, "Bearer fixture-token");
        return respond(posts);
      }
      if (url.pathname.startsWith("/api/blog/slug/")) {
        const post = posts.find(
          (post) =>
            post.published && post.slug === url.pathname.split("/").pop(),
        );
        return respond(post || { message: "Not found" }, post ? 200 : 404);
      }
      return respond(posts.filter((post) => post.published));
    });
    await page.goto(base + "/blog");
    await page.getByRole("heading", { name: "Published story" }).waitFor();
    assert.equal(
      await page.getByRole("heading", { name: "Private draft" }).count(),
      0,
    );
    assert.equal(
      await page.getByRole("img", { name: "Published story" }).count(),
      1,
    );
    await page
      .locator("aside")
      .getByRole("button", { name: "Switch to light mode" })
      .click();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      "light",
    );
    await page.reload();
    await page.getByRole("heading", { name: "Published story" }).waitFor();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      "light",
    );
    await page.getByRole("link", { name: "Read" }).click();
    await page.getByText("Original published text", { exact: true }).waitFor();
    await page.getByRole("img", { name: "Published story" }).waitFor();
    await page.screenshot({
      path: path.join(output, "public-light.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.goto(base + "/login");
    const inputs = page.locator("input[type=password]");
    for (let i = 0; i < 8; i++) await inputs.nth(i).fill(String(i + 1));
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForURL("**/admin");
    await page
      .locator("aside")
      .getByRole("link", { name: "Blog", exact: true })
      .click();
    await page.getByRole("button", { name: "Drafts (1)", exact: true }).click();
    await page
      .getByRole("button", { name: "View Private draft", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("img", { name: "Private draft" })
      .waitFor();
    await page.getByRole("button", { name: "Close modal" }).click();
    await page
      .getByRole("button", { name: "Edit Private draft", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title", { exact: true }).fill("Reordered draft");
    await dialog
      .getByLabel("Block 2 text", { exact: true })
      .fill("This paragraph comes before the cover.");
    await dialog
      .getByRole("button", { name: "Move block 1 down", exact: true })
      .click();
    await dialog
      .getByLabel("Block 2 alignment", { exact: true })
      .selectOption("right");
    await dialog
      .getByLabel("Block 2 width", { exact: true })
      .selectOption("small");
    await dialog
      .getByLabel("Add image block", { exact: true })
      .setInputFiles({
        name: "inline.png",
        mimeType: "image/png",
        buffer: png,
      });
    await dialog
      .getByLabel("Block 3 image description")
      .fill("Inline photograph");
    await dialog.getByRole("button", { name: "Preview", exact: true }).click();
    assert.equal(await dialog.locator("article img").count(), 2);
    assert.equal(
      await dialog
        .locator("article figure")
        .first()
        .evaluate((el) => el.style.width),
      "40%",
    );
    await page.screenshot({
      path: path.join(output, "editor-preview-light.png"),
      fullPage: true,
      animations: "disabled",
    });
    await dialog
      .getByRole("button", { name: "Return to editor to save" })
      .click();
    assert.equal(uploads, 0, "Returning to edit must not submit the form");
    await dialog
      .getByRole("button", { name: "Save draft", exact: true })
      .click();
    await dialog
      .getByRole("alert")
      .filter({ hasText: "Simulated save failure" })
      .waitFor();
    assert.equal(
      await dialog.getByLabel("Title", { exact: true }).inputValue(),
      "Reordered draft",
    );
    assert.equal(
      await dialog.getByLabel("Block 1 text", { exact: true }).inputValue(),
      "This paragraph comes before the cover.",
    );
    await dialog
      .getByRole("button", { name: "Save draft", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Edit Reordered draft", exact: true })
      .waitFor();
    assert.equal(
      uploads,
      1,
      "A successful inline upload is reused when retrying a failed save",
    );
    await page
      .getByRole("button", { name: "Edit Reordered draft", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    assert.equal(
      await dialog
        .getByLabel("Block 2 alignment", { exact: true })
        .inputValue(),
      "right",
    );
    assert.equal(
      await dialog.getByLabel("Block 2 width", { exact: true }).inputValue(),
      "small",
    );
    await dialog.getByRole("checkbox").check();
    await dialog
      .getByRole("button", { name: "Save & publish", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Published (2)", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "New Post", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title", { exact: true }).fill("Fresh draft");
    await dialog
      .getByLabel("Excerpt", { exact: true })
      .fill("New article excerpt");
    await dialog.getByLabel("Category", { exact: true }).fill("Notes");
    await dialog.getByLabel("Slug", { exact: true }).fill("fresh-draft");
    await dialog
      .getByLabel("Block 2 text", { exact: true })
      .fill("New draft body");
    await dialog
      .getByLabel("Featured image", { exact: true })
      .setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: png });
    await dialog
      .getByRole("button", { name: "Save draft", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View Fresh draft", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("img", { name: "Fresh draft", exact: true })
      .waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.equal(uploads, 2);
    await page.goto(base + "/blog/fresh-draft");
    await page.getByRole("heading", { name: "Blog post not found" }).waitFor();
    await page.goto(base + "/blog/private-draft");
    await page.getByRole("heading", { name: "Reordered draft" }).waitFor();
    assert.equal(await page.locator("article img").count(), 2);
    assert.deepEqual(
      await page
        .locator("article .space-y-6.border-t")
        .evaluate((el) => [...el.children].map((child) => child.tagName)),
      ["P", "FIGURE", "FIGURE"],
    );
    await page
      .locator("aside")
      .getByRole("button", { name: "Switch to dark mode" })
      .click();
    await page.screenshot({
      path: path.join(output, "public-dark.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("button", { name: "Switch to light mode" })
      .filter({ visible: true })
      .click();
    await page.getByRole("button", { name: "Close menu" }).click();
    await page.screenshot({
      path: path.join(output, "public-mobile-light.png"),
      fullPage: true,
      animations: "disabled",
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: draft tabs, authenticated reads, cover/inline previews, block order/alignment persistence, failed-save recovery, publication, theme persistence, desktop/mobile layouts.",
    );
    console.log("Screenshots: " + output);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
