import Image from "next/image";

const footerLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Who It Helps", href: "/contractors" },
  { label: "See Demo", href: "/demo" },
  { label: "Book a Demo", href: "/book-demo" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#14181A" }} className="py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12 mb-10 md:mb-16">
          <div style={{ maxWidth: "28ch" }}>
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <Image
                src="/images/logo-icon.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <span
                style={{
                  color: "#F5F2EC",
                  fontFamily: "'MontaguSlab', Georgia, serif",
                  fontWeight: 600,
                  fontVariationSettings: "'opsz' 36, 'wght' 600",
                  fontSize: "1.125rem",
                  letterSpacing: "-0.01em",
                }}
              >
                MannaFlow
              </span>
            </div>
            <p className="type-body" style={{ color: "#8A9BA3" }}>
              MannaFlow helps contractors respond faster, follow up
              consistently, and save time on every lead.
            </p>
          </div>

          <div>
            <p
              className="type-label mb-4 md:mb-5"
              style={{ color: "#8A9BA3", letterSpacing: "0.15em" }}
            >
              Company
            </p>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="type-body nav-link"
                    style={{ color: "#8A9BA3" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="rule-mid mb-5 md:mb-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
          <p
            className="type-label"
            style={{ color: "#8A9BA3", letterSpacing: "0.12em" }}
          >
            &copy; 2026 MannaFlow. All rights reserved.
          </p>
          <p
            className="type-label"
            style={{ color: "#8A9BA3", letterSpacing: "0.12em" }}
          >
            Saving time and money on every lead
          </p>
        </div>
      </div>
    </footer>
  );
}
