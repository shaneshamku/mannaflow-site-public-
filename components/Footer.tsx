import Image from "next/image";

const platformLinks = [
  { label: "Chat Agent", href: "#services" },
  { label: "Voice Agent", href: "#services" },
  { label: "Dashboard", href: "#services" },
];

const companyLinks = [
  { label: "Industries", href: "#industries" },
  { label: "Pricing", href: "#pricing" },
  { label: "Book a Demo", href: "#contact" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#35524A" }} className="py-10 md:py-16">
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
                mannaflow
              </span>
            </div>
            <p className="type-body" style={{ color: "#A2E8DD" }}>
              Automation for HVAC contractors. More leads captured, fewer calls missed.
            </p>
          </div>

          <div className="flex gap-10 md:gap-16">
            <div>
              <p
                className="type-label mb-4 md:mb-5"
                style={{ color: "#779CAB", letterSpacing: "0.15em" }}
              >
                Platform
              </p>
              <ul className="space-y-3">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="type-body nav-link"
                      style={{ color: "#A2E8DD" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p
                className="type-label mb-4 md:mb-5"
                style={{ color: "#779CAB", letterSpacing: "0.15em" }}
              >
                Company
              </p>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="type-body nav-link"
                      style={{ color: "#A2E8DD" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <hr className="rule-mid mb-5 md:mb-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
          <p
            className="type-label"
            style={{ color: "#627C85", letterSpacing: "0.12em" }}
          >
            &copy; 2026 mannaflow. All rights reserved.
          </p>
          <p
            className="type-label"
            style={{ color: "#627C85", letterSpacing: "0.12em" }}
          >
            automation for local businesses
          </p>
        </div>
      </div>
    </footer>
  );
}
