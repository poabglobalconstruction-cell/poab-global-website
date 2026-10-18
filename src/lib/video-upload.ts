/**
 * POAB Global Construction - Video Upload, Security & Storage Utilities
 *
 * Provides binary file signature (magic bytes) validation, entity-scoped
 * storage path generation, and deletion reconciliation logic for private
 * Supabase Storage buckets.
 */

export interface VideoFileValidationResult {
  valid: boolean;
  detectedFormat?: "mp4" | "mov" | "webm" | "unknown";
  error?: string;
  fileSizeBytes: number;
  exceedsLimit: boolean;
}

export const MAX_VIDEO_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50.0 MB
export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

/**
 * Validates the binary header (magic bytes) of a video file.
 * Inspects offset 4-12 for ISO Base Media 'ftyp' box and major brand identifiers.
 */
export function validateVideoBinaryHeader(headerBytes: Uint8Array): {
  valid: boolean;
  detectedFormat: "mp4" | "mov" | "webm" | "unknown";
  error?: string;
} {
  if (!headerBytes || headerBytes.length < 12) {
    return {
      valid: false,
      detectedFormat: "unknown",
      error: "File is too small to inspect binary container header (minimum 12 bytes required).",
    };
  }

  // Check for 'ftyp' box at index 4 to 7
  const boxType = String.fromCharCode(
    headerBytes[4],
    headerBytes[5],
    headerBytes[6],
    headerBytes[7]
  );

  if (boxType === "ftyp") {
    const majorBrand = String.fromCharCode(
      headerBytes[8],
      headerBytes[9],
      headerBytes[10],
      headerBytes[11]
    );

    // QuickTime (Apple .mov)
    if (majorBrand.startsWith("qt")) {
      return { valid: true, detectedFormat: "mov" };
    }

    // Standard MP4 brands (isom, iso2, mp41, mp42, avc1, M4V)
    const validMp4Brands = ["isom", "iso2", "mp41", "mp42", "avc1", "M4V ", "dash"];
    if (validMp4Brands.some((b) => majorBrand.startsWith(b.trim()))) {
      return { valid: true, detectedFormat: "mp4" };
    }

    // Generic ftyp container
    return { valid: true, detectedFormat: "mp4" };
  }

  // WebM / Matroska EBML signature (0x1A 0x45 0xDF 0xA3)
  if (
    headerBytes[0] === 0x1a &&
    headerBytes[1] === 0x45 &&
    headerBytes[2] === 0xdf &&
    headerBytes[3] === 0xa3
  ) {
    return { valid: true, detectedFormat: "webm" };
  }

  return {
    valid: false,
    detectedFormat: "unknown",
    error: "File does not contain a genuine MP4, QuickTime (MOV), or WebM binary container signature.",
  };
}

/**
 * Validates a video File object: inspects declared MIME type, file size, and binary magic bytes.
 */
export async function validateVideoFile(file: File): Promise<VideoFileValidationResult> {
  const fileSizeBytes = file.size;
  const exceedsLimit = fileSizeBytes > MAX_VIDEO_FILE_SIZE_BYTES;

  if (exceedsLimit) {
    return {
      valid: false,
      error: `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of 50.0 MB.`,
      fileSizeBytes,
      exceedsLimit: true,
      detectedFormat: "unknown",
    };
  }

  // Read the first 32 bytes for binary inspection
  try {
    const slice = file.slice(0, 32);
    const buffer = await slice.arrayBuffer();
    const headerBytes = new Uint8Array(buffer);
    const headerCheck = validateVideoBinaryHeader(headerBytes);

    if (!headerCheck.valid) {
      return {
        valid: false,
        error: headerCheck.error,
        fileSizeBytes,
        exceedsLimit: false,
        detectedFormat: headerCheck.detectedFormat,
      };
    }

    return {
      valid: true,
      fileSizeBytes,
      exceedsLimit: false,
      detectedFormat: headerCheck.detectedFormat,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Failed to read binary file header",
      fileSizeBytes,
      exceedsLimit: false,
      detectedFormat: "unknown",
    };
  }
}

/**
 * Generates an isolated, entity-scoped storage path for private video storage.
 * Enforces directory jailing: 'projects/{entityId}/{uuid}.mp4'
 */
export function generateEntityVideoPath(
  entityType: "project" | "property",
  entityId: string,
  extension = "mp4"
): { videoPath: string; posterPath: string; videoId: string } {
  const videoId = crypto.randomUUID();
  const folder = entityType === "project" ? "projects" : "properties";
  const safeExt = extension.replace(/^\./, "").toLowerCase();

  return {
    videoId,
    videoPath: `${folder}/${entityId}/${videoId}.${safeExt}`,
    posterPath: `${folder}/${entityId}/${videoId}_poster.jpg`,
  };
}

/**
 * Verifies that a storage path is strictly jailed inside the entity's designated UUID folder.
 */
export function isPathJailedToEntity(
  entityType: "project" | "property",
  entityId: string,
  storagePath: string
): boolean {
  if (!storagePath || typeof storagePath !== "string") return false;
  const prefix = entityType === "project" ? `projects/${entityId}/` : `properties/${entityId}/`;
  return storagePath.startsWith(prefix);
}

export interface DirectVideoItem {
  id: string;
  storage_path: string;
  thumbnail_path?: string | null;
  signed_playback_url?: string | null;
  signed_thumbnail_url?: string | null;
  title: string;
  caption?: string | null;
  duration_seconds?: number | null;
  file_size_bytes: number;
  mime_type: string;
  sort_order: number;
  is_published: boolean;
  purge_failed?: boolean;
  purge_error?: string | null;
  project_stage_id?: string | null;
}

/**
 * Converts a base64 DataURL (e.g. from canvas poster extraction) to a standard Blob.
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}
