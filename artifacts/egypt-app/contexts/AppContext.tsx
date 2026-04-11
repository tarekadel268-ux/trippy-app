import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Nationality = "egyptian" | "tourist";
export type UserRole = "ticket_holder" | "trip_planner" | "tourist_viewer";

export interface UserProfile {
  id: string;
  nationality: Nationality;
  role: UserRole;
  name: string;
  phone: string;
  isVerified: boolean;
  subscriptionExpiry: string | null;
  currency: "USD" | "EGP";
}

export interface TripOffer {
  id: string;
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
  holderName: string;
  holderPhone: string;
  holderContact: string;
  category: "concert" | "afro_techno" | "private_party";
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
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const SAMPLE_TRIPS: TripOffer[] = [
  {
    id: "trip_nc1",
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
    id: "evt1",
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt2",
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt4",
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt5",
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [savedUser, savedOnboarded, savedCurrency, savedTrips, savedEvents, savedChats, savedTickets] = await Promise.all([
        AsyncStorage.getItem("@user"),
        AsyncStorage.getItem("@onboarded"),
        AsyncStorage.getItem("@currency"),
        AsyncStorage.getItem("@trips"),
        AsyncStorage.getItem("@events"),
        AsyncStorage.getItem("@chats"),
        AsyncStorage.getItem("@purchased_tickets"),
      ]);
      if (savedUser) setUserState(JSON.parse(savedUser));
      if (savedOnboarded === "true") setOnboardedState(true);
      if (savedCurrency) setCurrencyState(savedCurrency as "USD" | "EGP");
      if (savedTrips) setTripsState(JSON.parse(savedTrips));
      if (savedEvents) setEventsState(JSON.parse(savedEvents));
      if (savedChats) setChatsState(JSON.parse(savedChats));
      if (savedTickets) setPurchasedTickets(JSON.parse(savedTickets));
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const setUser = async (u: UserProfile | null) => {
    setUserState(u);
    if (u) await AsyncStorage.setItem("@user", JSON.stringify(u));
    else await AsyncStorage.removeItem("@user");
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

  const addPurchasedTicket = async (ticket: PurchasedTicket) => {
    const updated = [ticket, ...purchasedTickets];
    setPurchasedTickets(updated);
    await AsyncStorage.setItem("@purchased_tickets", JSON.stringify(updated));
  };

  const startChat = async (thread: ChatThread) => {
    const exists = chats.find(c => c.id === thread.id);
    if (!exists) {
      const updated = [thread, ...chats];
      setChatsState(updated);
      await AsyncStorage.setItem("@chats", JSON.stringify(updated));
    }
  };

  return (
    <AppContext.Provider value={{
      user, setUser, onboarded, setOnboarded,
      currency, setCurrency,
      trips, setTrips, addTrip,
      events, setEvents, addEvent,
      chats, setChats, sendMessage, startChat,
      purchasedTickets, addPurchasedTicket,
      isLoading,
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
