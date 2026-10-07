import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Content Deletion & Protection Logic", () => {
  describe("Confirmation Challenge Verification", () => {
    function isDeleteConfirmed(input: string): boolean {
      return input.trim() === "DELETE";
    }

    it("accepts exact string 'DELETE'", () => {
      expect(isDeleteConfirmed("DELETE")).toBe(true);
    });

    it("accepts 'DELETE' with leading or trailing whitespace", () => {
      expect(isDeleteConfirmed("  DELETE  ")).toBe(true);
    });

    it("rejects lowercase 'delete'", () => {
      expect(isDeleteConfirmed("delete")).toBe(false);
    });

    it("rejects partial text 'DEL'", () => {
      expect(isDeleteConfirmed("DEL")).toBe(false);
    });

    it("rejects empty or blank text", () => {
      expect(isDeleteConfirmed("")).toBe(false);
      expect(isDeleteConfirmed("   ")).toBe(false);
    });

    it("rejects accidental input like 'yes' or 'confirm'", () => {
      expect(isDeleteConfirmed("yes")).toBe(false);
      expect(isDeleteConfirmed("confirm")).toBe(false);
    });
  });

  describe("Admin Authorization Role Verification", () => {
    function isAuthorizedAdmin(session: { role: string; active?: boolean } | null): boolean {
      if (!session) return false;
      if (session.active === false) return false;
      return ["admin", "super_admin"].includes(session.role);
    }

    it("rejects unauthenticated visitor (null session)", () => {
      expect(isAuthorizedAdmin(null)).toBe(false);
    });

    it("rejects non-admin role (e.g. user, client, editor)", () => {
      expect(isAuthorizedAdmin({ role: "user", active: true })).toBe(false);
      expect(isAuthorizedAdmin({ role: "client", active: true })).toBe(false);
      expect(isAuthorizedAdmin({ role: "editor", active: true })).toBe(false);
    });

    it("rejects inactive administrator", () => {
      expect(isAuthorizedAdmin({ role: "admin", active: false })).toBe(false);
      expect(isAuthorizedAdmin({ role: "super_admin", active: false })).toBe(false);
    });

    it("authorizes active admin", () => {
      expect(isAuthorizedAdmin({ role: "admin", active: true })).toBe(true);
    });

    it("authorizes active super_admin", () => {
      expect(isAuthorizedAdmin({ role: "super_admin", active: true })).toBe(true);
    });
  });

  describe("Customer Enquiry Lead Preservation Strategy", () => {
    interface MockEnquiry {
      id: string;
      property_id: string | null;
      property_reference?: string | null;
      property_title?: string | null;
      name: string;
      email: string;
    }

    interface MockProperty {
      id: string;
      reference: string;
      title: string;
    }

    function safeDecoupleEnquiries(
      property: MockProperty,
      enquiries: MockEnquiry[],
      canSetNull: boolean
    ): { success: boolean; decoupledEnquiries?: MockEnquiry[]; error?: string } {
      if (enquiries.length === 0) {
        return { success: true, decoupledEnquiries: [] };
      }

      if (!canSetNull) {
        return {
          success: false,
          error: `Cannot delete property: This listing is associated with ${enquiries.length} customer enquiry lead(s). Archive instead or decouple.`,
        };
      }

      const updated = enquiries.map((enq) => ({
        ...enq,
        property_id: null,
        property_reference: property.reference,
        property_title: property.title,
      }));

      return { success: true, decoupledEnquiries: updated };
    }

    it("safely decouples and preserves customer lead history when setting null is supported", () => {
      const property: MockProperty = {
        id: "prop-123",
        reference: "POAB-PROP-2026-0001",
        title: "Prime Commercial Plot",
      };

      const enquiries: MockEnquiry[] = [
        {
          id: "enq-1",
          property_id: "prop-123",
          name: "Chief Bamidele",
          email: "bamidele@example.com",
        },
      ];

      const result = safeDecoupleEnquiries(property, enquiries, true);
      expect(result.success).toBe(true);
      expect(result.decoupledEnquiries).toBeDefined();
      expect(result.decoupledEnquiries![0].property_id).toBeNull();
      expect(result.decoupledEnquiries![0].property_reference).toBe("POAB-PROP-2026-0001");
      expect(result.decoupledEnquiries![0].property_title).toBe("Prime Commercial Plot");
      expect(result.decoupledEnquiries![0].name).toBe("Chief Bamidele");
    });

    it("aborts deletion with error to protect customer lead history when foreign key would cascade", () => {
      const property: MockProperty = {
        id: "prop-123",
        reference: "POAB-PROP-2026-0001",
        title: "Prime Commercial Plot",
      };

      const enquiries: MockEnquiry[] = [
        {
          id: "enq-1",
          property_id: "prop-123",
          name: "Chief Bamidele",
          email: "bamidele@example.com",
        },
      ];

      const result = safeDecoupleEnquiries(property, enquiries, false);
      expect(result.success).toBe(false);
      expect(result.error).toContain("associated with 1 customer enquiry lead(s)");
    });

    it("proceeds seamlessly when property has zero linked enquiries", () => {
      const property: MockProperty = {
        id: "prop-empty",
        reference: "POAB-PROP-2026-0002",
        title: "Empty Test Listing",
      };

      const result = safeDecoupleEnquiries(property, [], false);
      expect(result.success).toBe(true);
      expect(result.decoupledEnquiries).toEqual([]);
    });
  });

  describe("Storage Assets Collection Strategy", () => {
    function collectProjectStoragePaths(
      coverImage: string | null,
      images: Array<{ storage_path: string }>
    ): string[] {
      const paths: string[] = [];
      if (coverImage) paths.push(coverImage);
      images.forEach((img) => {
        if (img.storage_path && !paths.includes(img.storage_path)) {
          paths.push(img.storage_path);
        }
      });
      return paths;
    }

    it("collects cover image and gallery images without duplicates", () => {
      const paths = collectProjectStoragePaths("cover.jpg", [
        { storage_path: "cover.jpg" },
        { storage_path: "stage1.jpg" },
        { storage_path: "stage2.jpg" },
      ]);

      expect(paths).toEqual(["cover.jpg", "stage1.jpg", "stage2.jpg"]);
    });

    it("returns empty array if no images exist", () => {
      const paths = collectProjectStoragePaths(null, []);
      expect(paths).toEqual([]);
    });
  });
});
