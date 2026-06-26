interface QuoteBlockProps {
  image: string;
  alt: string;
  height?: string;
  position?: string;
}

export default function QuoteBlock({
  image,
  alt,
  height = "65vh",
}: QuoteBlockProps) {
  return (
    <section
      className="w-full relative"
      style={{
        height,
        backgroundImage: "url('/images/bg-3.jfif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src={image}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </section>
  );
}
