import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const WA_URL = `https://wa.me/905419473049?text=${encodeURIComponent(
  "Merhaba! Welcaria demosu talep etmek istiyorum."
)}`;

const C = {
  teal: "#0d9488",
  tealHover: "#0f766e",
  tealLight: "#5eead4",
  tealBg: "#f0fdfa",
  tealBorder: "#99f6e4",
  bg: "#ffffff",
  bgAlt: "#f8fafc",
  bgDark: "#0c1427",
  bgDarkAlt: "#111b33",
  text: "#0f172a",
  textMuted: "#64748b",
  textOnDark: "#cbd5e1",
  textOnDarkMuted: "#94a3b8",
  border: "#e2e8f0",
  borderOnDark: "rgba(148,163,184,0.18)",
  whatsapp: "#25d366",
  whatsappHover: "#1da851",
};

function CheckIcon({ onDark }: { onDark?: boolean }) {
  const fill = onDark ? "rgba(13,148,136,0.28)" : C.tealBg;
  const stroke = onDark ? C.tealLight : C.teal;
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
      <circle cx="8.5" cy="8.5" r="8.5" fill={fill} />
      <path d="M5.5 8.5L7.5 10.5L11.5 6.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="13" height="9" rx="2.5" />
      <path d="M8 17h10a3 3 0 0 0 3-3V9" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" />
      <path d="M9.2 12.2l2 2 3.6-3.9" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={C.teal} style={{ flexShrink: 0 }}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

const pilotFeatures = [
  "7/24 otomatik hasta karşılama",
  "Çok dilli destek (TR, EN, DE, FR, AR, RU)",
  "Hasta niteleme ve sıcaklık skoru",
  "Canlı inbox paneli",
  "Anlık sıcak hasta bildirimleri",
  "Tek tıkla botu durdurma ve devralma",
];

const painPoints = [
  {
    icon: <ClockIcon />,
    title: "Gece gelen mesajlara geç yanıt",
    body: "Uluslararası hasta gece 23:00'te yazar. Sabah dönen mesaj çoktan rakibe gitmiş bir hastadır.",
  },
  {
    icon: <GlobeIcon />,
    title: "Yabancı dilde gelen sorulara cevap verememe",
    body: "Almanca veya Arapça gelen mesaja hazır cevabınız yoksa hasta güvenini ilk mesajda kaybedersiniz.",
  },
  {
    icon: <StackIcon />,
    title: "Yoğun saatlerde mesajların kaybolması",
    body: "Klinik dolu, telefon susmuyor. Okunmayan her WhatsApp mesajı sessizce listeden düşer.",
  },
];

const steps = [
  {
    title: "Hasta WhatsApp'tan yazıyor",
    body: "Yeni mesaj geldiği anda Welcaria devreye girer, hastanın dilini otomatik algılar.",
  },
  {
    title: "Welcaria anında doğru dilde karşılıyor ve niteliyor",
    body: "Tedavi, tarih ve iletişim bilgilerini profesyonel bir konuşma akışıyla toplar.",
  },
  {
    title: "Sıcak hasta size bildirilir, siz devralırsınız",
    body: "Nitelenen hasta anında ekibinize iletilir; görüşmeyi dilediğiniz yerden sürdürürsünüz.",
  },
];

const languages = [
  { code: "TR", name: "Türkçe" },
  { code: "EN", name: "English" },
  { code: "DE", name: "Deutsch" },
  { code: "FR", name: "Français" },
  { code: "AR", name: "العربية" },
  { code: "RU", name: "Русский" },
];

const chatMessages = [
  {
    fromPatient: true,
    lang: "DE",
    time: "23:47",
    text: "Guten Tag, ich interessiere mich für eine Haartransplantation. Wie läuft das ab?",
  },
  {
    fromPatient: false,
    lang: null,
    time: "23:47",
    text: "Guten Tag! Sehr gerne. Darf ich fragen, welche Methode Sie interessiert: FUE oder DHI?",
  },
  {
    fromPatient: true,
    lang: "EN",
    time: "23:51",
    text: "Hi, do you have availability next week for dental veneers?",
  },
  {
    fromPatient: false,
    lang: null,
    time: "23:51",
    text: "Hello! Yes, we have openings next week. Which day works best for you?",
  },
];

export default function LandingPage() {
  return (
    <div className={outfit.className} style={{ background: C.bg, color: C.text, minHeight: "100dvh" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .wrap { max-width: 1120px; margin: 0 auto; padding: 0 2rem; }
        @media (max-width: 640px) { .wrap { padding: 0 1.25rem; } }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 4rem;
          align-items: center;
          padding-top: 4.5rem;
          padding-bottom: 5rem;
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 3rem; padding-top: 3rem; padding-bottom: 3.5rem; }
          .hero-chat { max-width: 400px; margin: 0 auto; width: 100%; }
        }

        @media (prefers-reduced-motion: no-preference) {
          .hero-enter { animation: heroUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .hero-enter-late { animation: heroUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
          @keyframes heroUp {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }

        .pain-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
          margin-top: 3rem;
        }
        @media (max-width: 760px) {
          .pain-grid { grid-template-columns: 1fr; gap: 2rem; }
        }

        .btn-wa {
          background: ${C.whatsapp};
          color: #062b12;
          border: none;
          border-radius: 12px;
          padding: 1rem 2.25rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
          line-height: 1;
        }
        .btn-wa:hover { background: ${C.whatsappHover}; color: #fff; transform: translateY(-1px); }
        .btn-wa:active { transform: scale(0.98); }

        .btn-wa-block {
          background: ${C.whatsapp};
          color: #062b12;
          border: none;
          border-radius: 12px;
          padding: 1rem 1.75rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: block;
          width: 100%;
          text-align: center;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .btn-wa-block:hover { background: ${C.whatsappHover}; color: #fff; transform: translateY(-1px); }
        .btn-wa-block:active { transform: scale(0.98); }

        .nav-cta {
          background: ${C.whatsapp};
          color: #062b12;
          border-radius: 10px;
          padding: 0.55rem 1.2rem;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .nav-cta:hover { background: ${C.whatsappHover}; color: #fff; }

        .footer-mail { color: ${C.textOnDarkMuted}; text-decoration: none; transition: color 0.2s; }
        .footer-mail:hover { color: ${C.tealLight}; }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          background: C.bgDark,
          borderBottom: `1px solid ${C.borderOnDark}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="wrap"
          style={{ height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.035em" }}>
            Welcaria
          </span>
          <a href={WA_URL} className="nav-cta">
            Demo talep edin
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(1100px 520px at 78% -10%, rgba(13,148,136,0.22), transparent 62%), ${C.bgDark}`,
        }}
      >
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-enter">
              <h1
                style={{
                  fontSize: "clamp(2rem, 4.4vw, 3.05rem)",
                  fontWeight: 800,
                  lineHeight: 1.12,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  margin: "0 0 1.35rem",
                }}
              >
                WhatsApp&rsquo;tan gelen her hasta mesajını anında, doğru dilde karşılayın
              </h1>
              <p
                style={{
                  fontSize: "1.08rem",
                  color: C.textOnDarkMuted,
                  lineHeight: 1.7,
                  margin: "0 0 2.25rem",
                  maxWidth: "540px",
                }}
              >
                Welcaria, klinikler için 7/24 çalışan yapay zeka hasta karşılama sistemi. Türkçe, İngilizce,
                Almanca, Fransızca: hasta hangi dilde yazarsa yazsın, saniyeler içinde profesyonel yanıt.
              </p>
              <a href={WA_URL} className="btn-wa">
                Demo talep edin
              </a>
            </div>

            {/* WhatsApp chat mockup (dark theme) */}
            <div className="hero-chat hero-enter-late">
              <div
                style={{
                  background: "#0b141a",
                  border: `1px solid ${C.borderOnDark}`,
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 24px 70px rgba(2,6,18,0.55)",
                }}
              >
                <div
                  style={{
                    background: "#1f2c34",
                    padding: "0.8rem 1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "rgba(94,234,212,0.16)",
                      color: C.tealLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    KL
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#e9edef", lineHeight: 1.2 }}>
                      Kliniğiniz
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#8696a0" }}>çevrimiçi</div>
                  </div>
                </div>
                <div style={{ padding: "1rem 0.9rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.fromPatient ? "flex-start" : "flex-end" }}>
                      <div
                        style={{
                          background: m.fromPatient ? "#202c33" : "#005c4b",
                          color: "#e9edef",
                          borderRadius: m.fromPatient ? "12px 12px 12px 4px" : "12px 12px 4px 12px",
                          padding: "0.55rem 0.75rem 0.4rem",
                          fontSize: "0.82rem",
                          maxWidth: "84%",
                          lineHeight: 1.45,
                        }}
                      >
                        {m.text}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "0.4rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          {m.lang && (
                            <span
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                color: C.tealLight,
                                background: "rgba(94,234,212,0.13)",
                                borderRadius: "4px",
                                padding: "1px 5px",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {m.lang}
                            </span>
                          )}
                          <span style={{ fontSize: "0.64rem", color: "#8696a0" }}>{m.time}</span>
                          {!m.fromPatient && (
                            <svg width="13" height="9" viewBox="0 0 16 11" fill="none" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 5.5L4 8.5L9.5 1.5" />
                              <path d="M7 5.5L10 8.5L15.5 1.5" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ background: C.bg, padding: "5.5rem 0" }}>
        <div className="wrap">
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.15rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "560px",
            }}
          >
            Kaçırılan her mesaj, kaybedilen bir hasta demek
          </h2>
          <div className="pain-grid">
            {painPoints.map((p) => (
              <div key={p.title} style={{ borderTop: `2px solid ${C.tealBorder}`, paddingTop: "1.5rem" }}>
                {p.icon}
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.9rem 0 0.5rem", letterSpacing: "-0.01em" }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: "0.92rem", color: C.textMuted, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ background: C.bgAlt, padding: "5.5rem 0", borderTop: `1px solid ${C.border}` }}>
        <div className="wrap">
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.15rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              margin: "0 0 3rem",
            }}
          >
            Welcaria nasıl çalışır?
          </h2>

          <div style={{ maxWidth: "640px" }}>
            {steps.map((s, i) => (
              <div key={s.title} style={{ display: "flex", gap: "1.4rem", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: C.teal,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: "2px", flex: 1, background: C.tealBorder, margin: "6px 0" }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? "2.25rem" : 0 }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.45rem 0 0.4rem", letterSpacing: "-0.01em" }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "0.92rem", color: C.textMuted, lineHeight: 1.65, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "3rem",
              maxWidth: "640px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.teal}`,
              borderRadius: "14px",
              padding: "1.4rem 1.6rem",
              display: "flex",
              gap: "0.9rem",
              alignItems: "flex-start",
            }}
          >
            <PauseIcon />
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.3rem", letterSpacing: "-0.01em" }}>
                Tüm konuşmaları canlı izleyin, istediğiniz an devralın. Kontrol tamamen sizde.
              </p>
              <p style={{ fontSize: "0.9rem", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>
                Canlı inbox paneli her konuşmayı anlık gösterir; tek tıkla botu durdurup görüşmeyi kendiniz
                sürdürürsünüz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: C.bg, padding: "5.5rem 0" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 2.8vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.25,
              margin: "0 auto 2.5rem",
              maxWidth: "620px",
            }}
          >
            Diş, saç ekimi ve estetik kliniklerinde kullanılıyor
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.7rem",
              maxWidth: "620px",
              margin: "0 auto 2.5rem",
            }}
          >
            {languages.map((l) => (
              <span
                key={l.code}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: `1px solid ${C.border}`,
                  borderRadius: "999px",
                  padding: "0.5rem 1.05rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: C.text,
                  background: C.bgAlt,
                }}
              >
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: C.teal, letterSpacing: "0.05em" }}>
                  {l.code}
                </span>
                {l.name}
              </span>
            ))}
          </div>

          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              fontSize: "0.92rem",
              color: C.textMuted,
              margin: 0,
            }}
          >
            <ShieldIcon />
            Meta Business Partner teknolojisi ile güvenli WhatsApp entegrasyonu
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ background: C.bgAlt, padding: "5.5rem 0", borderTop: `1px solid ${C.border}` }}>
        <div className="wrap">
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.15rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              textAlign: "center",
              margin: "0 0 2.75rem",
            }}
          >
            Basit ve şeffaf fiyatlandırma
          </h2>

          <div
            style={{
              maxWidth: "460px",
              margin: "0 auto",
              background: C.bgDark,
              borderRadius: "20px",
              padding: "2.25rem 2rem",
              boxShadow: "0 24px 60px rgba(12,20,39,0.28)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: C.tealLight }}>Pilot Paket</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: C.tealLight,
                  background: "rgba(94,234,212,0.12)",
                  border: "1px solid rgba(94,234,212,0.25)",
                  borderRadius: "999px",
                  padding: "0.3rem 0.8rem",
                }}
              >
                2 hafta ücretsiz deneme
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginBottom: "1.75rem" }}>
              <span style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                $300
              </span>
              <span style={{ fontSize: "1rem", color: C.textOnDarkMuted, fontWeight: 500 }}>/ay</span>
            </div>

            <div style={{ borderTop: `1px solid ${C.borderOnDark}`, paddingTop: "1.5rem", marginBottom: "1.9rem" }}>
              {pilotFeatures.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    padding: "0.4rem 0",
                    fontSize: "0.92rem",
                    color: C.textOnDark,
                  }}
                >
                  <CheckIcon onDark />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <a href={WA_URL} className="btn-wa-block">
              Ücretsiz demo başlatın
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.bgDark, padding: "3rem 0" }}>
        <div
          className="wrap"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.035em" }}>
            Welcaria
          </span>
          <a href="mailto:info@welcaria.com" className="footer-mail" style={{ fontSize: "0.9rem" }}>
            info@welcaria.com
          </a>
          <span style={{ fontSize: "0.8rem", color: C.textOnDarkMuted }}>
            © {new Date().getFullYear()} Welcaria. Tüm hakları saklıdır.
          </span>
        </div>
      </footer>
    </div>
  );
}
