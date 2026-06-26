import Image from "next/image";

export default function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: "#35524A" }}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/images/logo-icon.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
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
        </a>

        <div className="hidden md:flex items-center gap-10">
          <a href="#how-it-works" className="nav-link type-label">
            How It Works
          </a>
          <a href="#industries" className="nav-link type-label">
            Industries
          </a>
          <a href="#pricing" className="nav-link type-label">
            Pricing
          </a>
        </div>

        <a
          href="#contact"
          className="btn-primary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
        >
          Book a Demo
        </a>
      </nav>
    </header>
  );
}
