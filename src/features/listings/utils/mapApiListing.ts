import type { ApiListing } from '../../../api/types';
import type { Listing } from '../types';

export const TYPE_TO_CATEGORY: Record<string, Listing['category']> = {
  VILLA: 'beach',
  CABIN: 'mountain',
  APARTMENT: 'city',
  HOUSE: 'countryside',
};

export function mapApiListingToListing(l: ApiListing): Listing {
  const photoUrls = (l.photos ?? []).map((p) => p.url).filter(Boolean);
  const cover = photoUrls[0] ?? '';
  const raw = l.rating;
  const rating = typeof raw === 'number' && !Number.isNaN(raw) ? raw : 0;

  return {
    id: l.id,
    title: l.title,
    location: l.location,
    price: l.pricePerNight,
    rating,
    superhost: false,
    available: l.status === 'APPROVED',
    availableFrom: l.createdAt,
    img: cover,
    photoUrls,
    category: TYPE_TO_CATEGORY[l.type] ?? 'city',
    description: l.description,
    amenities: Array.isArray(l.amenities) ? l.amenities : [],
    maxGuests: l.guests,
  };
}
