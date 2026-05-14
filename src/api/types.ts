export interface ApiUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  role: 'ADMIN' | 'HOST' | 'GUEST';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiListingPhoto {
  id: string;
  url: string;
  publicId: string;
}

export interface ApiListing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN';
  amenities: string[];
  rating?: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  hostId: string;
  host?: ApiUser;
  photos?: ApiListingPhoto[];
  bookings?: ApiBooking[];
  reviews?: ApiReview[];
}

export interface ApiBooking {
  id: string;
  listingId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  guest?: ApiUser;
  listing?: Pick<ApiListing, 'id' | 'title' | 'location' | 'hostId' | 'pricePerNight'> & {
    photos?: Pick<ApiListingPhoto, 'id' | 'url'>[];
  };
}

export interface ApiReview {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: ApiUser;
}

export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: ApiPagination;
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiMyReview extends ApiReview {
  listing: {
    id: string;
    title: string;
    location: string;
    photos?: { url: string }[];
    host?: { name: string };
  };
}

export interface ApiMessage {
  message: string;
}

export interface ApiChatParticipant {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: 'ADMIN' | 'HOST' | 'GUEST';
}

export interface ApiChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  read: boolean;
  createdAt: string;
  sender: ApiChatParticipant;
}

export interface ApiConversation {
  id: string;
  other: ApiChatParticipant;
  lastMessage: ApiChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}
