export default function TopoBand() {
  return (
    <section
      className="relative flex items-center justify-center text-center"
      style={{
        minHeight: "60vh",
        backgroundImage: "url('/images/bg-topo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Solid overlay — not a gradient */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(16, 20, 22, 0.74)" }}
      />

      <div className="relative z-10 px-6 py-20">
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)",
            fontWeight: 300,
            fontVariationSettings: "'opsz' 48, 'wght' 300",
            lineHeight: 1.4,
            color: "#C9CFCC",
            letterSpacing: "0.01em",
            marginBottom: "0.25em",
          }}
        >
          Your team handles the job.
        </p>
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            fontWeight: 100,
            fontVariationSettings: "'opsz' 120, 'wght' 100",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: "#32DE8A",
          }}
        >
          MannaFlow handles the follow-up.
        </p>
        <p
          className="type-label mt-10"
          style={{ color: "#8A9BA3", letterSpacing: "0.18em" }}
        >
          Fast responses, cleaner handoffs, fewer leads slipping through
        </p>
      </div>
    </section>
  );
}
