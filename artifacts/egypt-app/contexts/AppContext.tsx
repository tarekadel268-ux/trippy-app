import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type Nationality = "egyptian" | "tourist";
export type UserRole = "ticket_holder" | "event_planner" | "tourist_viewer" | "resident_viewer";

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
  bio?: string;
  privacy?: UserPrivacy;
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
  photos?: string[];
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
  photos?: string[];
  createdAt: string;
}

export interface OrganizerPrivacy {
  hidePhone: boolean;
  hideCity: boolean;
  hideInstagram: boolean;
  hideWebsite: boolean;
  hideEmail: boolean;
}

export const DEFAULT_ORGANIZER_PRIVACY: OrganizerPrivacy = {
  hidePhone: false,
  hideCity: false,
  hideInstagram: false,
  hideWebsite: false,
  hideEmail: true,
};

export interface UserPrivacy {
  hideEmail: boolean;
  hidePhone: boolean;
  hideRole: boolean;
}

export const DEFAULT_USER_PRIVACY: UserPrivacy = {
  hideEmail: true,
  hidePhone: true,
  hideRole: false,
};

export interface OrganizerProfile {
  id: string;
  name: string;
  type: "lounge" | "event_planner";
  bio: string;
  city: string;
  phone: string;
  isVerified: boolean;
  subscriptionActive: boolean;
  coverColor: string;
  avatarColor: string;
  website?: string;
  instagram?: string;
  privacy?: OrganizerPrivacy;
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

export interface UserReport {
  id: string;
  reportedById: string;
  targetId: string;
  targetName: string;
  type: "user" | "listing";
  reason: string;
  createdAt: string;
}

export interface HighlightPost {
  id: string;
  userId: string;
  uri: string;
  type: "photo" | "video";
  caption?: string;
  createdAt: string;
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
  fetchFollowers: (userId: string) => Promise<string[]>;
  fetchFollowing: (userId: string) => Promise<string[]>;
  getOrganizerRating: (organizerId: string) => { avg: number; count: number };
  organizerPhotos: Record<string, { profileUri?: string; coverUri?: string }>;
  updateOrganizerPhotos: (organizerId: string, photos: { profileUri?: string; coverUri?: string }) => void;
  myOrganizerId: string | null;
  setMyOrganizerId: (organizerId: string | null) => void;
  isLoading: boolean;
  loginWithCredentials: (username: string, password: string) => Promise<"ok" | "not_found" | "wrong_password">;
  notificationSubs: string[];
  toggleNotificationSub: (orgId: string) => Promise<void>;
  isNotificationSubbed: (orgId: string) => boolean;
  blockedUsers: string[];
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  reports: UserReport[];
  submitReport: (report: Omit<UserReport, "id" | "createdAt">) => Promise<void>;
  highlights: HighlightPost[];
  addHighlight: (h: HighlightPost) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
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
    type: "event_planner",
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
    type: "event_planner",
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
    type: "event_planner",
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
    type: "event_planner",
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
    type: "event_planner",
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
    type: "event_planner",
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
  { id: "rev16", organizerId: "org_sinai", reviewerName: "Jake R.", stars: 5, comment: "The Blue Hole snorkeling was unlike anything I've ever experienced. Our Bedouin guide knew every inch of the Sinai.", createdAt: "2026-03-09T11:00:00Z" },
  { id: "rev17", organizerId: "org_sinai", reviewerName: "Fatima A.", stars: 5, comment: "Camping under the stars in the Sinai desert was the highlight of my entire trip to Egypt. Absolutely magical.", createdAt: "2026-02-20T09:30:00Z" },
  { id: "rev18", organizerId: "org_sinai", reviewerName: "Ben H.", stars: 4, comment: "Great kite surfing lesson and Bedouin camp dinner. Dahab is such a special place and these guys know it best.", createdAt: "2026-01-30T15:00:00Z" },
  { id: "rev19", organizerId: "org_ancient", reviewerName: "Priya S.", stars: 5, comment: "Standing inside the Valley of the Kings with an Egyptologist guide explaining every hieroglyph — absolutely priceless.", createdAt: "2026-03-11T10:00:00Z" },
  { id: "rev20", organizerId: "org_nubian", reviewerName: "Tom W.", stars: 5, comment: "The felucca at sunset with Nubian music playing is the most peaceful thing I've ever experienced. Book this trip.", createdAt: "2026-02-27T18:00:00Z" },
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
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    includes: ["Chalet", "Breakfast", "Beach Access", "Watersports"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_nc2",
    organizerId: "org_sahel",
    plannerName: "Sahel Escapes",
    plannerPhone: "+20 111 789 0123",
    plannerVerified: true,
    city: "North Coast",
    title: "Hacienda White Summer Package",
    description: "Experience the iconic Hacienda White resort — white architecture, turquoise sea, rooftop parties, and the best sunset views on Egypt's Mediterranean coast.",
    priceUSD: 420,
    priceEGP: 21000,
    days: 5,
    viewCount: 2340,
    imageUrl: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
    includes: ["Villa", "All-inclusive", "Beach Club", "Nightlife"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_sokhna1",
    organizerId: "org_sahel",
    plannerName: "Sahel Escapes",
    plannerPhone: "+20 100 456 7890",
    plannerVerified: true,
    city: "Ain El Sokhna",
    title: "Ain El Sokhna Weekend Escape",
    description: "Just 90 minutes from Cairo — crystal clear Red Sea waters, private beach resort, unlimited watersports and a full relaxation package.",
    priceUSD: 140,
    priceEGP: 7000,
    days: 2,
    viewCount: 1120,
    imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    includes: ["Hotel", "Half-board", "Beach Access", "Jet Ski"],
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
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    includes: ["Resort", "All-inclusive", "Diving", "Snorkeling"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_sharm2",
    organizerId: "org_redsea",
    plannerName: "Red Sea Adventures",
    plannerPhone: "+20 111 987 6543",
    plannerVerified: true,
    city: "Sharm El-Sheikh",
    title: "Sharm Quad & Desert Safari",
    description: "Thrilling desert quad bike adventure at sunset, Bedouin campfire dinner under the stars, then full spa day at a 5-star resort.",
    priceUSD: 190,
    priceEGP: 9500,
    days: 3,
    viewCount: 730,
    imageUrl: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80",
    includes: ["Hotel", "Breakfast", "Quad Bike", "Desert Dinner"],
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
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    includes: ["Hostel", "Breakfast", "Snorkeling", "Desert Trip"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip4",
    organizerId: "org_sinai",
    plannerName: "Sinai Explorer",
    plannerPhone: "+20 100 222 3344",
    plannerVerified: true,
    city: "Nuweiba",
    title: "Nuweiba Desert & Sea Retreat",
    description: "Isolated beach camps, Sinai desert jeep tours, and peaceful sunsets over the Gulf of Aqaba. One of Egypt's last hidden gems.",
    priceUSD: 70,
    priceEGP: 3500,
    days: 3,
    viewCount: 312,
    imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    includes: ["Beach Camp", "Dinner", "Jeep Tour"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip5",
    organizerId: "org_redsea",
    plannerName: "Red Sea Adventures",
    plannerPhone: "+20 111 555 6677",
    plannerVerified: true,
    city: "Hurghada",
    title: "Hurghada Fun Sun & Sea",
    description: "Parasailing, glass-bottom boat tours, Sahl Hasheesh old village, and beachside resorts on Egypt's most popular Red Sea strip.",
    priceUSD: 180,
    priceEGP: 9000,
    days: 4,
    viewCount: 984,
    imageUrl: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800&q=80",
    includes: ["Hotel", "Half-board", "Water Sports", "Boat Tour"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip6",
    organizerId: "org_sahel",
    plannerName: "Sahel Escapes",
    plannerPhone: "+20 122 888 9900",
    plannerVerified: true,
    city: "Gouna",
    title: "El Gouna Luxury Marina Stay",
    description: "Lagoon villas, kite surfing, gourmet dining, and the vibrant nightlife of Egypt's most upscale resort town on the Red Sea.",
    priceUSD: 480,
    priceEGP: 24000,
    days: 5,
    viewCount: 736,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
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
    description: "Valley of the Kings, Karnak Temple, Luxor Temple, and a breathtaking hot air balloon ride over the Nile at sunrise.",
    priceUSD: 220,
    priceEGP: 11000,
    days: 3,
    viewCount: 1456,
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75e5c1e27e33?w=800&q=80",
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
    description: "Abu Simbel temples, Philae island, an authentic Nubian village homestay, and felucca sailing on the Nile at golden hour.",
    priceUSD: 195,
    priceEGP: 9750,
    days: 4,
    viewCount: 1102,
    imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
    includes: ["Hotel", "Breakfast", "Abu Simbel Flight", "Felucca"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_fayoum1",
    organizerId: undefined,
    plannerName: "Fayoum Adventures",
    plannerPhone: "+20 100 111 2233",
    plannerVerified: true,
    city: "Fayoum",
    title: "Wadi El Rayan Desert & Lakes",
    description: "Explore the breathtaking Wadi El Rayan waterfalls, sand dunes, and serene desert lakes. A perfect escape from Cairo just 2 hours away.",
    priceUSD: 55,
    priceEGP: 2750,
    days: 2,
    viewCount: 743,
    imageUrl: "https://fklmjwjsoszenlffhxfl.supabase.co/storage/v1/object/public/Fayom/IMG_0801.jpeg",
    includes: ["Transport", "Lunch", "Guide", "Desert Camp"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_fayoum2",
    organizerId: undefined,
    plannerName: "Fayoum Adventures",
    plannerPhone: "+20 100 111 2233",
    plannerVerified: true,
    city: "Fayoum",
    title: "Fayoum Dirt Bike & Dunes",
    description: "Ride through stunning Fayoum desert terrain on a guided dirt bike experience. Suitable for beginners and experienced riders. Helmets and gear included.",
    priceUSD: 40,
    priceEGP: 2000,
    days: 1,
    viewCount: 511,
    imageUrl: "https://fklmjwjsoszenlffhxfl.supabase.co/storage/v1/object/public/Fayom/IMG_0802.jpeg",
    includes: ["Bike Rental", "Helmet & Gear", "Guide", "Lunch"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_fayoum3",
    organizerId: undefined,
    plannerName: "Desert Horizon Egypt",
    plannerPhone: "+20 115 444 5566",
    plannerVerified: false,
    city: "Fayoum",
    title: "Lake Qarun Sunset Cruise",
    description: "Sail across Lake Qarun at golden hour, enjoy a traditional Egyptian BBQ on the boat, and stargaze in the clear Fayoum night sky.",
    priceUSD: 35,
    priceEGP: 1750,
    days: 1,
    viewCount: 328,
    imageUrl: "https://fklmjwjsoszenlffhxfl.supabase.co/storage/v1/object/public/Fayom/IMG_0801.jpeg",
    includes: ["Boat Cruise", "BBQ Dinner", "Fishing"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "trip_fayoum4",
    organizerId: undefined,
    plannerName: "Desert Horizon Egypt",
    plannerPhone: "+20 115 444 5566",
    plannerVerified: false,
    city: "Fayoum",
    title: "Fayoum Off-Road Adventure",
    description: "Full-day off-road ATV & dirt bike combo across Fayoum's iconic desert valleys and rocky trails with stunning panoramic views.",
    priceUSD: 65,
    priceEGP: 3250,
    days: 1,
    viewCount: 415,
    imageUrl: "https://fklmjwjsoszenlffhxfl.supabase.co/storage/v1/object/public/Fayom/IMG_0802.jpeg",
    includes: ["ATV Rental", "Dirt Bike", "Gear", "Guide", "Snacks"],
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
  {
    id: "evt6",
    organizerId: "org_twentyfive",
    holderName: "25 Degrees Rooftop",
    holderPhone: "+20 100 222 3344",
    holderContact: "@25degrees_cairo",
    category: "private_party",
    title: "New Cairo Rooftop Eid Party",
    description: "Eid celebration rooftop takeover — 2 tickets available. Live DJ, shisha, themed cocktails, and skyline fireworks view.",
    venue: "25 Degrees Rooftop, New Cairo",
    date: "2026-06-28",
    priceUSD: 20,
    priceEGP: 1000,
    viewCount: 430,
    imageUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt7",
    organizerId: "org_pyramidstage",
    holderName: "Pyramid Stage",
    holderPhone: "+20 111 789 0123",
    holderContact: "@pyramidstage",
    category: "concert",
    title: "Giza Pyramids Sound & Light Festival",
    description: "An epic 2-night outdoor festival at the base of the Great Pyramids — international headliners, laser shows, and an unforgettable backdrop.",
    venue: "Pyramid Stage, Giza",
    date: "2026-09-19",
    priceUSD: 55,
    priceEGP: 2750,
    viewCount: 3210,
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eaa54b8a3d03?w=800&q=80",
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
  const [notificationSubs, setNotificationSubsState] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsersState] = useState<string[]>([]);
  const [reports, setReportsState] = useState<UserReport[]>([]);
  const [highlights, setHighlightsState] = useState<HighlightPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) return;
      const raw = await AsyncStorage.getItem("@user");
      if (!raw && session.user) {
        await restoreFromSupabaseSession(session.user.id, session.user.email ?? "");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function restoreFromSupabaseSession(userId: string, email: string) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!profile) return;
      const restored: UserProfile = {
        id: profile.id,
        username: profile.username ?? email,
        name: profile.name ?? "",
        email: profile.email ?? email,
        role: profile.role ?? "tourist",
        nationality: profile.nationality ?? "other",
        phone: profile.phone ?? "",
        isVerified: profile.is_verified ?? false,
        currency: profile.currency ?? "EGP",
        followedOrganizers: profile.followed_organizers ?? [],
        authProvider: profile.auth_provider ?? "email",
        bio: profile.bio ?? "",
      };
      setUserState(restored);
      setOnboardedState(true);
      await AsyncStorage.setItem("@user", JSON.stringify(restored));
      await AsyncStorage.setItem("@onboarded", "true");
      // Sync user-specific listings and profile from Supabase after session restore
      syncUserDataFromSupabase();
      syncUserProfileFromSupabase();
    } catch {
      // profile not found — user needs to onboard
    }
  }

  async function loadData() {
    try {
      const [savedUser, savedOnboarded, savedCurrency, savedTrips, savedEvents, savedChats, savedTickets, savedReviews, savedFollowers, savedOrgPhotos, savedMyOrgId, savedUserOrgs, savedNotifSubs, savedBlocked, savedReports, savedHighlights] = await Promise.all([
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
        AsyncStorage.getItem("@notif_subs"),
        AsyncStorage.getItem("@blocked_users"),
        AsyncStorage.getItem("@reports"),
        AsyncStorage.getItem("@highlights"),
      ]);
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
      if (savedNotifSubs) setNotificationSubsState(JSON.parse(savedNotifSubs));
      if (savedBlocked) setBlockedUsersState(JSON.parse(savedBlocked));
      if (savedReports) setReportsState(JSON.parse(savedReports));
      if (savedHighlights) setHighlightsState(JSON.parse(savedHighlights));

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUserState(parsed);

        // With persistSession: true + storage: AsyncStorage, Supabase auto-restores
        // the session on startup. No manual signInWithPassword needed here.
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log("[loadData] getSession →", existingSession ? `uid=${existingSession.user.id}` : "no session (Supabase will restore async)");
        if (existingSession) {
          syncUserDataFromSupabase();
          syncUserProfileFromSupabase();
        }
      } else {
        // No local user — check for an active Supabase session and restore from profiles table
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[loadData] no local user, getSession →", session ? `uid=${session.user.id}` : "no session");
        if (session?.user) {
          await restoreFromSupabaseSession(session.user.id, session.user.email ?? "");
        }
      }
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
      // Persist profile changes to Supabase
      // IMPORTANT: always use authUser.id (the real Supabase UUID) as the row id,
      // NOT withDefaults.id which may be a local timestamp string from offline signup.
      // AppContext.tsx — setUser Supabase upsert
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("profiles").upsert({
            id: authUser.id,
            username: withDefaults.username ?? null,
            name: withDefaults.name ?? null,
            email: withDefaults.email ?? null,
            bio: withDefaults.bio ?? null,
            role: withDefaults.role ?? null,
            avatar_url: withDefaults.profileUri ?? null,
            cover_url: withDefaults.coverUri ?? null,
            nationality: withDefaults.nationality ?? null,
            phone: withDefaults.phone ?? null,
            currency: withDefaults.currency ?? "EGP",
            is_verified: withDefaults.isVerified ?? false,
            followed_organizers: withDefaults.followedOrganizers ?? [],
          }, { onConflict: "id" });
        }
      } catch (_) {}
    } else {
      await AsyncStorage.removeItem("@user");
      // Clear all user-specific state on logout, keep only sample/public content
      setTripsState(SAMPLE_TRIPS);
      setEventsState(SAMPLE_EVENTS);
      setPurchasedTickets([]);
      setHighlightsState([]);
      await AsyncStorage.removeItem("@trips");
      await AsyncStorage.removeItem("@events");
      await AsyncStorage.removeItem("@purchased_tickets");
      await AsyncStorage.removeItem("@highlights");
      await supabase.auth.signOut().catch(() => {});
    }
  };

  const syncUserDataFromSupabase = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [tripsRes, eventsRes, ticketsRes] = await Promise.all([
        supabase.from("trips").select("*").eq("user_id", authUser.id),
        supabase.from("events").select("*").eq("user_id", authUser.id),
        supabase.from("tickets").select("*").eq("user_id", authUser.id),
      ]);

      if (tripsRes.data && tripsRes.data.length > 0) {
        const remoteTrips: TripOffer[] = tripsRes.data.map(r => ({
          id: r.id,
          organizerId: r.organizer_id ?? undefined,
          plannerName: r.planner_name ?? "",
          plannerPhone: r.planner_phone ?? "",
          plannerVerified: r.planner_verified ?? false,
          city: r.city ?? "",
          title: r.title ?? "",
          description: r.description ?? "",
          priceUSD: r.price_usd ?? 0,
          priceEGP: r.price_egp ?? 0,
          days: r.days ?? 1,
          viewCount: r.view_count ?? 0,
          imageUrl: r.image_url ?? undefined,
          photos: r.photos ?? [],
          includes: r.includes ?? [],
          createdAt: r.created_at ?? new Date().toISOString(),
        }));
        const remoteIds = new Set(remoteTrips.map(t => t.id));
        const sampleIds = new Set(SAMPLE_TRIPS.map(t => t.id));
        setTripsState(prev => {
          const localOnly = prev.filter(t => !sampleIds.has(t.id) && !remoteIds.has(t.id));
          return [...remoteTrips, ...localOnly, ...SAMPLE_TRIPS];
        });
        await AsyncStorage.setItem("@trips", JSON.stringify([...remoteTrips, ...SAMPLE_TRIPS]));
      }

      if (eventsRes.data && eventsRes.data.length > 0) {
        const remoteEvents: EventListing[] = eventsRes.data.map(r => ({
          id: r.id,
          organizerId: r.organizer_id ?? undefined,
          holderName: r.holder_name ?? "",
          holderPhone: r.holder_phone ?? "",
          holderContact: r.holder_contact ?? "",
          category: r.category ?? "concert",
          title: r.title ?? "",
          description: r.description ?? "",
          venue: r.venue ?? "",
          date: r.date ?? new Date().toISOString(),
          priceUSD: r.price_usd ?? 0,
          priceEGP: r.price_egp ?? 0,
          viewCount: r.view_count ?? 0,
          imageUrl: r.image_url ?? undefined,
          photos: r.photos ?? [],
          createdAt: r.created_at ?? new Date().toISOString(),
        }));
        const remoteIds = new Set(remoteEvents.map(e => e.id));
        const sampleIds = new Set(SAMPLE_EVENTS.map(e => e.id));
        setEventsState(prev => {
          const localOnly = prev.filter(e => !sampleIds.has(e.id) && !remoteIds.has(e.id));
          return [...remoteEvents, ...localOnly, ...SAMPLE_EVENTS];
        });
        await AsyncStorage.setItem("@events", JSON.stringify([...remoteEvents, ...SAMPLE_EVENTS]));
      }

      if (ticketsRes.data && ticketsRes.data.length > 0) {
        const remoteTickets: PurchasedTicket[] = ticketsRes.data.map(r => ({
          id: r.id,
          eventId: r.event_id ?? "",
          eventTitle: r.event_title ?? "",
          quantity: r.quantity ?? 1,
          priceUSD: r.price_usd ?? 0,
          priceEGP: r.price_egp ?? 0,
          paymentMethod: r.payment_method ?? "",
          purchasedAt: r.purchased_at ?? new Date().toISOString(),
        }));
        setPurchasedTickets(remoteTickets);
        await AsyncStorage.setItem("@purchased_tickets", JSON.stringify(remoteTickets));
      }
    } catch {
      // Supabase unavailable — local data already loaded
    }
  };

  const syncUserProfileFromSupabase = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [profileRes, postsRes, msgsRes, followingRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUser.id).single(),
        supabase.from("posts").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
        supabase.from("messages")
          .select("*")
          .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
          .order("created_at", { ascending: true }),
        supabase.from("followers").select("following_id").eq("follower_id", authUser.id),
      ]);

      // Restore profile fields (bio, avatar, cover, username, name)
      // followedOrganizers comes from the real followers table rows (below), not the JSON column
      if (profileRes.data) {
        const p = profileRes.data;
        setUserState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            bio: p.bio ?? prev.bio,
            username: p.username ?? prev.username,
            name: p.name ?? prev.name,
            email: p.email ?? prev.email,
            role: p.role ?? prev.role,
            phone: p.phone ?? prev.phone,
            isVerified: p.is_verified ?? prev.isVerified,
            currency: p.currency ?? prev.currency,
            profileUri: p.avatar_url ?? prev.profileUri,
            coverUri: p.cover_url ?? prev.coverUri,
          };
        });
      }

      // Always overwrite followedOrganizers from the Supabase followers table —
      // even if the result is an empty array. This prevents stale AsyncStorage
      // values from making the app think the user is already following someone
      // (which would silently block the insert).
      const followedIds = (followingRes.data ?? []).map((r: { following_id: string }) => r.following_id);
      console.log("[Sync] followedOrganizers from Supabase:", followedIds);
      setUserState(prev => {
        if (!prev) return prev;
        return { ...prev, followedOrganizers: followedIds };
      });
      // Keep AsyncStorage cache in sync with Supabase truth
      const cachedUser = await AsyncStorage.getItem("@user");
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        await AsyncStorage.setItem("@user", JSON.stringify({ ...parsed, followedOrganizers: followedIds }));
      }

      // Restore posts (highlights)
      if (postsRes.data && postsRes.data.length > 0) {
        const remotePosts: HighlightPost[] = postsRes.data.map(r => ({
          id: r.id,
          userId: r.user_id,
          uri: r.image_url ?? "",
          type: (r.type as "photo" | "video") ?? "photo",
          caption: r.caption ?? undefined,
          createdAt: r.created_at ?? new Date().toISOString(),
        }));
        setHighlightsState(remotePosts);
        await AsyncStorage.setItem("@highlights", JSON.stringify(remotePosts));
      }

      // Rebuild chat threads from remote message history
      if (msgsRes.data && msgsRes.data.length > 0) {
        const threadMap: Record<string, ChatThread> = {};
        for (const row of msgsRes.data) {
          const threadId = row.thread_id ?? (row.sender_id === authUser.id
            ? `${row.sender_id}_${row.receiver_id}_${row.listing_id ?? "chat"}`
            : `${row.receiver_id}_${row.sender_id}_${row.listing_id ?? "chat"}`);
          const participantId = row.sender_id === authUser.id ? row.receiver_id : row.sender_id;
          if (!threadMap[threadId]) {
            threadMap[threadId] = {
              id: threadId,
              participantId,
              participantName: row.participant_name ?? participantId,
              listingId: row.listing_id ?? "",
              listingTitle: row.listing_title ?? "",
              messages: [],
              lastUpdated: row.created_at ?? new Date().toISOString(),
            };
          }
          threadMap[threadId].messages.push({
            id: row.id,
            senderId: row.sender_id,
            text: row.message ?? "",
            timestamp: row.created_at ?? new Date().toISOString(),
          });
          threadMap[threadId].lastUpdated = row.created_at ?? threadMap[threadId].lastUpdated;
        }
        const remoteThreads = Object.values(threadMap).sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        setChatsState(remoteThreads);
        await AsyncStorage.setItem("@chats", JSON.stringify(remoteThreads));
      }
    } catch {
      // Supabase unavailable — local data already loaded
    }
  };

  const loginWithCredentials = async (username: string, password: string): Promise<"ok" | "not_found" | "wrong_password"> => {
    const uname = username.toLowerCase();

    // 1. Try local registry first
    const raw = await AsyncStorage.getItem("@users_registry");
    const registry: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
    const localFound = registry[uname];

    if (localFound) {
      if (localFound.password !== password) return "wrong_password";
      const withDefaults = { ...localFound, followedOrganizers: localFound.followedOrganizers ?? [] };
      setUserState(withDefaults);
      await AsyncStorage.setItem("@user", JSON.stringify(withDefaults));
      setOnboardedState(true);
      await AsyncStorage.setItem("@onboarded", "true");
      if (localFound.role === "event_planner" || localFound.role === "ticket_holder") {
        const orgId = `org_user_${localFound.id}`;
        setMyOrganizerIdState(orgId);
        await AsyncStorage.setItem("@my_organizer_id", orgId);
      }
      // Also sign in with Supabase in the background if email available, then sync
      if (localFound.email) {
        console.log("AUTH CALL: loginWithCredentials (local) signInWithPassword", localFound.email);
        supabase.auth.signInWithPassword({ email: localFound.email, password })
          .then(({ data, error }) => {
            console.log("[loginWithCredentials] signInWithPassword result →", data?.user?.id ?? `error: ${error?.message}`);
            syncUserDataFromSupabase();
            syncUserProfileFromSupabase();
          })
          .catch(() => {});
      }
      return "ok";
    }

    // 2. Not found locally — try Supabase (cross-device login)
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", uname)
        .single();

      if (!profileData) return "not_found";

      console.log("AUTH CALL: loginWithCredentials (cross-device) signInWithPassword", profileData.email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });
      console.log("[loginWithCredentials] cross-device result →", authData?.user?.id ?? `error: ${authError?.message}`);

      if (authError) return "wrong_password";
      if (!authData.user) return "not_found";

      const restoredProfile: UserProfile = {
        id: profileData.id,
        username: profileData.username,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        nationality: profileData.nationality,
        phone: profileData.phone ?? "",
        isVerified: profileData.is_verified ?? false,
        subscriptionExpiry: profileData.subscription_expiry ?? null,
        currency: profileData.currency ?? "EGP",
        followedOrganizers: profileData.followed_organizers ?? [],
        authProvider: profileData.auth_provider ?? undefined,
        bio: profileData.bio ?? undefined,
      };

      setUserState(restoredProfile);
      await AsyncStorage.setItem("@user", JSON.stringify(restoredProfile));
      setOnboardedState(true);
      await AsyncStorage.setItem("@onboarded", "true");
      registry[uname] = restoredProfile;
      await AsyncStorage.setItem("@users_registry", JSON.stringify(registry));

      if (restoredProfile.role === "event_planner" || restoredProfile.role === "ticket_holder") {
        const orgId = `org_user_${restoredProfile.id}`;
        setMyOrganizerIdState(orgId);
        await AsyncStorage.setItem("@my_organizer_id", orgId);
      }
      // Supabase session is established, sync user's listings and profile
      syncUserDataFromSupabase();
      syncUserProfileFromSupabase();
      return "ok";
    } catch {
      return "not_found";
    }
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
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await supabase.from("trips").insert({
        id: trip.id,
        user_id: authUser.id,
        organizer_id: trip.organizerId ?? null,
        planner_name: trip.plannerName,
        planner_phone: trip.plannerPhone,
        planner_verified: trip.plannerVerified,
        city: trip.city,
        title: trip.title,
        description: trip.description,
        price_usd: trip.priceUSD,
        price_egp: trip.priceEGP,
        days: trip.days,
        view_count: trip.viewCount,
        image_url: trip.imageUrl ?? null,
        photos: trip.photos ?? [],
        includes: trip.includes,
        created_at: trip.createdAt,
      });
    }
    if (trip.organizerId && notificationSubs.includes(trip.organizerId)) {
      const org = [...SAMPLE_ORGANIZERS, ...userOrganizers].find(o => o.id === trip.organizerId);
      if (org) await scheduleListingNotification(org.name, trip.title, "trip");
    }
  };

  const setEvents = async (e: EventListing[]) => {
    setEventsState(e);
    await AsyncStorage.setItem("@events", JSON.stringify(e));
  };

  const addEvent = async (event: EventListing) => {
    const updated = [event, ...events];
    setEventsState(updated);
    await AsyncStorage.setItem("@events", JSON.stringify(updated));
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await supabase.from("events").insert({
        id: event.id,
        user_id: authUser.id,
        organizer_id: event.organizerId ?? null,
        holder_name: event.holderName,
        holder_phone: event.holderPhone,
        holder_contact: event.holderContact,
        category: event.category,
        title: event.title,
        description: event.description,
        venue: event.venue,
        date: event.date,
        price_usd: event.priceUSD,
        price_egp: event.priceEGP,
        view_count: event.viewCount,
        image_url: event.imageUrl ?? null,
        photos: event.photos ?? [],
        created_at: event.createdAt,
      });
    }
    if (event.organizerId && notificationSubs.includes(event.organizerId)) {
      const org = [...SAMPLE_ORGANIZERS, ...userOrganizers].find(o => o.id === event.organizerId);
      if (org) await scheduleListingNotification(org.name, event.title, "event");
    }
  };

  const setChats = async (c: ChatThread[]) => {
    setChatsState(c);
    await AsyncStorage.setItem("@chats", JSON.stringify(c));
  };

  const sendMessage = async (threadId: string, text: string) => {
    const now = new Date().toISOString();
    const msgId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const msg: ChatMessage = {
      id: msgId,
      senderId: user?.id || "me",
      text,
      timestamp: now,
    };
    const updated = chats.map(t => {
      if (t.id === threadId) {
        return { ...t, messages: [...t.messages, msg], lastUpdated: now };
      }
      return t;
    });
    setChatsState(updated);
    await AsyncStorage.setItem("@chats", JSON.stringify(updated));
    // Persist to Supabase messages table
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const thread = chats.find(t => t.id === threadId);
      if (authUser && thread) {
        await supabase.from("messages").insert({
          id: msgId,
          sender_id: authUser.id,
          receiver_id: thread.participantId,
          thread_id: threadId,
          listing_id: thread.listingId,
          listing_title: thread.listingTitle,
          participant_name: thread.participantName,
          message: text,
          created_at: now,
        });
      }
    } catch (_) {}
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
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await supabase.from("tickets").insert({
        id: ticket.id,
        user_id: authUser.id,
        event_id: ticket.eventId,
        event_title: ticket.eventTitle,
        quantity: ticket.quantity,
        price_usd: ticket.priceUSD,
        price_egp: ticket.priceEGP,
        payment_method: ticket.paymentMethod,
        purchased_at: ticket.purchasedAt,
      });
    }
  };

  const addReview = async (review: Review) => {
    const updated = [review, ...reviews];
    setReviewsState(updated);
    await AsyncStorage.setItem("@reviews", JSON.stringify(updated));
  };

  // Returns the active Supabase session user, or null if not logged in.
  const ensureSupabaseSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("CURRENT SESSION:", session ? `uid=${session.user.id} expires=${session.expires_at}` : "null — user must log in");
    if (!session) return null;
    return session.user;
  };

  const followOrganizer = async (organizerId: string) => {
    if (!user) return;
    if (user.followedOrganizers?.includes(organizerId)) return;

    // 1. Ensure a live Supabase session exists
    const authUser = await ensureSupabaseSession();
    if (!authUser) {
      Alert.alert(
        "Session expired",
        "Please log out and log back in to follow organizers.",
        [{ text: "OK" }]
      );
      return;
    }

    // 2. Optimistic local update so the button responds immediately
    const updatedFollowed = [...(user.followedOrganizers || []), organizerId];
    const updatedUser = { ...user, followedOrganizers: updatedFollowed };
    setUserState(updatedUser);
    await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
    setFollowerOverrides(prev => ({ ...prev, [organizerId]: (prev[organizerId] || 0) + 1 }));

    // 3. Write to Supabase
    const { error } = await supabase
      .from("followers")
      .insert([{ follower_id: authUser.id, following_id: organizerId }]);

    if (error && error.code !== "23505") {
      // 23505 = unique_violation (already following) — treat as success
      console.log("[Follow] insert error:", error.message);
      // Roll back optimistic update
      const rolledBack = { ...user, followedOrganizers: (user.followedOrganizers || []) };
      setUserState(rolledBack);
      await AsyncStorage.setItem("@user", JSON.stringify(rolledBack));
      setFollowerOverrides(prev => ({ ...prev, [organizerId]: Math.max(0, (prev[organizerId] || 1) - 1) }));
    }
  };

  const unfollowOrganizer = async (organizerId: string) => {
    if (!user) return;

    // 1. Optimistic local update
    const updatedUser = { ...user, followedOrganizers: (user.followedOrganizers || []).filter(id => id !== organizerId) };
    setUserState(updatedUser);
    await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
    setFollowerOverrides(prev => ({ ...prev, [organizerId]: Math.max(0, (prev[organizerId] || 0) - 1) }));
    await AsyncStorage.setItem("@follower_overrides", JSON.stringify({ ...followerOverrides, [organizerId]: Math.max(0, (followerOverrides[organizerId] || 0) - 1) }));
    if (notificationSubs.includes(organizerId)) {
      const updatedSubs = notificationSubs.filter(id => id !== organizerId);
      setNotificationSubsState(updatedSubs);
      await AsyncStorage.setItem("@notif_subs", JSON.stringify(updatedSubs));
    }

    // 2. Delete from Supabase
    const authUser = await ensureSupabaseSession();
    if (!authUser) return;

    await supabase.from("followers")
      .delete()
      .eq("follower_id", authUser.id)
      .eq("following_id", organizerId);
  };

  const isFollowing = (organizerId: string) => {
    return user?.followedOrganizers?.includes(organizerId) ?? false;
  };

  // Returns list of user IDs that follow the given userId
  // AppContext.tsx — fetchFollowers
  const fetchFollowers = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("follower_id")
        .eq("following_id", userId);
      if (error || !data) return [];
      return data.map((r: { follower_id: string }) => r.follower_id);
    } catch (_) {
      return [];
    }
  };

  // Returns list of user IDs that the given userId is following
  // AppContext.tsx — fetchFollowing
  const fetchFollowing = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", userId);
      if (error || !data) return [];
      return data.map((r: { following_id: string }) => r.following_id);
    } catch (_) {
      return [];
    }
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

  const requestNotificationPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  };

  const isNotificationSubbed = (orgId: string) => notificationSubs.includes(orgId);

  const toggleNotificationSub = async (orgId: string) => {
    const already = notificationSubs.includes(orgId);
    if (already) {
      const updated = notificationSubs.filter(id => id !== orgId);
      setNotificationSubsState(updated);
      await AsyncStorage.setItem("@notif_subs", JSON.stringify(updated));
    } else {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
      const updated = [...notificationSubs, orgId];
      setNotificationSubsState(updated);
      await AsyncStorage.setItem("@notif_subs", JSON.stringify(updated));
    }
  };

  const scheduleListingNotification = async (orgName: string, listingTitle: string, type: "trip" | "event") => {
    if (Platform.OS === "web") return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 New ${type === "trip" ? "Trip" : "Event"} by ${orgName}`,
          body: listingTitle,
          sound: true,
        },
        trigger: null,
      });
    } catch (_) {}
  };

  const blockUser = async (userId: string) => {
    const updated = blockedUsers.includes(userId) ? blockedUsers : [...blockedUsers, userId];
    setBlockedUsersState(updated);
    await AsyncStorage.setItem("@blocked_users", JSON.stringify(updated));
  };

  const unblockUser = async (userId: string) => {
    const updated = blockedUsers.filter(id => id !== userId);
    setBlockedUsersState(updated);
    await AsyncStorage.setItem("@blocked_users", JSON.stringify(updated));
  };

  const isBlocked = (userId: string) => blockedUsers.includes(userId);

  const submitReport = async (report: Omit<UserReport, "id" | "createdAt">) => {
    const full: UserReport = {
      ...report,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...reports, full];
    setReportsState(updated);
    await AsyncStorage.setItem("@reports", JSON.stringify(updated));
  };

  const addHighlight = async (h: HighlightPost) => {
    const updated = [h, ...highlights];
    setHighlightsState(updated);
    await AsyncStorage.setItem("@highlights", JSON.stringify(updated));
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from("posts").insert({
          id: h.id,
          user_id: authUser.id,
          image_url: h.uri,
          caption: h.caption ?? null,
          type: h.type,
          created_at: h.createdAt,
        });
      }
    } catch (_) {}
  };

  const removeHighlight = async (id: string) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlightsState(updated);
    await AsyncStorage.setItem("@highlights", JSON.stringify(updated));
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from("posts").delete().eq("id", id).eq("user_id", authUser.id);
      }
    } catch (_) {}
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
      fetchFollowers, fetchFollowing,
      getFollowerCount, getOrganizerRating,
      organizerPhotos, updateOrganizerPhotos,
      myOrganizerId: myOrganizerIdState,
      setMyOrganizerId: setMyOrganizerId as (id: string | null) => void,
      isLoading,
      loginWithCredentials,
      notificationSubs,
      toggleNotificationSub,
      isNotificationSubbed,
      blockedUsers,
      blockUser,
      unblockUser,
      isBlocked,
      reports,
      submitReport,
      highlights,
      addHighlight,
      removeHighlight,
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
