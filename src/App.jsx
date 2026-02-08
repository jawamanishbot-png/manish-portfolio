import './App.css'

export default function App() {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">Manish Jawa</h1>
          <div className="nav-links">
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-content">
          <h1>Manish Jawa</h1>
          <p className="hero-subtitle">Engineering Leader | AI/ML | Distributed Systems</p>
          <p className="hero-desc">18+ years building high-impact systems at Meta, Amazon, and Flipkart</p>
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
          <p>Years</p>
        </div>
        <div className="stat-card">
          <h3>10</h3>
          <p>Patents</p>
        </div>
        <div className="stat-card">
          <h3>3x</h3>
          <p>Revenue Growth</p>
        </div>
        <div className="stat-card">
          <h3>100M+</h3>
          <p>Impact/Day</p>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="experience">
        <h2>Experience</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Meta</h3>
              <p><strong>Software Engineering Manager</strong> • 2022 - Present</p>
              <p>3x revenue impact | Led 18 ICs | Mobile Ads Experience</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Amazon</h3>
              <p><strong>Software Development Manager</strong> • 2020 - 2022</p>
              <p>20% order volume increase | Led 24 engineers</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Flipkart</h3>
              <p><strong>Engineering Manager</strong> • 2018 - 2019</p>
              <p>10% cost savings | 100M content/day automation with AI/ML</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Browserstack, Notify.io, Fireeye, VMware, Citrix</h3>
              <p>Senior roles in mobile security, virtualization, and ML systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* Patents & Publications */}
      <section className="patents">
        <h2>Patents & Publications</h2>
        <p className="section-subtitle">Google Scholar Profile: <a href="https://scholar.google.com/citations?user=Bh4CeJ8AAAAJ&hl=en" target="_blank">View Full Profile</a></p>
        <div className="patents-grid">
          <div className="patent-card">
            <h3>Method and system for facilitating replacement of system calls</h3>
            <p className="patent-meta">US Patent 9,111,087 (2015)</p>
            <p className="citations">67 citations</p>
            <p className="authors">M Jawa, H Tebeka, C Newell</p>
          </div>

          <div className="patent-card">
            <h3>System and method for acquiring data from an aircraft</h3>
            <p className="patent-meta">US Patent App. 12/234,211 (2010)</p>
            <p className="citations">45 citations</p>
            <p className="authors">SP Eagleton, B Somasundram, S Bonkra, R Pynadath, M Jawa, ...</p>
          </div>

          <div className="patent-card">
            <h3>Method and system for identifying and replacing system calls</h3>
            <p className="patent-meta">US Patent 9,524,154 (2016)</p>
            <p className="citations">38 citations</p>
            <p className="authors">M Jawa, H Tebeka, C Newell</p>
          </div>

          <div className="patent-card">
            <h3>Method and system for facilitating replacement of system calls</h3>
            <p className="patent-meta">US Patent 10,007,782 (2018)</p>
            <p className="citations">10 citations</p>
            <p className="authors">M Jawa, H Tebeka, C Newell</p>
          </div>

          <div className="patent-card">
            <h3>Static redirection for objective C</h3>
            <p className="patent-meta">US Patent 9,189,622 (2015)</p>
            <p className="citations">4 citations</p>
            <p className="authors">M Jawa</p>
          </div>

          <div className="patent-card">
            <h3>Method and system for facilitating replacement of function calls</h3>
            <p className="patent-meta">US Patent 10,725,756 (2020)</p>
            <p className="authors">M Jawa, H Tebeka, C Newell</p>
          </div>

          <div className="patent-card">
            <h3>Static redirection for objective C</h3>
            <p className="patent-meta">US Patent 10,114,979 (2018)</p>
            <p className="authors">M Jawa</p>
          </div>

          <div className="patent-card">
            <h3>Method and system for facilitating replacement of system calls</h3>
            <p className="patent-meta">US Patent 9,665,355 (2017)</p>
            <p className="authors">M Jawa, H Tebeka, CF Newell</p>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="expertise">
        <h2>Expertise</h2>
        <div className="expertise-grid">
          <div className="expertise-card">
            <h3>Distributed Systems</h3>
            <p>Microservices, high-availability platforms, scale</p>
          </div>
          <div className="expertise-card">
            <h3>AI/ML</h3>
            <p>Recommendation engines, ML platforms, generative AI</p>
          </div>
          <div className="expertise-card">
            <h3>Engineering Leadership</h3>
            <p>Team scaling, org building, strategic planning</p>
          </div>
          <div className="expertise-card">
            <h3>Systems & Architecture</h3>
            <p>OS fundamentals, mobile virtualization, security</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <h2>Let's Connect</h2>
        <p>Open to discussing engineering leadership and building great teams.</p>
        <div className="contact-links">
          <a href="mailto:jawa.manish@gmail.com" className="contact-btn">📧 Email</a>
          <a href="https://linkedin.com/in/manishjawa" className="contact-btn" target="_blank">💼 LinkedIn</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Manish Jawa</p>
      </footer>
    </div>
  )
}
