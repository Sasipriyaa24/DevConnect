import { Link } from 'react-router-dom'
import '../styles/Home.css'

/**
 * Marketing landing page for DevConnect.
 * Each section is a semantic <section> for accessibility and clarity.
 */
function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="section-inner home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Developer community platform</p>
            <h1 className="home-title">
              Connect, share, and grow with <span>DevConnect</span>
            </h1>
            <p className="home-subtitle">
              Build your profile, share what you are learning, and discover developers who care about
              clean code, collaboration, and continuous improvement.
            </p>
            <div className="home-hero-actions">
              <Link to="/signup" className="btn btn-primary home-hero-primary">
                Join the community
              </Link>
              <Link to="/feed" className="btn btn-ghost home-hero-secondary">
                Explore the feed
              </Link>
            </div>
            <dl className="home-hero-stats">
              <div>
                <dt>Active builders</dt>
                <dd>12k+</dd>
              </div>
              <div>
                <dt>Weekly posts</dt>
                <dd>3.4k</dd>
              </div>
              <div>
                <dt>Meetups hosted</dt>
                <dd>180+</dd>
              </div>
            </dl>
          </div>
          <div className="home-hero-panel" aria-hidden="true">
            <div className="home-hero-orbit" />
            <div className="home-hero-card">
              <header className="home-hero-card-header">
                <span className="home-pill">Live activity</span>
                <span className="home-hero-card-title">Community pulse</span>
              </header>
              <ul className="home-hero-feed">
                <li>
                  <span className="home-dot home-dot-green" />
                  <div>
                    <p>Alex shipped a new open-source CLI tool.</p>
                    <small>2 minutes ago</small>
                  </div>
                </li>
                <li>
                  <span className="home-dot home-dot-blue" />
                  <div>
                    <p>Mina posted a deep dive on PostgreSQL indexing.</p>
                    <small>18 minutes ago</small>
                  </div>
                </li>
                <li>
                  <span className="home-dot home-dot-violet" />
                  <div>
                    <p>Jamal started a thread on system design patterns.</p>
                    <small>Just now</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-features" id="features">
        <div className="section-inner">
          <header className="home-section-header">
            <h2>Everything you need to stay in flow</h2>
            <p>
              DevConnect is designed around how real engineering teams communicate — async, focused,
              and friendly.
            </p>
          </header>
          <div className="home-feature-grid">
            <article className="home-card">
              <h3>Rich developer profiles</h3>
              <p>Showcase your stack, side projects, and the problems you enjoy solving.</p>
            </article>
            <article className="home-card">
              <h3>Thoughtful feed</h3>
              <p>Share updates, ask questions, and learn from a community that values depth.</p>
            </article>
            <article className="home-card">
              <h3>Activity dashboard</h3>
              <p>Track engagement, saved posts, and your own writing streak over time.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section home-popular">
        <div className="section-inner">
          <header className="home-section-header">
            <h2>Popular developers this week</h2>
            <p>Static preview data for now — will be powered by Supabase in a later phase.</p>
          </header>
          <div className="home-popular-grid">
            {[
              { name: 'Sofia Chen', role: 'Full-stack · Design systems', initials: 'SC' },
              { name: 'Noah Williams', role: 'Backend · Postgres enthusiast', initials: 'NW' },
              { name: 'Priya Desai', role: 'Frontend · Performance nerd', initials: 'PD' },
            ].map((dev) => (
              <article key={dev.name} className="home-popular-card">
                <div className="home-avatar">{dev.initials}</div>
                <div>
                  <h3>{dev.name}</h3>
                  <p>{dev.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-community">
        <div className="section-inner home-community-inner">
          <div>
            <h2>Built for community, not noise</h2>
            <p>
              Whether you are early in your journey or leading teams, DevConnect gives you space to
              share wins, debug tricky problems, and celebrate shipping.
            </p>
            <ul className="home-community-list">
              <li>Weekly highlights curated from real posts</li>
              <li>Skill-based discovery to find your people</li>
              <li>Respect-first guidelines baked into the product</li>
            </ul>
          </div>
          <div className="home-community-panel">
            <div className="home-community-tag">Community values</div>
            <p className="home-community-quote">
              “The best feed is the one where you leave smarter than you arrived.”
            </p>
          </div>
        </div>
      </section>

      <section className="home-section home-cta">
        <div className="section-inner home-cta-inner">
          <div>
            <h2>Ready to share your next build?</h2>
            <p>Create a free account, set up your profile, and publish your first post in minutes.</p>
          </div>
          <Link to="/signup" className="btn btn-primary home-cta-button">
            Get started for free
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="section-inner home-footer-inner">
          <div className="home-footer-brand">
            <span className="navbar-logo-mark">{'</>'}</span>
            <div>
              <strong>DevConnect</strong>
              <p>A modern home for developers who like to build in public.</p>
            </div>
          </div>
          <div className="home-footer-columns">
            <div>
              <h4>Product</h4>
              <Link to="/feed">Feed</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profiles</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Sign up</Link>
              <Link to="/create-post">Create post</Link>
            </div>
          </div>
          <p className="home-footer-meta">© {new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
