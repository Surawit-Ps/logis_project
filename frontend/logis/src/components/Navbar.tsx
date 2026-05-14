import { useState } from "react";

const links = ["Collections", "Atelier", "Stories", "About"];

export default function LuxuryNavbar() {
  const [active, setActive] = useState("Collections");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .luxury-nav {
          background: #0D0D0D;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 64px;
          border-radius: 16px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .luxury-logo {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #F5F0E8;
          letter-spacing: 0.02em;
          user-select: none;
        }

        .luxury-logo span {
          color: #C9A96E;
        }

        .luxury-links {
          display: flex;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .luxury-links li a {
          text-decoration: none;
          color: #9A9488;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.06em;
          padding: 6px 14px;
          border-radius: 6px;
          transition: all 0.2s;
          display: block;
          cursor: pointer;
        }

        .luxury-links li a:hover {
          color: #F5F0E8;
          background: rgba(255, 255, 255, 0.06);
        }

        .luxury-links li.active a {
          color: #C9A96E;
        }

        .luxury-cta {
          background: #C9A96E;
          color: #0D0D0D;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.2s;
          white-space: nowrap;
        }

        .luxury-cta:hover {
          opacity: 0.85;
        }

        /* Mobile menu button */
        .luxury-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .luxury-hamburger span {
          display: block;
          width: 20px;
          height: 1.5px;
          background: #9A9488;
          border-radius: 2px;
          transition: all 0.2s;
        }

        /* Mobile dropdown */
        .luxury-mobile-menu {
          display: none;
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #111;
          border: 0.5px solid rgba(201, 169, 110, 0.2);
          border-radius: 12px;
          padding: 0.75rem;
          z-index: 100;
          flex-direction: column;
          gap: 4px;
        }

        .luxury-mobile-menu.open {
          display: flex;
        }

        .luxury-mobile-menu a {
          text-decoration: none;
          color: #9A9488;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 10px 14px;
          border-radius: 8px;
          transition: all 0.2s;
          display: block;
          cursor: pointer;
        }

        .luxury-mobile-menu a:hover {
          color: #F5F0E8;
          background: rgba(255, 255, 255, 0.05);
        }

        .luxury-mobile-menu a.active {
          color: #C9A96E;
        }

        .luxury-mobile-cta {
          margin-top: 4px;
          background: #C9A96E;
          color: #0D0D0D;
          border: none;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          text-align: left;
          transition: opacity 0.2s;
        }

        .luxury-mobile-cta:hover {
          opacity: 0.85;
        }

        @media (max-width: 600px) {
          .luxury-links,
          .luxury-cta {
            display: none;
          }

          .luxury-hamburger {
            display: flex;
          }
        }
      `}</style>

      <nav className="luxury-nav">
        <div className="luxury-logo">
          Maison<span>.</span>
        </div>

        <ul className="luxury-links">
          {links.map((link) => (
            <li key={link} className={active === link ? "active" : ""}>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setActive(link);
                }}
                href="#"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <button className="luxury-cta">Discover</button>

        {/* Mobile hamburger */}
        <button
          className="luxury-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Mobile dropdown */}
        <div className={`luxury-mobile-menu ${menuOpen ? "open" : ""}`}>
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className={active === link ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActive(link);
                setMenuOpen(false);
              }}
            >
              {link}
            </a>
          ))}
          <button className="luxury-mobile-cta">Discover</button>
        </div>
      </nav>
    </>
  );
}