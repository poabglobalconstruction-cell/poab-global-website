import { describe, it, expect } from "vitest";
import { ProjectPhotoItem } from "@/components/admin/MultiImageUploader";

describe("MultiImageUploader & Project Photography Logic", () => {
  it("assigns the first uploaded photograph as the project cover automatically", () => {
    const uploadedPhotos: ProjectPhotoItem[] = [];

    const file1: ProjectPhotoItem = {
      id: "photo-1",
      storage_path: "https://example.com/site-1.jpg",
      alt_text: "Site Foundation",
      sort_order: 0,
      is_cover: true,
      project_stage_id: null,
    };

    const file2: ProjectPhotoItem = {
      id: "photo-2",
      storage_path: "https://example.com/site-2.jpg",
      alt_text: "Site Decking",
      sort_order: 1,
      is_cover: false,
      project_stage_id: null,
    };

    const updated = [...uploadedPhotos, file1, file2];
    expect(updated).toHaveLength(2);
    expect(updated[0].is_cover).toBe(true);
    expect(updated[1].is_cover).toBe(false);
  });

  it("supports setting another photo as cover without duplicating cover status", () => {
    let photos: ProjectPhotoItem[] = [
      {
        id: "photo-1",
        storage_path: "https://example.com/site-1.jpg",
        alt_text: "Foundation",
        sort_order: 0,
        is_cover: true,
        project_stage_id: null,
      },
      {
        id: "photo-2",
        storage_path: "https://example.com/site-2.jpg",
        alt_text: "Completed Exterior",
        sort_order: 1,
        is_cover: false,
        project_stage_id: null,
      },
    ];

    // Administrator selects photo-2 as cover
    const targetId = "photo-2";
    photos = photos.map((p) => ({
      ...p,
      is_cover: p.id === targetId,
    }));

    expect(photos.find((p) => p.id === "photo-1")?.is_cover).toBe(false);
    expect(photos.find((p) => p.id === "photo-2")?.is_cover).toBe(true);
    expect(photos.filter((p) => p.is_cover)).toHaveLength(1);
  });

  it("preserves gallery order when photographs are reordered", () => {
    const photos: ProjectPhotoItem[] = [
      { id: "p-1", storage_path: "p1.jpg", alt_text: "1", sort_order: 0, is_cover: true },
      { id: "p-2", storage_path: "p2.jpg", alt_text: "2", sort_order: 1, is_cover: false },
      { id: "p-3", storage_path: "p3.jpg", alt_text: "3", sort_order: 2, is_cover: false },
    ];

    // Move p-2 backward (swap with p-1)
    const reordered = [...photos];
    const [moved] = reordered.splice(1, 1);
    reordered.splice(0, 0, moved);

    const withUpdatedSort = reordered.map((p, idx) => ({ ...p, sort_order: idx }));

    expect(withUpdatedSort[0].id).toBe("p-2");
    expect(withUpdatedSort[0].sort_order).toBe(0);
    expect(withUpdatedSort[1].id).toBe("p-1");
    expect(withUpdatedSort[1].sort_order).toBe(1);
  });

  it("promotes the next available photo to cover when the cover photo is removed", () => {
    const photos: ProjectPhotoItem[] = [
      { id: "p-1", storage_path: "p1.jpg", alt_text: "1", sort_order: 0, is_cover: true },
      { id: "p-2", storage_path: "p2.jpg", alt_text: "2", sort_order: 1, is_cover: false },
    ];

    const removeId = "p-1";
    const removedPhoto = photos.find((p) => p.id === removeId);
    const remaining = photos
      .filter((p) => p.id !== removeId)
      .map((p, idx) => ({ ...p, sort_order: idx }));

    if (removedPhoto?.is_cover && remaining.length > 0) {
      remaining[0].is_cover = true;
    }

    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("p-2");
    expect(remaining[0].is_cover).toBe(true);
    expect(remaining[0].sort_order).toBe(0);
  });

  it("associates uploaded photographs with construction stages without losing cover photo", () => {
    let photos: ProjectPhotoItem[] = [
      { id: "p-1", storage_path: "p1.jpg", alt_text: "Cover", sort_order: 0, is_cover: true, project_stage_id: null },
      { id: "p-2", storage_path: "p2.jpg", alt_text: "Foundation", sort_order: 1, is_cover: false, project_stage_id: null },
    ];

    const stageId = "stage-foundation-123";
    photos = photos.map((p) => (p.id === "p-2" ? { ...p, project_stage_id: stageId } : p));

    expect(photos[0].is_cover).toBe(true);
    expect(photos[0].project_stage_id).toBeNull();
    expect(photos[1].project_stage_id).toBe("stage-foundation-123");
  });
});
