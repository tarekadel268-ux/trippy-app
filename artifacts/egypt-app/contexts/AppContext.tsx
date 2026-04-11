import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Nationality = "egyptian" | "tourist";
export type UserRole = "ticket_holder" | "trip_planner" | "tourist_viewer" | "resident_viewer";

export interface UserProfile {
  id: string;
  nationality: Nationality;
  role: UserRole;
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  profileUri?: string;
  coverUri?: string;
  phone: string;
  isVerified: boolean;
  subscriptionExpiry: string | null;
  currency: "USD" | "EGP";
  followedOrganizers: string[];
  authProvider?: "google" | "apple";
  password?: string;
}

export interface TripOffer {
  id: string;
  organizerId?: string;
  plannerName: string;
  plannerPhone: string;
  plannerVerified: boolean;
  city: string;
  title: string;
  description: string;
  priceUSD: number;
  priceEGP: number;
  days: number;
  viewCount: number;
  imageUrl?: string;
  includes: string[];
  createdAt: string;
}

export interface EventListing {
  id: string;
  organizerId?: string;
  holderName: string;
  holderPhone: string;
  holderContact: string;
  category: "lounge" | "concert" | "afro_techno" | "private_party";
  title: string;
  description: string;
  venue: string;
  date: string;
  priceUSD: number;
  priceEGP: number;
  viewCount: number;
  imageUrl?: string;
  createdAt: string;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  type: "lounge" | "trip_planner";
  bio: string;
  city: string;
  phone: string;
  isVerified: boolean;
  subscriptionActive: boolean;
  coverColor: string;
  avatarColor: string;
  website?: string;
  instagram?: string;
}

export interface Review {
  id: string;
  organizerId: string;
  reviewerName: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  priceUSD: number;
  priceEGP: number;
  paymentMethod: string;
  purchasedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  listingId: string;
  listingTitle: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  onboarded: boolean;
  setOnboarded: (val: boolean) => void;
  currency: "USD" | "EGP";
  setCurrency: (c: "USD" | "EGP") => void;
  trips: TripOffer[];
  setTrips: (trips: TripOffer[]) => void;
  addTrip: (trip: TripOffer) => void;
  events: EventListing[];
  setEvents: (events: EventListing[]) => void;
  addEvent: (event: EventListing) => void;
  chats: ChatThread[];
  setChats: (chats: ChatThread[]) => void;
  sendMessage: (threadId: string, text: string) => void;
  startChat: (thread: ChatThread) => void;
  purchasedTickets: PurchasedTicket[];
  addPurchasedTicket: (ticket: PurchasedTicket) => void;
  organizers: OrganizerProfile[];
  addOrganizer: (org: OrganizerProfile) => Promise<void>;
  reviews: Review[];
  addReview: (review: Review) => void;
  followOrganizer: (organizerId: string) => void;
  unfollowOrganizer: (organizerId: string) => void;
  isFollowing: (organizerId: string) => boolean;
  getFollowerCount: (organizerId: string) => number;
  getOrganizerRating: (organizerId: string) => { avg: number; count: number };
  organizerPhotos: Record<string, { profileUri?: string; coverUri?: string }>;
  updateOrganizerPhotos: (organizerId: string, photos: { profileUri?: string; coverUri?: string }) => void;
  myOrganizerId: string | null;
  setMyOrganizerId: (organizerId: string | null) => void;
  isLoading: boolean;
  loginWithCredentials: (username: string, password: string) => Promise<"ok" | "not_found" | "wrong_password">;
}

const AppContext = createContext<AppContextType | null>(null);

export const SAMPLE_ORGANIZERS: OrganizerProfile[] = [
  {
    id: "org_cairojazz",
    name: "CairoJazz Club",
    type: "lounge",
    bio: "Cairo's premier jazz and live music venue in the heart of Zamalek. Known for intimate concerts, Afro nights, and the city's best cocktails since 2009.",
    city: "Zamalek, Cairo",
    phone: "+20 122 333 4444",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#7c3aed",
    avatarColor: "#5b21b6",
    instagram: "@cairojazz",
  },
  {
    id: "org_nilemoon",
    name: "Nile Moon Floating Club",
    type: "lounge",
    bio: "A one-of-a-kind floating club on the Nile. Techno sunrises, Afro beats, and rooftop events that make Cairo nights unforgettable.",
    city: "Corniche, Cairo",
    phone: "+20 100 456 7890",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#0c4a6e",
    avatarColor: "#0369a1",
    instagram: "@nilemoon_cairo",
  },
  {
    id: "org_pyramidstage",
    name: "Pyramid Stage",
    type: "lounge",
    bio: "Egypt's most iconic outdoor concert venue at the foot of the Great Pyramids of Giza. Host of legendary international festivals and Eid concerts.",
    city: "Giza",
    phone: "+20 111 789 0123",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#92400e",
    avatarColor: "#b45309",
    instagram: "@pyramidstage",
  },
  {
    id: "org_twentyfive",
    name: "25 Degrees Rooftop",
    type: "lounge",
    bio: "Cairo's trendiest rooftop lounge and cocktail bar in New Cairo. Private parties, DJ nights, and skyline views that define the summer.",
    city: "New Cairo",
    phone: "+20 100 222 3344",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#065f46",
    avatarColor: "#047857",
    instagram: "@25degrees_cairo",
  },
  {
    id: "org_niletravels",
    name: "Nile Travels",
    type: "trip_planner",
    bio: "Alexandria's leading tour operator with 15+ years of experience. We specialize in Mediterranean coast getaways, historical tours, and custom day trips.",
    city: "Alexandria",
    phone: "+20 100 123 4567",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#1e3a8a",
    avatarColor: "#1d4ed8",
    website: "niletravels.eg",
  },
  {
    id: "org_redsea",
    name: "Red Sea Adventures",
    type: "trip_planner",
    bio: "PADI-certified dive center and travel agency in Sharm El-Sheikh. World-class underwater experiences, snorkeling, and luxury resort packages.",
    city: "Sharm El-Sheikh",
    phone: "+20 111 987 6543",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#0c4a6e",
    avatarColor: "#0284c7",
    website: "redsea-adventures.com",
  },
  {
    id: "org_sahel",
    name: "Sahel Escapes",
    type: "trip_planner",
    bio: "North Coast luxury summer specialists. We arrange Marassi chalets, Hacienda bookings, beach club access, and exclusive VIP summer packages.",
    city: "North Coast",
    phone: "+20 100 456 7890",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#0abab5",
    avatarColor: "#0891b2",
    website: "sahelescapes.eg",
  },
  {
    id: "org_sinai",
    name: "Sinai Explorer",
    type: "trip_planner",
    bio: "Bedouin-led tours of the Sinai Peninsula. From the Blue Hole to St. Catherine's monastery, we show you the Sinai nobody else can.",
    city: "Dahab",
    phone: "+20 122 456 7890",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#713f12",
    avatarColor: "#a16207",
  },
  {
    id: "org_ancient",
    name: "Ancient Egypt Tours",
    type: "trip_planner",
    bio: "Egyptologist-guided tours of Upper Egypt's greatest treasures. Valley of the Kings, Karnak, and hot air balloon rides over Luxor at sunrise.",
    city: "Luxor",
    phone: "+20 100 777 8899",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#7c2d12",
    avatarColor: "#c2410c",
    website: "ancientegypttours.com",
  },
  {
    id: "org_nubian",
    name: "Nubian Heritage",
    type: "trip_planner",
    bio: "Authentic Nubian experiences in Aswan. We connect travellers with local families, felucca captains, and the living culture of the Nile's southernmost city.",
    city: "Aswan",
    phone: "+20 111 333 4455",
    isVerified: true,
    subscriptionActive: true,
    coverColor: "#581c87",
    avatarColor: "#7e22ce",
  },
];

export const SAMPLE_REVIEWS: Review[] = [
  { id: "rev1", organizerId: "org_cairojazz", reviewerName: "Lara Khaled", stars: 5, comment: "Best night out in Cairo. The Afro set was unreal and the crowd was amazing. Will be back every week!", createdAt: "2026-03-10T20:00:00Z" },
  { id: "rev2", organizerId: "org_cairojazz", reviewerName: "James T.", stars: 5, comment: "Incredible vibe, fantastic DJ lineup. Small and intimate which makes it feel exclusive. Loved it.", createdAt: "2026-02-22T21:30:00Z" },
  { id: "rev3", organizerId: "org_cairojazz", reviewerName: "Nour Adel", stars: 4, comment: "Great music and drinks, a bit crowded but that's because everyone wants to be here!", createdAt: "2026-01-15T22:00:00Z" },
  { id: "rev4", organizerId: "org_nilemoon", reviewerName: "Sofia M.", stars: 5, comment: "Dancing on a floating boat on the Nile until sunrise. Nothing else like it in the world.", createdAt: "2026-03-05T03:00:00Z" },
  { id: "rev5", organizerId: "org_nilemoon", reviewerName: "Omar F.", stars: 4, comment: "Techno rave was 10/10. Sound system is top notch. Gets hot inside though.", createdAt: "2026-02-14T02:00:00Z" },
  { id: "rev6", organizerId: "org_pyramidstage", reviewerName: "Emma W.", stars: 5, comment: "Seeing the Pyramids lit up behind the stage while the music plays is a once in a lifetime experience.", createdAt: "2026-01-20T21:00:00Z" },
  { id: "rev7", organizerId: "org_twentyfive", reviewerName: "Karim B.", stars: 4, comment: "Great rooftop venue, amazing cocktails. The view of Cairo at night is spectacular.", createdAt: "2026-03-01T23:00:00Z" },
  { id: "rev8", organizerId: "org_niletravels", reviewerName: "Rachel H.", stars: 5, comment: "Mohamed our guide was absolutely incredible. The Library of Alexandria visit was unforgettable.", createdAt: "2026-02-10T10:00:00Z" },
  { id: "rev9", organizerId: "org_niletravels", reviewerName: "Youssef A.", stars: 5, comment: "Booked the Alex city tour, everything was perfectly organized. Highly recommend!", createdAt: "2026-01-25T09:00:00Z" },
  { id: "rev10", organizerId: "org_redsea", reviewerName: "David K.", stars: 5, comment: "Best diving in my life. The instructor was patient, knowledgeable and the reef is breathtaking.", createdAt: "2026-03-12T14:00:00Z" },
  { id: "rev11", organizerId: "org_redsea", reviewerName: "Mia L.", stars: 4, comment: "Great snorkeling trip to Ras Mohammed. Saw turtles and sharks! Only 4 stars because the boat was small.", createdAt: "2026-02-28T12:00:00Z" },
  { id: "rev12", organizerId: "org_sahel", reviewerName: "Hana S.", stars: 5, comment: "They got us a Marassi chalet that was sold out everywhere else. Amazing service and the best summer ever!", createdAt: "2026-03-08T15:00:00Z" },
  { id: "rev13", organizerId: "org_sahel", reviewerName: "Adam R.", stars: 5, comment: "Hacienda White package was worth every penny. The beach club access alone made the trip.", createdAt: "2026-02-18T16:00:00Z" },
  { id: "rev14", organizerId: "org_ancient", reviewerName: "Linda P.", stars: 5, comment: "Dr. Sameh's knowledge of ancient Egypt is extraordinary. The balloon ride over Luxor was magical.", createdAt: "2026-02-05T08:00:00Z" },
  { id: "rev15", organizerId: "org_nubian", reviewerName: "Carlos M.", stars: 5, comment: "The Nubian village homestay changed my perspective on travel. So warm, so genuine, so beautiful.", createdAt: "2026-03-14T17:00:00Z" },
];

const SAMPLE_FOLLOWER_COUNTS: Record<string, number> = {
  org_cairojazz: 4820,
  org_nilemoon: 3150,
  org_pyramidstage: 12400,
  org_twentyfive: 2890,
  org_niletravels: 1640,
  org_redsea: 2310,
  org_sahel: 3780,
  org_sinai: 980,
  org_ancient: 5120,
  org_nubian: 1760,
};

const SAMPLE_TRIPS: TripOffer[] = [
  {
    id: "trip_nc1",
    organizerId: "org_sahel",
    plannerName: "Sahel Escapes",
    plannerPhone: "+20 100 456 7890",
    plannerVerified: true,
    city: "North Coast",
    title: "Marassi Beach Getaway",
    description: "Luxury stay at Marassi with private beach access, watersports, beachfront dining, and vibrant summer nightlife on the Mediterranean.",
    priceUSD: 290,
    priceEGP: 14500,
    days: 4,
    viewCount: 1890,
    includes: ["Chalet", "Breakfast", "Beach Access", "Watersports"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_nc2",
    organizerId: "org_sahel",
    plannerName: "North Coast VIP",
    plannerPhone: "+20 111 789 0123",
    plannerVerified: true,
    city: "North Coast",
    title: "Hacienda White Summer Package",
    description: "Experience the iconic Hacienda White resort — white architecture, turquoise sea, rooftop parties, and the best sunset views on Egypt's Mediterranean coast.",
    priceUSD: 420,
    priceEGP: 21000,
    days: 5,
    viewCount: 2340,
    includes: ["Villa", "All-inclusive", "Beach Club", "Nightlife"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip1",
    organizerId: "org_niletravels",
    plannerName: "Nile Travels",
    plannerPhone: "+20 100 123 4567",
    plannerVerified: true,
    city: "Alexandria",
    title: "Alexandria City & Beach Package",
    description: "Explore the Pearl of the Mediterranean with guided tours of Bibliotheca Alexandrina, Qaitbay Citadel, and pristine beaches.",
    priceUSD: 120,
    priceEGP: 6000,
    days: 3,
    viewCount: 847,
    includes: ["Hotel", "Breakfast", "Guide", "Transport"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip2",
    organizerId: "org_redsea",
    plannerName: "Red Sea Adventures",
    plannerPhone: "+20 111 987 6543",
    plannerVerified: true,
    city: "Sharm El-Sheikh",
    title: "Sharm Diving & Relaxation",
    description: "World-class snorkeling and diving in the Red Sea with luxury beach resorts and Ras Mohammed National Park tour.",
    priceUSD: 350,
    priceEGP: 17500,
    days: 5,
    viewCount: 1203,
    includes: ["Resort", "All-inclusive", "Diving", "Snorkeling"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip3",
    organizerId: "org_sinai",
    plannerName: "Sinai Explorer",
    plannerPhone: "+20 122 456 7890",
    plannerVerified: true,
    city: "Dahab",
    title: "Dahab Backpacker Escape",
    description: "The Blue Hole, desert treks, Bedouin camps, and the bohemian vibe of Dahab. Snorkeling, kite surfing and mountain hikes.",
    priceUSD: 85,
    priceEGP: 4250,
    days: 4,
    viewCount: 562,
    includes: ["Hostel", "Breakfast", "Snorkeling", "Desert Trip"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip4",
    plannerName: "Gulf Escapes",
    plannerPhone: "+20 100 222 3344",
    plannerVerified: false,
    city: "Nuweiba",
    title: "Nuweiba Desert & Sea Retreat",
    description: "Isolated beach camps, Sinai desert jeep tours, and peaceful sunsets over the Gulf of Aqaba.",
    priceUSD: 70,
    priceEGP: 3500,
    days: 3,
    viewCount: 312,
    includes: ["Beach Camp", "Dinner", "Jeep Tour"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip5",
    organizerId: "org_redsea",
    plannerName: "Red Sea Stars",
    plannerPhone: "+20 111 555 6677",
    plannerVerified: true,
    city: "Hurghada",
    title: "Hurghada Fun Sun & Sea",
    description: "Parasailing, glass-bottom boat tours, Sahl Hasheesh old village, and beachside resorts.",
    priceUSD: 180,
    priceEGP: 9000,
    days: 4,
    viewCount: 984,
    includes: ["Hotel", "Half-board", "Water Sports", "Boat Tour"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip6",
    plannerName: "Gouna VIP",
    plannerPhone: "+20 122 888 9900",
    plannerVerified: true,
    city: "Gouna",
    title: "El Gouna Luxury Marina Stay",
    description: "Lagoon villas, kite surfing, gourmet dining, and the vibrant nightlife of Egypt's most upscale resort town.",
    priceUSD: 480,
    priceEGP: 24000,
    days: 5,
    viewCount: 736,
    includes: ["Lagoon Villa", "All-inclusive", "Kite Surfing", "Golf"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip7",
    organizerId: "org_ancient",
    plannerName: "Ancient Egypt Tours",
    plannerPhone: "+20 100 777 8899",
    plannerVerified: true,
    city: "Luxor",
    title: "Luxor Pharaohs & Temples",
    description: "Valley of the Kings, Karnak Temple, Luxor Temple, hot air balloon ride over the Nile at sunrise.",
    priceUSD: 220,
    priceEGP: 11000,
    days: 3,
    viewCount: 1456,
    includes: ["Hotel", "Breakfast", "Expert Guide", "Balloon Ride"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip8",
    organizerId: "org_nubian",
    plannerName: "Nubian Heritage",
    plannerPhone: "+20 111 333 4455",
    plannerVerified: true,
    city: "Aswan",
    title: "Aswan Nubian Culture & Abu Simbel",
    description: "Abu Simbel temples, Philae island, Nubian village homestay, felucca sailing on the Nile.",
    priceUSD: 195,
    priceEGP: 9750,
    days: 4,
    viewCount: 1102,
    includes: ["Hotel", "Breakfast", "Abu Simbel Flight", "Felucca"],
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_EVENTS: EventListing[] = [
  {
    id: "evt_lj1",
    organizerId: "org_cairojazz",
    holderName: "CairoJazz Club",
    holderPhone: "+20 122 333 4444",
    holderContact: "@cairojazz",
    category: "lounge",
    title: "CairoJazz Friday Sessions",
    description: "Every Friday night at CairoJazz — live jazz band, special cocktails, and the best Zamalek ambiance. Book your table now.",
    venue: "CairoJazz Club, Zamalek",
    date: "2026-05-02",
    priceUSD: 12,
    priceEGP: 600,
    viewCount: 1870,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt_lj2",
    organizerId: "org_nilemoon",
    holderName: "Nile Moon Floating Club",
    holderPhone: "+20 100 456 7890",
    holderContact: "@nilemoon_cairo",
    category: "lounge",
    title: "Nile Moon Sunset Lounge",
    description: "Float down the Nile as the sun sets over Cairo. Chill house music, craft cocktails, and the most beautiful view in the city.",
    venue: "Nile Moon Floating Club, Corniche",
    date: "2026-05-09",
    priceUSD: 15,
    priceEGP: 750,
    viewCount: 1340,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt_lj3",
    organizerId: "org_twentyfive",
    holderName: "25 Degrees Rooftop",
    holderPhone: "+20 100 222 3344",
    holderContact: "@25degrees_cairo",
    category: "lounge",
    title: "25 Degrees Sky Night",
    description: "Rooftop cocktails and deep house music under the Cairo skyline. Limited capacity. Dress code smart casual.",
    venue: "25 Degrees Rooftop, New Cairo",
    date: "2026-05-16",
    priceUSD: 10,
    priceEGP: 500,
    viewCount: 980,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe2e2?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt1",
    organizerId: "org_pyramidstage",
    holderName: "Sara Mohamed",
    holderPhone: "+20 100 111 2222",
    holderContact: "@sara_m",
    category: "concert",
    title: "Amr Diab Live - Cairo Stadium",
    description: "Two tickets available for the legendary Amr Diab summer concert at Cairo International Stadium. VIP section.",
    venue: "Cairo International Stadium",
    date: "2026-07-15",
    priceUSD: 45,
    priceEGP: 2250,
    viewCount: 2340,
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt2",
    organizerId: "org_cairojazz",
    holderName: "Karim Hassan",
    holderPhone: "+20 122 333 4444",
    holderContact: "@karim_h",
    category: "afro_techno",
    title: "Sahara Afro Night - CairoJazz",
    description: "One ticket for the sold-out Afro & Techno night at CairoJazz Club. Lineup features top African DJs.",
    venue: "CairoJazz Club, Zamalek",
    date: "2026-05-30",
    priceUSD: 18,
    priceEGP: 900,
    viewCount: 876,
    imageUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt3",
    holderName: "Mona El-Sherif",
    holderPhone: "+20 111 666 7777",
    holderContact: "@mona_s",
    category: "private_party",
    title: "Rooftop Pool Party - Maadi",
    description: "2 tickets for exclusive rooftop pool party in Maadi. International DJ, open bar, dress code strictly enforced.",
    venue: "Private Villa, Maadi",
    date: "2026-06-20",
    priceUSD: 30,
    priceEGP: 1500,
    viewCount: 543,
    imageUrl: "https://images.unsplash.com/photo-1540541338537-71cf58eadb81?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt4",
    organizerId: "org_pyramidstage",
    holderName: "Ahmed Nabil",
    holderPhone: "+20 100 999 0000",
    holderContact: "@ahmed_n",
    category: "concert",
    title: "Mashrou Leila Reunion - El Sawy",
    description: "Rare ticket for the Mashrou Leila reunion show at El Sawy Culturewheel. Seated section.",
    venue: "El Sawy Culturewheel",
    date: "2026-08-10",
    priceUSD: 25,
    priceEGP: 1250,
    viewCount: 1120,
    imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b4f2011?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt5",
    organizerId: "org_nilemoon",
    holderName: "Layla Ibrahim",
    holderPhone: "+20 122 555 8888",
    holderContact: "@layla_i",
    category: "afro_techno",
    title: "Rave the Nile - Floating Club",
    description: "3 tickets for the floating Nile techno rave. Sunrise set on the Nile. All-night event.",
    venue: "Nile Moon Floating Club",
    date: "2026-06-05",
    priceUSD: 22,
    priceEGP: 1100,
    viewCount: 765,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [onboarded, setOnboardedState] = useState(false);
  const [currency, setCurrencyState] = useState<"USD" | "EGP">("EGP");
  const [trips, setTripsState] = useState<TripOffer[]>(SAMPLE_TRIPS);
  const [events, setEventsState] = useState<EventListing[]>(SAMPLE_EVENTS);
  const [chats, setChatsState] = useState<ChatThread[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [reviews, setReviewsState] = useState<Review[]>(SAMPLE_REVIEWS);
  const [followerOverrides, setFollowerOverrides] = useState<Record<string, number>>(SAMPLE_FOLLOWER_COUNTS);
  const [organizerPhotos, setOrganizerPhotosState] = useState<Record<string, { profileUri?: string; coverUri?: string }>>({});
  const [myOrganizerIdState, setMyOrganizerIdState] = useState<string | null>(null);
  const [userOrganizers, setUserOrganizersState] = useState<OrganizerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [savedUser, savedOnboarded, savedCurrency, savedTrips, savedEvents, savedChats, savedTickets, savedReviews, savedFollowers, savedOrgPhotos, savedMyOrgId, savedUserOrgs] = await Promise.all([
        AsyncStorage.getItem("@user"),
        AsyncStorage.getItem("@onboarded"),
        AsyncStorage.getItem("@currency"),
        AsyncStorage.getItem("@trips"),
        AsyncStorage.getItem("@events"),
        AsyncStorage.getItem("@chats"),
        AsyncStorage.getItem("@purchased_tickets"),
        AsyncStorage.getItem("@reviews"),
        AsyncStorage.getItem("@follower_overrides"),
        AsyncStorage.getItem("@organizer_photos"),
        AsyncStorage.getItem("@my_organizer_id"),
        AsyncStorage.getItem("@user_organizers"),
      ]);
      if (savedUser) setUserState(JSON.parse(savedUser));
      if (savedOnboarded === "true") setOnboardedState(true);
      if (savedCurrency) setCurrencyState(savedCurrency as "USD" | "EGP");
      if (savedTrips) setTripsState(JSON.parse(savedTrips));
      if (savedEvents) setEventsState(JSON.parse(savedEvents));
      if (savedChats) setChatsState(JSON.parse(savedChats));
      if (savedTickets) setPurchasedTickets(JSON.parse(savedTickets));
      if (savedReviews) setReviewsState(JSON.parse(savedReviews));
      if (savedFollowers) setFollowerOverrides(JSON.parse(savedFollowers));
      if (savedOrgPhotos) setOrganizerPhotosState(JSON.parse(savedOrgPhotos));
      if (savedMyOrgId) setMyOrganizerIdState(savedMyOrgId);
      if (savedUserOrgs) setUserOrganizersState(JSON.parse(savedUserOrgs));
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const setUser = async (u: UserProfile | null) => {
    const withDefaults = u ? { ...u, followedOrganizers: u.followedOrganizers ?? [] } : null;
    setUserState(withDefaults);
    if (withDefaults) {
      await AsyncStorage.setItem("@user", JSON.stringify(withDefaults));
      if (withDefaults.password && withDefaults.username) {
        const raw = await AsyncStorage.getItem("@users_registry");
        const registry: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
        registry[withDefaults.username] = withDefaults;
        await AsyncStorage.setItem("@users_registry", JSON.stringify(registry));
      }
    } else {
      await AsyncStorage.removeItem("@user");
    }
  };

  const loginWithCredentials = async (username: string, password: string): Promise<"ok" | "not_found" | "wrong_password"> => {
    const raw = await AsyncStorage.getItem("@users_registry");
    if (!raw) return "not_found";
    const registry: Record<string, UserProfile> = JSON.parse(raw);
    const found = registry[username.toLowerCase()];
    if (!found) return "not_found";
    if (found.password !== password) return "wrong_password";
    const withDefaults = { ...found, followedOrganizers: found.followedOrganizers ?? [] };
    setUserState(withDefaults);
    await AsyncStorage.setItem("@user", JSON.stringify(withDefaults));
    setOnboardedState(true);
    await AsyncStorage.setItem("@onboarded", "true");
    if (found.role === "trip_planner" || found.role === "ticket_holder") {
      const orgId = `org_user_${found.id}`;
      setMyOrganizerIdState(orgId);
      await AsyncStorage.setItem("@my_organizer_id", orgId);
    }
    return "ok";
  };

  const setOnboarded = async (val: boolean) => {
    setOnboardedState(val);
    await AsyncStorage.setItem("@onboarded", String(val));
  };

  const setCurrency = async (c: "USD" | "EGP") => {
    setCurrencyState(c);
    await AsyncStorage.setItem("@currency", c);
  };

  const setTrips = async (t: TripOffer[]) => {
    setTripsState(t);
    await AsyncStorage.setItem("@trips", JSON.stringify(t));
  };

  const addTrip = async (trip: TripOffer) => {
    const updated = [trip, ...trips];
    setTripsState(updated);
    await AsyncStorage.setItem("@trips", JSON.stringify(updated));
  };

  const setEvents = async (e: EventListing[]) => {
    setEventsState(e);
    await AsyncStorage.setItem("@events", JSON.stringify(e));
  };

  const addEvent = async (event: EventListing) => {
    const updated = [event, ...events];
    setEventsState(updated);
    await AsyncStorage.setItem("@events", JSON.stringify(updated));
  };

  const setChats = async (c: ChatThread[]) => {
    setChatsState(c);
    await AsyncStorage.setItem("@chats", JSON.stringify(c));
  };

  const sendMessage = async (threadId: string, text: string) => {
    const updated = chats.map(t => {
      if (t.id === threadId) {
        const msg: ChatMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          senderId: user?.id || "me",
          text,
          timestamp: new Date().toISOString(),
        };
        return { ...t, messages: [...t.messages, msg], lastUpdated: new Date().toISOString() };
      }
      return t;
    });
    setChatsState(updated);
    await AsyncStorage.setItem("@chats", JSON.stringify(updated));
  };

  const startChat = async (thread: ChatThread) => {
    const exists = chats.find(c => c.id === thread.id);
    if (!exists) {
      const updated = [thread, ...chats];
      setChatsState(updated);
      await AsyncStorage.setItem("@chats", JSON.stringify(updated));
    }
  };

  const addPurchasedTicket = async (ticket: PurchasedTicket) => {
    const updated = [ticket, ...purchasedTickets];
    setPurchasedTickets(updated);
    await AsyncStorage.setItem("@purchased_tickets", JSON.stringify(updated));
  };

  const addReview = async (review: Review) => {
    const updated = [review, ...reviews];
    setReviewsState(updated);
    await AsyncStorage.setItem("@reviews", JSON.stringify(updated));
  };

  const followOrganizer = async (organizerId: string) => {
    if (!user) return;
    const already = user.followedOrganizers?.includes(organizerId);
    if (already) return;
    const updatedUser = { ...user, followedOrganizers: [...(user.followedOrganizers || []), organizerId] };
    setUserState(updatedUser);
    await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
    const updatedFollowers = { ...followerOverrides, [organizerId]: (followerOverrides[organizerId] || 0) + 1 };
    setFollowerOverrides(updatedFollowers);
    await AsyncStorage.setItem("@follower_overrides", JSON.stringify(updatedFollowers));
  };

  const unfollowOrganizer = async (organizerId: string) => {
    if (!user) return;
    const updatedUser = { ...user, followedOrganizers: (user.followedOrganizers || []).filter(id => id !== organizerId) };
    setUserState(updatedUser);
    await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
    const updatedFollowers = { ...followerOverrides, [organizerId]: Math.max(0, (followerOverrides[organizerId] || 0) - 1) };
    setFollowerOverrides(updatedFollowers);
    await AsyncStorage.setItem("@follower_overrides", JSON.stringify(updatedFollowers));
  };

  const isFollowing = (organizerId: string) => {
    return user?.followedOrganizers?.includes(organizerId) ?? false;
  };

  const getFollowerCount = (organizerId: string) => {
    return followerOverrides[organizerId] || SAMPLE_FOLLOWER_COUNTS[organizerId] || 0;
  };

  const getOrganizerRating = (organizerId: string) => {
    const orgReviews = reviews.filter(r => r.organizerId === organizerId);
    if (orgReviews.length === 0) return { avg: 0, count: 0 };
    const avg = orgReviews.reduce((sum, r) => sum + r.stars, 0) / orgReviews.length;
    return { avg: Math.round(avg * 10) / 10, count: orgReviews.length };
  };

  const updateOrganizerPhotos = async (organizerId: string, photos: { profileUri?: string; coverUri?: string }) => {
    const updated = { ...organizerPhotos, [organizerId]: { ...organizerPhotos[organizerId], ...photos } };
    setOrganizerPhotosState(updated);
    await AsyncStorage.setItem("@organizer_photos", JSON.stringify(updated));
  };

  const setMyOrganizerId = async (organizerId: string | null) => {
    setMyOrganizerIdState(organizerId);
    if (organizerId) await AsyncStorage.setItem("@my_organizer_id", organizerId);
    else await AsyncStorage.removeItem("@my_organizer_id");
  };

  const addOrganizer = async (org: OrganizerProfile) => {
    const updated = [...userOrganizers.filter(o => o.id !== org.id), org];
    setUserOrganizersState(updated);
    await AsyncStorage.setItem("@user_organizers", JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      user, setUser, onboarded, setOnboarded,
      currency, setCurrency,
      trips, setTrips, addTrip,
      events, setEvents, addEvent,
      chats, setChats, sendMessage, startChat,
      purchasedTickets, addPurchasedTicket,
      organizers: [...SAMPLE_ORGANIZERS, ...userOrganizers],
      addOrganizer,
      reviews, addReview,
      followOrganizer, unfollowOrganizer, isFollowing,
      getFollowerCount, getOrganizerRating,
      organizerPhotos, updateOrganizerPhotos,
      myOrganizerId: myOrganizerIdState,
      setMyOrganizerId: setMyOrganizerId as (id: string | null) => void,
      isLoading,
      loginWithCredentials,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
