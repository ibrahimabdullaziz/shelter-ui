import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";

interface GalleryProps {
  images?: string[];
  alt?: string;
}

export function Gallery({
  images = [],
  alt = "Unit gallery image",
}: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const target = event.target;
      if (
        images.length === 0 ||
        !(target instanceof HTMLElement) ||
        !target.closest('[aria-label="Photo gallery"]')
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex(
          (current) => (current - 1 + images.length) % images.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = () =>
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const lightboxNext = () =>
    setLightboxIndex((i) => (i + 1) % images.length);

  if (!images.length) {
    return (
      <div
        className="unit-gallery-empty"
        role="img"
        aria-label="No photos available"
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
    <>
      <div className="unit-gallery" role="region" aria-label="Photo gallery">
        <div
          className="unit-gallery-stage"
          onClick={() => openLightbox(activeIndex)}
          title="Click to view fullscreen"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={`${activeIndex}-${activeImage}`}
              className="unit-gallery-image"
              src={activeImage}
              alt={alt}
              decoding="async"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <Button
                className="unit-gallery-control unit-gallery-control--previous"
                variant="secondary"
                type="button"
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); showPrevious(); }}
              >
                <span aria-hidden="true">←</span>
              </Button>
              <Button
                className="unit-gallery-control unit-gallery-control--next"
                variant="secondary"
                type="button"
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
              >
                <span aria-hidden="true">→</span>
              </Button>
              <span className="unit-gallery-count" aria-live="polite">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}

          <span className="unit-gallery-expand-hint" aria-hidden="true">
            ⛶ Expand
          </span>
        </div>

        {images.length > 1 && (
          <div
            className="unit-gallery-thumbnails"
            aria-label="Gallery thumbnails"
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                className={`unit-gallery-thumbnail${index === activeIndex ? " is-active" : ""}`}
                type="button"
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        size="large"
        label="Photo lightbox"
      >
        <div className="lightbox-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${alt} ${lightboxIndex + 1}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                className="lightbox-control lightbox-control--prev"
                type="button"
                aria-label="Previous photo"
                onClick={lightboxPrev}
              >
                ←
              </button>
              <button
                className="lightbox-control lightbox-control--next"
                type="button"
                aria-label="Next photo"
                onClick={lightboxNext}
              >
                →
              </button>
              <span className="lightbox-count">
                {lightboxIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
