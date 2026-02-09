import './App.css'
import BookingModal from './components/BookingModal'

export default function App() {
  return <MainPage />
}

function MainPage() {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="#" className="logo">MJ</a>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#patents">Patents</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-bg-glow" aria-hidden="true"></div>
        <div className="hero-content">
          <p className="hero-tag">Engineering Leader &bull; AI/ML &bull; Distributed Systems</p>
          <h1 className="hero-name">Manish Jawa</h1>
          <p className="hero-desc">
            18+ years building high-impact systems at <strong>Meta</strong>, <strong>Amazon</strong>, and <strong>Flipkart</strong>.
            I turn complex technical challenges into scalable products that serve hundreds of millions.
          </p>
          <div className="hero-cta">
            <BookingModal />
            <a href="https://linkedin.com/in/manishjawa" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="stats" aria-label="Key achievements">
        <div className="stat-card">
          <span className="stat-number">18+</span>
          <span className="stat-label">Years of Experience</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">10</span>
          <span className="stat-label">US Patents</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">3x</span>
          <span className="stat-label">Revenue Growth at Meta</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">100M+</span>
          <span className="stat-label">Users Impacted Daily</span>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about">
        <h2>About</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              I&rsquo;m an engineering leader who thrives at the intersection of
              <strong> AI/ML</strong>, <strong>distributed systems</strong>, and
              <strong> product strategy</strong>. I&rsquo;ve led teams of up to 24
              engineers, built ML platforms processing 100M+ content pieces daily,
              and delivered 3x revenue impact at Meta.
            </p>
            <p>
              My technical roots are deep &mdash; 10 US patents in systems programming,
              virtualization, and mobile security. I combine this depth with a focus
              on building high-performing teams and shipping products that matter.
            </p>
          </div>
          <div className="about-highlights">
            <div className="highlight">
              <h3>Distributed Systems</h3>
              <p>Microservices, high-availability platforms, systems at massive scale</p>
            </div>
            <div className="highlight">
              <h3>AI / ML</h3>
              <p>Recommendation engines, ML platforms, generative AI applications</p>
            </div>
            <div className="highlight">
              <h3>Engineering Leadership</h3>
              <p>Team scaling, org building, cross-functional strategic planning</p>
            </div>
            <div className="highlight">
              <h3>Systems &amp; Security</h3>
              <p>OS internals, mobile virtualization, application security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="experience">
        <h2>Experience</h2>
        <div className="exp-grid">
          <div className="exp-card exp-featured">
            <div className="exp-header">
              <span className="exp-company">Meta</span>
              <span className="exp-period">2022 &ndash; Present</span>
            </div>
            <p className="exp-role">Software Engineering Manager</p>
            <ul className="exp-details">
              <li>3x revenue impact on Mobile Ads Experience</li>
              <li>Led a team of 18 ICs across multiple workstreams</li>
              <li>Driving AI-powered ad ranking and delivery systems</li>
            </ul>
          </div>

          <div className="exp-card">
            <div className="exp-header">
              <span className="exp-company">Amazon</span>
              <span className="exp-period">2020 &ndash; 2022</span>
            </div>
            <p className="exp-role">Software Development Manager</p>
            <ul className="exp-details">
              <li>20% order volume increase through systems optimization</li>
              <li>Led 24 engineers across distributed services</li>
            </ul>
          </div>

          <div className="exp-card">
            <div className="exp-header">
              <span className="exp-company">Flipkart</span>
              <span className="exp-period">2018 &ndash; 2019</span>
            </div>
            <p className="exp-role">Engineering Manager</p>
            <ul className="exp-details">
              <li>10% cost savings through infrastructure optimization</li>
              <li>Built AI/ML pipeline automating 100M+ content/day</li>
            </ul>
          </div>

          <div className="exp-card">
            <div className="exp-header">
              <span className="exp-company">BrowserStack, FireEye, VMware, Citrix</span>
              <span className="exp-period">2008 &ndash; 2018</span>
            </div>
            <p className="exp-role">Senior Engineering Roles</p>
            <ul className="exp-details">
              <li>Mobile security, virtualization, and ML systems</li>
              <li>10 US patents in systems programming</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Patents */}
      <section id="patents" className="patents">
        <div className="patents-header">
          <h2>Patents &amp; Publications</h2>
          <a href="https://scholar.google.com/citations?user=Bh4CeJ8AAAAJ&hl=en" className="patents-link" target="_blank" rel="noopener noreferrer">
            View Google Scholar &rarr;
          </a>
        </div>
        <div className="patents-grid">
          <div className="patent-card">
            <span className="patent-year">2015</span>
            <h3>Method and system for facilitating replacement of system calls</h3>
            <p className="patent-id">US Patent 9,111,087</p>
            <p className="patent-citations">67 citations</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2010</span>
            <h3>System and method for acquiring data from an aircraft</h3>
            <p className="patent-id">US Patent App. 12/234,211</p>
            <p className="patent-citations">45 citations</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2016</span>
            <h3>Method and system for identifying and replacing system calls</h3>
            <p className="patent-id">US Patent 9,524,154</p>
            <p className="patent-citations">38 citations</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2018</span>
            <h3>Method and system for facilitating replacement of system calls</h3>
            <p className="patent-id">US Patent 10,007,782</p>
            <p className="patent-citations">10 citations</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2015</span>
            <h3>Static redirection for Objective-C</h3>
            <p className="patent-id">US Patent 9,189,622</p>
            <p className="patent-citations">4 citations</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2020</span>
            <h3>Method and system for facilitating replacement of function calls</h3>
            <p className="patent-id">US Patent 10,725,756</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2018</span>
            <h3>Static redirection for Objective-C</h3>
            <p className="patent-id">US Patent 10,114,979</p>
          </div>

          <div className="patent-card">
            <span className="patent-year">2017</span>
            <h3>Method and system for facilitating replacement of system calls</h3>
            <p className="patent-id">US Patent 9,665,355</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <div className="contact-inner">
          <h2>Let&rsquo;s Connect</h2>
          <p className="contact-desc">
            Interested in discussing engineering leadership, AI/ML strategy, or building great teams?
            I&rsquo;d love to hear from you.
          </p>
          <div className="contact-actions">
            <BookingModal />
            <a href="mailto:jawa.manish@gmail.com" className="btn btn-secondary">Email Me</a>
            <a href="https://linkedin.com/in/manishjawa" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Manish Jawa. Built with purpose.</p>
      </footer>
    </div>
  )
}
