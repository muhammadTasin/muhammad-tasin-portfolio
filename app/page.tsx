"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";

const LINKS = {
  github: "https://github.com/muhammadTasin",
  linkedin: "https://www.linkedin.com/in/md-tasfiq-tasin-701634359/",
  email: "muhammadtasin18@gmail.com",
  resume: "/muhammad-tasin-resume.txt",
  desiDigest: "https://github.com/muhammadTasin/Desi-Digest-The-Infinity-AI-BuildFest-2026-",
  desiDigestLive: "https://project-rae6k.vercel.app/",
  courseVault: "https://github.com/muhammadTasin/Bracu-coursevault-ai",
  latexStudio: "https://github.com/muhammadTasin/Latex-Converter",
};

type Project = {
  id: "salesbondhu" | "desidigest" | "coursevault" | "latex";
  number: string;
  name: string;
  tagline: string;
  summary: string;
  accent: string;
  type: string;
  visibility: string;
  problem: string;
  role: string;
  contribution: string;
  solution: string;
  decision: string;
  reliability: string;
  challenges: string;
  tradeoffs: string;
  testing: string;
  result: string;
  features: string[];
  stack: string[];
  architecture: string[];
  github?: string;
  live?: string;
};

const projects: Project[] = [
  {
    id: "salesbondhu",
    number: "01",
    name: "SalesBondhu AI",
    tagline: "Trust infrastructure for field sales teams.",
    summary: "A production-oriented Flutter platform combining secure backend workflows, GPS visit verification, manager visibility and a context-aware Bangla AI sales coach.",
    accent: "lime",
    type: "Mobile · Backend · AI",
    visibility: "Private case study",
    problem: "Field teams need a reliable way to prove visits happened at the correct shop, while officers need practical help planning routes and improving conversion.",
    role: "Product engineering across Flutter, FastAPI, data workflows and applied AI.",
    contribution: "I built and iterated the mobile flows, backend verification logic, manager review surfaces and context-aware Bangla coach experience.",
    solution: "A backend-owned visit workflow captures GPS proof, verifies dealer coordinates, flags exceptions for managers and grounds coaching in sales, route and dealer context.",
    decision: "Keep sensitive business rules, location decisions and AI actions on the backend instead of trusting the mobile client.",
    reliability: "Production mode hides development shortcuts; sensitive keys remain server-side and visit status is decided by backend rules.",
    challenges: "Balancing real location proof with testability, poor network conditions and a workflow that stays usable for field officers.",
    tradeoffs: "The public case study intentionally shows architecture and outcomes without repository access, client data, internal URLs or implementation secrets.",
    testing: "159 backend tests passed at the latest verified development milestone.",
    result: "A private, production-oriented field-sales system with verifiable visit evidence and manager review paths.",
    features: ["GPS visit verification", "Manager flag review", "Supabase-backed daily plan", "Natural Bangla AI coach", "Backend-driven actions"],
    stack: ["Flutter", "FastAPI", "Python", "Supabase", "PostgreSQL", "JWT", "REST APIs", "LLM integration"],
    architecture: ["Flutter app", "FastAPI API", "Supabase", "AI coach"],
  },
  {
    id: "desidigest",
    number: "02",
    name: "Desi Digest",
    tagline: "Nutrition intelligence shaped for Bangladesh.",
    summary: "A culturally intelligent nutrition platform for Bangladeshi and South Asian food, with photo analysis, Banglish meal input and safety-aware AI guidance.",
    accent: "terracotta",
    type: "HealthTech · Vision AI",
    visibility: "Public product",
    problem: "Most nutrition tools are optimized for Western diets and struggle with meals such as bhat, dal, mach, shak and vorta.",
    role: "Technical Lead & Full-Stack AI Engineer in a team-built Infinity AI BuildFest project.",
    contribution: "I led the core architecture, Supabase backend, Gemini integration, plate analyzer, Banglish meal parser, health nudges and deployment reliability work.",
    solution: "The product combines culturally aware input, image-based plate analysis, nutrition tracking and a warm AI companion with non-medical safety boundaries.",
    decision: "Pair AI output with deterministic fallbacks and structured safety routing so the product remains useful when providers fail.",
    reliability: "Auth, Postgres, Storage and RLS are handled through Supabase; AI paths include fallback behavior and a judge-safe demo mode.",
    challenges: "Recognizing local dishes, estimating mixed plates and keeping recommendations culturally useful without presenting medical advice.",
    tradeoffs: "Meal analysis is educational estimation, not diagnosis; the product prioritizes transparent guidance and practical local context.",
    testing: "The repository documents health guardrails, deterministic fallback paths and production verification scripts.",
    result: "Top 100 finalist from 3,626 participants at Infinity AI BuildFest 2026.",
    features: ["Photo plate analysis", "Banglish meal parser", "Personalized health nudges", "Nanumoni AI companion", "Nutrition dashboard"],
    stack: ["TanStack Start", "React", "TypeScript", "Gemini", "Supabase", "Zod", "Vite", "Nitro"],
    architecture: ["Meal input", "AI analysis", "Nutrition context", "Safe guidance"],
    github: LINKS.desiDigest,
    live: LINKS.desiDigestLive,
  },
  {
    id: "coursevault",
    number: "03",
    name: "CourseVault AI",
    tagline: "An academic resource command center.",
    summary: "A modern university resource manager with secure course folders, categorized bookmarks, AI-assisted suggestions and a shader-driven study universe.",
    accent: "violet",
    type: "EdTech · Full-stack",
    visibility: "Public repository",
    problem: "University resources are scattered across GitHub, videos, PDFs, websites and practice links, making course-by-course organization difficult.",
    role: "Full-stack implementation across product UI, data model, authentication and interactive visual systems.",
    contribution: "I built the Next.js application, Supabase-backed course/resource workflows, route guards, RLS data boundaries and Three.js visual layer.",
    solution: "Course folders become a single command center where students create structured resource lanes and manage useful links behind authenticated routes.",
    decision: "Use PostgreSQL Row Level Security alongside server-side route checks so each scholar can access only their own records.",
    reliability: "Zod validates payloads; cookie-aware Supabase sessions and guarded dashboard routes protect authenticated workflows.",
    challenges: "Combining a visually ambitious WebGL interface with an academic dashboard that still scans quickly and works responsively.",
    tradeoffs: "Three.js visuals support the product identity but remain secondary to CRUD usability, secure sessions and accessible resource organization.",
    testing: "The repository includes a production build path and typed Next.js/Supabase architecture; a hosted live URL is not currently documented.",
    result: "A polished EdTech prototype with secure course and resource management backed by a documented relational schema.",
    features: ["Course/resource CRUD", "Supabase authentication", "PostgreSQL RLS", "Secure route guards", "Three.js shader visuals"],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Three.js", "Zod", "Tailwind CSS"],
    architecture: ["Next.js UI", "Server actions", "Supabase Auth", "Postgres + RLS"],
    github: LINKS.courseVault,
  },
  {
    id: "latex",
    number: "04",
    name: "Research LaTeX Studio",
    tagline: "Recover academic structure from messy sources.",
    summary: "A research-document conversion tool that transforms plain text, PDFs, OCR output and mixed academic notes into structured, compilable LaTeX.",
    accent: "blue",
    type: "Developer tool · Research",
    visibility: "Public beta",
    problem: "Academic material copied from PDFs, images or mixed notes often loses equations, tables, citations and document structure.",
    role: "Product architecture, parser workflow, conversion interface and validation tooling.",
    contribution: "I built the Next.js conversion experience and recovery pipeline for research structure, math, matrices, tables, citations, OCR and PDF text.",
    solution: "The tool detects input types, reconstructs academic sections and converts supported content into organized LaTeX with documented limitations.",
    decision: "Treat OCR/PDF recovery as best-effort and publish supported cases and limitations instead of claiming universal conversion accuracy.",
    reliability: "Regression tests, TypeScript checks, linting and build validation support the converter; source quality still affects OCR and PDF recovery.",
    challenges: "Macro-heavy documentation, missing assets and complex dynamic TeX constructs cannot be safely normalized with one generic parser.",
    tradeoffs: "The beta focuses on high-value academic papers and common research structures while documenting weaker support for complex documentation sources.",
    testing: "Validated against an internal benchmark suite; see the repository for methodology, supported cases and known limitations.",
    result: "A focused research utility with explicit quality boundaries and repeatable regression checks.",
    features: ["Equation and matrix conversion", "Table reconstruction", "Citation handling", "PDF text extraction", "Tesseract OCR"],
    stack: ["Next.js", "TypeScript", "React", "pdf-parse", "Tesseract.js", "Regression tests"],
    architecture: ["Mixed input", "Type detection", "Structure parser", "LaTeX output"],
    github: LINKS.latexStudio,
  },
];

const repositories = [
  { name: "Qasas", language: "TypeScript", description: "Full-stack story publishing with authentication, reactions, comments and read-time analytics.", url: "https://github.com/muhammadTasin/Qasas-" },
  { name: "Aircraft Maintenance Tracker v2", language: "JavaScript", description: "Role-aware fleet maintenance, defect, task and operational-alert workflows.", url: "https://github.com/muhammadTasin/aircraft-maintenance-tracker-v2-publish-ready" },
  { name: "Falah", language: "TypeScript", description: "Private per-user ibadah tracking with prayer times, Firebase and optional AI reflections.", url: "https://github.com/muhammadTasin/falah-web" },
  { name: "Java DSA Practice", language: "Java", description: "Hands-on data structures, tree traversal and algorithm fundamentals.", url: "https://github.com/muhammadTasin/dsa-practice-and-learning-basic" },
  { name: "CSE 427 Machine Learning", language: "Jupyter Notebook", description: "University machine-learning labs and reproducible coursework experiments.", url: "https://github.com/muhammadTasin/Cse-427-Machine-learning-" },
];

const expertise = [
  { index: "01", title: "Backend & APIs", description: "Secure, testable services that keep business logic and sensitive actions on the server.", skills: ["FastAPI", "REST APIs", "Python", "JWT", "PostgreSQL", "Supabase"] },
  { index: "02", title: "Applied AI", description: "LLM features grounded in product context, structured output and resilient fallback workflows.", skills: ["LLM integration", "RAG", "Gemini", "Prompt systems", "Embeddings", "AI evaluation"] },
  { index: "03", title: "Product Interfaces", description: "Responsive web and mobile interfaces built around real workflows rather than demo-only screens.", skills: ["Flutter", "React", "Next.js", "TypeScript", "Responsive UI", "Accessibility"] },
  { index: "04", title: "Engineering Tools", description: "Practical tooling for iteration, validation, deployment and collaboration.", skills: ["Git", "GitHub", "Docker", "Linux", "Postman", "Android Studio"] },
];

const keywords = ["Backend", "Applied AI", "Flutter", "Product systems"];

function ArrowIcon() { return <span className="arrow-icon" aria-hidden="true">↗</span>; }

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [localTime, setLocalTime] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);
  const [keywordIndex, setKeywordIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const updateTime = () => setLocalTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateTime();
    const clock = window.setInterval(updateTime, 30_000);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keyword = reduceMotion ? 0 : window.setInterval(() => setKeywordIndex((value) => (value + 1) % keywords.length), 2200);
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduceMotion || !("IntersectionObserver" in window)) items.forEach((item) => item.classList.add("is-visible"));
    const observer = reduceMotion ? null : new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer?.unobserve(entry.target); } }), { threshold: 0.12 });
    items.forEach((item) => observer?.observe(item));
    const glow = document.querySelector<HTMLElement>(".cursor-glow");
    const moveGlow = (event: PointerEvent) => { if (glow && !reduceMotion) glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`; };
    window.addEventListener("pointermove", moveGlow, { passive: true });
    return () => { window.clearInterval(clock); if (keyword) window.clearInterval(keyword); observer?.disconnect(); window.removeEventListener("pointermove", moveGlow); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = selectedProject || menuOpen ? "hidden" : "";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelectedProject(null); setMenuOpen(false); } };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [selectedProject, menuOpen]);

  async function copyEmail() {
    await navigator.clipboard.writeText(LINKS.email);
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1800);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;
    if (!form.checkValidity()) {
      setFormMessage("Please check the highlighted fields and try again.");
      form.reportValidity();
      return;
    }
    const subject = encodeURIComponent(`Portfolio enquiry from ${data.get("name")}`);
    const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
    setFormMessage("Message prepared—your email app should open now.");
    window.location.href = `mailto:${LINKS.email}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="cursor-glow" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Muhammad Tasin home">
          <span className="brand-mark">MT</span>
          <span className="brand-copy"><strong>Muhammad Tasin</strong><small>AI · Backend · Flutter</small></span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Primary navigation">
          <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
          <a href="#expertise" onClick={() => setMenuOpen(false)}>Expertise</a>
          <a href="#github" onClick={() => setMenuOpen(false)}>GitHub</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <div className="nav-socials">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="View Muhammad Tasin on GitHub in a new tab">GitHub <ArrowIcon /></a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Connect with Muhammad Tasin on LinkedIn in a new tab">LinkedIn <ArrowIcon /></a>
          </div>
        </nav>
        <div className="header-actions">
          <div className="header-socials">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile in a new tab">GH</a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile in a new tab">in</a>
          </div>
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}><span>{theme === "dark" ? "☼" : "☾"}</span></button>
          <a className="button button-small" href="#contact">Let&apos;s talk <ArrowIcon /></a>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation"><span></span><span></span></button>
        </div>
      </header>

      <main id="main">
        <section className="hero section" id="top">
          <div className="hero-glow" aria-hidden="true"></div>
          <div className="hero-grid container">
            <div className="hero-copy" data-reveal>
              <div className="availability"><span></span> Available for internships & junior roles</div>
              <h1>I build <em>intelligent</em><br />products that work<br />in the real world.</h1>
              <p className="hero-lede">I build practical AI-powered web and mobile products using secure backend APIs, databases, Flutter and context-aware LLM workflows.</p>
              <div className="hero-actions">
                <a className="button button-primary magnetic" href="#work">Explore selected work <span aria-hidden="true">↓</span></a>
                <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile in a new tab">GitHub <ArrowIcon /></a>
                <a className="text-link" href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile in a new tab">LinkedIn <ArrowIcon /></a>
              </div>
              <div className="keyword-line" aria-label="Focus areas"><span>Focus</span><strong key={keywords[keywordIndex]}>{keywords[keywordIndex]}</strong></div>
            </div>
            <div className="hero-console" aria-label="Selected engineering workflow" data-reveal>
              <div className="console-top"><span></span><span></span><span></span><small>product.system</small></div>
              <div className="console-body">
                <p className="console-comment">{"// practical systems, honest evidence"}</p>
                <p><span className="code-purple">const</span> <span className="code-green">focus</span> = {'{'}</p>
                <p className="indent">backend: <span className="code-string">&quot;secure APIs&quot;</span>,</p>
                <p className="indent">mobile: <span className="code-string">&quot;Flutter&quot;</span>,</p>
                <p className="indent">intelligence: <span className="code-string">&quot;LLM + context&quot;</span>,</p>
                <p className="indent">quality: <span className="code-string">&quot;proof over claims&quot;</span></p>
                <p>{'}'};</p>
                <div className="console-status"><span></span> building across the product stack</div>
              </div>
              <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
            </div>
          </div>
          <a className="scroll-cue" href="#work"><span>Scroll to work</span><i aria-hidden="true">↓</i></a>
          <div className="signal-strip container" aria-label="Highlights" data-reveal>
            <div><strong>Top 100</strong><span>Infinity AI BuildFest 2026</span></div>
            <div><strong>04</strong><span>Featured product builds</span></div>
            <div><strong>159</strong><span>Backend tests passed</span></div>
            <div><strong>BRACU</strong><span>Computer Science student</span></div>
          </div>
        </section>

        <section className="section work-section" id="work">
          <div className="container">
            <div className="section-heading" data-reveal><div><span className="eyebrow">Verified selected work · 2026</span><h2>Real products.<br /><em>Real constraints.</em></h2></div><p>Four focused case studies—one private production project and three verified public repositories. Each card shows the problem, contribution and engineering decision.</p></div>
            <div className="project-list">
              {projects.map((project) => (
                <article className={`project-card ${project.accent}`} key={project.id} data-reveal>
                  <div className="project-copy">
                    <div className="project-meta"><span>{project.number}</span><span>{project.type}</span></div>
                    <div className="visibility-label"><i></i>{project.visibility}</div>
                    <h3>{project.name}</h3>
                    <p className="project-tagline">{project.tagline}</p>
                    <p className="project-summary">{project.summary}</p>
                    <div className="project-facts">
                      <div><span>Problem</span><p>{project.problem}</p></div>
                      <div><span>My contribution</span><p>{project.contribution}</p></div>
                      <div><span>Engineering decision</span><p>{project.decision}</p></div>
                    </div>
                    <div className="tag-row">{project.stack.slice(0, 6).map((tech) => <span key={tech}>{tech}</span>)}</div>
                    <div className="project-actions">
                      {project.live && <a className="button button-primary" href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} live product in a new tab`}>Live product <ArrowIcon /></a>}
                      {project.github && <a className="button button-ghost" href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} repository on GitHub in a new tab`}>GitHub <ArrowIcon /></a>}
                      {!project.github && <button className="button button-ghost" type="button" onClick={() => setSelectedProject(project)}>Architecture overview <span aria-hidden="true">→</span></button>}
                      <button className="case-button" type="button" onClick={() => setSelectedProject(project)}>Case study <span aria-hidden="true">→</span></button>
                    </div>
                  </div>
                  <div className="project-visual" aria-label={`${project.name} product presentation`}>
                    <div className="visual-frame">
                      <div className="visual-bar"><span></span><span></span><span></span><small>{project.id}.system</small></div>
                      {project.id === "salesbondhu" && <SalesVisual />}
                      {project.id === "desidigest" && <DigestVisual />}
                      {project.id === "coursevault" && <CourseVaultVisual />}
                      {project.id === "latex" && <LatexVisual />}
                    </div>
                    <div className="proof-chip"><span>✓</span>{project.result}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section github-section" id="github">
          <div className="container">
            <div className="github-intro" data-reveal>
              <div><span className="eyebrow">Open-source footprint</span><h2>More experiments<br />and <em>builds.</em></h2></div>
              <div><p>A curated view of public repositories. Flagship projects remain intentionally selected rather than changing with GitHub&apos;s recent-update order.</p><a className="button button-primary" href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="Browse all Muhammad Tasin repositories on GitHub in a new tab">Browse all repositories <ArrowIcon /></a></div>
            </div>
            <div className="repo-grid">
              {repositories.map((repo, index) => <a className="repo-card" key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${repo.name} repository in a new tab`} data-reveal><span className="repo-index">0{index + 1}</span><div><span className="repo-language"><i></i>{repo.language}</span><h3>{repo.name}</h3><p>{repo.description}</p></div><ArrowIcon /></a>)}
            </div>
          </div>
        </section>

        <section className="section expertise-section" id="expertise">
          <div className="container">
            <div className="section-heading compact" data-reveal><div><span className="eyebrow">Technical expertise</span><h2>Built across the<br /><em>product stack.</em></h2></div><p>No arbitrary percentages—just the tools I use to turn product requirements into working systems.</p></div>
            <div className="expertise-grid">{expertise.map((item) => <article className="expertise-card" key={item.index} data-reveal><span className="expertise-index">{item.index}</span><h3>{item.title}</h3><p>{item.description}</p><div className="skill-list">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div className="about-sticky" data-reveal><span className="eyebrow">About</span><h2>Curious by nature.<br /><em>Practical by design.</em></h2></div>
            <div className="about-content" data-reveal>
              <p className="about-lead">I&apos;m Muhammad Tasin, a CSE student at BRAC University in Bangladesh, focused on building useful AI-powered products without overstating what they do.</p>
              <p>I work where backend logic, databases, mobile interfaces and language models meet. I care about the part after the demo: security boundaries, error handling, useful context, test coverage and a clear experience for the person using the product.</p>
              <div className="timeline">
                <article><span>Now</span><div><h3>AI-focused product development</h3><p>Deepening backend, Flutter, LLM integration and system design through production-oriented projects.</p></div></article>
                <article><span>2026</span><div><h3>Infinity AI BuildFest finalist</h3><p>Reached the Top 100 from 3,626 participants with Desi Digest.</p></div></article>
                <article><span>BRACU</span><div><h3>B.Sc. in Computer Science & Engineering</h3><p>Building foundations in algorithms, software engineering, machine learning and data communications.</p></div></article>
              </div>
              <div className="about-actions"><a className="button button-ghost" href={LINKS.resume} download>Download resume <span aria-hidden="true">↓</span></a><a className="text-link" href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile in a new tab">View LinkedIn <ArrowIcon /></a></div>
            </div>
          </div>
        </section>

        <section className="section architecture-section">
          <div className="container architecture-card" data-reveal>
            <div className="architecture-copy"><span className="eyebrow">How I think</span><h2>AI is a system,<br /><em>not a button.</em></h2><p>I design the context, validation, fallbacks and safe actions around the model—because the product still has to work when the ideal path does not.</p></div>
            <div className="system-map" aria-label="AI product architecture"><div className="system-node primary"><span>01</span><strong>Product UI</strong><small>Web · Flutter</small></div><div className="system-line"><span>validated request</span></div><div className="system-node"><span>02</span><strong>Backend API</strong><small>Auth · Rules · Context</small></div><div className="system-line"><span>structured context</span></div><div className="system-node accent"><span>03</span><strong>AI workflow</strong><small>LLM · RAG · Fallback</small></div></div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy" data-reveal>
              <span className="eyebrow">Start a conversation</span><h2>Have a useful problem<br />to <em>build around?</em></h2><p>I&apos;m open to internships, junior developer roles and thoughtful collaborations across AI, backend, Flutter and full-stack products.</p>
              <div className="contact-facts"><div><span>Based in</span><strong>Dhaka, Bangladesh</strong></div><div><span>Local time</span><strong>{localTime ? `${localTime} BST` : "Bangladesh time"}</strong></div><div><span>Email</span><strong>{LINKS.email}</strong></div></div>
              <div className="contact-cards">
                <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile in a new tab"><span>GH</span><div><small>Code & repositories</small><strong>View GitHub</strong></div><ArrowIcon /></a>
                <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn in a new tab"><span>in</span><div><small>Professional profile</small><strong>Connect on LinkedIn</strong></div><ArrowIcon /></a>
                <button type="button" onClick={copyEmail}><span>@</span><div><small>Direct email</small><strong>{emailCopied ? "Email copied" : "Copy email"}</strong></div><span aria-hidden="true">{emailCopied ? "✓" : "⧉"}</span></button>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleSubmit} noValidate data-reveal>
              <label><span>Your name</span><input name="name" type="text" placeholder="Jane Smith" required minLength={2} autoComplete="name" /></label>
              <label><span>Email address</span><input name="email" type="email" placeholder="jane@company.com" required autoComplete="email" /></label>
              <label><span>What are you building?</span><textarea name="message" rows={5} placeholder="Tell me about the role, product or problem..." required minLength={12}></textarea></label>
              <label className="honeypot" aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
              <button className="button button-primary form-submit" type="submit">Prepare email <ArrowIcon /></button>
              <p className="form-note" role="status">{formMessage || "No data is stored. Your email app handles the message."}</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-main"><div><strong>Muhammad Tasin</strong><p>AI-Focused Backend Developer · Full-Stack & Flutter App Developer</p></div><div className="footer-links"><a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowIcon /></a><a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowIcon /></a><a href={`mailto:${LINKS.email}`}>Email</a><a href={LINKS.resume} download>Resume ↓</a></div></div>
        <div className="container footer-bottom"><span>© 2026 Muhammad Tasin</span><span>Built with proof, curiosity and care.</span></div>
      </footer>

      {selectedProject && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedProject(null)}><section className="case-modal" role="dialog" aria-modal="true" aria-labelledby="case-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setSelectedProject(null)} aria-label="Close case study" autoFocus>×</button><div className="modal-heading"><span className="eyebrow">{selectedProject.type} case study</span><h2 id="case-title">{selectedProject.name}</h2><p>{selectedProject.tagline}</p></div><div className="case-grid"><CaseFact label="Context" text={selectedProject.summary} /><CaseFact label="The problem" text={selectedProject.problem} /><CaseFact label="My role" text={selectedProject.role} /><CaseFact label="My contribution" text={selectedProject.contribution} /></div><div className="case-section"><span className="case-label">Architecture</span><div className="architecture-flow">{selectedProject.architecture.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < selectedProject.architecture.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div></div><div className="case-grid detail-grid"><CaseFact label="Core solution" text={selectedProject.solution} /><CaseFact label="Security & reliability" text={selectedProject.reliability} /><CaseFact label="Challenge" text={selectedProject.challenges} /><CaseFact label="Trade-off" text={selectedProject.tradeoffs} /><CaseFact label="Testing & validation" text={selectedProject.testing} /><CaseFact label="Result" text={selectedProject.result} /></div><div className="case-section"><span className="case-label">Technologies</span><div className="tag-row modal-tags">{selectedProject.stack.map((tech) => <span key={tech}>{tech}</span>)}</div></div><div className="modal-actions">{selectedProject.live && <a className="button button-primary" href={selectedProject.live} target="_blank" rel="noopener noreferrer">View live <ArrowIcon /></a>}{selectedProject.github && <a className="button button-ghost" href={selectedProject.github} target="_blank" rel="noopener noreferrer">View repository <ArrowIcon /></a>}{!selectedProject.github && <span className="private-note">Private project · no repository link exposed</span>}</div></section></div>}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: "Muhammad Tasin", jobTitle: "AI-Focused Backend Developer | Full-Stack & Flutter App Developer", email: `mailto:${LINKS.email}`, sameAs: [LINKS.github, LINKS.linkedin], alumniOf: { "@type": "CollegeOrUniversity", name: "BRAC University" }, knowsAbout: ["FastAPI", "Flutter", "LLM integration", "RAG", "React", "Supabase"], subjectOf: projects.map((project) => ({ "@type": "CreativeWork", name: project.name, description: project.summary, ...(project.github ? { url: project.github } : {}) })) }) }} />
    </>
  );
}

function CaseFact({ label, text }: { label: string; text: string }) { return <div><span className="case-label">{label}</span><p>{text}</p></div>; }

function SalesVisual() { return <div className="app-scene sales-scene"><aside><b>SB</b><i></i><i></i><i></i></aside><div className="scene-main"><div className="scene-head"><div><small>Today&apos;s route</small><strong>Field visit control</strong></div><span>Private system</span></div><div className="sales-map"><div className="route-line"></div><b className="pin one">1</b><b className="pin two">2</b><b className="pin three">3</b></div><div className="scene-stats"><div><small>Proof</small><strong>GPS</strong></div><div><small>Review</small><strong>Flags</strong></div><div><small>Coach</small><strong>Bangla</strong></div></div></div></div>; }

function DigestVisual() { return <div className="digest-gallery"><img className="digest-main" src="/images/desi-dashboard.webp" width="1600" height="865" alt="Desi Digest public product dashboard" loading="lazy" /><img className="digest-thumb plate-shot" src="/images/desi-plate-analysis.webp" width="1600" height="865" alt="Desi Digest plate analysis screen" loading="lazy" /><img className="digest-thumb chat-shot" src="/images/desi-ai-chat.webp" width="1600" height="902" alt="Desi Digest AI nutrition assistant" loading="lazy" /></div>; }

function CourseVaultVisual() { return <div className="vault-scene"><div className="vault-top"><div><small>COURSEVAULT AI</small><strong>Academic command center</strong></div><span>Scholar 01</span></div><div className="vault-space"><i className="star s1"></i><i className="star s2"></i><i className="star s3"></i><div className="vault-orbit"></div><div className="folder f1"><span>CSE 427</span><small>12 resources</small></div><div className="folder f2"><span>CSE 220</span><small>08 resources</small></div><div className="folder f3"><span>MAT 120</span><small>05 resources</small></div></div><div className="vault-lanes"><span>GitHub</span><span>Videos</span><span>PDF / Notes</span><span>Practice</span></div></div>; }

function LatexVisual() { return <div className="latex-scene"><div className="latex-toolbar"><strong>Research LaTeX Studio</strong><span>Beta · validation on</span></div><div className="latex-workspace"><div className="source-pane"><small>EXTRACTED SOURCE</small><p>Abstract</p><i></i><i></i><p>Equation</p><code>A = [1 2; 3 4]</code><p>Citation</p><code>[Rahman, 2026]</code></div><div className="convert-arrow">→</div><div className="output-pane"><small>STRUCTURED LATEX</small><code>{"\\begin{abstract}"}</code><i></i><code>{"\\begin{equation}"}</code><code>{"\\begin{bmatrix}"}</code><code>{"\\cite{rahman2026}"}</code><div className="latex-valid">✓ regression checks</div></div></div></div>; }
