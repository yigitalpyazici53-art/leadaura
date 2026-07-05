/**
 * Nurabla Karadeniz Restaurant — pilot business config + intent logic.
 *
 * This module is intentionally self-contained and has NO dependency on the
 * clinic / laser conversation pipeline. It holds Nurabla's static business
 * information plus the pure functions used by the isolated WhatsApp webhook
 * at app/api/whatsapp/nurabla/route.ts.
 *
 * The restaurant operates multiple branches; each branch has its own address
 * and Google Maps link, while the menu is shared across branches.
 */

export type NurablaBranchKey = "cekmekoy" | "umraniye" | "basaksehir";

export interface NurablaBranch {
  /** Display name (Turkish), used in replies and the branch-selection prompt. */
  name: string;
  address: string;
  mapsUrl: string;
}

export interface NurablaBusiness {
  name: string;
  menuUrl: string;
  branches: Record<NurablaBranchKey, NurablaBranch>;
}

export const NURABLA: NurablaBusiness = {
  name: "Nurabla Karadeniz Restaurant",
  menuUrl: "https://www.nurabla.com.tr/menu/",
  branches: {
    cekmekoy: {
      name: "Çekmeköy",
      address: "Merkez Mahallesi, Nefer Sokak No:15, 34782 Çekmeköy/İstanbul",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Nur+Abla+Karadeniz+Sofrası+Çekmeköy",
    },
    umraniye: {
      name: "Ümraniye",
      address:
        "Fatih Sultan Mehmet, Balkan Caddesi Meydan İstanbul AVM No: 62, 34770 Ümraniye/İstanbul",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Nur+Abla+Karadeniz+Sofrası+Ümraniye",
    },
    basaksehir: {
      name: "Başakşehir",
      address:
        "Ziya Gökalp Mah., Süleyman Demirel Bulv. Mall of İstanbul AVM No: 523, 34490 Başakşehir/İstanbul",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Nur+Abla+Karadeniz+Sofrası+Başakşehir",
    },
  },
};

/** Reply sent when we cannot confidently answer — never invent information. */
export const NURABLA_FALLBACK =
  "Bu konuda size Nurabla ekibi yardımcı olacaktır.";

/**
 * Asked when the user wants a location but has not told us which branch — we
 * must never guess, so we present the branch list and wait for a choice.
 */
export const NURABLA_BRANCH_PROMPT =
  "Hangi şubemizin konumunu paylaşmamızı istersiniz?\n\n" +
  "1. Çekmeköy\n" +
  "2. Ümraniye\n" +
  "3. Başakşehir";

const LOCATION_KEYWORDS = [
  "konum",
  "adres",
  "nerede",
  "nasıl gelirim",
  "yol tarifi",
  "harita",
];

const MENU_KEYWORDS = [
  "menü",
  "menu",
  "fiyat",
  "yemekler",
  "ne var",
  "kahvaltı",
];

/**
 * Branch name variations (with and without Turkish diacritics) mapped to the
 * canonical branch key. Matched against the Turkish-normalized message body.
 */
const BRANCH_KEYWORDS: Record<NurablaBranchKey, string[]> = {
  cekmekoy: ["çekmeköy", "cekmekoy"],
  umraniye: ["ümraniye", "umraniye"],
  basaksehir: ["başakşehir", "basaksehir"],
};

/**
 * Lowercase text using Turkish locale rules so that İ→i and I→ı map correctly
 * (plain String.toLowerCase mishandles Turkish dotted/dotless i).
 */
export function normalizeTurkish(text: string): string {
  return (text ?? "").toLocaleLowerCase("tr-TR").trim();
}

export interface NurablaIntent {
  location: boolean;
  menu: boolean;
}

/** Detect whether the message asks for location and/or menu information. */
export function detectNurablaIntent(body: string): NurablaIntent {
  const normalized = normalizeTurkish(body);
  if (!normalized) {
    return { location: false, menu: false };
  }

  const matches = (keywords: string[]): boolean =>
    keywords.some((kw) => normalized.includes(normalizeTurkish(kw)));

  return {
    location: matches(LOCATION_KEYWORDS),
    menu: matches(MENU_KEYWORDS),
  };
}

/**
 * Detect which branch (if any) the message refers to. Returns the canonical
 * branch key, or null when no branch is mentioned — callers must not guess.
 */
export function detectNurablaBranch(body: string): NurablaBranchKey | null {
  const normalized = normalizeTurkish(body);
  if (!normalized) {
    return null;
  }

  for (const key of Object.keys(BRANCH_KEYWORDS) as NurablaBranchKey[]) {
    if (BRANCH_KEYWORDS[key].some((kw) => normalized.includes(normalizeTurkish(kw)))) {
      return key;
    }
  }
  return null;
}

function branchLocationText(key: NurablaBranchKey): string {
  const branch = NURABLA.branches[key];
  return (
    `${branch.name} şubemizin konumu:\n` +
    `Adres: ${branch.address}\n` +
    `Google Haritalar: ${branch.mapsUrl}`
  );
}

function menuText(): string {
  return `Menümüz: ${NURABLA.menuUrl}`;
}

/**
 * Build the plain-text reply for an incoming message.
 *
 * - Location + known branch → that branch's address and maps link.
 * - Location without a branch → the branch-selection prompt (never guessed).
 * - Menu only → the menu link.
 * - Menu + location without a branch → the menu link, then the branch prompt.
 * - Menu + location with a branch → the menu link, then the branch location.
 * - Neither intent (including empty input) → the fallback reply.
 */
export function buildNurablaReply(body: string): string {
  const { location, menu } = detectNurablaIntent(body);
  const branch = location ? detectNurablaBranch(body) : null;

  const locationSection = branch
    ? branchLocationText(branch)
    : NURABLA_BRANCH_PROMPT;

  if (location && menu) {
    return `${menuText()}\n\n${locationSection}`;
  }
  if (location) {
    return locationSection;
  }
  if (menu) {
    return menuText();
  }
  return NURABLA_FALLBACK;
}
