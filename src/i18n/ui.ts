export const languages = {
  hr: "HR",
  en: "EN",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "hr";

export const routes: Record<Lang, Record<string, string>> = {
  hr: {
    home: "/",
    "our-story": "/nasa-prica",
    details: "/detalji",
    rsvp: "/rsvp",
    travel: "/putovanje",
    registry: "/registar",
  },
  en: {
    home: "/en",
    "our-story": "/en/our-story",
    details: "/en/details",
    rsvp: "/en/rsvp",
    travel: "/en/travel",
    registry: "/en/registry",
  },
};

export const sections: Record<string, { enabled: boolean }> = {
  home: { enabled: true },
  "our-story": { enabled: true },
  details: { enabled: true },
  rsvp: { enabled: true },
  travel: { enabled: false },
  registry: { enabled: false },
};

export const ui: Record<Lang, Record<string, string>> = {
  hr: {
    // Meta
    "meta.title": "Tea i Mak — Svadba",
    "meta.description": "Pridružite nam se na proslavi ljubavi! 30. svibnja 2026.",

    // Nav
    "nav.home": "Početna",
    "nav.our-story": "Naša priča",
    "nav.details": "Detalji",
    "nav.rsvp": "RSVP",
    "nav.travel": "Putovanje",
    "nav.registry": "Registar",

    // Home
    "home.subtitle": "Ženimo se!",
    "home.date": "30. svibnja 2026.",
    "home.invite": "S radošću vas pozivamo da proslavite ovaj poseban dan s nama.",
    "home.cta": "Potvrdite dolazak",

    // Countdown
    "countdown.days": "dana",
    "countdown.hours": "sati",
    "countdown.minutes": "minuta",
    "countdown.seconds": "sekundi",

    // Our Story
    "story.title": "Naša priča",
    "story.content": "Sadržaj stiže uskoro...",

    // Details
    "details.title": "Detalji vjenčanja",
    "details.when": "Kada",
    "details.where": "Gdje",
    "details.date": "30. svibnja 2026.",
    "details.venue": "Medvedgrad, Himper ul. 16",
    "details.ceremony": "Vjenčanje",
    "details.reception": "Večera",
    "details.schedule": "Raspored",
    "details.gathering": "Okupljanje",
    "details.gathering.time": "17:00 h",
    "details.ceremony.time": "18:30 h",
    "details.reception.time": "19:00 h",
    "details.dresscode": "Dress code",
    "details.dresscode.desc": "Svečano odijevanje",
    "details.playlist": "Naša playlista",

    // RSVP
    "rsvp.title": "Potvrdite dolazak",
    "rsvp.description":
      "Molimo vas da potvrdite svoj dolazak do 30. travnja 2026.",
    "rsvp.name": "Ime i prezime",
    "rsvp.name.placeholder": "Vaše puno ime",
    "rsvp.attending": "Dolazite li?",
    "rsvp.attending.yes": "Da, dolazim!",
    "rsvp.attending.no": "Nažalost, ne mogu",
    "rsvp.dietary": "Posebni zahtjevi prehrane",
    "rsvp.dietary.placeholder": "Alergije, vegetarijanstvo, itd.",
    "rsvp.add-guest": "Dodaj osobu",
    "rsvp.remove-guest": "Ukloni",
    "rsvp.additional-guest": "Dodatni gost",
    "rsvp.guest-name": "Ime i prezime",
    "rsvp.guest-name.placeholder": "Puno ime gosta",
    "rsvp.guest-dietary.placeholder": "Posebni zahtjevi prehrane (ako ima)",
    "rsvp.accommodation": "Trebate li pomoć sa smještajem?",
    "rsvp.accommodation.yes": "Da, trebam pomoć",
    "rsvp.accommodation.no": "Ne, imam smještaj",
    "rsvp.song": "Pjesma za plesni podij",
    "rsvp.song.placeholder": "Koja pjesma vas tjera na ples?",
    "rsvp.message": "Poruka za mladence",
    "rsvp.message.placeholder": "Napišite nam nešto lijepo...",
    "rsvp.submit": "Pošalji",
    "rsvp.sending": "Šaljem...",
    "rsvp.success": "Hvala! Vaša potvrda je zaprimljena.",
    "rsvp.error": "Nešto je pošlo po krivu. Pokušajte ponovo.",

    // Coming Soon
    "coming-soon.title": "Uskoro",
    "coming-soon.description": "Ovaj dio stranice je u pripremi. Pratite nas!",

    // Travel
    "travel.title": "Putovanje i smještaj",

    // Registry
    "registry.title": "Registar",

    // Footer
    "footer.made-with": "Napravljeno s",
    "footer.for": "za naš poseban dan",

    // Password page
    "password.title": "Tea i Mak",
    "password.instruction": "Unesite lozinku s pozivnice",
  },
  en: {
    // Meta
    "meta.title": "Tea & Mak — Wedding",
    "meta.description":
      "Join us in celebrating love! May 30th, 2026.",

    // Nav
    "nav.home": "Home",
    "nav.our-story": "Our Story",
    "nav.details": "Details",
    "nav.rsvp": "RSVP",
    "nav.travel": "Travel",
    "nav.registry": "Registry",

    // Home
    "home.subtitle": "We're getting married!",
    "home.date": "May 30, 2026",
    "home.invite":
      "We joyfully invite you to celebrate this special day with us.",
    "home.cta": "RSVP Now",

    // Countdown
    "countdown.days": "days",
    "countdown.hours": "hours",
    "countdown.minutes": "minutes",
    "countdown.seconds": "seconds",

    // Our Story
    "story.title": "Our Story",
    "story.content": "Content coming soon...",

    // Details
    "details.title": "Wedding Details",
    "details.when": "When",
    "details.where": "Where",
    "details.date": "May 30, 2026",
    "details.venue": "Medvedgrad, Himper ul. 16",
    "details.ceremony": "Ceremony",
    "details.reception": "Dinner",
    "details.schedule": "Schedule",
    "details.gathering": "Gathering",
    "details.gathering.time": "5:00 PM",
    "details.ceremony.time": "6:30 PM",
    "details.reception.time": "7:00 PM",
    "details.dresscode": "Dress Code",
    "details.dresscode.desc": "Formal attire",
    "details.playlist": "Our Playlist",

    // RSVP
    "rsvp.title": "RSVP",
    "rsvp.description": "Please confirm your attendance by April 30, 2026.",
    "rsvp.name": "Full Name",
    "rsvp.name.placeholder": "Your full name",
    "rsvp.attending": "Will you attend?",
    "rsvp.attending.yes": "Yes, I'll be there!",
    "rsvp.attending.no": "Sorry, I can't make it",
    "rsvp.dietary": "Dietary Requirements",
    "rsvp.dietary.placeholder": "Allergies, vegetarian, etc.",
    "rsvp.add-guest": "Add a person",
    "rsvp.remove-guest": "Remove",
    "rsvp.additional-guest": "Additional guest",
    "rsvp.guest-name": "Full Name",
    "rsvp.guest-name.placeholder": "Guest's full name",
    "rsvp.guest-dietary.placeholder": "Dietary requirements (if any)",
    "rsvp.accommodation": "Do you need help with accommodation?",
    "rsvp.accommodation.yes": "Yes, I need help",
    "rsvp.accommodation.no": "No, I have accommodation",
    "rsvp.song": "Song Request",
    "rsvp.song.placeholder": "What song gets you on the dance floor?",
    "rsvp.message": "Message for the Couple",
    "rsvp.message.placeholder": "Write us something lovely...",
    "rsvp.submit": "Submit",
    "rsvp.sending": "Sending...",
    "rsvp.success": "Thank you! Your RSVP has been received.",
    "rsvp.error": "Something went wrong. Please try again.",

    // Coming Soon
    "coming-soon.title": "Coming Soon",
    "coming-soon.description":
      "This section is under preparation. Stay tuned!",

    // Travel
    "travel.title": "Travel & Accommodation",

    // Registry
    "registry.title": "Registry",

    // Footer
    "footer.made-with": "Made with",
    "footer.for": "for our special day",

    // Password page
    "password.title": "Tea & Mak",
    "password.instruction": "Enter the password from your invitation",
  },
};
