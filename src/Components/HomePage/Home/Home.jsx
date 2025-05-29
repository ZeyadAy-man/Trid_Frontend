import React, { useRef } from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Store, Phone, Mail, Sparkles, MapPin } from "lucide-react";
import styles from "./Home.module.css";
import Navbar from "../Nav/Nav";
import Slider from "../Slider/Slider";
import ShopsAndCategories from "../ShopList/ShopList";

const Home = () => {
  const shopsRef = useRef(null);

  const scrollToShops = () => {
    shopsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <Slider onStartShopping={scrollToShops} />
      <div ref={shopsRef}>
        <ShopsAndCategories />
      </div>

      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose Trid?</h2>
            <p className={styles.sectionDescription}>
              Experience the future of online shopping
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} ${styles.featureBlue}`}>
              <div
                className={`${styles.featureIcon} ${styles.featureIconBlue}`}
              >
                <Store className={styles.featureIconSvg} />
              </div>
              <h3 className={styles.featureTitle}>3D Virtual Experience</h3>
              <p className={styles.featureDescription}>
                Immerse yourself in a realistic 3D shopping environment
              </p>
            </div>

            <div className={`${styles.featureCard} ${styles.featureGreen}`}>
              <div
                className={`${styles.featureIcon} ${styles.featureIconGreen}`}
              >
                <MapPin className={styles.featureIconSvg} />
              </div>
              <h3 className={styles.featureTitle}>Easy Navigation</h3>
              <p className={styles.featureDescription}>
                Find products quickly with our intuitive navigation system
              </p>
            </div>

            <div className={`${styles.featureCard} ${styles.featurePurple}`}>
              <div
                className={`${styles.featureIcon} ${styles.featureIconPurple}`}
              >
                <Sparkles className={styles.featureIconSvg} />
              </div>
              <h3 className={styles.featureTitle}>Premium Quality</h3>
              <p className={styles.featureDescription}>
                Curated selection of high-quality products from trusted brands
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <img
                  className={styles.footerLogoIcon}
                  src="/logo.jpeg"
                  alt="Trid Logo"
                />
                <span className={styles.footerLogoText}>Trid</span>
              </div>
              <p className={styles.footerDescription}>
                Experience the future of online shopping with our immersive 3D
                virtual mall. Discover thousands of products from trusted brands
                in a revolutionary shopping environment.
              </p>
              <div className={styles.socialLinks}>
                <div
                  className={`${styles.socialIcon} ${styles.socialFacebook}`}
                >
                  <FaFacebook className={styles.socialSvg} />
                </div>
                <div
                  className={`${styles.socialIcon} ${styles.socialInstagram}`}
                >
                  <FaInstagram className={styles.socialSvg} />
                </div>
                <div className={`${styles.socialIcon} ${styles.socialTwitter}`}>
                  <FaTwitter className={styles.socialSvg} />
                </div>
              </div>
            </div>

            <div className={styles.footerLinks}>
              <h3 className={styles.footerLinksTitle}>Quick Links</h3>
              <ul className={styles.footerLinksList}>
                {[
                  "About Us",
                  "Contact Us",
                  "FAQ",
                  "Terms & Conditions",
                  "Privacy Policy",
                ].map((link) => (
                  <li key={link} className={styles.footerLinkItem}>
                    <a href="#" className={styles.footerLink}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.footerContact}>
              <h3 className={styles.footerContactTitle}>Contact Us</h3>
              <div className={styles.footerContactList}>
                <div className={styles.footerContactItem}>
                  <Phone className={styles.footerContactIcon} />
                  <span className={styles.footerContactText}>
                    +20 011 1234 5678
                  </span>
                </div>
                <div className={styles.footerContactItem}>
                  <Mail className={styles.footerContactIcon} />
                  <span className={styles.footerContactText}>
                    Trid@metamall.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} Trid. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
