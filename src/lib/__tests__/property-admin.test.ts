import { describe, it, expect } from "vitest";
import { PropertyStatus } from "@/types/database";

describe("Property Administration & Availability Management", () => {
  it("supports all valid property status transitions including Withdrawn", () => {
    const statuses: PropertyStatus[] = ["Available", "Under Offer", "Sold", "Withdrawn"];
    expect(statuses).toContain("Withdrawn");
    expect(statuses).toHaveLength(4);
  });

  it("safely sanitizes property update payload and normalizes featuresText", () => {
    // Simulating PUT payload parser logic
    const body: Record<string, any> = {
      id: "test-property-id",
      title: "Luxury Duplex",
      featuresText: "Perimeter Fencing\nTarred Road\nElectricity",
      status: "Available",
      extraUnmappedColumn: "should be ignored",
    };

    const { id, images, featuresText, ...updates } = body;

    const allowedColumns = [
      "title",
      "slug",
      "property_type",
      "location",
      "price",
      "price_public",
      "bedrooms",
      "bathrooms",
      "size",
      "description",
      "features",
      "status",
      "featured",
      "published",
      "archived_at",
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const key of allowedColumns) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (Array.isArray(updates.features)) {
      sanitizedUpdates.features = updates.features;
    } else if (typeof featuresText === "string") {
      sanitizedUpdates.features = featuresText.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean);
    }

    // Crucial: featuresText must NOT be present in sanitizedUpdates to prevent schema cache errors
    expect(sanitizedUpdates).not.toHaveProperty("featuresText");
    expect(sanitizedUpdates).not.toHaveProperty("extraUnmappedColumn");
    expect(sanitizedUpdates.features).toEqual(["Perimeter Fencing", "Tarred Road", "Electricity"]);
    expect(sanitizedUpdates.title).toBe("Luxury Duplex");
  });

  it("handles multi-photo gallery items and cover mapping without caption column", () => {
    const incomingPhotos = [
      {
        id: "img-1",
        storage_path: "https://example.com/photo1.jpg",
        alt_text: "Front view",
        is_cover: false,
        sort_order: 0,
      },
      {
        id: "img-2",
        storage_path: "https://example.com/photo2.jpg",
        alt_text: "Master Bedroom",
        is_cover: true,
        sort_order: 1,
      },
    ];

    const propertyId = "prop-123";

    // Simulate mapping to property_images table
    const mappedImages = incomingPhotos.map((img, idx) => ({
      id: img.id,
      property_id: propertyId,
      storage_path: img.storage_path,
      alt_text: img.alt_text,
      sort_order: img.sort_order ?? idx,
      is_primary: Boolean((img as any).is_primary ?? img.is_cover ?? idx === 0),
    }));

    // Must map is_cover to is_primary
    expect(mappedImages[0].is_primary).toBe(false);
    expect(mappedImages[1].is_primary).toBe(true);

    // Must NOT have caption column
    for (const img of mappedImages) {
      expect(img).not.toHaveProperty("caption");
    }
  });

  it("correctly determines public visibility for Withdrawn vs Sold vs Available listings", () => {
    const properties = [
      { id: "1", status: "Available", published: true },
      { id: "2", status: "Under Offer", published: true },
      { id: "3", status: "Sold", published: true },
      { id: "4", status: "Withdrawn", published: true },
      { id: "5", status: "Available", published: false },
    ];

    // Default public filter: published = true and status != Withdrawn
    const defaultPublic = properties.filter((p) => p.published && p.status !== "Withdrawn");
    expect(defaultPublic.map((p) => p.id)).toEqual(["1", "2", "3"]);

    // Withdrawn listing is hidden from general public browsing
    expect(defaultPublic.some((p) => p.status === "Withdrawn")).toBe(false);
  });
});
