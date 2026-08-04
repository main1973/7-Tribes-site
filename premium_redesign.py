#!/usr/bin/env python3
"""Premium Homepage Redesign - Replace all sections below hero with premium versions."""

with open('index.html', 'r') as f:
    content = f.read()

# Find boundaries
main_start = content.find('    <!-- WHY COMMUNITIES STRUGGLE -->')
body_end = content.find('</body>')

# The new premium sections HTML
new_sections = '''    <!-- WHY COMMUNITIES STRUGGLE -->
    <section class="section struggle-section" id="why-struggle">
      <div class="wrap">
        <h2 class="premium-title">Why Communities Struggle</h2>
        <div class="premium-cards-grid">
          <div class="premium-card" data-animate="fade-up">
            <div class="premium-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="16" cy="16" r="6"/>
                <circle cx="32" cy="16" r="6"/>
                <circle cx="24" cy="34" r="6"/>
                <line x1="16" y1="22" x2="24" y2="28" stroke-dasharray="3 3" opacity="0.4"/>
                <line x1="32" y1="22" x2="24" y2="28" stroke-dasharray="3 3" opacity="0.4"/>
              </svg>
            </div>
            <h3>Disconnected People</h3>
            <p>Without connection, people cannot collaborate, share resources, or build together. Isolation prevents collective power.</p>
          </div>
          <div class="premium-card" data-animate="fade-up" data-delay="100">
            <div class="premium-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="8" y="20" width="12" height="18" rx="2"/>
                <rect x="28" y="14" width="12" height="24" rx="2"/>
                <line x1="20" y1="30" x2="28" y2="26" stroke-dasharray="3 3" opacity="0.4"/>
              </svg>
            </div>
            <h3>Businesses Without Networks</h3>
            <p>Local businesses struggle without a community ecosystem to support them. No network means no customers, no referrals, no growth.</p>
          </div>
          <div class="premium-card" data-animate="fade-up" data-delay="200">
            <div class="premium-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="24" cy="24" r="16"/>
                <path d="M24 8 L24 14 M24 34 L24 40" stroke-dasharray="2 2"/>
                <path d="M16 24 C16 24 20 16 28 20 C36 24 32 32 24 32 C16 32 12 28 16 24" opacity="0.6"/>
                <line x1="30" y1="30" x2="40" y2="40" stroke-width="2"/>
              </svg>
            </div>
            <h3>Money Leaves Too Quickly</h3>
            <p>Wealth flows out of communities faster than it circulates locally. Without internal circulation, economies weaken from within.</p>
          </div>
        </div>
        <p class="premium-conclusion" data-animate="fade-up">There is another way. Organized communities create stronger economies.</p>
      </div>
    </section>

    <!-- ORGANIZE SECTION -->
    <section class="section organize-section" id="organize">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">Organize</h2>
        <p class="premium-subtitle" data-animate="fade-up">People Must Connect Before They Can Build</p>
        <div class="network-viz" data-animate="fade-up">
          <svg viewBox="0 0 600 400" class="network-interactive" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="node-glow">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(255,215,122,0.4)"/>
                <stop offset="100%" stop-color="rgba(255,215,122,0)"/>
              </radialGradient>
            </defs>
            <!-- Connection lines (animated) -->
            <g class="connection-lines" opacity="0.6">
              <line x1="300" y1="200" x2="150" y2="100" class="conn-line"/>
              <line x1="300" y1="200" x2="450" y2="100" class="conn-line"/>
              <line x1="300" y1="200" x2="120" y2="300" class="conn-line"/>
              <line x1="300" y1="200" x2="480" y2="300" class="conn-line"/>
              <line x1="300" y1="200" x2="300" y2="60" class="conn-line"/>
            </g>
            <!-- Center hub glow -->
            <circle cx="300" cy="200" r="60" fill="url(#hub-gradient)" class="hub-pulse"/>
            <!-- Center hub -->
            <circle cx="300" cy="200" r="36" fill="rgba(255,215,122,0.15)" stroke="rgba(255,215,122,0.8)" stroke-width="2" filter="url(#node-glow)" class="center-hub"/>
            <text x="300" y="195" text-anchor="middle" fill="#FFD77A" font-size="11" font-weight="700">COMMUNITY</text>
            <text x="300" y="210" text-anchor="middle" fill="#FFD77A" font-size="11" font-weight="700">HUB</text>
            <!-- Outer nodes -->
            <g class="network-node" data-label="Create your profile, share your skills, and become discoverable.">
              <circle cx="150" cy="100" r="24" fill="rgba(255,215,122,0.08)" stroke="rgba(255,215,122,0.5)" stroke-width="1.5"/>
              <text x="150" y="104" text-anchor="middle" fill="#FFD77A" font-size="9" font-weight="600">Create Profile</text>
            </g>
            <g class="network-node" data-label="Discover members in your city and connect with like-minded people.">
              <circle cx="450" cy="100" r="24" fill="rgba(255,215,122,0.08)" stroke="rgba(255,215,122,0.5)" stroke-width="1.5"/>
              <text x="450" y="104" text-anchor="middle" fill="#FFD77A" font-size="9" font-weight="600">Meet Members</text>
            </g>
            <g class="network-node" data-label="Join discussions, share ideas, and participate in community decisions.">
              <circle cx="120" cy="300" r="24" fill="rgba(255,215,122,0.08)" stroke="rgba(255,215,122,0.5)" stroke-width="1.5"/>
              <text x="120" y="296" text-anchor="middle" fill="#FFD77A" font-size="8" font-weight="600">Join</text>
              <text x="120" y="308" text-anchor="middle" fill="#FFD77A" font-size="8" font-weight="600">Conversations</text>
            </g>
            <g class="network-node" data-label="Find your city, your community, your people. Build relationships.">
              <circle cx="480" cy="300" r="24" fill="rgba(255,215,122,0.08)" stroke="rgba(255,215,122,0.5)" stroke-width="1.5"/>
              <text x="480" y="296" text-anchor="middle" fill="#FFD77A" font-size="8" font-weight="600">Find Your</text>
              <text x="480" y="308" text-anchor="middle" fill="#FFD77A" font-size="8" font-weight="600">Tribe</text>
            </g>
            <g class="network-node" data-label="Coordinate projects, events, and initiatives with your community.">
              <circle cx="300" cy="60" r="24" fill="rgba(255,215,122,0.08)" stroke="rgba(255,215,122,0.5)" stroke-width="1.5"/>
              <text x="300" y="56" text-anchor="middle" fill="#FFD77A" font-size="8" font-weight="600">Organize</text>
              <text x="300" y="68" text-anchor="middle" fill="#FFD77A" font-size="8" font-weight="600">Together</text>
            </g>
          </svg>
          <div class="network-tooltip" id="network-tooltip"></div>
        </div>
        <p class="premium-description" data-animate="fade-up">
          <strong>Loop</strong> is the community town hall where members create profiles, organize, discuss, post updates, join city conversations, and start participating in the 7Tribes ecosystem.
        </p>
        <div class="premium-cta" data-animate="fade-up">
          <a href="https://loop.7trb.com" class="btn gold premium-btn">Enter Loop</a>
        </div>
      </div>
    </section>

    <!-- BUILD SECTION -->
    <section class="section build-section" id="build">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">Build</h2>
        <p class="premium-subtitle" data-animate="fade-up">Community Powers Businesses</p>
        <div class="build-cards-grid">
          <div class="build-card" data-animate="fade-up">
            <div class="build-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="24" cy="14" r="6"/>
                <circle cx="12" cy="34" r="5"/>
                <circle cx="36" cy="34" r="5"/>
                <line x1="24" y1="20" x2="12" y2="29"/>
                <line x1="24" y1="20" x2="36" y2="29"/>
                <line x1="12" y1="34" x2="36" y2="34" stroke-dasharray="3 3" opacity="0.5"/>
              </svg>
            </div>
            <h3>Community</h3>
            <p>Members organize around shared goals and mutual support.</p>
            <span class="build-card-arrow">&rarr;</span>
          </div>
          <div class="build-card" data-animate="fade-up" data-delay="80">
            <div class="build-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="10" y="16" width="28" height="22" rx="3"/>
                <line x1="10" y1="24" x2="38" y2="24"/>
                <rect x="14" y="28" width="8" height="6" rx="1"/>
                <rect x="26" y="28" width="8" height="6" rx="1"/>
              </svg>
            </div>
            <h3>Businesses</h3>
            <p>Entrepreneurs create products and services for the community.</p>
            <span class="build-card-arrow">&rarr;</span>
          </div>
          <div class="build-card" data-animate="fade-up" data-delay="160">
            <div class="build-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8 38 L8 18 L24 8 L40 18 L40 38"/>
                <rect x="18" y="26" width="12" height="12"/>
                <line x1="24" y1="26" x2="24" y2="38"/>
              </svg>
            </div>
            <h3>Storefronts</h3>
            <p>Businesses become discoverable within the ecosystem.</p>
            <span class="build-card-arrow">&rarr;</span>
          </div>
          <div class="build-card" data-animate="fade-up" data-delay="240">
            <div class="build-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="10" y="10" width="28" height="28" rx="4"/>
                <line x1="10" y1="20" x2="38" y2="20"/>
                <circle cx="24" cy="32" r="4"/>
                <path d="M20 32 L28 32"/>
              </svg>
            </div>
            <h3>Projects</h3>
            <p>Economic circulation funds community growth initiatives.</p>
            <span class="build-card-arrow">&rarr;</span>
          </div>
          <div class="build-card" data-animate="fade-up" data-delay="320">
            <div class="build-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M24 8 L24 16"/>
                <path d="M16 12 L24 16 L32 12"/>
                <rect x="12" y="16" width="24" height="24" rx="3"/>
                <path d="M18 26 L22 30 L30 22"/>
              </svg>
            </div>
            <h3>Builders</h3>
            <p>Developers and creators build tools that strengthen the ecosystem.</p>
            <span class="build-card-arrow">&rarr;</span>
          </div>
        </div>
        <p class="premium-description" data-animate="fade-up">
          <strong>Connect</strong> is the marketplace where merchants, creators, developers, and service providers exchange value using 7TRB. Build your business. Find your customers. Grow together.
        </p>
        <div class="premium-cta" data-animate="fade-up">
          <a href="https://connect.7trb.com" class="btn gold premium-btn">Explore Connect</a>
        </div>
      </div>
    </section>

    <!-- CIRCULATE SECTION -->
    <section class="section circulate-section" id="circulate">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">Circulate</h2>
        <p class="premium-subtitle" data-animate="fade-up">Value Moves Through the Entire Ecosystem</p>
        <div class="orbit-container" data-animate="fade-up">
          <div class="orbit-center">
            <img src="images/7trb_symbol.png" alt="7TRB" class="orbit-logo"/>
            <div class="orbit-pulse"></div>
          </div>
          <div class="orbit-ring orbit-ring-1">
            <div class="orbit-node" data-label="Members"><span>Members</span></div>
            <div class="orbit-node" data-label="Businesses"><span>Businesses</span></div>
            <div class="orbit-node" data-label="Merchants"><span>Merchants</span></div>
            <div class="orbit-node" data-label="Builders"><span>Builders</span></div>
          </div>
          <div class="orbit-ring orbit-ring-2">
            <div class="orbit-node" data-label="Creators"><span>Creators</span></div>
            <div class="orbit-node" data-label="Rewards"><span>Rewards</span></div>
            <div class="orbit-node" data-label="Projects"><span>Projects</span></div>
            <div class="orbit-node" data-label="Referrals"><span>Referrals</span></div>
          </div>
          <svg class="orbit-lines" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,215,122,0.2)" stroke-width="1" stroke-dasharray="4 4"/>
            <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255,215,122,0.15)" stroke-width="1" stroke-dasharray="4 4"/>
            <circle cx="200" cy="200" r="40" fill="none" stroke="rgba(255,215,122,0.4)" stroke-width="1.5" class="orbit-energy"/>
          </svg>
        </div>
        <p class="premium-description" data-animate="fade-up">
          7TRB supports participation, referrals, rewards, and merchant benefits. Value circulates continuously through members, businesses, builders, and creators — strengthening the entire community.
        </p>
        <div class="premium-cta" data-animate="fade-up">
          <a href="learn.html" class="btn gold premium-btn">Learn About 7TRB</a>
        </div>
      </div>
    </section>

    <!-- ECOSYSTEM MAP -->
    <section class="section ecosystem-map-section" id="ecosystem-map">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">The Ecosystem</h2>
        <p class="premium-subtitle" data-animate="fade-up">Five layers working together</p>
        <div class="eco-map-grid" data-animate="fade-up">
          <div class="eco-map-card active" onclick="selectEcosystem(this, 0)">
            <div class="eco-map-icon">
              <img src="images/7trb_symbol.png" alt="7TRB" style="width:32px;height:32px;"/>
            </div>
            <h3>7TRB</h3>
            <p>Education and economic model</p>
            <a href="learn.html" class="eco-map-link">Learn More &rarr;</a>
          </div>
          <div class="eco-map-card" onclick="selectEcosystem(this, 1)">
            <div class="eco-map-icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="16" r="12"/><path d="M10 16 L14 20 L22 12"/></svg>
            </div>
            <h3>Loop</h3>
            <p>Town hall and community</p>
            <a href="https://loop.7trb.com" class="eco-map-link">Enter Loop &rarr;</a>
          </div>
          <div class="eco-map-card" onclick="selectEcosystem(this, 2)">
            <div class="eco-map-icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="24" height="16" rx="3"/><line x1="4" y1="14" x2="28" y2="14"/></svg>
            </div>
            <h3>Connect</h3>
            <p>Marketplace and profiles</p>
            <a href="https://connect.7trb.com" class="eco-map-link">Explore Connect &rarr;</a>
          </div>
          <div class="eco-map-card" onclick="selectEcosystem(this, 3)">
            <div class="eco-map-icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="20" height="24" rx="3"/><circle cx="16" cy="22" r="3"/></svg>
            </div>
            <h3>Nuru</h3>
            <p>Wallet, identity, and dApp browser</p>
            <a href="https://play.google.com/store/apps/details?id=com.alkebuleum.nuru" target="_blank" rel="noopener" class="eco-map-link">Download Nuru &rarr;</a>
          </div>
          <div class="eco-map-card" onclick="selectEcosystem(this, 4)">
            <div class="eco-map-icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="24" height="16" rx="2"/><path d="M4 14 L28 14"/><circle cx="8" cy="11" r="1.5" fill="currentColor"/><circle cx="13" cy="11" r="1.5" fill="currentColor"/></svg>
            </div>
            <h3>Alkebuleum</h3>
            <p>Blockchain infrastructure</p>
            <a href="ecosystem.html" class="eco-map-link">Learn More &rarr;</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ROLE SELECTOR -->
    <section class="section role-section" id="role-selector">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">Choose Your Role</h2>
        <p class="premium-subtitle" data-animate="fade-up">Everyone has a place in the ecosystem</p>
        <div class="role-cards-grid" data-animate="fade-up">
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="14" r="6"/><path d="M8 36 C8 28 14 24 20 24 C26 24 32 28 32 36"/></svg>
            </div>
            <h3>Member</h3>
            <p>Join the community, build your profile, participate.</p>
          </div>
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="12" width="28" height="20" rx="3"/><line x1="6" y1="20" x2="34" y2="20"/><path d="M14 26 L18 30 L26 22"/></svg>
            </div>
            <h3>Merchant</h3>
            <p>Open your storefront, accept 7TRB, grow your business.</p>
          </div>
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="24" height="24" rx="3"/><path d="M14 20 L20 14 L26 20 L20 26 Z"/></svg>
            </div>
            <h3>Builder</h3>
            <p>Create tools, apps, and services for the ecosystem.</p>
          </div>
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 32 L8 12 L16 8 L24 12 L24 8 L32 12 L32 32"/><line x1="8" y1="32" x2="32" y2="32"/></svg>
            </div>
            <h3>Developer</h3>
            <p>Build on Alkebuleum, integrate APIs, ship code.</p>
          </div>
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="20" r="12"/><path d="M14 20 L18 24 L26 16"/></svg>
            </div>
            <h3>Creator</h3>
            <p>Produce content, art, music, and media for the community.</p>
          </div>
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="16" r="6"/><circle cx="10" cy="28" r="4"/><circle cx="30" cy="28" r="4"/><line x1="20" y1="22" x2="10" y2="24"/><line x1="20" y1="22" x2="30" y2="24"/></svg>
            </div>
            <h3>Organizer</h3>
            <p>Lead initiatives, coordinate events, build movements.</p>
          </div>
          <div class="role-card">
            <div class="role-card-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 8 L24 16 L32 17 L26 23 L28 32 L20 28 L12 32 L14 23 L8 17 L16 16 Z"/></svg>
            </div>
            <h3>Supporter</h3>
            <p>Invest in the vision, hold 7TRB, support growth.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BLUEPRINT SECTION -->
    <section class="section blueprint-section" id="blueprint">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">The Blueprint Behind 7Tribes</h2>
        <p class="premium-subtitle" data-animate="fade-up">A practical guide to building community economies</p>
        <div class="blueprint-showcase" data-animate="fade-up">
          <div class="blueprint-book">
            <div class="book-glow"></div>
            <div class="book-visual">
              <div class="book-cover">
                <img src="images/7trb_symbol.png" alt="7Tribes Blueprint" style="width:64px;height:64px;margin:0 auto 16px;display:block;"/>
                <span class="book-title-text">7Tribes<br/>Blueprint</span>
              </div>
            </div>
          </div>
          <div class="blueprint-chapters">
            <div class="chapter-card">
              <span class="chapter-num">01</span>
              <h4>Organize</h4>
              <p>Connect people, build networks, form community.</p>
            </div>
            <div class="chapter-card">
              <span class="chapter-num">02</span>
              <h4>Build</h4>
              <p>Create businesses, storefronts, and projects.</p>
            </div>
            <div class="chapter-card">
              <span class="chapter-num">03</span>
              <h4>Circulate</h4>
              <p>Move value through the ecosystem continuously.</p>
            </div>
          </div>
        </div>
        <div class="blueprint-ctas" data-animate="fade-up">
          <a href="https://gumroad.com" target="_blank" rel="noopener" class="btn gold premium-btn">Buy Book</a>
          <a href="learn.html" class="btn ghost premium-btn">Read Field Manual</a>
          <a href="learn.html" class="btn ghost premium-btn">Learn More</a>
        </div>
      </div>
    </section>

    <!-- COMMUNITY GROWTH SIMULATOR -->
    <section class="section simulator-section" id="simulator">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">Community Growth Simulator</h2>
        <p class="premium-subtitle" data-animate="fade-up">See how organized communities create economic power</p>
        <div class="sim-dashboard" data-animate="fade-up">
          <div class="sim-controls">
            <div class="sim-slider-group">
              <label>Members <span id="members-value">500</span></label>
              <input type="range" id="members-slider" min="10" max="10000" value="500" oninput="updateSimulator()"/>
            </div>
            <div class="sim-slider-group">
              <label>Businesses <span id="businesses-value">25</span></label>
              <input type="range" id="businesses-slider" min="1" max="500" value="25" oninput="updateSimulator()"/>
            </div>
            <div class="sim-slider-group">
              <label>Builders <span id="builders-value">10</span></label>
              <input type="range" id="builders-slider" min="1" max="200" value="10" oninput="updateSimulator()"/>
            </div>
            <div class="sim-slider-group">
              <label>Creators <span id="creators-value">15</span></label>
              <input type="range" id="creators-slider" min="1" max="200" value="15" oninput="updateSimulator()"/>
            </div>
            <div class="sim-slider-group">
              <label>Referral Rate <span id="referrals-value">20%</span></label>
              <input type="range" id="referrals-slider" min="5" max="80" value="20" oninput="updateSimulator()"/>
            </div>
          </div>
          <div class="sim-results">
            <div class="sim-stat">
              <span class="sim-stat-value" id="connections-result">12,375</span>
              <span class="sim-stat-label">Connections</span>
            </div>
            <div class="sim-stat">
              <span class="sim-stat-value" id="active-businesses-result">25</span>
              <span class="sim-stat-label">Active Businesses</span>
            </div>
            <div class="sim-stat">
              <span class="sim-stat-value" id="participation-result">10%</span>
              <span class="sim-stat-label">Participation Score</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DETROIT SECTION -->
    <section class="section detroit-section" id="detroit">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">Detroit: Flagship City</h2>
        <p class="premium-subtitle" data-animate="fade-up">Building the model for community-powered economies</p>
        <div class="detroit-stats" data-animate="fade-up">
          <div class="detroit-stat">
            <span class="detroit-stat-value" data-count="247">0</span>
            <span class="detroit-stat-label">Members</span>
          </div>
          <div class="detroit-stat">
            <span class="detroit-stat-value" data-count="34">0</span>
            <span class="detroit-stat-label">Businesses</span>
          </div>
          <div class="detroit-stat">
            <span class="detroit-stat-value" data-count="12">0</span>
            <span class="detroit-stat-label">Projects</span>
          </div>
          <div class="detroit-stat">
            <span class="detroit-stat-value" data-count="89">0</span>
            <span class="detroit-stat-label">Community Growth %</span>
          </div>
        </div>
        <div class="premium-cta" data-animate="fade-up">
          <a href="https://loop.7trb.com" class="btn gold premium-btn">Join Detroit in Loop</a>
        </div>
      </div>
    </section>

    <!-- CLOSING SECTION -->
    <section class="section closing-section" id="closing">
      <div class="wrap">
        <h2 class="premium-title" data-animate="fade-up">The Infrastructure Is Being Built</h2>
        <p class="premium-subtitle" data-animate="fade-up">Join the ecosystem. Start organizing. Build something real.</p>
        <div class="closing-ctas" data-animate="fade-up">
          <a href="https://loop.7trb.com" class="btn gold premium-btn">Join Loop</a>
          <a href="https://connect.7trb.com" class="btn ghost premium-btn">Explore Connect</a>
          <a href="https://play.google.com/store/apps/details?id=com.alkebuleum.nuru" target="_blank" rel="noopener" class="btn ghost premium-btn">Download Nuru</a>
          <a href="learn.html" class="btn ghost premium-btn">Read Blueprint</a>
        </div>
      </div>
    </section>
  </main>

  <!-- PREMIUM FOOTER -->
  <footer class="premium-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="images/7trb_symbol.png" alt="7TRB" class="footer-logo"/>
          <p class="footer-mission">Organize. Build. Circulate. A practical blueprint for connecting people, growing businesses, and building stronger community economies.</p>
        </div>
        <div class="footer-col">
          <h4>Platform</h4>
          <a href="https://loop.7trb.com">Loop</a>
          <a href="https://connect.7trb.com">Connect</a>
          <a href="https://play.google.com/store/apps/details?id=com.alkebuleum.nuru" target="_blank" rel="noopener">Nuru</a>
          <a href="https://jollofswap.com" target="_blank" rel="noopener">JollofSwap</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="learn.html">Learn</a>
          <a href="ecosystem.html">Ecosystem</a>
          <a href="transparency.html">Transparency</a>
          <a href="dashboard.html">Dashboard</a>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <a href="https://t.me/SevenTribeowner" target="_blank" rel="noopener">Telegram</a>
          <a href="builders.html">Builders</a>
          <a href="developers.html">Developers</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2025 7Tribes &bull; Mainhouse Oasis LLC</span>
        <span id="visitor-count">Visitors: 0</span>
      </div>
    </div>
  </footer>
'''

# Replace the old content with new premium sections
content = content[:main_start] + new_sections + '\n' + content[body_end:]

with open('index.html', 'w') as f:
    f.write(content)

print("Premium sections HTML replaced successfully")
