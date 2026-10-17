export interface ProjectVideo {
  id: string;
  url: string;
  youtube_id: string;
  title: string;
  caption?: string | null;
  project_stage_id?: string | null;
  sort_order: number;
  poster_url?: string | null;
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts and validates a YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-character video ID
 */
export function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Direct 11-char ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    // Normalise protocol if missing
    const urlString = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // 1. youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const pathId = parsed.pathname.slice(1).split("/")[0].split("?")[0];
      if (YOUTUBE_ID_REGEX.test(pathId)) {
        return pathId;
      }
    }

    // 2. youtube.com or m.youtube.com
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      // /watch?v=VIDEO_ID
      const vParam = parsed.searchParams.get("v");
      if (vParam && YOUTUBE_ID_REGEX.test(vParam)) {
        return vParam;
      }

      // /embed/VIDEO_ID
      if (parsed.pathname.startsWith("/embed/")) {
        const embedId = parsed.pathname.replace("/embed/", "").split("/")[0].split("?")[0];
        if (YOUTUBE_ID_REGEX.test(embedId)) {
          return embedId;
        }
      }

      // /shorts/VIDEO_ID
      if (parsed.pathname.startsWith("/shorts/")) {
        const shortsId = parsed.pathname.replace("/shorts/", "").split("/")[0].split("?")[0];
        if (YOUTUBE_ID_REGEX.test(shortsId)) {
          return shortsId;
        }
      }

      // /v/VIDEO_ID
      if (parsed.pathname.startsWith("/v/")) {
        const vId = parsed.pathname.replace("/v/", "").split("/")[0].split("?")[0];
        if (YOUTUBE_ID_REGEX.test(vId)) {
          return vId;
        }
      }
    }
  } catch {
    // Malformed URL
    return null;
  }

  return null;
}

/**
 * Validates whether the given URL is a valid, recognized YouTube link.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Returns a privacy-respecting YouTube embed URL using youtube-nocookie.com
 */
export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0&modestbranding=1`;
}

/**
 * Returns the default high-quality thumbnail URL for a given YouTube video ID
 */
export function getYouTubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`;
}

const VIDEO_BLOCK_TAG_START = "<!-- POAB_PROJECT_VIDEOS_JSON:";
const VIDEO_BLOCK_TAG_END = "-->";

/**
 * Parses project description text and extracts any embedded project videos metadata.
 * Returns clean human-readable description and an array of ProjectVideo objects.
 */
export function parseProjectVideos(rawDescription: string | null | undefined): {
  cleanDescription: string;
  videos: ProjectVideo[];
} {
  if (!rawDescription || typeof rawDescription !== "string") {
    return { cleanDescription: "", videos: [] };
  }

  const startIndex = rawDescription.indexOf(VIDEO_BLOCK_TAG_START);
  if (startIndex === -1) {
    return { cleanDescription: rawDescription.trim(), videos: [] };
  }

  const endIndex = rawDescription.indexOf(VIDEO_BLOCK_TAG_END, startIndex);
  if (endIndex === -1) {
    // Incomplete block, leave description as is
    return { cleanDescription: rawDescription.trim(), videos: [] };
  }

  const jsonString = rawDescription.substring(
    startIndex + VIDEO_BLOCK_TAG_START.length,
    endIndex
  ).trim();

  let cleanDescription = (
    rawDescription.substring(0, startIndex) +
    rawDescription.substring(endIndex + VIDEO_BLOCK_TAG_END.length)
  ).trim();

  let videos: ProjectVideo[] = [];
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      videos = parsed
        .map((item, index) => {
          const ytId = item.youtube_id || extractYouTubeId(item.url || "");
          if (!ytId) return null;
          return {
            id: String(item.id || `video-${index}-${Date.now()}`),
            url: String(item.url || `https://www.youtube.com/watch?v=${ytId}`),
            youtube_id: ytId,
            title: String(item.title || "Construction Progress Video"),
            caption: item.caption ? String(item.caption) : null,
            project_stage_id: item.project_stage_id ? String(item.project_stage_id) : null,
            sort_order: typeof item.sort_order === "number" ? item.sort_order : index,
            poster_url: item.poster_url ? String(item.poster_url) : null,
          } as ProjectVideo;
        })
        .filter((v): v is ProjectVideo => v !== null)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
  } catch {
    videos = [];
  }

  return { cleanDescription, videos };
}

/**
 * Serializes project videos array into the project description as a backward-compatible HTML comment block.
 * Leaves the human-readable description text clean at the top.
 */
export function serializeProjectVideos(cleanDescription: string, videos: ProjectVideo[]): string {
  const trimmedDesc = (cleanDescription || "").trim();

  if (!videos || videos.length === 0) {
    return trimmedDesc;
  }

  // Sanitize videos list before saving
  const sanitizedVideos: ProjectVideo[] = videos.map((v, idx) => ({
    id: v.id || `video-${idx}-${Date.now()}`,
    url: v.url.trim(),
    youtube_id: v.youtube_id.trim(),
    title: (v.title || "Construction Progress Video").trim(),
    caption: v.caption?.trim() || null,
    project_stage_id: v.project_stage_id || null,
    sort_order: typeof v.sort_order === "number" ? v.sort_order : idx,
    poster_url: v.poster_url?.trim() || null,
  }));

  const json = JSON.stringify(sanitizedVideos);
  const videoBlock = `${VIDEO_BLOCK_TAG_START} ${json} ${VIDEO_BLOCK_TAG_END}`;

  return trimmedDesc ? `${trimmedDesc}\n\n${videoBlock}` : videoBlock;
}
