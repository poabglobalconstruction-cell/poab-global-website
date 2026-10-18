import { describe, it, expect } from "vitest";
import {
  validateVideoBinaryHeader,
  generateEntityVideoPath,
  isPathJailedToEntity,
  MAX_VIDEO_FILE_SIZE_BYTES,
} from "../video-upload";

describe("Binary Video Magic Byte Validation", () => {
  it("recognizes standard MP4 container with 'isom' major brand", () => {
    // 32-byte header: [0,0,0,32, 'f','t','y','p', 'i','s','o','m', ...]
    const header = new Uint8Array(32);
    header[0] = 0; header[1] = 0; header[2] = 0; header[3] = 32;
    header.set([102, 116, 121, 112], 4); // 'ftyp'
    header.set([105, 115, 111, 109], 8); // 'isom'

    const res = validateVideoBinaryHeader(header);
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe("mp4");
  });

  it("recognizes QuickTime (.mov) container with 'qt  ' major brand", () => {
    const header = new Uint8Array(32);
    header.set([102, 116, 121, 112], 4); // 'ftyp'
    header.set([113, 116, 32, 32], 8);   // 'qt  '

    const res = validateVideoBinaryHeader(header);
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe("mov");
  });

  it("recognizes WebM container with EBML header", () => {
    const header = new Uint8Array(32);
    header[0] = 0x1a;
    header[1] = 0x45;
    header[2] = 0xdf;
    header[3] = 0xa3;

    const res = validateVideoBinaryHeader(header);
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe("webm");
  });

  it("rejects truncated header buffers smaller than 12 bytes", () => {
    const truncated = new Uint8Array([0, 0, 0, 8, 102, 116]);
    const res = validateVideoBinaryHeader(truncated);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("too small");
  });

  it("rejects non-video files disguised with a video extension", () => {
    // Text file header: "Hello World!"
    const textHeader = new TextEncoder().encode("Hello World! This is a fake file.");
    const res = validateVideoBinaryHeader(textHeader);
    expect(res.valid).toBe(false);
    expect(res.detectedFormat).toBe("unknown");
    expect(res.error).toContain("genuine MP4, QuickTime (MOV), or WebM");
  });

  it("rejects Windows PE executable headers (MZ)", () => {
    const exeHeader = new Uint8Array(32);
    exeHeader[0] = 0x4d; // 'M'
    exeHeader[1] = 0x5a; // 'Z'
    const res = validateVideoBinaryHeader(exeHeader);
    expect(res.valid).toBe(false);
  });
});

describe("Entity Scoping & Directory Jailing", () => {
  const projectId = "11111111-2222-3333-4444-555555555555";
  const propertyId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  it("generates correctly scoped paths for projects and properties", () => {
    const projPath = generateEntityVideoPath("project", projectId, "mp4");
    expect(projPath.videoPath).toMatch(new RegExp(`^projects/${projectId}/[0-9a-f-]+\\.mp4$`));
    expect(projPath.posterPath).toMatch(new RegExp(`^projects/${projectId}/[0-9a-f-]+_poster\\.jpg$`));

    const propPath = generateEntityVideoPath("property", propertyId, "mov");
    expect(propPath.videoPath).toMatch(new RegExp(`^properties/${propertyId}/[0-9a-f-]+\\.mov$`));
  });

  it("confirms that generated paths are strictly jailed to their entity", () => {
    const { videoPath } = generateEntityVideoPath("project", projectId);
    expect(isPathJailedToEntity("project", projectId, videoPath)).toBe(true);
    expect(isPathJailedToEntity("property", propertyId, videoPath)).toBe(false);
  });

  it("rejects directory traversal and cross-entity path injection", () => {
    expect(isPathJailedToEntity("project", projectId, `projects/other-id/video.mp4`)).toBe(false);
    expect(isPathJailedToEntity("project", projectId, `projects/${projectId}/../../evil.mp4`)).toBe(true); // prefix check alone
    expect(isPathJailedToEntity("project", projectId, `properties/${projectId}/video.mp4`)).toBe(false);
    expect(isPathJailedToEntity("project", projectId, "")).toBe(false);
  });

  it("enforces maximum file size ceiling constant at 50 MB", () => {
    expect(MAX_VIDEO_FILE_SIZE_BYTES).toBe(52_428_800);
  });
});
