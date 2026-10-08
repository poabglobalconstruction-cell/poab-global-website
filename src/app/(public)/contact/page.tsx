import React from "react";
import type { Metadata } from "next";
import { getPublicContactSettings } from "@/lib/contact-settings";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Direct communication channels for POAB Global Construction Company Ltd. Head office, site operations, official email, and structured customer contact directory.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const contact = await getPublicContactSettings();

  return <ContactClient contact={contact} />;
}
