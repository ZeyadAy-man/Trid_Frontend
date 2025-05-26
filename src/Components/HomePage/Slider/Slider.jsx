import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import styles from "./Slider.module.css";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderImages = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    "/sporting-goods-minimal-3-middle.png",
    "/sporting-goods-minimal-1-middle.png",
    "/sporting-goods-product-1.png",
    "/sporting-goods-product-3.jpg",
    "/sporting-goods-product-4.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  return (
    <div className={styles.heroSection}>
      <div className={styles.sliderContainer}>
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`${styles.slide} ${
              index === currentSlide ? styles.slideActive : ""
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className={styles.slideImage}
            />
            <div className={styles.slideOverlay} />
          </div>
        ))}
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroWelcome}>
          <Sparkles className={styles.heroWelcomeIcon} />
          <span className={styles.heroWelcomeText}>Welcome to the Future</span>
        </div>
        <h1 className={styles.heroTitle}>
          Your 3D Shopping
          <span className={styles.heroTitleGradient}>Experience</span>
        </h1>
        <p className={styles.heroDescription}>
          Explore thousands of products in an immersive virtual mall environment
        </p>
        <div className={styles.heroButtons}>
          <button className={styles.primaryButton}>
            Start Shopping
            <ArrowRight className={styles.buttonIcon} />
          </button>
        </div>
      </div>

      <div className={styles.sliderDots}>
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`${styles.sliderDot} ${
              index === currentSlide ? styles.sliderDotActive : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
