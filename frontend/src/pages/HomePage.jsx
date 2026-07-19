import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Hero from "../components/sections/Hero.jsx";
import NextServiceStrip from "../components/sections/NextServiceStrip.jsx";
import About from "../components/sections/About.jsx";
import Schedule from "../components/sections/Schedule.jsx";
import Gallery from "../components/sections/Gallery.jsx";
import Clergy from "../components/sections/Clergy.jsx";
import Announcements from "../components/sections/Announcements.jsx";
import Contact from "../components/sections/Contact.jsx";
import usePageMeta from "../hooks/usePageMeta.js";

/** Public landing page. Intentionally exposes no link to the admin login. */
export default function HomePage() {
  // Re-assert the defaults from index.html after client-side navigation
  // (e.g. coming back from the noindex-ed login page).
  usePageMeta({
    title: "Biserica Ortodoxă „Sf. M. Mc. Gheorghe” - Parohia Sântana I, Arad",
    robots: "index, follow",
  });

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <main>
        <NextServiceStrip />
        <About />
        <Schedule />
        <Gallery />
        <Clergy />
        <Announcements />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
