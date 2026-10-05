import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="hero-section" aria-label="Featured stays">
      <div className="hero-image-wrapper" aria-hidden="true">
        <img src="/hero-bg.jpg" alt="" className="hero-bg" aria-hidden="true" />
        <div className="hero-gradient" />
        {/* Ambient light particles */}
        <div className="hero-lights" aria-hidden="true">
          <span className="hero-light hero-light--1" />
          <span className="hero-light hero-light--2" />
          <span className="hero-light hero-light--3" />
        </div>
      </div>

      <div className="hero-content-wrapper">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            className="hero-eyebrow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            SHELTER / PREMIUM STAYS
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Discover Extraordinary
            <br />
            <span className="hero-title-accent">Places to Stay</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
          >
            Curated luxury accommodations for unforgettable experiences.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a href="#listings" className="hero-cta">
              Explore Stays
              <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <div className="hero-stat">
            <strong>500+</strong>
            <span>Premium stays</span>
          </div>
          <div className="hero-stat-divider" aria-hidden="true" />
          <div className="hero-stat">
            <strong>60+</strong>
            <span>Cities worldwide</span>
          </div>
          <div className="hero-stat-divider" aria-hidden="true" />
          <div className="hero-stat">
            <strong>4.9★</strong>
            <span>Average rating</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
