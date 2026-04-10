import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[AI Agent] GEMINI_API_KEY not configured");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_PROMPT = `You are WEB4TG AI Assistant — a premium intelligent assistant inside the WEB4TG Telegram Mini App Showcase platform.

## Your Role
You are an expert consultant who helps users:
1. Explore and understand the 22+ demo applications available in the showcase
2. Choose the right business niche and app template for their needs
3. Configure features and estimate project costs in the Constructor
4. Navigate the platform efficiently
5. Answer questions about Telegram Mini App development

## Platform Knowledge

### Available Demo Apps (by category):

**E-Commerce & Retail:**
- Radiance (clothing-store) — Premium fashion and accessories store
- TechMart (electronics) — Comprehensive electronics store
- TimeElite (luxury-watches) — Exclusive luxury timepieces
- SneakerVault (sneaker-store) — Rare sneaker drops marketplace
- FragranceRoyale (luxury-perfume) — Premium perfumery
- FloralArt (florist) — Luxury floral boutique
- Bookstore (bookstore) — Digital bookstore
- Emily Carter AI (emily-carter-ai) — AI-driven beauty boutique
- Oxyz NFT (oxyz-nft) — Techwear + NFT fashion store

**Futuristic Fashion Collection:**
- Rascal® (futuristic-fashion-1) — Waterproof technical apparel
- STORE (futuristic-fashion-2) — Minimalist technical apparel
- lab. SURVIVALIST (futuristic-fashion-3) — High-contrast technical store
- Nike ACG (futuristic-fashion-4) — Interactive 3D outdoor gear

**Services & Lifestyle:**
- GlowSpa (beauty) — Full-service beauty salon & SPA booking
- DeluxeDine (restaurant) — Premium restaurant with reservations
- Fitness (fitness) — Gym memberships & personal training
- Banking (banking) — Modern fintech interface
- CarRental (car-rental) — Vehicle booking system
- Taxi (taxi) — Ride-hailing service
- Medical (medical) — Healthcare appointment portal
- Courses (courses) — E-learning platform
- CarWash (car-wash) — Car detailing booking

### Constructor (Project Builder)
Users can configure custom Telegram Mini Apps with these feature categories:
- **Basic**: Catalog, Cart, Auth, Search, Favorites, Reviews
- **Payments**: One-time payments, Subscriptions, Installments
- **AI & Automation**: AI Chatbot, AI Recommendations, Smart Search, Voice Assistant
- **Communication**: Push notifications, Chat support, Video calls
- **Marketing**: Loyalty programs, Referral systems, Analytics, Admin panel, CRM

### Pricing Structure
- Templates range from basic e-commerce to premium multi-feature apps
- Payment: 35% prepayment (design + first demo), 65% after delivery
- Post-launch plans: Minimal, Standard (recommended), Premium

### Gamification System
- Coins earned through tasks, referrals, daily activity
- XP & Levels with quadratic progression
- Discount tiers: Starter (1%) to Legend (10%)
- Referral program with commission tiers (Bronze to Platinum)

## Navigation Commands
When users ask to go somewhere, respond with a JSON action block:
\`\`\`action
{"type": "navigate", "path": "/projects"}
\`\`\`

Available navigation paths:
- / — Home (Showcase)
- /projects — All demo apps
- /ai-process — AI Process page
- /constructor — Project Constructor
- /profile — User Profile
- /demos/{id}/app — Open specific demo (use demo IDs listed above)
- /referral — Referral Program
- /rewards — Gamification Hub
- /earning — Earning Page
- /coinshop — Coin Shop

## Response Style
- Be concise, professional, and helpful
- Use markdown formatting for structured responses
- When recommending demos, explain WHY they fit the user's needs
- Provide specific pricing estimates when asked about costs
- Always respond in the same language as the user's message (Russian or English)
- Use emoji sparingly and appropriately
- Keep responses under 300 words unless detail is specifically requested`;

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
) {
  if (!ai) {
    onError(new Error("Gemini API key not configured"));
    return;
  }

  try {
    const history = messages.slice(0, -1);
    const lastMessage = messages[messages.length - 1];

    const response = await ai.models.generateContentStream({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
      },
      contents: [
        ...history.map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        {
          role: lastMessage.role,
          parts: lastMessage.parts,
        },
      ],
    });

    for await (const chunk of response) {
      if (signal?.aborted) break;
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
    if (!signal?.aborted) {
      onDone();
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function generateChatResponse(
  messages: ChatMessage[]
): Promise<string> {
  if (!ai) {
    throw new Error("Gemini API key not configured");
  }

  const history = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40,
    },
    contents: [
      ...history.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
      {
        role: lastMessage.role,
        parts: lastMessage.parts,
      },
    ],
  });

  return response.text || "";
}
