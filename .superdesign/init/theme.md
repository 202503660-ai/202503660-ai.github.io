# Current theme
Background #0a0e1a; surfaces #111827/#1e293b; primary text #f8fafc; secondary #94a3b8; muted #64748b; accent #6366f1 plus purple/pink/cyan. Pretendard body, Outfit loaded. Radii 8/14/20/28px. Container max1440, side padding24. Desktop sidebar380 gap24; main single column <=1024, recommendations single column <=1200, courses single column <=900. Shadows/glass/gradients extensive.
# Raw CSS
```css
/* ==========================================================================
   TROIKA 연합축제 개인 맞춤형 AI 추천 시스템 — 프리미엄 디자인 시스템
   ========================================================================== */

:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-tertiary: #1e293b;
  --bg-glass: rgba(17, 24, 39, 0.72);
  --bg-glass-card: rgba(30, 41, 59, 0.65);
  --bg-glass-hover: rgba(51, 65, 85, 0.8);

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(99, 102, 241, 0.4);
  --border-glow: rgba(139, 92, 246, 0.5);

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-highlight: #38bdf8;

  --accent-primary: #6366f1;
  --accent-purple: #8b5cf6;
  --accent-pink: #ec4899;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --accent-cyan: #06b6d4;

  --zone-core: #ef4444;
  --zone-participate: #f59e0b;
  --zone-connect: #3b82f6;

  --cong-smooth: #10b981;
  --cong-crowded: #f59e0b;
  --cong-danger: #ef4444;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px -6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 20px 40px -12px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 25px rgba(99, 102, 241, 0.35);

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  --transition-fast: 0.18s ease;
  --transition-normal: 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.10) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.06) 0%, transparent 50%);
  background-attachment: fixed;
  min-height: 100vh;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}
::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Container */
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header & Nav */
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 14px 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-badge {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

.brand-text h1 {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(to right, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.brand-text p {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-emerald);
  border-radius: 50%;
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.btn-quiz {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-quiz:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.6);
}

/* Hero Section */
.hero-section {
  padding: 32px 0 20px;
  text-align: center;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  color: var(--accent-cyan);
  margin-bottom: 12px;
}

.hero-title {
  font-size: 2.3rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
  line-height: 1.25;
}

.hero-title span.gradient-text {
  background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 760px;
  margin: 0 auto;
}

/* Main Grid Layout */
.main-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
  margin-top: 24px;
  margin-bottom: 60px;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

/* Sidebar Controls */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-panel {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
}

.glass-panel:hover {
  border-color: rgba(255, 255, 255, 0.14);
}

.panel-title {
  font-size: 1.05rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.panel-title .icon-badge {
  font-size: 1.15rem;
}

/* Persona Cards Grid */
.persona-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.persona-card {
  background: var(--bg-glass-card);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  transition: var(--transition-bounce);
  position: relative;
  overflow: hidden;
  text-align: left;
}

.persona-card:hover {
  background: var(--bg-glass-hover);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.persona-card.active {
  background: rgba(99, 102, 241, 0.18);
  border-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.35);
}

.persona-card.active::before {
  content: '✓ 선택됨';
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--accent-highlight);
  background: rgba(14, 165, 233, 0.2);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.persona-card .p-icon {
  font-size: 1.6rem;
  margin-bottom: 6px;
}

.persona-card .p-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.persona-card .p-subtitle {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.persona-detail-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  padding: 14px;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.persona-detail-box .p-desc {
  margin-bottom: 10px;
  color: #e2e8f0;
  line-height: 1.45;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-highlight);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-weight: 600;
}

/* Custom Profile Sliders & Filters */
.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.filter-label .value-badge {
  color: var(--accent-highlight);
  font-weight: 700;
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.select-custom {
  width: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.select-custom:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

.radio-pills {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.radio-pills.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.radio-pill-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 8px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: var(--transition-fast);
}

.radio-pill-btn:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
}

.radio-pill-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
}

/* Congestion Simulation Slider */
.timeline-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-time-badge {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--accent-highlight);
  font-family: monospace;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.step-label {
  font-size: 0.82rem;
  color: var(--accent-amber);
  font-weight: 600;
  text-align: right;
  max-width: 180px;
}

.custom-range {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: #334155;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent-highlight);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.custom-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.timeline-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.timeline-controls {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.btn-timeline {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 8px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: var(--transition-fast);
}

.btn-timeline:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Dynamic Boost Notice */
.boost-banner {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15));
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.78rem;
  color: #fde68a;
  animation: glowPulse 2s infinite alternate;
}

@keyframes glowPulse {
  0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.2); }
  100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
}

/* Main Content Area */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* View Switcher Tabs */
.tab-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 6px;
}

.tab-btn-group {
  display: flex;
  gap: 6px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.stats-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 14px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stats-summary strong {
  color: var(--text-primary);
}

/* Recommendation Results Cards */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

.rec-card {
  background: var(--bg-glass-card);
  backdrop-filter: blur(16px);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: var(--transition-bounce);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rec-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: var(--shadow-glow);
}

.rec-card.rank-1 {
  border-color: rgba(236, 72, 153, 0.5);
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.85), rgba(76, 29, 149, 0.25));
}

.rec-card.rank-1::before {
  content: 'TOP 1 PICK';
  position: absolute;
  top: 14px;
  right: -30px;
  transform: rotate(45deg);
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 3px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  font-weight: 900;
  font-size: 0.85rem;
  background: #334155;
  color: white;
}

.rank-1 .rank-badge {
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.score-badge {
  text-align: right;
}

.score-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--accent-highlight);
  line-height: 1;
}

.score-label {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.card-title-wrap {
  margin-bottom: 10px;
}

.district-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.zone-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.zone-core { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.zone-participate { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.zone-connect { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }

.district-theme {
  font-size: 0.82rem;
  color: var(--accent-purple);
  font-weight: 600;
  margin-top: 2px;
}

.district-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin-bottom: 14px;
}

/* Card Metrics Grid */
.card-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  padding: 10px;
  border-radius: var(--radius-md);
  margin-bottom: 14px;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.metric-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Congestion Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.status-쾌적 { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.status-혼잡 { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.status-위험 { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.card-footer-action {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn-card-action {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: var(--transition-fast);
}

.btn-card-action:hover {
  background: var(--accent-primary);
  color: white;
}

.btn-card-stores {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-highlight);
  border-color: rgba(56, 189, 248, 0.3);
}

.btn-card-stores:hover {
  background: var(--accent-highlight);
  color: var(--bg-primary);
}

/* Interactive Map Container */
.map-container-wrap {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.map-legends {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

#troikaMap {
  width: 100%;
  height: 480px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  z-index: 10;
}

/* Custom Leaflet Map Styling */
.leaflet-popup-content-wrapper {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-primary) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-lg) !important;
}

.leaflet-popup-tip {
  background: rgba(15, 23, 42, 0.95) !important;
}

/* Tour Course Cards */
.course-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .course-section {
    grid-template-columns: 1fr;
  }
}

.course-card {
  background: var(--bg-glass-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: var(--transition-bounce);
}

.course-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.2);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.course-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.course-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.course-stops {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  padding-left: 12px;
}

.course-stops::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: rgba(255, 255, 255, 0.15);
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stop-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-highlight);
  position: relative;
  z-index: 1;
}

.btn-course-apply {
  margin-top: auto;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 8px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-course-apply:hover {
  background: var(--accent-purple);
  color: white;
}

/* Economic Impact Dashboard Grid */
.econ-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .econ-dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
}

.econ-kpi-card {
  background: var(--bg-glass-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.kpi-title {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1.2;
}

.kpi-sub {
  font-size: 0.72rem;
  color: var(--accent-emerald);
  margin-top: 4px;
}

/* Stamp Pass Section */
.stamp-pass-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(236, 72, 153, 0.35);
  border-radius: var(--radius-lg);
  padding: 22px;
  position: relative;
  overflow: hidden;
}

.stamp-pass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stamp-pass-title {
  font-size: 1.15rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stamp-slots-wrap {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  margin: 20px 0;
}

.stamp-slot {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  padding: 16px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: var(--transition-bounce);
}

.stamp-slot:hover {
  border-color: var(--accent-pink);
  background: rgba(236, 72, 153, 0.1);
}

.stamp-slot.stamped {
  border-style: solid;
  border-color: var(--accent-emerald);
  background: rgba(16, 185, 129, 0.15);
}

.stamp-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.stamped .stamp-icon-box {
  background: var(--accent-emerald);
  color: white;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.stamp-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stamp-reward-banner {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
}

.modal-backdrop.active {
  opacity: 1;
  visibility: visible;
}

.modal-card {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  box-shadow: var(--shadow-lg);
  transform: scale(0.95);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-backdrop.active .modal-card {
  transform: scale(1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Quiz UI inside Modal */
.quiz-step-progress {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.progress-bar-seg {
  flex: 1;
  height: 6px;
  background: #334155;
  border-radius: var(--radius-full);
}

.progress-bar-seg.filled {
  background: var(--accent-primary);
}

.quiz-question-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 18px;
  line-height: 1.4;
}

.quiz-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz-option-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
}

.quiz-option-btn:hover {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.15);
  transform: translateX(4px);
}

/* Store List Modal */
.partner-stores-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.partner-store-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.store-info-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.store-category-tag {
  font-size: 0.7rem;
  color: var(--accent-highlight);
}

.store-benefit-desc {
  font-size: 0.8rem;
  color: #fde68a;
  margin-top: 4px;
}

.btn-stamp-action {
  background: linear-gradient(135deg, var(--accent-emerald), #059669);
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-stamp-action:hover {
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--border-subtle);
  background: rgba(10, 14, 26, 0.95);
  padding: 24px 0;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
}

```
