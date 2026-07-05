/**
 * Nurabla Karadeniz Restaurant — pilot business config + intent logic.
 *
 * This module is intentionally self-contained and has NO dependency on the
 * clinic / laser conversation pipeline. It holds Nurabla's static business
 * information plus the pure functions used by the isolated WhatsApp webhook
 * at app/api/whatsapp/nurabla/route.ts.
 *
 * Business details are placeholders for the pilot and should be filled in
 * before go-live.
 */

export interface NurablaBusiness {
  name: string;
  address: string;
  mapsUrl: string;
  menuUrl: string;
}

export const NURABLA: NurablaBusiness = {
  name: "Nurabla Karadeniz Restaurant",
  address: "Merkez Mahallesi, Nefer Sokak No:15, 34782 Çekmeköy/İstanbul",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nur+Abla+Karadeniz+Sofrası+Çekmeköy",
  menuUrl: "https://www.nurabla.com.tr/menu/",
};

/** Reply sent when we cannot confidently answer — never invent information. */
export const NURABLA_FALLBACK =
  "Bu konuda size Nurabla ekibi yardımcı olacaktır.";

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

function locationText(): string {
  return `Adresimiz: ${NURABLA.address}\nGoogle Haritalar: ${NURABLA.mapsUrl}`;
}

function menuText(): string {
  return `Menümüz: ${NURABLA.menuUrl}`;
}

/**
 * Build the plain-text reply for an incoming message. Returns both location and
 * menu details when the message asks for both, a single section when it asks for
 * one, and the fallback when neither intent is recognized (including empty input).
 */
export function buildNurablaReply(body: string): string {
  const { location, menu } = detectNurablaIntent(body);

  if (location && menu) {
    return `${locationText()}\n\n${menuText()}`;
  }
  if (location) {
    return locationText();
  }
  if (menu) {
    return menuText();
  }
  return NURABLA_FALLBACK;
}
