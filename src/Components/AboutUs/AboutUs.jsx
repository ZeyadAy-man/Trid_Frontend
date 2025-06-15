/* eslint-disable react/prop-types */

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Globe, Award, Code, Twitter, Linkedin, Github, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter as FaTwitterIcon } from "react-icons/fa";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  const navigate = useNavigate();
  const eCommerceSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToECommerce = () => {
    eCommerceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const teamMembers = [
    {
      id: 1,
      name: "Zeyad Ayman",
      role: "Frontend Developer",
      image: "/OLP.jpg",
      skills: ["React", "3D", "Animation"],
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    },
    {
        id: 2,
      name: "Mohammad Ragab",
      role: "Backend Developer",
      image: "/OLP.jpg",
      skills: ["Node.js", "API Design", "Database"],
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 3,
      name: "Mazen Ramadan",
      role: "Frontend Developer",
      image: "/OLP.jpg",
      skills: ["React", "3D", "Animation"],
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 4,
      name: "Ahmed Mahmoud",
      role: "Backend Developer",
      image: "/OLP.jpg",
      skills: ["Node.js", "API Design", "Database"],
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 5,
      name: "Mostafa khafaga",
      role: "Frontend Developer",
      image: "/OLP.jpg",
      skills: ["React", "3D", "Animation"],
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 6,
      name: "Rawan Adel",
      role: "Frontend Developer",
      image: "/team4.jpg",
      skills: ["React", "3D", "Animation"],
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    }
  ];

  const handleFooterLinkClick = (link) => {
    const linkMap = {
      "About Us": "/about",
      "Contact Us": "/contact",
      "FAQ": "/faq",
      "Terms & Conditions": "/terms",
      "Privacy Policy": "/privacy"
    };

    if (linkMap[link]) {
      navigate(linkMap[link]);
    }
  };

  const TeamMemberCard = ({ member }) => (
    <div className={styles.teamCard}>
      <div className={styles.teamCardInner}>
        <div className={styles.teamImageContainer}>
          <img 
            src={member.image} 
            alt={member.name} 
            className={styles.teamImage}
          />
          <div className={styles.teamSocial}>
            <a href={member.social.twitter} className={styles.socialIcon}>
              <Twitter size={18} />
            </a>
            <a href={member.social.linkedin} className={styles.socialIcon}>
              <Linkedin size={18} />
            </a>
            <a href={member.social.github} className={styles.socialIcon}>
              <Github size={18} />
            </a>
          </div>
        </div>
        <div className={styles.teamInfo}>
          <h3>{member.name}</h3>
          <p>{member.role}</p>
          <div className={styles.teamSkills}>
            {member.skills.map((skill, index) => (
              <span key={index} className={styles.skillBadge}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.aboutPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>About Trid</h1>
          <h2 className={styles.heroSubtitle}>The Future of 3D E-Commerce</h2>
          <p className={styles.heroDescription}>
            We're transforming online shopping with immersive 3D experiences that
            bridge the gap between digital and physical retail.
          </p>
          <button 
            className={styles.heroButton}
            onClick={scrollToECommerce}
          >
            <ShoppingBag size={20} />
            Explore Now
          </button>
        </div>
      </section>

      <section ref={eCommerceSectionRef} className={styles.unifiedSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Redefining E-Commerce</h2>
            <div className={styles.sectionDivider}></div>
          </div>
          
          <div className={styles.aboutTridContent}>
            <div className={styles.aboutTridText}>
              <h3>The Future of Shopping is Here</h3>
              <p>
                Trid is not just another e-commerce platform - we are a revolution in digital retail. 
                Our cutting-edge 3D technology transforms online shopping from a static experience 
                into an immersive journey.
              </p>
              
              <div className={styles.innovationPoints}>
                <div className={styles.innovationCard}>
                  <div className={styles.innovationIcon}>🚀</div>
                  <div>
                    <h4>Immersive 3D Showrooms</h4>
                    <p>Walk through virtual stores that mimic physical retail spaces</p>
                  </div>
                </div>
                
                <div className={styles.innovationCard}>
                  <div className={styles.innovationIcon}>👁️</div>
                  <div>
                    <h4>Product Visualization</h4>
                    <p>Inspect items from every angle with realistic 3D models</p>
                  </div>
                </div>
                
                <div className={styles.innovationCard}>
                  <div className={styles.innovationIcon}>🌐</div>
                  <div>
                    <h4>Global Marketplace</h4>
                    <p>Access international brands from the comfort of your home</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.aboutTridVisual}>
              <img 
                src="/logo.jpeg" 
                alt="Trid 3D Experience" 
                className={styles.tridShowcaseImage}
              />
              <div className={styles.floatingBadge}>3D Innovation</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.unifiedSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Vision</h2>
            <div className={styles.sectionDivider}></div>
          </div>
          
          <div className={styles.missionContent}>
            <div className={styles.missionText}>
              <p>
                At Trid, we are revolutionizing e-commerce by blending cutting-edge 
                3D technology with seamless shopping. Our virtual mall transports 
                you to a world where products come to life.
              </p>
              
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <Globe className={styles.featureIcon} />
                  <h3>Immersive Environments</h3>
                  <p>Walk through virtual stores just like in real life</p>
                </div>
                
                <div className={styles.featureCard}>
                  <Award className={styles.featureIcon} />
                  <h3>Premium Brands</h3>
                  <p>Discover curated collections from top designers</p>
                </div>
                
                <div className={styles.featureCard}>
                  <Code className={styles.featureIcon} />
                  <h3>Tech Innovation</h3>
                  <p>Powered by WebGL and Three.js for stunning visuals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Creative Team</h2>
            <div className={styles.sectionDivider}></div>
            <p className={styles.sectionDescription}>
              The brilliant minds powering Trid's 3D shopping revolution
            </p>
          </div>
          
          <div className={styles.teamRow}>
            {teamMembers.slice(0, 3).map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
          
          <div className={styles.teamRow}>
            {teamMembers.slice(3).map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
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
                <div className={`${styles.socialIcon} ${styles.socialFacebook}`}>
                  <FaFacebook className={styles.socialSvg} />
                </div>
                <div className={`${styles.socialIcon} ${styles.socialInstagram}`}>
                  <FaInstagram className={styles.socialSvg} />
                </div>
                <div className={`${styles.socialIcon} ${styles.socialTwitter}`}>
                  <FaTwitterIcon className={styles.socialSvg} />
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
                    <a 
                      href="#"
                      className={styles.footerLink}
                      onClick={(e) => {
                        e.preventDefault();
                        handleFooterLinkClick(link);
                      }}
                    >
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

export default AboutUs;