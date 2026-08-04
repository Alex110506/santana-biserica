/**
 * Static site content and the bundled DEFAULTS for the editable sections.
 * Editable content (about, schedule, gallery, clergy, events) now comes from
 * the backend — the data here is the fallback shown until the admin publishes
 * something (or when the API is unreachable).
 */

import { isoDaysFromNow } from "../lib/dates.js";

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

/**
 * Only priests are listed in „Preoți și cler” (no cântăreț, paracliser etc.).
 * `startYear`/`endYear` give the years of ministry at the parish; `current: true`
 * means still serving („încă în funcție”), in which case `endYear` is ignored.
 */
export const clergy = [
  { name: "Pr. Nicolae Rădulescu", role: "Preot paroh", startYear: 1998, endYear: null, current: true },
];

/**
 * Dated events shown in „Anunțuri și evenimente”.
 * `source: "calendar"` marks entries that come from the automatic
 * Orthodox-calendar scraper (read-only in the admin dashboard);
 * `source: "manual"` entries are added by the parish admin.
 * `holiday: true` = red-letter day in the church calendar — rendered with a
 * red date so visitors can tell the big feasts from parish announcements.
 * A few manual dates are relative to today so the demo always has upcoming items.
 */
export const events = [
  {
    id: "ev-seara-duhovniceasca",
    date: isoDaysFromNow(3),
    time: "18:00",
    title: "Seară duhovnicească",
    desc: "Vecernie și cuvânt de învățătură, urmate de un ceai în sala parohială.",
    source: "manual",
    holiday: false,
  },
  {
    id: "ev-pelerinaj",
    date: isoDaysFromNow(12),
    time: "07:30",
    title: "Pelerinaj la Mănăstirea Hodoș-Bodrog",
    desc: "Plecare din fața bisericii. Înscrieri la pangar până joi.",
    source: "manual",
    holiday: false,
  },
  {
    id: "ev-colecta",
    date: isoDaysFromNow(25),
    title: "Colectă pentru familiile nevoiașe",
    desc: "Alimente neperisabile și rechizite pentru începutul anului școlar.",
    source: "manual",
    holiday: false,
  },
  {
    id: "ev-sf-ilie",
    date: "2026-07-20",
    title: "Sf. Proroc Ilie Tesviteanul",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-schimbarea-la-fata",
    date: "2026-08-06",
    title: "Schimbarea la Față a Domnului",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-adormirea-md",
    date: "2026-08-15",
    title: "Adormirea Maicii Domnului",
    desc: "Sfânta Liturghie, urmată de binecuvântarea strugurilor.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-taierea-capului",
    date: "2026-08-29",
    title: "Tăierea capului Sf. Ioan Botezătorul",
    desc: "Zi de post. Sfânta Liturghie.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-nasterea-md",
    date: "2026-09-08",
    title: "Nașterea Maicii Domnului",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-inaltarea-sf-cruci",
    date: "2026-09-14",
    title: "Înălțarea Sfintei Cruci",
    desc: "Zi de post. Sfânta Liturghie și cinstirea Sfintei Cruci.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-sf-parascheva",
    date: "2026-10-14",
    title: "Sf. Cuvioasă Parascheva",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-sf-dimitrie",
    date: "2026-10-26",
    title: "Sf. M. Mc. Dimitrie, Izvorâtorul de mir",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-sf-arhangheli",
    date: "2026-11-08",
    title: "Sf. Arhangheli Mihail și Gavriil",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-intrarea-in-biserica",
    date: "2026-11-21",
    title: "Intrarea Maicii Domnului în Biserică",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-sf-andrei",
    date: "2026-11-30",
    title: "Sf. Apostol Andrei, Ocrotitorul României",
    desc: "Sfânta Liturghie de sărbătoare.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-sf-nicolae",
    date: "2026-12-06",
    title: "Sf. Ierarh Nicolae",
    desc: "Slujbă și daruri pentru copiii parohiei.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-craciun",
    date: "2026-12-25",
    title: "Nașterea Domnului (Crăciunul)",
    desc: "Sfânta Liturghie de sărbătoare, cu colinde.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-boboteaza",
    date: "2027-01-06",
    title: "Botezul Domnului (Boboteaza)",
    desc: "Sfânta Liturghie și sfințirea mare a apei.",
    source: "calendar",
    holiday: true,
  },
  {
    id: "ev-hram",
    date: "2027-04-23",
    title: "Hramul bisericii - Sf. M. Mc. Gheorghe",
    desc: "Sfântă Liturghie arhierească și agapă în curtea bisericii.",
    source: "manual",
    holiday: false,
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
