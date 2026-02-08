import './App.css'

export default function App() {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">Manish Jawa</h1>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#expertise">Expertise</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-content">
          <h1>Manish Jawa</h1>
          <p className="hero-subtitle">Engineering Leader | AI/ML | Distributed Systems</p>
          <p className="hero-desc">18+ years building high-impact distributed systems at scale</p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-primary">Let's Talk</a>
            <a href="mailto:jawa.manish@gmail.com" className="btn btn-secondary">Email</a>
          </div>
        </div>
      </header>

      {/* Key Stats */}
      <section className="stats">
        <div className="stat-card">
          <h3>18+</h3>
          <p>Years Experience</p>
        </div>
        <div className="stat-card">
          <h3>4</h3>
          <p>Patents Granted</p>
        </div>
        <div className="stat-card">
          <h3>100M+</h3>
          <p>Content/Day Impact</p>
        </div>
        <div className="stat-card">
          <h3>3x</h3>
          <p>Revenue Growth</p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about">
        <h2>About</h2>
        <p>
          Seasoned Engineering Leader with deep expertise in building large-scale, distributed systems. 
          Proven track record of leading high-performance engineering teams, driving product strategy, 
          and delivering significant business impact across Meta, Amazon, Atlassian, and other leading companies.
        </p>
        <p>
          Specialized in microservices architecture, AI/ML systems, developer productivity tools, and 
          organizational scaling. Strong foundation in operating systems, computer architecture, and 
          modern distributed computing.
        </p>
      </section>

      {/* Featured Companies */}
      <section className="companies">
        <h2>Featured Companies</h2>
        <div className="company-grid">
          <div className="company-card">
            <h3>Meta</h3>
            <p>Software Engineering Manager</p>
            <p className="date">2022 - Present</p>
            <p className="highlight">3x revenue impact | Led 18 ICs | Mobile Ads Experience</p>
          </div>
          <div className="company-card">
            <h3>Atlassian</h3>
            <p>Sr Engineering Manager</p>
            <p className="date">2023 - 2024</p>
            <p className="highlight">1.5x productivity increase | Built observability + AI/LLM tools</p>
          </div>
          <div className="company-card">
            <h3>Amazon</h3>
            <p>Software Development Manager</p>
            <p className="date">2020 - 2022</p>
            <p className="highlight">20% order volume increase | Led 24 engineers</p>
          </div>
          <div className="company-card">
            <h3>Flipkart</h3>
            <p>Engineering Manager</p>
            <p className="date">2018 - 2019</p>
            <p className="highlight">10% cost savings | 100M content/day automation</p>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section id="experience" className="experience">
        <h2>Experience</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Meta</h3>
              <p className="role">Software Engineering Manager - AI in Ads</p>
              <p className="date">Apr 2024 - Present</p>
              <ul>
                <li>Leading AI in Ads Products with significant revenue growth</li>
                <li>AI in Developer Productivity initiatives</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Atlassian</h3>
              <p className="role">Sr Engineering Manager</p>
              <p className="date">Aug 2023 - Mar 2024</p>
              <ul>
                <li>Built observability and generative AI in developer productivity toolchain</li>
                <li>Increased developer productivity by 1.5x</li>
                <li>Led 18 ICs from 0 to 1</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Meta - UK</h3>
              <p className="role">Engineering Manager - Mobile Ads Experience</p>
              <p className="date">Jan 2022 - Aug 2023</p>
              <ul>
                <li>Revamped 3-year product strategy with VP alignment</li>
                <li>Achieved 3x revenue impact target</li>
                <li>Scaled team to 18 ICs through hiring and transfers</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Amazon</h3>
              <p className="role">Software Development Manager</p>
              <p className="date">May 2020 - Jan 2022</p>
              <ul>
                <li>Delivered data-driven recommendation system</li>
                <li>Improved daily order volume by 20%</li>
                <li>Led 24 engineers including 1 EM</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Flipkart</h3>
              <p className="role">Engineering Manager - Auto-Content Platform</p>
              <p className="date">May 2018 - Oct 2019</p>
              <ul>
                <li>Built AI/ML system for automated content creation (100M content/day)</li>
                <li>10% cost savings during sale events</li>
                <li>Led product roadmap and end-to-end delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section id="expertise" className="expertise">
        <h2>Expertise</h2>
        <div className="expertise-grid">
          <div className="expertise-card">
            <h3>🏗️ Architecture</h3>
            <p>Large-scale distributed systems, microservices, high-availability platforms</p>
          </div>
          <div className="expertise-card">
            <h3>🤖 AI/ML</h3>
            <p>Recommendation engines, ML platforms, generative AI, chatbots</p>
          </div>
          <div className="expertise-card">
            <h3>👥 Leadership</h3>
            <p>Team scaling, org building, high-performance culture, strategic planning</p>
          </div>
          <div className="expertise-card">
            <h3>🛠️ Systems</h3>
            <p>Operating systems, computer architecture, mobile virtualization, security</p>
          </div>
          <div className="expertise-card">
            <h3>📊 Analytics</h3>
            <p>Data platforms, real estate price prediction, ML pipelines</p>
          </div>
          <div className="expertise-card">
            <h3>🚀 DevOps</h3>
            <p>Browser automation, testing platforms, developer productivity tools</p>
          </div>
        </div>
      </section>

      {/* Patents */}
      <section className="patents">
        <h2>Patents</h2>
        <ul>
          <li>System & method for acquiring data from an aircraft (20100073197)</li>
          <li>Method and system for identifying and replacing system calls (20140059573)</li>
          <li>Method and system for facilitating replacement of system calls (9111087)</li>
          <li>Static redirection for Objective C (9189622)</li>
        </ul>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <h2>Let's Connect</h2>
        <p>Open to discussing engineering leadership, product strategy, and building great teams.</p>
        <div className="contact-links">
          <a href="mailto:jawa.manish@gmail.com" className="contact-btn">📧 Email</a>
          <a href="tel:+14254060934" className="contact-btn">📱 Call</a>
          <a href="https://linkedin.com/in/manishjawa" className="contact-btn" target="_blank">💼 LinkedIn</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Manish Jawa. All rights reserved.</p>
        <p>Bellevue, WA • +1-425-406-0934</p>
      </footer>
    </div>
  )
}
