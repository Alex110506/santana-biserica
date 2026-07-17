/**
 * All site content lives here — texts, schedule, people, events, contact.
 * Edit this file to update the site; the components only render it.
 */

export const parish = {
  shortName: "Sf. M. Mc. Gheorghe",
  subtitle: "Parohia Sântana I · Arad",
  fullName: "Parohia Ortodoxă Română Sântana I",
  motto: "„Casa Mea, casă de rugăciune se va chema.”",
  psalm: "Doamne, iubit-am frumusețea casei Tale (Ps. 25, 8)",
};

export const navLinks = [
  { href: "#despre", label: "Despre" },
  { href: "#program", label: "Program" },
  { href: "#galerie", label: "Galerie" },
  { href: "#cler", label: "Cler" },
  { href: "#anunturi", label: "Anunțuri" },
  { href: "#contact", label: "Contact" },
];

export const heroImage = "/assets/church-front-cloudy.png";

export const galleryImages = [
  { src: "/assets/church-front-cloudy.png", alt: "Fața bisericii, dinspre curtea cu trandafiri" },
  { src: "/assets/church-facade.png", alt: "Turnul-clopotniță și pridvorul, în soare" },
  { src: "/assets/church-towers.png", alt: "Turlele acoperite cu aramă" },
  { src: "/assets/church-entrance.png", alt: "Pridvorul și intrarea principală" },
  { src: "/assets/church-apse.png", alt: "Absida altarului, dinspre răsărit" },
  { src: "/assets/church-side.png", alt: "Vedere laterală a locașului" },
];

/** Rows shown in the „Programul slujbelor” section. */
export const weeklyProgram = [
  { day: "Duminică", service: "Utrenia, apoi Sfânta Liturghie", time: "8:00 · 10:00" },
  { day: "Miercuri", service: "Sfânta Liturghie", time: "8:00" },
  { day: "Vineri", service: "Paraclisul Maicii Domnului", time: "8:00" },
  { day: "Sâmbătă", service: "Vecernia", time: "18:00" },
  { day: "Sărbători", service: "Utrenia, apoi Sfânta Liturghie", time: "8:00 · 10:00" },
];

/** Machine-readable schedule used to compute the next service (dow: 0 = Sunday). */
export const serviceTimes = [
  { dow: 0, hour: 8, name: "Utrenia" },
  { dow: 0, hour: 10, name: "Sfânta Liturghie" },
  { dow: 3, hour: 8, name: "Sfânta Liturghie" },
  { dow: 5, hour: 8, name: "Paraclisul Maicii Domnului" },
  { dow: 6, hour: 18, name: "Vecernia" },
];

export const clergy = [
  { name: "Pr. Nicolae Rădulescu", role: "Preot paroh" },
  { name: "Pr. Andrei Munteanu", role: "Preot coslujitor" },
  { name: "Ioan Bota", role: "Cântăreț bisericesc" },
];

export const events = [
  {
    day: "23",
    month: "Aprilie",
    title: "Hramul bisericii",
    desc: "Sfântul Mare Mucenic Gheorghe — Sfântă Liturghie și agapă în curtea bisericii.",
  },
  {
    day: "18",
    month: "Aprilie",
    title: "Deniile din Săptămâna Mare",
    desc: "Slujbele Deniilor, în fiecare seară de la ora 18:00.",
  },
  {
    day: "15",
    month: "August",
    title: "Adormirea Maicii Domnului",
    desc: "Sfânta Liturghie, urmată de binecuvântarea strugurilor.",
  },
  {
    day: "6",
    month: "Decembrie",
    title: "Sfântul Nicolae",
    desc: "Slujbă și daruri pentru copiii parohiei.",
  },
];

export const contactRows = [
  { label: "Adresă", value: "Str. Ion Creangă nr. 5, Sântana 317280, județul Arad" },
  { label: "Telefon", value: "+40 744 779 270" },
  { label: "E-mail", value: "parohia.ortodoxa.romana.santana.I@gmail.com" },
  { label: "Cancelaria parohială", value: "Luni - Vineri, 9:00 - 13:00" },
];

export const footerAddress = ["Str. Ion Creangă nr. 5", "Sântana 317280, jud. Arad", "+40 744 779 270"];

const mapsQuery = encodeURIComponent("Biserica Ortodoxă Sf. M. Mucenic Gheorghe, Sântana, Arad");
export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
export const mapsEmbed = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
