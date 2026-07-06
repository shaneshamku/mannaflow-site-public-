export default function AgencyIntro() {
  return (
    <section
      id="about"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-14 md:py-20"
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(1.15rem, 2.6vw, 1.5rem)",
            fontWeight: 400,
            fontVariationSettings: "'opsz' 48, 'wght' 400",
            lineHeight: 1.7,
            color: "#031D2A",
          }}
        >
          MannaFlow helps contractors respond faster,{" "}
          <br className="mf-br" />
          book more jobs, and stop letting{" "}
          <br className="mf-br" />
          good leads slip through the cracks.
        </p>
      </div>
    </section>
  );
}
