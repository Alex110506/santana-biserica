import { useEffect, useState } from "react";
import { galleryImages } from "../../data/site.js";
import useContent from "../../hooks/useContent.js";
import { getGallery } from "../../lib/content.js";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion.js";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

const AUTOPLAY_MS = 5500;

// Bundled placeholders, shown until the parish uploads its own photos.
const FALLBACK = {
  images: galleryImages.map((img) => ({ id: img.src, url: img.src, caption: img.alt })),
};

/**
 * Cross-fading photo carousel over the admin-managed gallery. Autoplays until
 * the visitor takes over with the arrows or thumbnails; never autoplays under
 * reduced motion.
 */
export default function Gallery() {
  const gallery = useContent(getGallery, FALLBACK);
  // An emptied-out gallery (all photos deleted) also falls back, so the
  // carousel never runs on zero slides.
  const images = gallery.images.length ? gallery.images : FALLBACK.images;

  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // If the image set changes (server data arrives), restart from the first.
  useEffect(() => {
    setIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [paused, reduced, images.length]);

  const show = (i) => {
    setPaused(true);
    setIndex((i + images.length) % images.length);
  };

  const current = images[index] ?? images[0];

  return (
    <section id="galerie" className="scroll-mt-[70px] px-[34px] py-[clamp(64px,9vw,120px)]">
      <Reveal className="mx-auto max-w-[1120px]">
        <SectionHeading kicker="Priveliști ale locașului" title="Galerie foto" className="mb-12" />
      </Reveal>

      <Reveal className="mx-auto max-w-[1000px]">
        <div className="plate relative aspect-[16/10] overflow-hidden shadow-[0_14px_40px_rgba(45,43,43,.2)]">
          {images.map((img, i) => (
            <img
              key={img.id}
              src={img.url}
              alt={img.caption}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${
                i === index ? "z-[2] opacity-100" : "z-[1] opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-x-0 bottom-0 z-[5] flex items-end justify-between gap-4 bg-[linear-gradient(180deg,transparent,rgba(20,22,28,.66))] px-[26px] pt-11 pb-5">
            <span className="font-heading text-[clamp(17px,2.4vw,24px)] text-cream [text-shadow:0_1px_10px_rgba(0,0,0,.5)]">
              {current.caption}
            </span>
            <span className="text-[13px] whitespace-nowrap text-cream/80 tabular-nums">
              {index + 1} / {images.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => show(index - 1)}
            aria-label="Imaginea anterioară"
            className="absolute top-1/2 left-4 z-[6] h-[46px] w-[46px] -translate-y-1/2 cursor-pointer rounded-full border-none bg-[rgba(28,25,21,.42)] text-xl text-cream backdrop-blur-[4px] transition-colors duration-300 hover:bg-[rgba(28,25,21,.72)]"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => show(index + 1)}
            aria-label="Imaginea următoare"
            className="absolute top-1/2 right-4 z-[6] h-[46px] w-[46px] -translate-y-1/2 cursor-pointer rounded-full border-none bg-[rgba(28,25,21,.42)] text-xl text-cream backdrop-blur-[4px] transition-colors duration-300 hover:bg-[rgba(28,25,21,.72)]"
          >
            ›
          </button>
        </div>

        <div className="mt-[22px] flex flex-wrap justify-center gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => show(i)}
              aria-label={img.caption || `Imaginea ${i + 1}`}
              aria-current={i === index}
              className={`h-11 w-16 cursor-pointer overflow-hidden rounded border-2 bg-transparent p-0 transition-[opacity,border-color] duration-350 ${
                i === index ? "border-burgundy opacity-100" : "border-transparent opacity-50"
              }`}
            >
              <img
                src={img.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
