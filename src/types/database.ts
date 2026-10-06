export type ProjectType = 'Residential' | 'Commercial' | 'Renovation' | 'Site Works';
export type ProjectStatus = 'Ongoing' | 'Completed' | 'Planning';
export type PropertyType = 'Land' | 'Bungalow' | 'Duplex' | 'Commercial' | 'Apartment';
export type PropertyStatus = 'Available' | 'Under Offer' | 'Sold';
export type QuoteStatus = 'New' | 'Contacted' | 'Site Assessment' | 'Quotation Sent' | 'Won' | 'Lost' | 'Closed';
export type PropertyEnquiryStatus = 'New' | 'Contacted' | 'Scheduled Inspection' | 'Closed';
export type SellRequestStatus = 'New' | 'Reviewing' | 'Contacted' | 'Accepted' | 'Rejected' | 'Closed';

export type AdminRole = 'admin' | 'super_admin';

export interface AdminProfile {
  id: string;
  auth_user_id: string;
  name: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectStage {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  stage_date: string | null;
  created_at: string;
  updated_at: string;
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  project_stage_id: string | null;
  storage_path: string;
  alt_text: string;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  location: string;
  project_type: ProjectType;
  status: ProjectStatus;
  scope: string | null;
  short_description: string;
  description: string | null;
  cover_image_path: string | null;
  featured: boolean;
  published: boolean;
  start_date: string | null;
  completion_date: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  stages?: ProjectStage[];
  images?: ProjectImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  reference: string;
  title: string;
  slug: string;
  property_type: PropertyType;
  location: string;
  price: number | null;
  price_public: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  size: string | null;
  description: string;
  features: string[];
  status: PropertyStatus;
  featured: boolean;
  published: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
}

export interface QuoteAttachment {
  id: string;
  quote_id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  reference: string;
  project_type: string;
  location: string;
  land_size: string | null;
  floors: string | null;
  bedrooms: string | null;
  current_stage: string;
  description: string;
  budget_range: string;
  timeline: string;
  has_building_plan: boolean;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  preferred_contact: 'phone' | 'whatsapp' | 'email';
  privacy_acknowledged: boolean;
  status: QuoteStatus;
  project_inspiration: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  attachments?: QuoteAttachment[];
}

export interface PropertyEnquiry {
  id: string;
  property_id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp: string | null;
  message: string;
  status: PropertyEnquiryStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface SellPropertyAttachment {
  id: string;
  sell_request_id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface SellPropertyRequest {
  id: string;
  reference: string;
  seller_name: string;
  phone: string;
  email: string;
  whatsapp: string | null;
  property_location: string;
  property_type: string;
  description: string;
  expected_price: string | null;
  status: SellRequestStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  attachments?: SellPropertyAttachment[];
}

export interface CompanyInfoSettings {
  name: string;
  tagline: string;
  cac_number: string;
  head_office: string;
  operations_coverage: string;
  experience: string;
  promise: string;
}

export interface ContactChannelsSettings {
  official_email: string;
  public_phone: string;
  whatsapp_number: string;
  office_address: string;
  business_hours: string;
}

export interface SocialLinksSettings {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
}

export interface QuoteConfigSettings {
  budget_options: string[];
  timeline_options: string[];
}

export type ContactMessageStatus = 'New' | 'Read' | 'Replied' | 'Archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}
