import { describe, it, expect } from "vitest";
import {
  extractYouTubeId,
  isValidYouTubeUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  parseProjectVideos,
  serializeProjectVideos,
  ProjectVideo,
} from "../video";

describe("YouTube URL & ID Extraction", () => {
  it("extracts ID from standard watch URLs", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("http://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from shortened youtu.be URLs", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("http://youtu.be/dQw4w9WgXcQ?t=12")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from embed URLs", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from mobile URLs", () => {
    expect(extractYouTubeId("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from shorts URLs", () => {
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtube.com/shorts/dQw4w9WgXcQ?feature=share")).toBe("dQw4w9WgXcQ");
  });

  it("accepts a raw 11-char YouTube ID", () => {
    expect(extractYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejects invalid, empty, or malicious inputs", () => {
    expect(extractYouTubeId("")).toBeNull();
    expect(extractYouTubeId("   ")).toBeNull();
    expect(extractYouTubeId("not-a-url")).toBeNull();
    expect(extractYouTubeId("https://vimeo.com/12345678")).toBeNull();
    expect(extractYouTubeId("https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(extractYouTubeId("javascript:alert(1)")).toBeNull();
    expect(extractYouTubeId("https://www.youtube.com/watch?v=tooShort")).toBeNull();
    expect(extractYouTubeId("https://www.youtube.com/watch?v=wayTooLongString123456789")).toBeNull();
  });

  it("validates URLs with isValidYouTubeUrl", () => {
    expect(isValidYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isValidYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isValidYouTubeUrl("invalid")).toBe(false);
  });

  it("generates correct embed and thumbnail URLs", () => {
    expect(getYouTubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
    );
    expect(getYouTubeThumbnailUrl("dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });
});

describe("Project Video Serialization & Deserialization", () => {
  const sampleVideos: ProjectVideo[] = [
    {
      id: "v-1",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtube_id: "dQw4w9WgXcQ",
      title: "Foundation & Groundwork Excavation",
      caption: "Live footage of site excavation and footing casting.",
      project_stage_id: "stage-101",
      sort_order: 0,
      poster_url: null,
    },
    {
      id: "v-2",
      url: "https://youtu.be/L_LUpnjgPso",
      youtube_id: "L_LUpnjgPso",
      title: "Roof Truss Installation",
      caption: null,
      project_stage_id: null,
      sort_order: 1,
      poster_url: "https://example.com/custom-poster.jpg",
    },
  ];

  it("handles descriptions without video blocks cleanly", () => {
    const raw = "This is a luxury 5-bedroom duplex in Ibadan.\nBuilt to premium engineering standards.";
    const { cleanDescription, videos } = parseProjectVideos(raw);
    expect(cleanDescription).toBe(raw);
    expect(videos).toEqual([]);
  });

  it("handles null and undefined descriptions", () => {
    expect(parseProjectVideos(null)).toEqual({ cleanDescription: "", videos: [] });
    expect(parseProjectVideos(undefined)).toEqual({ cleanDescription: "", videos: [] });
    expect(parseProjectVideos("")).toEqual({ cleanDescription: "", videos: [] });
  });

  it("serializes and round-trips videos cleanly without corrupting the description", () => {
    const originalText = "Comprehensive structural overhaul with Grade-40 reinforced concrete.";
    const serialized = serializeProjectVideos(originalText, sampleVideos);

    expect(serialized).toContain(originalText);
    expect(serialized).toContain("<!-- POAB_PROJECT_VIDEOS_JSON:");

    const parsed = parseProjectVideos(serialized);
    expect(parsed.cleanDescription).toBe(originalText);
    expect(parsed.videos).toHaveLength(2);
    expect(parsed.videos[0].youtube_id).toBe("dQw4w9WgXcQ");
    expect(parsed.videos[0].title).toBe("Foundation & Groundwork Excavation");
    expect(parsed.videos[0].project_stage_id).toBe("stage-101");
    expect(parsed.videos[1].youtube_id).toBe("L_LUpnjgPso");
    expect(parsed.videos[1].poster_url).toBe("https://example.com/custom-poster.jpg");
  });

  it("does not append a video block when video list is empty", () => {
    const originalText = "Standard project description.";
    const serialized = serializeProjectVideos(originalText, []);
    expect(serialized).toBe(originalText);
    expect(serialized).not.toContain("POAB_PROJECT_VIDEOS_JSON");
  });

  it("gracefully recovers if video JSON is malformed in description", () => {
    const corrupted = "Some text.\n<!-- POAB_PROJECT_VIDEOS_JSON: {not-valid-json} -->";
    const parsed = parseProjectVideos(corrupted);
    expect(parsed.cleanDescription).toBe("Some text.");
    expect(parsed.videos).toEqual([]);
  });

  it("maintains sorting order of videos", () => {
    const outOfOrder: ProjectVideo[] = [
      { ...sampleVideos[1], sort_order: 10 },
      { ...sampleVideos[0], sort_order: 2 },
    ];
    const serialized = serializeProjectVideos("Sorting test", outOfOrder);
    const parsed = parseProjectVideos(serialized);
    expect(parsed.videos[0].id).toBe("v-1");
    expect(parsed.videos[1].id).toBe("v-2");
  });
});
