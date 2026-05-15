import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LuxuryNavbar() {
  const navigate = useNavigate();
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
          cursor: pointer;
        }

        .luxury-logo span {
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
          right: 0;
          width: 180px;
          background: #111;
          border: 0.5px solid rgba(201, 169, 110, 0.2);
          border-radius: 12px;
          padding: 0.75rem;
          z-index: 100;
          flex-direction: column;
          gap: 8px;
        }

        .luxury-mobile-menu.open {
          display: flex;
        }

        .luxury-mobile-cta {
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
          transition: opacity 0.2s;
        }

        .luxury-mobile-cta:hover {
          opacity: 0.85;
        }

        @media (max-width: 600px) {
          .luxury-cta {
            display: none;
          }

          .luxury-hamburger {
            display: flex;
          }
        }

        @media (min-width: 601px) {
          .luxury-hamburger,
          .luxury-mobile-menu {
            display: none !important;
          }
        }
      `}</style>

      <nav className="luxury-nav">
        <div
          className="luxury-logo"
          onClick={() => navigate("/")}
        >
          Logis<span>.</span>
        </div>

        {/* Desktop Login */}
        <button
          className="luxury-cta"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        {/* Mobile Hamburger */}
        <button
          className="luxury-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Mobile Dropdown */}
        <div className={`luxury-mobile-menu ${menuOpen ? "open" : ""}`}>
          <button
            className="luxury-mobile-cta"
            onClick={() => {
              navigate("/");
              setMenuOpen(false);
            }}
          >
            Login
          </button>
        </div>
      </nav>
    </>
  );
}