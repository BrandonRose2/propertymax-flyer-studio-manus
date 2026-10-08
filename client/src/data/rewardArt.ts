/**
 * Cartoon prize artwork that can sit on the flyer photo next to the reward.
 * Images live in client/public/reward-art (transparent PNGs, 480px).
 */
export type RewardArt = {
  id: string;
  label: string;
  url: string;
  /** Words in the reward text that suggest this art, e.g. "Free 55\" TV" → television. */
  keywords: RegExp;
};

export const REWARD_ART: RewardArt[] = [
  {
    id: "cash",
    label: "Cash",
    url: "/reward-art/cash.png",
    keywords: /\$|cash|money|dollar|credit|rent/i,
  },
  {
    id: "television",
    label: "Television",
    url: "/reward-art/television.png",
    keywords: /\btvs?\b|television|smart\s*tv|\d+\s*("|”|in(ch)?\b)/i,
  },
  {
    id: "game-console",
    label: "Game console (PS5)",
    url: "/reward-art/game-console.png",
    keywords: /ps\s?5|playstation|xbox|console|nintendo|switch|gaming/i,
  },
  {
    id: "gift-cards",
    label: "Gift cards",
    url: "/reward-art/gift-cards.png",
    keywords: /gift\s*cards?|visa|amazon|target|walmart|card/i,
  },
  {
    id: "gift-box",
    label: "Gift box",
    url: "/reward-art/gift-box.png",
    keywords: /gift|prize|surprise/i,
  },
  {
    id: "earbuds",
    label: "Wireless earbuds",
    url: "/reward-art/earbuds.png",
    keywords: /air\s*pods?|ear\s*buds?|headphones?|beats/i,
  },
  {
    id: "tablet",
    label: "Tablet",
    url: "/reward-art/tablet.png",
    keywords: /i\s*pad|tablet|galaxy\s*tab|kindle/i,
  },
  {
    id: "movie-night",
    label: "Movie night",
    url: "/reward-art/movie-night.png",
    keywords: /movie|cinema|theater|theatre|popcorn|ticket|amc|regal/i,
  },
  {
    id: "pizza-party",
    label: "Pizza party",
    url: "/reward-art/pizza-party.png",
    keywords: /pizza|dinner|food|restaurant|meal|party/i,
  },
  {
    id: "air-fryer",
    label: "Air fryer",
    url: "/reward-art/air-fryer.png",
    keywords: /air\s*fryer|kitchen|instant\s*pot|appliance/i,
  },
];

export const NO_REWARD_ART_ID = "none";

// Specific prizes are checked before the catch-alls, so "$100 Amazon gift card" gets gift cards, not cash.
const MATCH_ORDER = [
  "gift-cards",
  "television",
  "game-console",
  "earbuds",
  "tablet",
  "movie-night",
  "pizza-party",
  "air-fryer",
  "cash",
  "gift-box",
];

/** Best art for the reward text; ledger credits always get cash. Returns NO_REWARD_ART_ID when nothing fits. */
export const suggestRewardArtId = (reward: string, isLedger: boolean) => {
  if (isLedger) return "cash";
  const match = MATCH_ORDER.map(
    id => REWARD_ART.find(art => art.id === id)!
  ).find(art => art.keywords.test(reward));
  return match?.id ?? NO_REWARD_ART_ID;
};
