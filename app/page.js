"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import ProductCard from "../components/ProductCard";
import SiteHeader from "../components/SiteHeader";
import { products } from "../lib/products";

const moodCards = [
  {
    className: "casual",
    eyebrow: "01 / DAILY EASE",
    title: "Everyday",
    image: "/sneakers 1.jpg",
    alt: "Everyday sneakers",
  },
  {
    className: "formal",
    eyebrow: "02 / CLEAN LINES",
    title: "Refined",
    image: "/Blackloafers.png",
    alt: "Refined loafers",
  },
  {
    className: "active",
    eyebrow: "03 / KEEP MOVING",
    title: "On the move",
    image: "/sneakers 2.jpg",
    alt: "Active sneakers",
  },
  {
    className: "easy",
    eyebrow: "04 / TAKE IT SLOW",
    title: "Off duty",
    image: "/sandals.jpg",
    alt: "Off-duty sandals",
  },
];

const testimonials = [
  {
    quote: "Comfort without compromise.",
    body: "My Urban Runners genuinely made long city days feel easier. The fit is spot on.",
    name: "Sarah A.",
  },
  {
    quote: "My new everyday pair.",
    body: "Minimal, polished, and surprisingly soft from the first wear. I’m already back for another pair.",
    name: "Tobi E.",
  },
  {
    quote: "Excellent from order to door.",
    body: "Fast delivery, beautiful packaging, and loafers that work with absolutely everything.",
    name: "James O.",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const testimonialTrack = useRef(null);
  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) =>
          `${product.name} ${product.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 4),
    [query],
  );
  const scrollTestimonials = (direction) =>
    testimonialTrack.current?.scrollBy({
      left: testimonialTrack.current.clientWidth * direction * 0.82,
      behavior: "smooth",
    });
  async function subscribe(event) {
    event.preventDefault();
    if (newsletterState === "sending") return;
    setNewsletterState("sending");
    setNewsletterMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "We could not add you to the list.");
      setNewsletterState("success");
      setNewsletterMessage(result.message || "You’re on the list. Welcome in.");
      setEmail("");
    } catch (error) {
      setNewsletterState("error");
      setNewsletterMessage(
        error.message || "We could not add you to the list. Please try again.",
      );
    }
  }
  return (
    <main>
      <SiteHeader searchValue={query} onSearch={setQuery} />
      <section className="commerce-hero">
        <div className="hero-copy">
          <p className="kicker">THE NEW SEASON</p>
          <h1>
            Find shoes that <em>move</em> with your style.
          </h1>
          <p>
            Elevated everyday footwear, chosen for the small moments that take
            you everywhere.
          </p>
          <Link href="/products" className="primary-action">
            Shop now <span>→</span>
          </Link>
          <div className="stats">
            <div>
              <strong>200+</strong>
              <span>styles to explore</span>
            </div>
            <div>
              <strong>2,000+</strong>
              <span>pairs delivered</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>customer love</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/hero-shoe.svg" alt="Hephzi shoe collection" />
          <i className="spark spark-one">✦</i>
          <i className="spark spark-two">✦</i>
          <div className="hero-note">
            Made for
            <br />
            <b>every step.</b>
          </div>
        </div>
      </section>
      <section className="brand-strip">
        <span>COMFORT FIRST</span>
        <span>EVERYDAY FORM</span>
        <span>HEPHZI</span>
        <span>MADE TO MOVE</span>
        <span>GOOD SHOES</span>
      </section>
      <section className="catalog-section featured-section">
        <div className="section-title">
          <div>
            <p className="kicker">CURATED FOR YOU</p>
            <h2>Featured styles</h2>
          </div>
          <Link href="/products">View all products →</Link>
        </div>
        {featuredProducts.length ? (
          <div className="catalog-grid">
            {featuredProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-search">
            No pairs found for “{query}”. Try another search or browse the full
            collection.
          </div>
        )}
        <Link className="collection-link" href="/products">
          Explore all {products.length} products <span>→</span>
        </Link>
      </section>
      <section className="style-edit" id="edit">
        <div className="edit-heading">
          <p className="kicker">SHOP BY MOOD</p>
          <h2>
            Browse the
            <br />
            Hephzi edit
          </h2>
          <p className="edit-intro">
            Four moods, one good pair for wherever the day takes you.
          </p>
          <Link href="/products" className="edit-all">
            Shop the full edit <span>↗</span>
          </Link>
        </div>
        <div className="edit-grid">
          {moodCards.map((mood) => (
            <Link
              href="/products"
              className={`edit-card ${mood.className}`}
              key={mood.title}
            >
              <span>
                <small>{mood.eyebrow}</small>
                {mood.title} <b aria-hidden="true">↗</b>
              </span>
              <img src={mood.image} alt={mood.alt} />
            </Link>
          ))}
        </div>
      </section>
      <section className="testimonials">
        <div className="section-title">
          <div>
            <p className="kicker">REAL WORDS</p>
            <h2>Happy customers</h2>
          </div>
          <div className="testimonial-controls">
            <button
              type="button"
              onClick={() => scrollTestimonials(-1)}
              aria-label="Show previous testimonials"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollTestimonials(1)}
              aria-label="Show next testimonials"
            >
              →
            </button>
          </div>
        </div>
        <div
          className="testimonial-grid"
          ref={testimonialTrack}
          tabIndex="0"
          aria-label="Customer testimonials"
        >
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name}>
              <span aria-label="5 out of 5 stars">★★★★★</span>
              <h3>“{testimonial.quote}”</h3>
              <p>{testimonial.body}</p>
              <footer>— {testimonial.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="newsletter">
        <div>
          <p className="kicker">THE GOOD STUFF</p>
          <h2>Get first access to new drops.</h2>
        </div>
        <form onSubmit={subscribe}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
            autoComplete="email"
            required
            disabled={newsletterState === "sending"}
          />
          <button disabled={newsletterState === "sending"}>
            {newsletterState === "sending" ? "Joining…" : "Subscribe →"}
          </button>
          <p
            className={`newsletter-status ${newsletterState}`}
            aria-live="polite"
          >
            {newsletterMessage}
          </p>
        </form>
      </section>
      <footer className="site-footer">
        <div>
          <Link href="/" className="wordmark">
            HEPHZI<span>.</span>
          </Link>
          <p>Footwear with feeling. Made for the way you move.</p>
        </div>
        <div>
          <b>Shop</b>
          <Link href="/products">New arrivals</Link>
          <Link href="/products">Best sellers</Link>
          <a href="#edit">The edit</a>
        </div>
        <div>
          <b>Help</b>
          <a href="mailto:hello@hephzi.com">Contact</a>
          <Link href="/checkout">Bag</Link>
          <Link href="/products">Delivery</Link>
        </div>
        <div>
          <b>Account</b>
          <Link href="/account">My account</Link>
          <Link href="/checkout">Checkout</Link>
        </div>
        <small>© 2026 Hephzi Shoes. All rights reserved.</small>
      </footer>
    </main>
  );
}
