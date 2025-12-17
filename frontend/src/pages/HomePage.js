import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import heroImage from '../assets/images/hero-image.avif';
import hero1Image from '../assets/images/hero 1.png';
import hero2Image from '../assets/images/hero 2.png';
import ringImage from '../assets/images/ring.webp';
import earRingImage from '../assets/images/ear-ring.avif';
import pendantImage from '../assets/images/pendant.avif';
import braceletImage from '../assets/images/bracelet.avif';
import necklaceImage from '../assets/images/necklace.webp';

const CAROUSEL_SLIDES = [
  {
    title: "The Eternal Bloom Collection",
    subtitle: "Discover timeless elegance with our latest collection",
    description: "Crafted to perfection for the modern woman",
    buttonText: "Explore Collection",
    link: "/rings",
    image: heroImage,
    bgColor: "#f8f5f0",
    layout: "split"
  },
  {
    title: "Diamond Dreams",
    subtitle: "Brilliance that lasts forever",
    description: "Exquisite diamonds set in stunning designs",
    buttonText: "Shop Diamonds",
    link: "/diamond",
    image: earRingImage,
    bgColor: "#f0f4f8",
    layout: "split"
  },
  {
    title: "Bridal Elegance",
    subtitle: "Make your special day unforgettable",
    description: "Premium wedding jewelry collection",
    buttonText: "View Bridal",
    link: "/collections",
    image: pendantImage,
    bgColor: "#fef5f5",
    layout: "split"
  },
  {
    title: "Gold & Pearls",
    subtitle: "Traditional meets contemporary",
    description: "Handcrafted gold jewelry with lustrous pearls",
    buttonText: "Discover More",
    link: "/gold",
    image: braceletImage,
    bgColor: "#fffbf0",
    layout: "split"
  },
  {
    title: "Timeless Treasures",
    subtitle: "Elegance redefined",
    description: "Discover pieces that tell your story",
    buttonText: "Shop Now",
    link: "/collections",
    image: hero1Image,
    bgColor: "#f5f5f5",
    layout: "overlay"
  },
  {
    title: "Luxe Collection",
    subtitle: "Where tradition meets modernity",
    description: "Handcrafted masterpieces for every occasion",
    buttonText: "Explore Now",
    link: "/collections",
    image: hero2Image,
    bgColor: "#fafafa",
    layout: "overlay"
  }
];

const CATEGORY_ITEMS = [
  { path: '/rings', image: ringImage, name: 'Rings' },
  { path: '/earrings', image: earRingImage, name: 'Earrings' },
  { path: '/pendants', image: pendantImage, name: 'Pendants' },
  { path: '/bracelets', image: braceletImage, name: 'Bracelets' },
  { path: '/necklaces', image: necklaceImage, name: 'Necklaces' }
];

const AUTOPLAY_INTERVAL = 5000;

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="home-page">
      <section className="hero-carousel">
        <div className="carousel-container">
          {CAROUSEL_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''} ${slide.layout === 'overlay' ? 'overlay-layout' : ''}`}
              style={{ backgroundColor: slide.bgColor }}
            >
              {slide.layout === 'overlay' ? (
                <div className="slide-overlay-content">
                  <img src={slide.image} alt={slide.title} className="overlay-bg-image" />
                  <div className="overlay-text">
                    <h1>{slide.title}</h1>
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    <p className="slide-description">{slide.description}</p>
                    <Link to={slide.link}>
                      <button className="explore-button">{slide.buttonText}</button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="slide-content">
                  <div className="slide-text">
                    <h1>{slide.title}</h1>
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    <p className="slide-description">{slide.description}</p>
                    <Link to={slide.link}>
                      <button className="explore-button">{slide.buttonText}</button>
                    </Link>
                  </div>
                  <div className="slide-image">
                    <img src={slide.image} alt={slide.title} />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Previous slide">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Next slide">
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="carousel-indicators">
            {CAROUSEL_SLIDES.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span>Free Shipping on All Orders Above ₹5,000</span>
          <span className="separator">★</span>
          <span>Exclusive 10% Off on Diamond Jewelry - Use Code: SPARKLE10</span>
          <span className="separator">★</span>
          <span>Complimentary Gift Wrapping on All Purchases</span>
          <span className="separator">★</span>
          <span>Lifetime Exchange & Buyback on Gold Jewelry</span>
          <span className="separator">★</span>
          <span>Free Shipping on All Orders Above ₹5,000</span>
          <span className="separator">★</span>
          <span>Exclusive 10% Off on Diamond Jewelry - Use Code: SPARKLE10</span>
          <span className="separator">★</span>
          <span>Complimentary Gift Wrapping on All Purchases</span>
          <span className="separator">★</span>
          <span>Lifetime Exchange & Buyback on Gold Jewelry</span>
          <span className="separator">★</span>
        </div>
      </div>

      <section className="shop-by-category">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {CATEGORY_ITEMS.map((category) => (
            <Link key={category.path} to={category.path} className="category-item">
              <img src={category.image} alt={category.name} />
              <p>{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="new-arrivals">
        <h2>New Arrivals</h2>
        <div className="product-grid"></div>
      </section>
    </div>
  );
};

export default HomePage;