import Image from "next/image";

export default function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100]"
      style={{ backgroundColor: "#101b1b" }}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[65px] md:h-16">
        <a href="/" className="flex items-center gap-3 shrink-0" aria-label="MannaFlow home">
          <Image
            src="/images/logo-icon.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span
            className="hidden sm:inline"
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
        </a>

        <div className="hidden md:flex items-center gap-10">
          <a href="/" className="nav-link type-label">
            Home Page
          </a>
          <a href="/how-it-works" className="nav-link type-label">
            How It Works
          </a>
          <a href="/contractors" className="nav-link type-label">
            Who We Help
          </a>
          <a href="/demo" className="nav-link type-label">
            See Demo
          </a>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <a
            href="/login"
            className="inline-flex items-center justify-center h-[39px] px-3 md:px-5 md:min-w-[90px] whitespace-nowrap text-[0.7rem] md:text-xs"
            style={{
              backgroundColor: "transparent",
              color: "#D8DED8",
              fontFamily: "'MontaguSlab', Georgia, serif",
              fontWeight: 700,
              fontVariationSettings: "'opsz' 36, 'wght' 700",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "10px",
              border: "1px solid #2A3134",
            }}
          >
            Sign In
          </a>

          <a
            href="/book-demo"
            className="inline-flex items-center justify-center h-[39px] px-3 md:px-5 md:min-w-[135px] whitespace-nowrap text-[0.7rem] md:text-xs"
            style={{
              backgroundColor: "#12633b",
              color: "#D8DED8",
              fontFamily: "'MontaguSlab', Georgia, serif",
              fontWeight: 700,
              fontVariationSettings: "'opsz' 36, 'wght' 700",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "10px",
              border: "none",
            }}
          >
            Book a Demo
          </a>
        </div>
      </nav>
    </header>
  );
}
