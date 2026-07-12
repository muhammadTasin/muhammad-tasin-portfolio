"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState, useMemo } from "react";
import PillNav from "@/components/ui/pill-nav";
import BubbleMenu from "@/components/ui/bubble-menu";
import { PortfolioSearch, SearchItem } from "@/components/ui/portfolio-search";
import LogoLoop from "@/components/effects/logo-loop";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import ElectricBorder from "@/components/effects/electric-border";
import GradualBlur from "@/components/ui/gradual-blur";
import Strands from "@/components/ui/strands";

const LINKS = {
  github: "https://github.com/muhammadTasin",
  linkedin: "https://www.linkedin.com/in/md-tasfiq-tasin-701634359/",
  email: "muhammadtasin18@gmail.com",
  resumePdf: "/Md_Tasfiq_Tasin_ATS_Master_CV.pdf",
  resumeDocx: "/Md_Tasfiq_Tasin_ATS_Master_CV.docx",
  desiDigest: "https://github.com/muhammadTasin/Desi-Digest-The-Infinity-AI-BuildFest-2026-",
  desiDigestLive: "https://project-rae6k.vercel.app/",
  courseVault: "https://github.com/muhammadTasin/Bracu-coursevault-ai",
  courseVaultLive: "https://bracu-coursevault-ai.vercel.app",
  latexStudio: "https://github.com/muhammadTasin/Latex-Converter",
  latexStudioLive: "https://latex-converter-coral.vercel.app",
  salesBondhu: "https://github.com/muhammadTasin/SalesBondhu-AI",
};

// NAV_ITEMS is dynamically defined inside the component to support local event handlers.

const BUBBLE_ITEMS = [
  { label: "Work", href: "#work", rotation: -5, hoverStyles: { bgColor: '#c8ff43', ...{ textColor: '#09090b' } } },
  { label: "Expertise", href: "#expertise", rotation: 5, hoverStyles: { bgColor: '#f1814d', ...{ textColor: '#ffffff' } } },
  { label: "About", href: "#about", rotation: 5, hoverStyles: { bgColor: '#78a9ff', ...{ textColor: '#ffffff' } } },
  { label: "Contact", href: "#contact", rotation: -5, hoverStyles: { bgColor: '#c8ff43', ...{ textColor: '#09090b' } } }
];

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
    visibility: "Public repository",
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
    github: LINKS.salesBondhu,
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
    live: LINKS.courseVaultLive,
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
    live: LINKS.latexStudioLive,
  },
];

const repositories = [
  { name: "Qasas", language: "TypeScript", description: "Full-stack story publishing with authentication, reactions, comments and read-time analytics.", url: "https://github.com/muhammadTasin/Qasas-" },
  { name: "Aircraft Maintenance Tracker v2", language: "JavaScript", description: "Role-aware fleet maintenance, defect, task and operational-alert workflows.", url: "https://github.com/muhammadTasin/aircraft-maintenance-tracker-v2-publish-ready" },
  { name: "Falah", language: "TypeScript", description: "Private per-user ibadah tracking with prayer times, Firebase and optional AI reflections.", url: "https://github.com/muhammadTasin/falah-web" },
];

const expertise = [
  { index: "01", title: "Backend & APIs", description: "Secure, testable services that keep business logic and sensitive actions on the server.", skills: ["FastAPI", "REST APIs", "Python", "JWT", "PostgreSQL", "Supabase"] },
  { index: "02", title: "Applied AI", description: "LLM features grounded in product context, structured output and resilient fallback workflows.", skills: ["LLM integration", "RAG", "Gemini", "Prompt systems", "Embeddings", "AI evaluation"] },
  { index: "03", title: "Product Interfaces", description: "Responsive web and mobile interfaces built around real workflows rather than demo-only screens.", skills: ["Flutter", "React", "Next.js", "TypeScript", "Responsive UI", "Accessibility"] },
  { index: "04", title: "Engineering Tools", description: "Practical tooling for iteration, validation, deployment and collaboration.", skills: ["Git", "GitHub", "Docker", "Linux", "Postman", "Android Studio"] },
];

const keywords = ["Backend", "Applied AI", "Flutter", "Product systems"];

const BACKEND_CI_STATS_URL =
  "https://nsiyjrhplawzooopgtox.supabase.co/functions/v1/backend-ci-stats";

type BackendCiStats = {
  backendRepositoryCount: number;

  github: {
    year: number;
    authoredCommits: number;
    longestContributionStreak?: number;
    activeContributionDays?: number;
  };

  tests?: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    reportingRepositoryCount: number;
    allLatestSuitesPassing: boolean;
  };

  summary: {
    successRate: number | null;
  };

  repositories: Array<{
    ci: {
      available: boolean;
    };
  }>;
};

function ArrowIcon() { return <span className="arrow-icon" aria-hidden="true">↗</span>; }

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [activeSection, setActiveSection] = useState("top");
  const [emailCopied, setEmailCopied] = useState(false);
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [backendCi, setBackendCi] =
    useState<BackendCiStats | null>(null);

  const navItems = useMemo(() => [
    { label: "Work", href: "#work" },
    { label: "Expertise", href: "#expertise" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "CV", href: "#cv", onClick: () => setIsCvModalOpen(true) }
  ], []);

  const searchItems: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];
    projects.forEach(p => {
      items.push({ id: `project-${p.id}`, title: p.name, subtitle: p.tagline, type: "Project", href: `#project-${p.id}`, matches: p.stack });
    });
    expertise.forEach(e => {
      items.push({ id: `exp-${e.index}`, title: e.title, subtitle: e.description, type: "Expertise", href: "#expertise", matches: e.skills });
    });
    repositories.forEach(r => {
      items.push({ id: `repo-${r.name}`, title: r.name, subtitle: r.description, type: "Repository", href: r.url });
    });
    items.push({ id: "nav-about", title: "About", type: "Section", href: "#about" });
    items.push({ id: "nav-contact", title: "Contact", type: "Section", href: "#contact" });
    items.push({ id: "nav-github", title: "GitHub", subtitle: "View my GitHub profile", type: "Link", href: LINKS.github });
    items.push({ id: "nav-resume-pdf", title: "Resume (PDF)", subtitle: "Download ATS PDF resume", type: "Link", href: LINKS.resumePdf });
    items.push({ id: "nav-resume-docx", title: "Resume (Word)", subtitle: "Download ATS Word resume", type: "Link", href: LINKS.resumeDocx });
    return items;
  }, []);

  const handleSearchSelect = (item: SearchItem) => {
    if (item.id.startsWith("project-")) {
      const p = projects.find(proj => `project-${proj.id}` === item.id);
      if (p) {
        setSelectedProject(p);
      }
    } else if (item.href) {
      if (item.href.startsWith("http")) {
        window.open(item.href, "_blank");
      } else {
        window.location.hash = item.href;
      }
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const updateTime = () => setLocalTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateTime();
    const clock = window.setInterval(updateTime, 30_000);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keyword = reduceMotion ? 0 : window.setInterval(() => setKeywordIndex((value) => (value + 1) % keywords.length), 2200);
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduceMotion || !("IntersectionObserver" in window)) items.forEach((item) => item.classList.add("is-visible"));
    const observer = reduceMotion ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else if (entry.intersectionRatio === 0) {
          entry.target.classList.remove("is-visible");
        }
      });
    }, { threshold: [0, 0.12] });
    items.forEach((item) => observer?.observe(item));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => sectionObserver.observe(s));
    
    // Close mobile menu when resizing to desktop
    const handleResize = () => { if (window.innerWidth >= 900) setMenuOpen(false); };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => { window.clearInterval(clock); if (keyword) window.clearInterval(keyword); observer?.disconnect(); sectionObserver.disconnect(); window.removeEventListener("resize", handleResize); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBackendCi() {
      try {
        const response = await fetch(
          `${BACKEND_CI_STATS_URL}?t=${Date.now()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Backend CI request failed: ${response.status}`,
          );
        }

        const data =
          (await response.json()) as BackendCiStats;

        if (!cancelled) {
          setBackendCi(data);
        }
      } catch (error) {
        console.error(
          "Unable to load live backend CI statistics:",
          error,
        );
      }
    }

    void loadBackendCi();

    const DHAKA_OFFSET_MS =
      6 * 60 * 60 * 1000;

    function millisecondsUntilNextDailyRefresh() {
      const dhakaNow = new Date(
        Date.now() + DHAKA_OFFSET_MS,
      );

      const nextRefresh = new Date(dhakaNow);

      // Refresh at 12:10 AM Bangladesh time,
      // allowing the midnight workflow to finish.
      nextRefresh.setUTCHours(0, 10, 0, 0);

      if (nextRefresh <= dhakaNow) {
        nextRefresh.setUTCDate(
          nextRefresh.getUTCDate() + 1,
        );
      }

      return (
        nextRefresh.getTime() -
        dhakaNow.getTime()
      );
    }

    let dailyRefreshInterval:
      number | undefined;

    const dailyRefreshTimer = window.setTimeout(
      () => {
        void loadBackendCi();

        dailyRefreshInterval =
          window.setInterval(
            () => void loadBackendCi(),
            24 * 60 * 60 * 1000,
          );
      },
      millisecondsUntilNextDailyRefresh(),
    );

    return () => {
      cancelled = true;

      window.clearTimeout(
        dailyRefreshTimer,
      );

      if (
        dailyRefreshInterval !== undefined
      ) {
        window.clearInterval(
          dailyRefreshInterval,
        );
      }
    };
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
      <GradualBlur position="top" height="100px" strength={10} divCount={4} />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand cursor-target" href="#top" aria-label="Md. Tasfiq Tasin home">
          <span className="brand-mark">MT</span>
          <span className="brand-copy"><strong>Md. Tasfiq Tasin</strong><small>AI · Backend · Flutter</small></span>
        </a>
        <PillNav
          className=""
          logo={<span className="brand-mark font-bold text-xl px-2">MT</span>}
          items={navItems}
          activeHref={`#${activeSection}`}
          baseColor={theme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)"}
          pillColor={theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
          pillTextColor={theme === "dark" ? "#f3f1eb" : "#121214"}
          hoveredPillTextColor={theme === "dark" ? "#c8ff43" : "#0b6e0b"}
        />
        <div className="header-actions">
          <div className="header-socials">
            <a href={LINKS.github} className="cursor-target" target="_blank" rel="noopener noreferrer" aria-label="View GitHub profile in a new tab">GH</a>
            <a href={LINKS.linkedin} className="cursor-target" target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile in a new tab">in</a>
          </div>
          <div className="desktop-search-wrap">
            <PortfolioSearch items={searchItems} onSelect={handleSearchSelect} />
          </div>
          <button className="theme-toggle cursor-target" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}><span>{theme === "dark" ? "☼" : "☾"}</span></button>
          <a className="button button-small cursor-target desktop-cta" href="#contact">Let&apos;s talk <ArrowIcon /></a>
          <BubbleMenu
            items={BUBBLE_ITEMS}
            logo={<span className="brand-mark font-bold text-xl px-2">MT</span>}
            menuBg="#1a1a1e"
            menuContentColor="#f3f1eb"
            onMenuClick={setMenuOpen}
          />
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
          <div
            className="signal-strip container"
            aria-label="Career and product highlights"
            data-reveal
          >
            <div>
              <strong>Top 100</strong>
              <span>Infinity AI BuildFest 2026</span>
            </div>

            <div>
              <strong>
                {String(projects.length).padStart(2, "0")}
              </strong>
              <span>Featured product builds</span>
            </div>

            <div>
              <strong>
                {backendCi
                  ? backendCi.github.authoredCommits.toLocaleString()
                  : "—"}
              </strong>

              <span>
                {backendCi
                  ? `Authored commits · ${backendCi.github.year}`
                  : "Loading GitHub activity"}
              </span>
            </div>

            <div>
              <strong>
                {backendCi
                  ? String(
                      backendCi.backendRepositoryCount,
                    ).padStart(2, "0")
                  : "—"}
              </strong>

              <span>
                Backend &amp; full-stack repositories
              </span>
            </div>
          </div>
        </section>

        <section
          className="engineering-proof-section"
          aria-labelledby="engineering-proof-title"
        >
          <div className="container">
            <div
              className="engineering-proof-heading"
              data-reveal
            >
              <div>
                <span className="eyebrow">
                  Live engineering evidence
                </span>

                <h2 id="engineering-proof-title">
                  Measured work.
                  <br />
                  <em>Not just claims.</em>
                </h2>
              </div>

              <p>
                Live signals collected from my GitHub repositories,
                automated test pipelines and contribution activity.
                Repositories without verified test reports are never
                counted as passing.
              </p>
            </div>

            <div
              className="engineering-proof-grid"
              data-reveal
            >
              <article className="engineering-proof-card">
                <div className="engineering-proof-card-top">
                  <span className="engineering-proof-label">
                    Automated tests
                  </span>

                  <span
                    className={`engineering-proof-status ${
                      backendCi?.tests
                        ?.allLatestSuitesPassing
                        ? "is-passing"
                        : ""
                    }`}
                  >
                    <i aria-hidden="true" />

                    {backendCi?.tests
                      ? backendCi.tests
                          .allLatestSuitesPassing
                        ? "Passing"
                        : "Review"
                      : "Collecting"}
                  </span>
                </div>

                <strong className="engineering-proof-value">
                  {backendCi?.tests &&
                  backendCi.tests
                    .reportingRepositoryCount > 0
                    ? backendCi.tests.passed
                        .toLocaleString()
                    : "—"}
                </strong>

                <p>
                  {backendCi?.tests &&
                  backendCi.tests
                    .reportingRepositoryCount > 0
                    ? "Tests passing in latest suites"
                    : "Awaiting the first verified test scan"}
                </p>
              </article>

              <article className="engineering-proof-card">
                <div className="engineering-proof-card-top">
                  <span className="engineering-proof-label">
                    Test coverage
                  </span>

                  <span className="engineering-proof-index">
                    02
                  </span>
                </div>

                <strong className="engineering-proof-value">
                  {backendCi?.tests &&
                  backendCi.tests
                    .reportingRepositoryCount > 0
                    ? String(
                        backendCi.tests
                          .reportingRepositoryCount,
                      ).padStart(2, "0")
                    : "—"}
                </strong>

                <p>
                  Repositories publishing verified test
                  reports
                </p>
              </article>

              <article className="engineering-proof-card">
                <div className="engineering-proof-card-top">
                  <span className="engineering-proof-label">
                    Consistency
                  </span>

                  <span className="engineering-proof-index">
                    03
                  </span>
                </div>

                <strong className="engineering-proof-value">
                  {typeof backendCi?.github
                    .longestContributionStreak === "number"
                    ? `${
                        backendCi.github
                          .longestContributionStreak
                      }d`
                    : "—"}
                </strong>

                <p>
                  Longest contribution streak in{" "}
                  {backendCi?.github.year ?? "2026"}
                </p>
              </article>

              <article className="engineering-proof-card">
                <div className="engineering-proof-card-top">
                  <span className="engineering-proof-label">
                    Active days
                  </span>

                  <span className="engineering-proof-index">
                    04
                  </span>
                </div>

                <strong className="engineering-proof-value">
                  {typeof backendCi?.github
                    .activeContributionDays === "number"
                    ? backendCi.github
                        .activeContributionDays
                        .toLocaleString()
                    : "—"}
                </strong>

                <p>
                  Contribution days recorded in{" "}
                  {backendCi?.github.year ?? "2026"}
                </p>
              </article>
            </div>

            <p
              className="engineering-proof-note"
              data-reveal
            >
              Daily snapshot · Refreshes nightly after
              12:00 AM Bangladesh time. Missing evidence is
              shown as unavailable, never estimated.
            </p>
          </div>
        </section>

        <section className="section work-section" id="work">
          <div className="container">
            <div className="section-heading" data-reveal><div><span className="eyebrow">Verified selected work · 2026</span><h2>Real products.<br /><em>Real constraints.</em></h2></div><p>Four focused case studies—one private production project and three verified public repositories. Each card shows the problem, contribution and engineering decision.</p></div>
            <div className="project-grid">
              {projects.map((project, index) => {
                const card = (
                  <article className={`project-card cursor-target ${project.accent}`} key={project.id} id={`project-${project.id}`} data-reveal>
                    {index < 4 && (
                      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen" aria-hidden="true">
                        <Strands 
                          colors={['#c8ff43', '#78a9ff', '#aa8cff']} 
                          speed={0.8}
                          amplitude={1.2}
                          thickness={0.8}
                          opacity={0.6}
                        />
                      </div>
                    )}
                    <div className="project-copy relative z-10">
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
                        {project.live && <a className="button button-primary cursor-target" href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} live product in a new tab`}>Live product <ArrowIcon /></a>}
                        {project.github && <a className="button button-ghost cursor-target" href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} repository on GitHub in a new tab`}>GitHub <ArrowIcon /></a>}
                        {!project.github && <button className="button button-ghost cursor-target" type="button" onClick={() => setSelectedProject(project)}>Architecture overview <span aria-hidden="true">→</span></button>}
                        <button className="case-button cursor-target" type="button" onClick={() => setSelectedProject(project)}>Case study <span aria-hidden="true">→</span></button>
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
                );
                return (
                  <div key={project.id} className="contents">
                    {project.id === "desidigest" && (
                      <div className="buildfest-showcase" data-reveal>
                        <div className="buildfest-content">
                          <span className="eyebrow">Hackathon Highlight</span>
                          <h3>Infinity AI BuildFest 2026</h3>
                          <p>
                            Built in a high-intensity sprint among 3,626 participants, Desi Digest was created to solve local nutrition tracking challenges, ultimately securing a spot as a Top 100 finalist.
                          </p>
                        </div>
                        <div className="buildfest-marquee-container">
                          <div className="buildfest-marquee">
                            <img src="/images/buildfest-1.webp" alt="Infinity AI BuildFest scene 1" />
                            <img src="/images/buildfest-2.webp" alt="Infinity AI BuildFest scene 2" />
                            <img src="/images/buildfest-3.webp" alt="Infinity AI BuildFest scene 3" />
                            <img src="/images/buildfest-1.webp" alt="Infinity AI BuildFest scene 1" />
                            <img src="/images/buildfest-2.webp" alt="Infinity AI BuildFest scene 2" />
                            <img src="/images/buildfest-3.webp" alt="Infinity AI BuildFest scene 3" />
                          </div>
                        </div>
                      </div>
                    )}
                    {card}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section github-section" id="github">
          <div className="container">
            <div className="github-intro" data-reveal>
              <div><span className="eyebrow">Open-source footprint</span><h2>More experiments<br />and <em>builds.</em></h2></div>
              <div><p>A curated view of public repositories. Flagship projects remain intentionally selected rather than changing with GitHub&apos;s recent-update order.</p><a className="button button-primary" href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="Browse all Md. Tasfiq Tasin repositories on GitHub in a new tab">Browse all repositories <ArrowIcon /></a></div>
            </div>
            <div className="repo-grid">
              {repositories.map((repo, index) => <a className="repo-card" key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${repo.name} repository in a new tab`} data-reveal><span className="repo-index">0{index + 1}</span><div><span className="repo-language"><i></i>{repo.language}</span><h3>{repo.name}</h3><p>{repo.description}</p></div><ArrowIcon /></a>)}
            </div>
          </div>
        </section>

        <section className="section expertise-section" id="expertise">
          <div className="container">
            <div className="section-heading compact" data-reveal><div><span className="eyebrow">Technical expertise</span><h2>Built across the<br /><em>product stack.</em></h2></div><p>No arbitrary percentages—just the tools I use to turn product requirements into working systems.</p></div>
            <div className="expertise-grid">
              {expertise.map((exp) => (
                <article className="expertise-card" key={exp.index} data-reveal>
                  <div className="expertise-meta"><span>{exp.index}</span></div>
                  <h3>{exp.title}</h3>
                  <p>{exp.description}</p>
                  <div className="tag-row">
                    {exp.skills.map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section logo-loop-section">
          <div className="container">
            <p className="logo-loop-heading">Tools behind the work</p>
            <LogoLoop 
              logos={[
                { src: "/logos/python.svg", title: "Python" },
                { src: "/logos/java.svg", title: "Java" },
                { src: "/logos/javascript.svg", title: "JavaScript" },
                { src: "/logos/typescript.svg", title: "TypeScript" },
                { src: "/logos/dart.svg", title: "Dart" },
                { src: "/logos/fastapi.svg", title: "FastAPI" },
                { src: "/logos/postgresql.svg", title: "PostgreSQL" },
                { src: "/logos/supabase.svg", title: "Supabase" },
                { src: "/logos/react.svg", title: "React" },
                { src: "/logos/nextjs.svg", title: "Next.js" },
                { src: "/logos/flutter.svg", title: "Flutter" },
                { src: "/logos/git.svg", title: "Git" },
                { src: "/logos/github.svg", title: "GitHub" },
                { src: "/logos/docker.svg", title: "Docker" },
                { src: "/logos/android-studio.svg", title: "Android Studio" },
                { src: "/logos/postman.svg", title: "Postman" },
                { src: "/logos/intellij.svg", title: "IntelliJ IDEA" },
                { src: "/logos/pycharm.svg", title: "PyCharm" },
              ]}
              speed={40}
              direction="left"
            />
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div className="about-sticky" data-reveal><span className="eyebrow">About</span><h2>Curious by nature.<br /><em>Practical by design.</em></h2></div>
            <div className="about-content" data-reveal>
              <p className="about-lead">I&apos;m Md. Tasfiq Tasin, a CSE student at BRAC University in Bangladesh, focused on building useful AI-powered products without overstating what they do.</p>
              <p>I work where backend logic, databases, mobile interfaces and language models meet. I care about the part after the demo: security boundaries, error handling, useful context, test coverage and a clear experience for the person using the product.</p>
              <div className="timeline">
                <article><span>Now</span><div><h3>AI-focused product development</h3><p>Deepening backend, Flutter, LLM integration and system design through production-oriented projects.</p></div></article>
                <article><span>2026</span><div><h3>Infinity AI BuildFest finalist</h3><p>Reached the Top 100 from 3,626 participants with Desi Digest.</p></div></article>
                <article><span>BRACU</span><div><h3>B.Sc. in Computer Science & Engineering</h3><p>Building foundations in algorithms, software engineering, machine learning and data communications.</p></div></article>
              </div>
              <div className="about-actions">
                <a className="button button-ghost" href={LINKS.resumePdf} download>Download ATS CV (PDF) <span aria-hidden="true">↓</span></a>
                <a className="button button-ghost" href={LINKS.resumeDocx} download>Download ATS CV (Word) <span aria-hidden="true">↓</span></a>
                <a className="text-link" href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn profile in a new tab">View LinkedIn <ArrowIcon /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="section architecture-section">
          <div className="container architecture-card" data-reveal>
            <div className="architecture-copy"><span className="eyebrow">HOW I BUILD</span><h2>Useful AI starts<br /><em>before the prompt.</em></h2><p>I design product flows, backend context, validation and fallback paths around the model—so experiences stay useful across web and mobile.</p></div>
            <div className="system-map" aria-label="AI product architecture"><div className="system-node primary"><span>01</span><strong>Product experience</strong><small>Web · Mobile · User flows</small></div><div className="system-line"><span>validated request</span></div><div className="system-node"><span>02</span><strong>Backend foundation</strong><small>APIs · Auth · Database</small></div><div className="system-line"><span>structured context</span></div><div className="system-node accent"><span>03</span><strong>Reliable intelligence</strong><small>LLM · RAG · Validation · Fallbacks</small></div></div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="container" data-reveal>
            <div className="contact-grid">
              <div className="contact-copy">
                <h2 className="sr-only">Have an idea worth building?</h2>
                <h2 aria-hidden="true" className="text-[clamp(2.7rem,5.2vw,5rem)] leading-[0.96] tracking-[-0.067em] font-bold mt-[17px]">
                  Have an{" "}
                  <TypewriterEffect
                    words={[
                      { text: "idea", className: "text-acid font-normal font-serif text-[clamp(2.7rem,5.2vw,5rem)]" }
                    ]}
                    inline={true}
                    loopInterval={15000}
                  />
                  <br />
                  worth <em className="text-acid font-normal font-serif">building?</em>
                </h2>
              </div>
              <div className="contact-form-container">
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <label><span>Your name</span><input name="name" type="text" placeholder="Jane Smith" required minLength={2} autoComplete="name" /></label>
                  <label><span>Email address</span><input name="email" type="email" placeholder="jane@company.com" required autoComplete="email" /></label>
                  <label><span>What are you building?</span><textarea name="message" rows={5} placeholder="Tell me about the role, product or problem..." required minLength={12}></textarea></label>
                  <label className="honeypot" aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
                  <button className="button button-primary cursor-target" type="submit">Prepare email <ArrowIcon /></button>
                </form>
                {formMessage && <p className="form-message" role="status" aria-live="polite">{formMessage}</p>}
                <div className="direct-contact mt-8 pt-8 border-t border-line">
                  <p className="text-muted text-sm mb-2">Or email me directly:</p>
                  <button className="text-link cursor-target group relative" onClick={copyEmail} aria-label="Copy email address to clipboard">
                    <span className="font-mono">{LINKS.email}</span>
                    <span className={`copy-feedback ${emailCopied ? "visible" : ""}`} aria-hidden="true">{emailCopied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-columns">
            <div className="footer-column">
              <span className="footer-label">Based in</span>
              <span className="footer-value">Dhaka, Bangladesh</span>
            </div>
            <div className="footer-column">
              <span className="footer-label">Open to</span>
              <span className="footer-value">Internships · Junior roles · Collaborations</span>
            </div>
            <div className="footer-column">
              <span className="footer-label">Response time</span>
              <span className="footer-value">Usually within 24–48 hours</span>
            </div>
          </div>
          
          <div className="footer-divider"></div>
          
          <div className="footer-bottom-row">
            <div className="copyright">
              © 2026 Md. Tasfiq Tasin. Built with Next.js, TypeScript and thoughtful systems.
            </div>
            <div className="socials">
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="cursor-target">GitHub</a>
              <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="cursor-target">LinkedIn</a>
              <a href={`mailto:${LINKS.email}`} className="cursor-target">Email</a>
            </div>
            <a href="#top" className="back-to-top cursor-target" aria-label="Back to top">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>

      {selectedProject && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedProject(null)}><section className="case-modal" role="dialog" aria-modal="true" aria-labelledby="case-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setSelectedProject(null)} aria-label="Close case study" autoFocus>×</button><div className="modal-heading"><span className="eyebrow">{selectedProject.type} case study</span><h2 id="case-title">{selectedProject.name}</h2><p>{selectedProject.tagline}</p></div><div className="case-grid"><CaseFact label="Context" text={selectedProject.summary} /><CaseFact label="The problem" text={selectedProject.problem} /><CaseFact label="My role" text={selectedProject.role} /><CaseFact label="My contribution" text={selectedProject.contribution} /></div><div className="case-section"><span className="case-label">Architecture</span><div className="architecture-flow">{selectedProject.architecture.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < selectedProject.architecture.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div></div><div className="case-grid detail-grid"><CaseFact label="Core solution" text={selectedProject.solution} /><CaseFact label="Security & reliability" text={selectedProject.reliability} /><CaseFact label="Challenge" text={selectedProject.challenges} /><CaseFact label="Trade-off" text={selectedProject.tradeoffs} /><CaseFact label="Testing & validation" text={selectedProject.testing} /><CaseFact label="Result" text={selectedProject.result} /></div><div className="case-section"><span className="case-label">Technologies</span><div className="tag-row modal-tags">{selectedProject.stack.map((tech) => <span key={tech}>{tech}</span>)}</div></div><div className="modal-actions">{selectedProject.live && <a className="button button-primary" href={selectedProject.live} target="_blank" rel="noopener noreferrer">View live <ArrowIcon /></a>}{selectedProject.github && <a className="button button-ghost" href={selectedProject.github} target="_blank" rel="noopener noreferrer">View repository <ArrowIcon /></a>}{!selectedProject.github && <span className="private-note">Private project · no repository link exposed</span>}</div></section></div>}

      {isCvModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsCvModalOpen(false)}>
          <section className="case-modal" style={{ maxWidth: "480px" }} role="dialog" aria-modal="true" aria-labelledby="cv-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setIsCvModalOpen(false)} aria-label="Close CV download" autoFocus>×</button>
            <div className="modal-heading">
              <span className="eyebrow">Curriculum Vitae</span>
              <h2 id="cv-modal-title">Download Resume</h2>
              <p>Get a copy of Md. Tasfiq Tasin&apos;s ATS-friendly professional resume in your preferred format.</p>
            </div>
            
            <div style={{ display: "grid", gap: "16px", margin: "24px 0" }}>
              <a 
                className="button button-primary cursor-target" 
                href={LINKS.resumePdf} 
                download 
                style={{ justifyContent: "center", width: "100%" }}
                onClick={() => setIsCvModalOpen(false)}
              >
                Download ATS CV (PDF) <span aria-hidden="true" style={{ marginLeft: "6px" }}>↓</span>
              </a>
              <a 
                className="button button-ghost cursor-target" 
                href={LINKS.resumeDocx} 
                download 
                style={{ justifyContent: "center", width: "100%" }}
                onClick={() => setIsCvModalOpen(false)}
              >
                Download ATS CV (Word) <span aria-hidden="true" style={{ marginLeft: "6px" }}>↓</span>
              </a>
            </div>
          </section>
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: "Md. Tasfiq Tasin", jobTitle: "AI-Focused Backend Developer | Full-Stack & Flutter App Developer", email: `mailto:${LINKS.email}`, sameAs: [LINKS.github, LINKS.linkedin], alumniOf: { "@type": "CollegeOrUniversity", name: "BRAC University" }, knowsAbout: ["FastAPI", "Flutter", "LLM integration", "RAG", "React", "Supabase"], subjectOf: projects.map((project) => ({ "@type": "CreativeWork", name: project.name, description: project.summary, ...(project.github ? { url: project.github } : {}) })) }) }} />
    </>
  );
}

function CaseFact({ label, text }: { label: string; text: string }) { return <div><span className="case-label">{label}</span><p>{text}</p></div>; }

function SalesVisual() { return <div className="digest-gallery"><img className="digest-main" src="/images/salesbondhu-today-dashboard.png" width="1600" height="865" alt="SalesBondhu AI dashboard preview" loading="lazy" /><img className="digest-thumb plate-shot" src="/images/salesbondhu-optimized-route.png" width="1600" height="865" alt="SalesBondhu AI route optimization preview" loading="lazy" /><img className="digest-thumb chat-shot" src="/images/salesbondhu-login-role-selection.png" width="1600" height="902" alt="SalesBondhu AI mobile app preview" loading="lazy" /></div>; }

function DigestVisual() { return <div className="digest-gallery"><img className="digest-main" src="/images/desi-dashboard.webp" width="1600" height="865" alt="Desi Digest public product dashboard" loading="lazy" /><img className="digest-thumb plate-shot" src="/images/desi-plate-analysis.webp" width="1600" height="865" alt="Desi Digest plate analysis screen" loading="lazy" /><img className="digest-thumb chat-shot" src="/images/desi-ai-chat.webp" width="1600" height="902" alt="Desi Digest AI nutrition assistant" loading="lazy" /></div>; }

function CourseVaultVisual() { return <div className="vault-scene"><div className="vault-top"><div><small>COURSEVAULT AI</small><strong>Academic command center</strong></div><span>Scholar 01</span></div><div className="vault-space"><i className="star s1"></i><i className="star s2"></i><i className="star s3"></i><div className="vault-orbit"></div><div className="folder f1"><span>CSE 427</span><small>12 resources</small></div><div className="folder f2"><span>CSE 220</span><small>08 resources</small></div><div className="folder f3"><span>MAT 120</span><small>05 resources</small></div></div><div className="vault-lanes"><span>GitHub</span><span>Videos</span><span>PDF / Notes</span><span>Practice</span></div></div>; }

function LatexVisual() { return <div className="latex-scene"><div className="latex-toolbar"><strong>Research LaTeX Studio</strong><span>Beta · validation on</span></div><div className="latex-workspace"><div className="source-pane"><small>EXTRACTED SOURCE</small><p>Abstract</p><i></i><i></i><p>Equation</p><code>A = [1 2; 3 4]</code><p>Citation</p><code>[Rahman, 2026]</code></div><div className="convert-arrow">→</div><div className="output-pane"><small>STRUCTURED LATEX</small><code>{"\\begin{abstract}"}</code><i></i><code>{"\\begin{equation}"}</code><code>{"\\begin{bmatrix}"}</code><code>{"\\cite{rahman2026}"}</code><div className="latex-valid">✓ regression checks</div></div></div></div>; }
