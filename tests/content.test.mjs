import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseContent,
  serializeContent,
  safeMediaUrl,
} from "../src/features/public/blog/types/content.ts";

test("legacy articles retain plain text and display their featured image", () => {
  const blocks = parseContent("Original text\nSecond paragraph");
  assert.equal(blocks[0].type, "featured-image");
  assert.equal(blocks[1].text, "Original text\nSecond paragraph");
});

test("reordered blocks retain image alignment, width, and caption after saving", () => {
  const blocks = [
    { id: "text", type: "text", text: "First paragraph", alignment: "left" },
    {
      id: "photo",
      type: "image",
      src: "https://example.com/image.png",
      alt: "Photo",
      caption: "Caption",
      alignment: "right",
      width: "small",
    },
    {
      id: "cover",
      type: "featured-image",
      alt: "Cover",
      caption: "",
      alignment: "center",
      width: "full",
    },
  ];
  assert.deepEqual(parseContent(serializeContent(blocks)), blocks);
});

test("quotes, links, and embeds keep their content and presentation settings", () => {
  const blocks = [
    {
      id: "heading",
      type: "text",
      text: "A section",
      alignment: "center",
      style: "heading",
    },
    {
      id: "quote",
      type: "quote",
      text: "Keep learning.",
      citation: "Portfolio owner",
      alignment: "left",
    },
    {
      id: "link",
      type: "link",
      text: "Project source",
      href: "https://example.com",
      appearance: "button",
      alignment: "center",
    },
    {
      id: "embed",
      type: "embed",
      url: "https://www.youtube.com/watch?v=abc123",
      caption: "Project demo",
      alignment: "center",
    },
  ];
  assert.deepEqual(parseContent(serializeContent(blocks)), blocks);
});

test("arbitrary JSON remains plain text and unsafe URLs never render", () => {
  assert.equal(parseContent('{"hello":"world"}')[1].text, '{"hello":"world"}');
  assert.equal(safeMediaUrl("javascript:alert(1)"), undefined);
  assert.equal(safeMediaUrl("data:text/html,test"), undefined);
  assert.equal(safeMediaUrl("blob:preview"), undefined);
  assert.equal(safeMediaUrl("blob:preview", true), "blob:preview");
  assert.equal(
    safeMediaUrl("https://example.com/image.png"),
    "https://example.com/image.png",
  );
});
