export interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  superhost: boolean;
  available: boolean;
  availableFrom: string;
  /** Cover image URL; empty string when the listing has no uploaded photos (UI shows a neutral placeholder). */
  img: string;
  /** All photo URLs from the API for detail / gallery (may be empty). */
  photoUrls: string[];
  category: 'villa' | 'cabin' | 'apartment' | 'house';
  /** Present when loaded from API detail. */
  description?: string;
  amenities?: string[];
  maxGuests?: number;
}
