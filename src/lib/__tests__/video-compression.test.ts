import { describe, it, expect } from "vitest";
import {
  COMPRESSION_PRESETS,
  estimateCompressedSize,
  checkCompressionCapabilities,
} from "../video-compression";

describe("Video Compression Presets & Bitrate Calculations", () => {
  it("defines all three required compression presets", () => {
    expect(COMPRESSION_PRESETS.smaller).toBeDefined();
    expect(COMPRESSION_PRESETS.balanced).toBeDefined();
    expect(COMPRESSION_PRESETS.quality).toBeDefined();
  });

  it("assigns appropriate bitrates and resolutions to each preset", () => {
    const { smaller, balanced, quality } = COMPRESSION_PRESETS;

    // Bitrate hierarchy: smaller < balanced < quality
    expect(smaller.targetVideoBitrate).toBeLessThan(balanced.targetVideoBitrate);
    expect(balanced.targetVideoBitrate).toBeLessThan(quality.targetVideoBitrate);

    // Audio bitrates
    expect(smaller.targetAudioBitrate).toBe(96_000);
    expect(balanced.targetAudioBitrate).toBe(128_000);
    expect(quality.targetAudioBitrate).toBe(160_000);

    // Resolutions
    expect(smaller.targetResolution.width).toBe(1280);
    expect(smaller.targetResolution.height).toBe(720);

    expect(balanced.targetResolution.width).toBe(1920);
    expect(balanced.targetResolution.height).toBe(1080);

    expect(quality.targetResolution.width).toBe(1920);
    expect(quality.targetResolution.height).toBe(1080);
  });

  it("calculates accurate size estimates based on duration and bitrate", () => {
    // 60 seconds on smaller preset (1.2 Mbps video + 96 kbps audio = 1.296 Mbps total)
    // 1,296,000 * 60 / 8 = 9,720,000 bytes (~9.27 MB)
    const estimated60s = estimateCompressedSize(60, "smaller");
    expect(estimated60s).toBe(9_720_000);

    // 90 seconds on balanced preset (2.2 Mbps video + 128 kbps audio = 2.328 Mbps)
    // 2,328,000 * 90 / 8 = 26,190,000 bytes (~24.97 MB)
    const estimated90s = estimateCompressedSize(90, "balanced");
    expect(estimated90s).toBe(26_190_000);

    // 0 seconds returns 0
    expect(estimateCompressedSize(0, "smaller")).toBe(0);
  });

  it("ensures typical 60s clips on all presets stay well below 50MB Supabase limit", () => {
    const limit50MB = 50 * 1024 * 1024;

    const smaller60 = estimateCompressedSize(60, "smaller");
    const balanced60 = estimateCompressedSize(60, "balanced");
    const quality60 = estimateCompressedSize(60, "quality");

    expect(smaller60).toBeLessThan(limit50MB);
    expect(balanced60).toBeLessThan(limit50MB);
    expect(quality60).toBeLessThan(limit50MB);

    // A 90-second high quality clip fits safely under 50MB (44.5 MB)
    const quality90 = estimateCompressedSize(90, "quality");
    expect(quality90).toBeLessThan(limit50MB);
  });
});

describe("Capability & Environment Checking", () => {
  it("handles non-browser (Node.js/SSR) environment safely without throwing", () => {
    const result = checkCompressionCapabilities();
    expect(result).toBeDefined();
    // In Node.js environment window is undefined or lacks full MediaRecorder
    if (typeof window === "undefined" || !window.MediaRecorder) {
      expect(result.supported).toBe(false);
      expect(result.engine).toBe("unsupported");
    }
  });
});
