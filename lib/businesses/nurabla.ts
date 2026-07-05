/**
 * Nurabla Karadeniz Restaurant — pilot business config + intent logic.
 *
 * This module is intentionally self-contained and has NO dependency on the
 * clinic / laser conversation pipeline. It holds Nurabla's static business
 * information plus the pure functions used by the isolated WhatsApp webhook
 * at app/api/whatsapp/nurabla/route.ts.
 *
 * The restaurant operates multiple branches; each branch has its own address
 * and Google Maps link, while the menu is shared across branches. Location
 * replies list a fixed set of branches — we never ask the user to choose.
 */

export type NurablaBranchKey = "cekmekoy" | "umraniye" | "basaksehir";

export interface NurablaBranch {
  /** Display name (Turkish), used in location replies. */
  name: string;
  address: string;
  mapsUrl: string;
  /** Branch phone number. Optional — only active branches publish one. */
  phone?: string;
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
      phone: "0216 642 53 10",
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
      phone: "0212 809 01 77",
    },
  },
};

/**
 * Branches included in a location reply, in display order. Ümraniye is
 * intentionally omitted from location replies.
 */
const LOCATION_BRANCH_KEYS: NurablaBranchKey[] = ["cekmekoy", "basaksehir"];

/**
 * Reply sent when we cannot confidently answer — never invent information.
 * Directs the customer to the active branch phone numbers instead.
 */
export const NURABLA_FALLBACK =
  "Bu konuda Nurabla ekibimiz size yardımcı olabilir.\n\n" +
  LOCATION_BRANCH_KEYS.map((key) => {
    const branch = NURABLA.branches[key];
    return `📞 ${branch.name}: ${branch.phone}`;
  }).join("\n");

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

function branchLocationText(key: NurablaBranchKey): string {
  const branch = NURABLA.branches[key];
  return (
    `${branch.name} şubemizin konumu:\n` +
    `Adres: ${branch.address}\n` +
    `Google Haritalar: ${branch.mapsUrl}`
  );
}

/** Location reply listing every branch in {@link LOCATION_BRANCH_KEYS}. */
function locationText(): string {
  return LOCATION_BRANCH_KEYS.map(branchLocationText).join("\n\n");
}

function menuText(): string {
  return `Menümüz: ${NURABLA.menuUrl}`;
}

/**
 * Build the plain-text reply for an incoming message.
 *
 * - Location → the Çekmeköy and Başakşehir addresses and maps links.
 * - Menu only → the menu link.
 * - Menu + location → the menu link followed by both branch locations.
 * - Neither intent (including empty input) → the phone fallback.
 */
export function buildNurablaReply(body: string): string {
  const { location, menu } = detectNurablaIntent(body);

  if (location && menu) {
    return `${menuText()}\n\n${locationText()}`;
  }
  if (location) {
    return locationText();
  }
  if (menu) {
    return menuText();
  }
  return NURABLA_FALLBACK;
}
