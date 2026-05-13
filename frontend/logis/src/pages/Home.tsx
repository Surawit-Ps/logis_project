import { useState } from "react";

const navLinks = ["Dashboard", "Fuel Claims", "Fleet", "Reports"];

const stats = [
  { label: "Claims This Month", value: "284", unit: "", delta: "+12%", up: true },
  { label: "Total Fuel Cost", value: "฿1.24M", unit: "", delta: "+3.8%", up: false },
  { label: "Vehicles Active", value: "67", unit: "", delta: "of 72", up: true },
  { label: "Avg. L/100km", value: "14.2", unit: "L", delta: "-0.6%", up: true },
];

const recentClaims = [
  { id: "FC-2847", driver: "Somchai P.", plate: "กข-1234", route: "BKK → Chonburi", liters: 85, amount: "฿3,060", status: "approved" },
  { id: "FC-2846", driver: "Wanchai R.", plate: "ขค-5678", route: "BKK → Rayong", liters: 110, amount: "฿3,960", status: "pending" },
  { id: "FC-2845", driver: "Pranee S.", plate: "คง-9012", route: "BKK → Saraburi", liters: 62, amount: "฿2,232", status: "approved" },
  { id: "FC-2844", driver: "Thana K.", plate: "งจ-3456", route: "BKK → Ayutthaya", liters: 48, amount: "฿1,728", status: "rejected" },
  { id: "FC-2843", driver: "Malee W.", plate: "จฉ-7890", route: "BKK → Lopburi", liters: 95, amount: "฿3,420", status: "pending" },
];

const quickActions = [
  { icon: "⛽", label: "New Claim", desc: "Submit fuel receipt" },
  { icon: "🚛", label: "Add Vehicle", desc: "Register fleet unit" },
  { icon: "📊", label: "Export Report", desc: "Monthly summary" },
  { icon: "🗺️", label: "Route Log", desc: "Trip history" },
];

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  approved: { bg: "#0f2a1a", text: "#4ADE80", dot: "#22C55E" },
  pending:  { bg: "#2a1f0a", text: "#FCD34D", dot: "#F59E0B" },
  rejected: { bg: "#2a0f0f", text: "#F87171", dot: "#EF4444" },
};

export default function FuelClaimHome() {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: "#090909", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#F5F0E8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .d1 { animation-delay: 0.05s; } .d2 { animation-delay: 0.12s; } .d3 { animation-delay: 0.19s; } .d4 { animation-delay: 0.26s; } .d5 { animation-delay: 0.33s; }

        .stat-card { background: #111; border: 0.5px solid #222; border-radius: 14px; padding: 1.25rem 1.5rem; transition: border-color 0.2s; cursor: default; }
        .stat-card:hover { border-color: #C9A96E44; }

        .claim-row { display: grid; grid-template-columns: 80px 1fr 90px 1fr 60px 80px 90px; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem; border-bottom: 0.5px solid #1a1a1a; transition: background 0.15s; cursor: default; }
        .claim-row:hover { background: #ffffff06; }
        .claim-row:last-child { border-bottom: none; }

        .quick-card { background: #111; border: 0.5px solid #222; border-radius: 14px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s; }
        .quick-card:hover { border-color: #C9A96E66; background: #C9A96E08; }

        .nav-link { text-decoration: none; color: #9A9488; font-size: 13px; letter-spacing: 0.06em; padding: 6px 14px; border-radius: 6px; transition: all 0.2s; display: block; }
        .nav-link:hover { color: #F5F0E8; background: rgba(255,255,255,0.06); }
        .nav-link.active { color: #C9A96E; }

        .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em; }

        .btn-gold { background: #C9A96E; color: #0D0D0D; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; letter-spacing: 0.04em; cursor: pointer; transition: opacity 0.2s; }
        .btn-gold:hover { opacity: 0.85; }
        .btn-ghost { background: transparent; border: 0.5px solid #2a2a2a; color: #9A9488; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
        .btn-ghost:hover { border-color: #444; color: #F5F0E8; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .claim-row { grid-template-columns: 70px 1fr 80px; }
          .claim-route, .claim-liters, .claim-amount { display: none; }
          .quick-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Navbar */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, padding: "1rem 1.5rem", background: "#090909cc", backdropFilter: "blur(12px)", borderBottom: "0.5px solid #1a1a1a" }}>
        <nav style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#F5F0E8", letterSpacing: "0.02em", userSelect: "none" }}>
            Maison<span style={{ color: "#C9A96E" }}>.</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 400, color: "#555", letterSpacing: "0.12em", marginLeft: 10, textTransform: "uppercase" }}>ERP</span>
          </div>

          <ul className="desktop-nav" style={{ display: "flex", gap: "0.25rem", listStyle: "none" }}>
            {navLinks.map(link => (
              <li key={link}>
                <a href="#" className={`nav-link${active === link ? " active" : ""}`} onClick={e => { e.preventDefault(); setActive(link); }}>
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #C9A96E, #8B6914)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#0D0D0D" }}>SP</div>
            <button className="btn-gold" style={{ display: "none" }}>+ New Claim</button>
            <button className="btn-gold desktop-only">+ New Claim</button>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Hero Banner */}
        <div className="fade-up d1" style={{ background: "linear-gradient(120deg, #1a1200 0%, #111 60%)", border: "0.5px solid #C9A96E22", borderRadius: 20, padding: "2.5rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "#C9A96E08", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: 80, width: 140, height: 140, background: "#C9A96E05", borderRadius: "50%", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", color: "#C9A96E", textTransform: "uppercase", marginBottom: "0.6rem" }}>Fuel Claims Management</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 500, color: "#F5F0E8", lineHeight: 1.25, marginBottom: "0.75rem" }}>
            Good morning, Somchai.<br />
            <span style={{ color: "#9A9488", fontSize: "0.7em", fontWeight: 400 }}>Wednesday, 13 May 2026</span>
          </h1>
          <p style={{ fontSize: 14, color: "#666", maxWidth: 480, lineHeight: 1.7, marginBottom: "1.5rem" }}>
            You have <span style={{ color: "#FCD34D", fontWeight: 500 }}>8 pending claims</span> awaiting approval and <span style={{ color: "#4ADE80", fontWeight: 500 }}>3 vehicles</span> due for refuel today.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-gold">Review Claims</button>
            <button className="btn-ghost">View Fleet Map</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-up d2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", marginBottom: "0.6rem" }}>{s.label}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500, color: "#F5F0E8", lineHeight: 1 }}>
                {s.value}
                {s.unit && <span style={{ fontSize: 14, color: "#777", marginLeft: 4 }}>{s.unit}</span>}
              </p>
              <p style={{ fontSize: 12, marginTop: "0.5rem", color: s.up ? "#4ADE80" : "#F87171" }}>{s.delta}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem", alignItems: "start" }}>

          {/* Claims Table */}
          <div className="fade-up d3" style={{ background: "#111", border: "0.5px solid #1e1e1e", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "0.5px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, color: "#F5F0E8" }}>Recent Claims</p>
                <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Last 5 submissions</p>
              </div>
              <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}>View All →</button>
            </div>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 1fr 60px 80px 90px", gap: "0.75rem", padding: "0.65rem 1.25rem", background: "#0d0d0d" }}>
              {["ID","Driver","Plate","Route","Liters","Amount","Status"].map(h => (
                <p key={h} style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", color: "#444", textTransform: "uppercase" }}>{h}</p>
              ))}
            </div>

            {recentClaims.map((c) => {
              const sc = statusColor[c.status];
              return (
                <div key={c.id} className="claim-row">
                  <p style={{ fontSize: 12, color: "#C9A96E", fontWeight: 500 }}>{c.id}</p>
                  <p style={{ fontSize: 13, color: "#D4CFC8" }}>{c.driver}</p>
                  <p className="claim-plate" style={{ fontSize: 12, color: "#777", fontFamily: "monospace" }}>{c.plate}</p>
                  <p className="claim-route" style={{ fontSize: 12, color: "#888" }}>{c.route}</p>
                  <p className="claim-liters" style={{ fontSize: 13, color: "#aaa" }}>{c.liters}L</p>
                  <p className="claim-amount" style={{ fontSize: 13, color: "#F5F0E8", fontWeight: 500 }}>{c.amount}</p>
                  <span className="badge" style={{ background: sc.bg, color: sc.text }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                    {c.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Quick Actions */}
            <div className="fade-up d4" style={{ background: "#111", border: "0.5px solid #1e1e1e", borderRadius: 16, padding: "1.25rem" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 500, color: "#F5F0E8", marginBottom: "1rem" }}>Quick Actions</p>
              <div className="quick-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {quickActions.map((a, i) => (
                  <div key={i} className="quick-card">
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#D4CFC8" }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fuel Budget Gauge */}
            <div className="fade-up d5" style={{ background: "#111", border: "0.5px solid #1e1e1e", borderRadius: 16, padding: "1.25rem" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 500, color: "#F5F0E8", marginBottom: "0.4rem" }}>Monthly Budget</p>
              <p style={{ fontSize: 12, color: "#555", marginBottom: "1.25rem" }}>฿1.24M of ฿1.5M used</p>

              {/* Progress bar */}
              <div style={{ background: "#1a1a1a", borderRadius: 6, height: 6, marginBottom: "0.75rem", overflow: "hidden" }}>
                <div style={{ width: "82.7%", height: "100%", background: "linear-gradient(90deg, #8B6914, #C9A96E)", borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: 11, color: "#555" }}>82.7% used</p>
                <p style={{ fontSize: 11, color: "#4ADE80" }}>฿260K remaining</p>
              </div>

              <div style={{ borderTop: "0.5px solid #1a1a1a", marginTop: "1.25rem", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  { label: "Bangkok Zone", pct: 78, color: "#C9A96E" },
                  { label: "East Zone", pct: 91, color: "#F87171" },
                  { label: "Central Zone", pct: 55, color: "#4ADE80" },
                ].map(z => (
                  <div key={z.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <p style={{ fontSize: 12, color: "#888" }}>{z.label}</p>
                      <p style={{ fontSize: 12, color: z.color, fontWeight: 500 }}>{z.pct}%</p>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 4, height: 4, overflow: "hidden" }}>
                      <div style={{ width: `${z.pct}%`, height: "100%", background: z.color, borderRadius: 4, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}