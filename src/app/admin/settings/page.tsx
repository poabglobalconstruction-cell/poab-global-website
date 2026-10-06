import React from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { SettingsClient } from "./SettingsClient";
import { ContactChannelsSettings, SocialLinksSettings } from "@/types/database";

export const revalidate = 0;

async function getSettings(): Promise<{
  contactChannels: ContactChannelsSettings;
  socialLinks: SocialLinksSettings;
}> {
  const defaultContact: ContactChannelsSettings = {
    official_email: "poabglobalconstruction@gmail.com",
    public_phone: "",
    whatsapp_number: "",
    office_address: "Ibadan, Oyo State, Nigeria",
    business_hours: "",
  };

  const defaultSocials: SocialLinksSettings = {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  };

  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return { contactChannels: defaultContact, socialLinks: defaultSocials };

    const { data: contactData } = await client
      .from("site_settings")
      .select("value")
      .eq("key", "contact_channels")
      .single();

    const { data: socialData } = await client
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .single();

    return {
      contactChannels: (contactData?.value as ContactChannelsSettings) || defaultContact,
      socialLinks: (socialData?.value as SocialLinksSettings) || defaultSocials,
    };
  } catch {
    return { contactChannels: defaultContact, socialLinks: defaultSocials };
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsClient
      initialContact={settings.contactChannels}
      initialSocials={settings.socialLinks}
    />
  );
}
