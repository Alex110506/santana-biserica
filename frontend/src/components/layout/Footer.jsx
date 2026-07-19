import { footerAddress, navLinks, parish } from "../../data/site.js";
import CrossIcon from "../ui/CrossIcon.jsx";

export default function Footer() {
  return (
    <footer className="bg-night px-[34px] pt-16 pb-10 text-night-soft">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-start justify-between gap-10">
        <div className="max-w-[340px]">
          <div className="mb-[18px] flex items-center gap-3">
            <CrossIcon className="text-gold" />
            <span className="font-heading text-xl text-cream">{parish.shortName}</span>
          </div>
          <p className="text-[14.5px] leading-[1.8] text-night-mute">
            {parish.fullName}, Protopopiatul Arad. {parish.motto}
          </p>
        </div>

        <div className="flex flex-wrap gap-14">
          <div>
            <div className="mb-3.5 text-[11px] tracking-[.2em] text-gold uppercase">Navigare</div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-[5px] text-[14.5px] text-night-soft no-underline hover:text-gold-light"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div>
            <div className="mb-3.5 text-[11px] tracking-[.2em] text-gold uppercase">Contact</div>
            <address className="text-[14.5px] leading-[1.9] text-night-mute not-italic">
              {footerAddress.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </address>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-11 flex max-w-[1120px] flex-wrap justify-between gap-3 border-t border-night-soft/16 pt-6 text-[12.5px] text-night-dim">
        <span>
          © {new Date().getFullYear()} Parohia „{parish.shortName}”, Sântana I
        </span>
        <span>{parish.psalm}</span>
      </div>
    </footer>
  );
}
