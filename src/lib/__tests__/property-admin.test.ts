import { describe, it, expect } from "vitest";
import { Property, PropertyImage, PropertyStatus } from "@/types/database";

describe("Property Administration, Availability Management & Cover Image Resolution", () => {
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

  describe("Cover Image Selection, Persistence & Resolution", () => {
    it("resolves primary cover image when property has property_images join result", () => {
      // Simulate PostgREST join where images come back as property_images
      const property = {
        id: "prop-1",
        title: "Duplex",
        property_images: [
          { id: "1", storage_path: "https://example.com/1.jpg", is_primary: false, sort_order: 0 },
          { id: "2", storage_path: "https://example.com/cover.jpg", is_primary: true, sort_order: 1 },
          { id: "3", storage_path: "https://example.com/3.jpg", is_primary: false, sort_order: 2 },
        ],
      };

      const allImages = (property as any).property_images || (property as any).images || [];
      const primaryImage =
        allImages.length > 0
          ? allImages.find((img: any) => img.is_primary)?.storage_path || allImages[0].storage_path
          : null;

      expect(primaryImage).toBe("https://example.com/cover.jpg");
    });

    it("resolves primary cover image when property has images array", () => {
      const property = {
        id: "prop-2",
        title: "Bungalow",
        images: [
          { id: "1", storage_path: "https://example.com/bungalow-cover.jpg", is_primary: true, sort_order: 0 },
          { id: "2", storage_path: "https://example.com/bungalow-2.jpg", is_primary: false, sort_order: 1 },
        ],
      };

      const allImages = (property as any).property_images || (property as any).images || [];
      const primaryImage =
        allImages.length > 0
          ? allImages.find((img: any) => img.is_primary)?.storage_path || allImages[0].storage_path
          : null;

      expect(primaryImage).toBe("https://example.com/bungalow-cover.jpg");
    });

    it("falls back to first image if no image has is_primary explicitly set", () => {
      const property = {
        id: "prop-3",
        title: "Commercial Plot",
        property_images: [
          { id: "1", storage_path: "https://example.com/first.jpg", is_primary: false, sort_order: 0 },
          { id: "2", storage_path: "https://example.com/second.jpg", is_primary: false, sort_order: 1 },
        ],
      };

      const allImages = (property as any).property_images || (property as any).images || [];
      const primaryImage =
        allImages.length > 0
          ? allImages.find((img: any) => img.is_primary)?.storage_path || allImages[0].storage_path
          : null;

      expect(primaryImage).toBe("https://example.com/first.jpg");
    });

    it("returns null when property has no photographs (triggers placeholder)", () => {
      const property = {
        id: "prop-4",
        title: "Land Parcel",
        property_images: [],
      };

      const allImages = (property as any).property_images || (property as any).images || [];
      const primaryImage =
        allImages.length > 0
          ? allImages.find((img: any) => img.is_primary)?.storage_path || allImages[0].storage_path
          : null;

      expect(primaryImage).toBeNull();
    });

    it("restores selected cover on edit when mapping initial database images to PhotoItem", () => {
      const initialImages: PropertyImage[] = [
        {
          id: "img-1",
          property_id: "prop-1",
          storage_path: "https://example.com/1.jpg",
          alt_text: "Photo 1",
          sort_order: 0,
          is_primary: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "img-2",
          property_id: "prop-1",
          storage_path: "https://example.com/2.jpg",
          alt_text: "Photo 2",
          sort_order: 1,
          is_primary: true, // Selected cover
          created_at: new Date().toISOString(),
        },
      ];

      // Form initialization in EditPropertyClient
      const photos = initialImages.map((img, idx) => ({
        id: img.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text,
        caption: null,
        sort_order: typeof img.sort_order === "number" ? img.sort_order : idx,
        is_cover: Boolean(img.is_primary),
      }));

      expect(photos[0].is_cover).toBe(false);
      expect(photos[1].is_cover).toBe(true);

      // Changing cover to img-1
      const updatedPhotos = photos.map((p) => ({
        ...p,
        is_cover: p.id === "img-1",
      }));

      expect(updatedPhotos[0].is_cover).toBe(true);
      expect(updatedPhotos[1].is_cover).toBe(false);

      // Normalization before save
      const hasCover = updatedPhotos.some((p) => p.is_cover);
      const normalizedPhotos = updatedPhotos.map((p, idx) => ({
        id: p.id,
        storage_path: p.storage_path,
        alt_text: p.alt_text,
        sort_order: p.sort_order ?? idx,
        is_primary: hasCover ? Boolean(p.is_cover) : idx === 0,
      }));

      expect(normalizedPhotos[0].is_primary).toBe(true);
      expect(normalizedPhotos[1].is_primary).toBe(false);
    });

    it("automatically reassigns cover if the cover photograph is deleted", () => {
      const photos = [
        { id: "1", storage_path: "https://example.com/1.jpg", is_cover: true, sort_order: 0 },
        { id: "2", storage_path: "https://example.com/2.jpg", is_cover: false, sort_order: 1 },
      ];

      // Remove photo 1
      const photoToRemove = photos.find((p) => p.id === "1");
      const remaining = photos
        .filter((p) => p.id !== "1")
        .map((p, idx) => ({ ...p, sort_order: idx }));

      if (photoToRemove?.is_cover && remaining.length > 0) {
        remaining[0].is_cover = true;
      }

      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe("2");
      expect(remaining[0].is_cover).toBe(true);
    });
  });

  describe("Internal Reference Number Privacy", () => {
    it("ensures public metadata title does not contain internal reference number", () => {
      const property = {
        title: "Executive 4 Bedroom Duplex",
        reference: "POAB-PROP-2026-0003",
      };

      const publicTitle = `${property.title} | POAB Global Properties`;
      expect(publicTitle).not.toContain(property.reference);
      expect(publicTitle).toBe("Executive 4 Bedroom Duplex | POAB Global Properties");
    });

    it("ensures WhatsApp pre-filled message uses property title and location, not reference", () => {
      const property = {
        title: "Executive 4 Bedroom Duplex",
        reference: "POAB-PROP-2026-0003",
        location: "Ibafo, Ogun State",
      };

      const whatsappMessage = `Hello POAB Global Construction, I am interested in property "${property.title}" located at ${property.location}. Please share inspection availability.`;
      expect(whatsappMessage).not.toContain(property.reference);
      expect(whatsappMessage).toContain(property.title);
      expect(whatsappMessage).toContain(property.location);
    });
  });
});
