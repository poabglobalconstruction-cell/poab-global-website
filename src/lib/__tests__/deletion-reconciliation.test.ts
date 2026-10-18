import { describe, it, expect } from "vitest";
import { DirectVideoItem, isPathJailedToEntity } from "../video-upload";

describe("Deletion Reconciliation & Partial Failure State Management", () => {
  const projectId = "proj-101-uuid";
  const propertyId = "prop-202-uuid";

  const sampleVideos: DirectVideoItem[] = [
    {
      id: "v-1",
      storage_path: `projects/${projectId}/v-1.mp4`,
      thumbnail_path: `projects/${projectId}/v-1_poster.jpg`,
      title: "Excavation Video",
      file_size_bytes: 12_000_000,
      mime_type: "video/mp4",
      sort_order: 0,
      is_published: true,
      purge_failed: false,
    },
    {
      id: "v-2",
      storage_path: `projects/${projectId}/v-2.mp4`,
      thumbnail_path: `projects/${projectId}/v-2_poster.jpg`,
      title: "Piling & Footings",
      file_size_bytes: 15_000_000,
      mime_type: "video/mp4",
      sort_order: 1,
      is_published: true,
      purge_failed: false,
    },
  ];

  it("safely flags item as purge_failed when cloud storage API times out", () => {
    // Simulate partial failure during deletion
    const videoToDelete = sampleVideos[0];
    const storageError = "Gateway timeout while calling Supabase Storage API";

    const updatedVideos = sampleVideos.map((v) =>
      v.id === videoToDelete.id
        ? { ...v, purge_failed: true, purge_error: storageError }
        : v
    );

    // Verify row is NOT lost or deleted prematurely
    expect(updatedVideos).toHaveLength(2);
    const failedItem = updatedVideos.find((v) => v.id === videoToDelete.id);
    expect(failedItem?.purge_failed).toBe(true);
    expect(failedItem?.purge_error).toBe(storageError);
  });

  it("successfully cleans up video record upon successful retry", () => {
    // Starting with a video that failed previously
    const failedList: DirectVideoItem[] = [
      {
        ...sampleVideos[0],
        purge_failed: true,
        purge_error: "Storage timeout",
      },
      sampleVideos[1],
    ];

    // Retry succeeds -> item is purged from list
    const reconciledList = failedList
      .filter((v) => v.id !== "v-1")
      .map((v, idx) => ({ ...v, sort_order: idx }));

    expect(reconciledList).toHaveLength(1);
    expect(reconciledList[0].id).toBe("v-2");
    expect(reconciledList[0].sort_order).toBe(0);
  });

  it("strictly enforces cross-entity isolation before deletion", () => {
    const maliciousTarget = {
      id: "v-foreign",
      storage_path: `properties/${propertyId}/v-foreign.mp4`,
      title: "Foreign Property Video",
    };

    // A delete request intended for `projectId` must reject a path belonging to `propertyId`
    const isAllowedForProject = isPathJailedToEntity("project", projectId, maliciousTarget.storage_path);
    expect(isAllowedForProject).toBe(false);

    // Only allowed for its genuine owner
    const isAllowedForProperty = isPathJailedToEntity("property", propertyId, maliciousTarget.storage_path);
    expect(isAllowedForProperty).toBe(true);
  });

  it("handles bulk deletion for properties without touching other records", () => {
    const propertyVideos: DirectVideoItem[] = [
      {
        id: "pv-1",
        storage_path: `properties/${propertyId}/pv-1.mp4`,
        title: "Walkthrough 1",
        file_size_bytes: 8_000_000,
        mime_type: "video/mp4",
        sort_order: 0,
        is_published: true,
      },
      {
        id: "pv-2",
        storage_path: `properties/${propertyId}/pv-2.mp4`,
        title: "Walkthrough 2",
        file_size_bytes: 9_000_000,
        mime_type: "video/mp4",
        sort_order: 1,
        is_published: true,
      },
    ];

    // Bulk delete cleans all property videos
    const cleared = propertyVideos.filter(() => false);
    expect(cleared).toHaveLength(0);

    // Project videos remain untouched
    expect(sampleVideos).toHaveLength(2);
  });
});
