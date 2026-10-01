import { useState } from "react";

interface GalleryProps {
  images?: string[];
  alt?: string;
}

const defaultImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
];

export function Gallery({
  images = defaultImages,
  alt = "Unit gallery image",
}: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div
        style={{
          height: "220px",
          background: "#edf3f1",
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          color: "#355045",
        }}
      >
        No photos available
      </div>
    );
  }

  const activeImage = images[activeIndex];

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const showNext = () =>
    setActiveIndex((current) => (current + 1) % images.length);

  return (
    <div
      role="region"
      aria-label="Photo gallery"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          showNext();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPrevious();
        }
      }}
      style={{ display: "grid", gap: "12px" }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #dfe6e3",
          background: "#edf3f1",
        }}
      >
        <img
          src={activeImage}
          alt={alt}
          style={{
            display: "block",
            width: "100%",
            height: "320px",
            objectFit: "cover",
          }}
        />

        <button
          type="button"
          aria-label="Previous image"
          onClick={showPrevious}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#173b34",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            width: "36px",
            height: "36px",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <button
          type="button"
          aria-label="Next image"
          onClick={showNext}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#173b34",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            width: "36px",
            height: "36px",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          →
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(68px, 1fr))",
          gap: "8px",
        }}
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            style={{
              border:
                index === activeIndex
                  ? "2px solid #1f594c"
                  : "1px solid #dfe6e3",
              borderRadius: "10px",
              overflow: "hidden",
              padding: 0,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <img
              src={image}
              alt={`${alt} ${index + 1}`}
              style={{
                display: "block",
                width: "100%",
                height: "68px",
                objectFit: "cover",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
