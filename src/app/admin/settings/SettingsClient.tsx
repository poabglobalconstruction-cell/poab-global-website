"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { ContactChannelsSettings, SocialLinksSettings } from "@/types/database";
import { COMPANY_INFO } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SettingsClientProps {
  initialContact: ContactChannelsSettings;
  initialSocials: SocialLinksSettings;
}

export function SettingsClient({ initialContact, initialSocials }: SettingsClientProps) {
  const [contact, setContact] = useState(initialContact);
  const [socials, setSocials] = useState(initialSocials);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "contact_channels",
          value: contact,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save contact channels");

      setStatusMessage("Contact settings updated successfully.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "social_links",
          value: socials,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save social links");

      setStatusMessage("Social media settings updated successfully.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
          System &amp; Contact Settings
        </h2>
        <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
          Configure changeable public phone lines, WhatsApp channels, and social media handles.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Protected Legal Identity Box (Section 34) */}
      <div className="bg-poab-stone-light p-6 border border-poab-grey-border space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-poab-navy">
          <Lock className="w-4 h-4 text-poab-gold" />
          <span>Protected Corporate Identity (Read-Only)</span>
        </div>
        <p className="text-xs text-poab-charcoal/70 font-light leading-relaxed">
          Company legal registration is protected from accidental casual modification.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Corporate Name</span>
            <span className="font-bold text-poab-navy">{COMPANY_INFO.name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">CAC Registration</span>
            <span className="font-mono font-bold text-poab-navy">{COMPANY_INFO.rcNumber}</span>
          </div>
        </div>
      </div>

      {/* Contact Channels Form */}
      <form onSubmit={handleSaveContact} className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3">
          1. Public Contact Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Official Public Phone"
            value={contact.public_phone}
            onChange={(e) => setContact({ ...contact, public_phone: e.target.value })}
            placeholder="e.g., +234 800 000 0000"
            helperText="Leave empty until genuine official number is supplied."
          />

          <Input
            label="WhatsApp Integration Number"
            value={contact.whatsapp_number}
            onChange={(e) => setContact({ ...contact, whatsapp_number: e.target.value })}
            placeholder="e.g., +234 800 000 0000"
            helperText="Enables direct WhatsApp buttons across quote and property pages."
          />
        </div>

        <Input
          label="Official Email Address"
          value={contact.official_email}
          onChange={(e) => setContact({ ...contact, official_email: e.target.value })}
          placeholder="e.g., poabglobalconstruction@gmail.com"
        />

        <Input
          label="Office Address"
          value={contact.office_address}
          onChange={(e) => setContact({ ...contact, office_address: e.target.value })}
          placeholder="Ibadan, Oyo State, Nigeria"
        />

        <Input
          label="Business / Operating Hours (Optional)"
          value={contact.business_hours}
          onChange={(e) => setContact({ ...contact, business_hours: e.target.value })}
          placeholder="e.g., Mon - Fri: 8:00 AM - 5:00 PM"
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Contact Settings</span>
          </Button>
        </div>
      </form>

      {/* Social Media Links Form */}
      <form onSubmit={handleSaveSocials} className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3">
          2. Social Media Handles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Instagram URL"
            value={socials.instagram}
            onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
            placeholder="https://instagram.com/..."
          />

          <Input
            label="Facebook URL"
            value={socials.facebook}
            onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
            placeholder="https://facebook.com/..."
          />

          <Input
            label="LinkedIn URL"
            value={socials.linkedin}
            onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
            placeholder="https://linkedin.com/company/..."
          />

          <Input
            label="X / Twitter URL"
            value={socials.twitter}
            onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
            placeholder="https://x.com/..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Social Links</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
