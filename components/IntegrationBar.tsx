// Moving integration row — logos scroll right-to-left and loop seamlessly.
// Assets live in /public/logos (already trimmed to their content). Each logo
// carries its own `h` (rendered height in px) so wide wordmarks and square
// icons read at the same optical weight. The row auto-duplicates for the loop,
// so you only list each logo once.

type Logo = { src: string; alt: string; h: number };

const logos: Logo[] = [
  { src: "/logos/anthropic.png", alt: "Anthropic", h: 24 },
  { src: "/logos/retell.svg", alt: "Retell AI", h: 30 },
  { src: "/logos/gohighlevel.png", alt: "GoHighLevel", h: 28 },
  { src: "/logos/twilio.png", alt: "Twilio", h: 32 },
  { src: "/logos/gmail.png", alt: "Gmail", h: 40 },
  { src: "/logos/google-drive.png", alt: "Google Drive", h: 44 },
];

export default function IntegrationBar() {
  return (
    <div className="mf-marquee" aria-label="Tools MannaFlow works with">
      <div className="mf-marquee-track">
        {/* Two identical sets; the animation shifts one full set width. */}
        {[0, 1].map((set) => (
          <ul className="mf-marquee-set" aria-hidden={set === 1} key={set}>
            {logos.map((logo) => (
              <li className="mf-marquee-item" key={`${set}-${logo.alt}`}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  style={{ height: logo.h }}
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
