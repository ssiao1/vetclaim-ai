import React, { useMemo, useState } from "react";

const Icon = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => <div className={`rounded-3xl border ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

const Check = ({ className = "" }) => <Icon className={className}>✓</Icon>;
const Shield = ({ className = "" }) => <Icon className={className}>★</Icon>;
const Upload = ({ className = "" }) => <Icon className={className}>↑</Icon>;
const AI = ({ className = "" }) => <Icon className={className}>AI</Icon>;
const Alert = ({ className = "" }) => <Icon className={className}>!</Icon>;
const Menu = ({ className = "" }) => <Icon className={className}>☰</Icon>;
const Close = ({ className = "" }) => <Icon className={className}>×</Icon>;

const resources = [
  {
    title: "VA Disability Basics",
    tag: "Free",
    summary: "Understand service connection, disability ratings, evidence, and common claim types.",
  },
  {
    title: "HLR vs Supplemental Claim",
    tag: "Free",
    summary: "Learn when a Higher-Level Review or supplemental claim may apply after a denial.",
  },
  {
    title: "SMC-L and Aid & Attendance",
    tag: "Premium",
    summary: "Plain-language education about SMC levels, A&A factors, and supporting evidence.",
  },
  {
    title: "Decision Letter Breakdown",
    tag: "Premium",
    summary: "Learn how to read favorable findings, denial reasons, effective dates, and next steps.",
  },
  {
    title: "DBQ Review Guide",
    tag: "Premium",
    summary: "Understand how symptoms, severity, and examiner notes may connect to rating criteria.",
  },
  {
    title: "VA Math Calculator",
    tag: "Free",
    summary: "Estimate combined disability ratings using VA-style combined rating logic.",
  },
];

const sampleAnswers = {
  denial:
    "A denial usually means VA found one or more missing elements: current diagnosis, in-service event, nexus, severity, or continuity. Review the favorable findings first because VA has already conceded those items. Then focus your next evidence on the exact reason for denial.",
  smc:
    "SMC-L generally involves loss of use, blindness criteria, or regular Aid & Attendance need. For A&A, VA often looks at whether the veteran needs help with activities like dressing, bathing, feeding, medication management, safety, or protection from daily hazards.",
  dbq:
    "A DBQ matters because it documents diagnosis, symptoms, severity, functional impact, and medical findings. The strongest DBQs usually align symptoms with the rating schedule and clearly explain occupational and daily-life limitations.",
  default:
    "I can help explain VA claim concepts, evidence gaps, appeal options, rating criteria, SMC, DBQs, and decision letters in plain language. This response is educational only and is not legal or medical advice.",
};

export default function VAClaimsAIPlatform() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState("home");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to VetClaim AI. Ask a VA claim question or upload a decision letter, DBQ, or screenshot for a plain-language explanation.",
    },
  ]);
  const [freeUsed, setFreeUsed] = useState(2);
  const [plan, setPlan] = useState("free");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ratingInputs, setRatingInputs] = useState("70, 50, 10");
  const freeLimit = 5;

  const combinedRating = useMemo(() => {
    const values = ratingInputs
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 100)
      .sort((a, b) => b - a);

    let combined = 0;
    values.forEach((rating) => {
      combined = combined + (100 - combined) * (rating / 100);
    });

    const rounded = Math.round(combined / 10) * 10;
    return Math.min(100, rounded);
  }, [ratingInputs]);

  const askAI = () => {
    if (!question.trim()) return;

    const userText = question.trim();
    const lowered = userText.toLowerCase();

    if (plan === "free" && freeUsed >= freeLimit) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: userText },
        {
          role: "assistant",
          text: "You have reached the free question limit. Upgrade to Premium for unlimited AI questions and document/image review.",
        },
      ]);
      setQuestion("");
      return;
    }

    if (plan === "free") setFreeUsed((prev) => prev + 1);

    let response = sampleAnswers.default;
    if (lowered.includes("deny") || lowered.includes("denied") || lowered.includes("denial")) response = sampleAnswers.denial;
    if (lowered.includes("smc") || lowered.includes("aid") || lowered.includes("attendance")) response = sampleAnswers.smc;
    if (lowered.includes("dbq")) response = sampleAnswers.dbq;

    if (uploadedFile) {
      response += `

Uploaded file detected: ${uploadedFile}. In the live version, the AI would securely read the document, identify favorable findings, denial reasons, missing evidence, possible appeal paths, and create a plain-language summary.`;
    }

    setMessages((prev) => [...prev, { role: "user", text: userText }, { role: "assistant", text: response }]);
    setQuestion("");
  };

  const upgrade = () => {
    setPlan("premium");
    setView("dashboard");
  };

  const nav = [
    ["home", "Home"],
    ["assistant", "AI Assistant"],
    ["resources", "Resources"],
    ["tools", "Tools"],
    ["pricing", "Pricing"],
    ["dashboard", "Dashboard"],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button onClick={() => setView("home")} className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-bold shadow-lg shadow-blue-500/30">
              <Shield />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">VetClaim AI</p>
              <p className="text-xs text-slate-400">VA Claims Education + AI Guidance</p>
            </div>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`rounded-xl px-3 py-2 text-sm transition ${view === key ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan === "premium" ? "bg-emerald-400/15 text-emerald-200" : "bg-slate-800 text-slate-300"}`}>
              {plan === "premium" ? "Premium Active" : `Free ${freeUsed}/${freeLimit}`}
            </span>
            <Button onClick={upgrade} className="bg-blue-500 hover:bg-blue-600">Upgrade</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <Close /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 px-5 py-4 md:hidden">
            <div className="grid gap-2">
              {nav.map(([key, label]) => (
                <button key={key} onClick={() => { setView(key); setMobileOpen(false); }} className="rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5">
                  {label}
                </button>
              ))}
              <Button onClick={upgrade} className="bg-blue-500 hover:bg-blue-600">Upgrade</Button>
            </div>
          </div>
        )}
      </header>

      {view === "home" && (
        <main>
          <section className="relative overflow-hidden px-5 py-20 md:py-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_30%)]" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
                  <AI /> AI-powered VA claim education
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  Understand your VA claim faster with guided AI support.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  Ask questions, review decision letters, understand DBQs, learn SMC, and get plain-language explanations for claim options, evidence gaps, and appeal pathways.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => setView("assistant")} className="bg-blue-500 px-6 py-4 text-base hover:bg-blue-600">Try AI Assistant</Button>
                  <Button onClick={() => setView("resources")} className="border border-white/20 bg-white/5 px-6 py-4 text-base hover:bg-white/10">View Free Resources</Button>
                </div>
                <p className="mt-4 text-sm text-slate-400">Free questions included. Premium is $9.99/month for unlimited AI and upload review.</p>
              </div>
              <AssistantPanel
                question={question}
                setQuestion={setQuestion}
                askAI={askAI}
                messages={messages}
                plan={plan}
                freeUsed={freeUsed}
                freeLimit={freeLimit}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
              />
            </div>
          </section>

          <section className="px-5 py-14">
            <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
              {[
                ["Decision Letters", "Break down favorable findings, denial reasons, and evidence gaps."],
                ["SMC + A&A", "Explain SMC levels, Aid & Attendance, and supporting evidence."],
                ["DBQ Review", "Translate DBQ findings into plain-language claim meaning."],
                ["Appeals", "Compare HLR, supplemental claims, and Board appeal basics."],
              ].map(([title, text]) => (
                <Card key={title} className="border-white/10 bg-white/5">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200"><Check /></div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      )}

      {view === "assistant" && (
        <Page title="AI Claim Assistant" subtitle="Ask questions, upload documents, and get plain-language VA claim explanations.">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <AssistantPanel
              question={question}
              setQuestion={setQuestion}
              askAI={askAI}
              messages={messages}
              plan={plan}
              freeUsed={freeUsed}
              freeLimit={freeLimit}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              large
            />
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">Best questions to ask</h3>
                <div className="mt-5 grid gap-3 text-sm text-slate-300">
                  {[
                    "Why did VA deny my claim?",
                    "What does this favorable finding mean?",
                    "Do I need a nexus letter?",
                    "What is the difference between HLR and supplemental claim?",
                    "What evidence helps with SMC-L or Aid & Attendance?",
                    "How should I read this DBQ?",
                  ].map((q) => (
                    <button key={q} onClick={() => setQuestion(q)} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left hover:bg-white/10">{q}</button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Page>
      )}

      {view === "resources" && (
        <Page title="VA Claim Resource Library" subtitle="Free and premium education sections for claim basics, DBQs, SMC, appeals, and decision letters.">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <Card key={r.title} className="border-white/10 bg-white/5">
                <CardContent className="p-6">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.tag === "Free" ? "bg-emerald-400/15 text-emerald-200" : "bg-blue-400/15 text-blue-200"}`}>{r.tag}</span>
                  <h3 className="mt-5 text-xl font-bold">{r.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{r.summary}</p>
                  <Button onClick={() => r.tag === "Premium" && plan !== "premium" ? setView("pricing") : setView("assistant")} className="mt-6 w-full bg-white/10 hover:bg-white/15">
                    {r.tag === "Premium" && plan !== "premium" ? "Unlock Premium" : "Open"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Page>
      )}

      {view === "tools" && (
        <Page title="Claim Tools" subtitle="Useful built-in tools for veterans researching claim outcomes and evidence needs.">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">VA Combined Rating Estimator</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">Enter ratings separated by commas. Example: 70, 50, 10</p>
                <input
                  value={ratingInputs}
                  onChange={(e) => setRatingInputs(e.target.value)}
                  className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-white outline-none focus:border-blue-400"
                />
                <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5">
                  <p className="text-sm text-blue-100">Estimated combined rating</p>
                  <p className="mt-2 text-5xl font-bold">{combinedRating}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">Evidence Gap Checklist</h3>
                <div className="mt-5 grid gap-3 text-slate-300">
                  {["Current diagnosis", "In-service event or exposure", "Medical nexus", "Severity documentation", "Functional impact statement", "Private medical records", "Lay statement or buddy letter"].map((item) => (
                    <label key={item} className="flex items-center gap-3 rounded-2xl bg-slate-900/70 p-3"><input type="checkbox" /> {item}</label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Page>
      )}

      {view === "pricing" && (
        <Page title="Pricing" subtitle="Start free, then upgrade when you need unlimited AI guidance and upload review.">
          <div className="grid gap-6 md:grid-cols-2">
            <PricingCard title="Free" price="$0" points={["Limited AI questions", "Basic VA claim articles", "VA math estimator", "No document upload analysis", "Good for basic research"]} action="Current Free Plan" />
            <PricingCard featured title="Premium" price="$9.99/month" points={["Unlimited AI questions", "Decision letter upload review", "DBQ and image uploads", "SMC and A&A guidance", "Evidence gap summaries", "Cancel anytime"]} action="Subscribe Now" onClick={upgrade} />
          </div>
        </Page>
      )}

      {view === "dashboard" && (
        <Page title="Member Dashboard" subtitle="Track questions, uploads, saved answers, and claim research in one place.">
          <div className="grid gap-6 md:grid-cols-3">
            <Stat title="Plan" value={plan === "premium" ? "Premium" : "Free"} />
            <Stat title="Questions Used" value={plan === "premium" ? "Unlimited" : `${freeUsed}/${freeLimit}`} />
            <Stat title="Uploads" value={uploadedFile ? "1 file" : "0 files"} />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">Saved Claim Research</h3>
                <div className="mt-5 grid gap-3 text-sm text-slate-300">
                  {messages.slice(-4).map((m, i) => (
                    <div key={i} className="rounded-2xl bg-slate-900/70 p-4"><strong className="text-white">{m.role === "assistant" ? "AI" : "You"}:</strong> {m.text}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-300/20 bg-amber-300/10">
              <CardContent className="p-6">
                <div className="flex gap-3"><Alert className="text-amber-200" /><h3 className="text-xl font-bold">Compliance Reminder</h3></div>
                <p className="mt-4 leading-7 text-amber-50/90">This platform provides educational information only. It is not a law firm, does not provide legal or medical advice, and does not guarantee VA claim approval, rating increases, or specific outcomes.</p>
              </CardContent>
            </Card>
          </div>
        </Page>
      )}

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-400">
        © 2026 VetClaim AI. Educational use only. Not legal or medical advice.
      </footer>
    </div>
  );
}

function Page({ title, subtitle, children }) {
  return (
    <main className="px-5 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function AssistantPanel({ question, setQuestion, askAI, messages, plan, freeUsed, freeLimit, uploadedFile, setUploadedFile, large }) {
  return (
    <Card className="border-white/10 bg-white/10 shadow-2xl backdrop-blur">
      <CardContent className="p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">AI Claim Assistant</p>
            <p className="text-sm text-slate-300">Ask about claims, ratings, appeals, SMC, DBQs, or decision letters.</p>
          </div>
          <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-bold text-blue-200">{plan === "premium" ? "Unlimited" : `${freeUsed}/${freeLimit} Free`}</span>
        </div>

        <div className={`${large ? "h-96" : "h-72"} overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-4`}>
          <div className="grid gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[92%] rounded-2xl p-3 text-sm leading-6 ${m.role === "assistant" ? "bg-blue-400/10 text-blue-50" : "ml-auto bg-white/10 text-white"}`}>
                {m.text}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10">
            <Upload /> Upload Letter/DBQ
            <input type="file" className="hidden" onChange={(e) => setUploadedFile(e.target.files?.[0]?.name || null)} />
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10">
            <Upload /> Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setUploadedFile(e.target.files?.[0]?.name || null)} />
          </label>
        </div>
        {uploadedFile && <p className="mt-2 text-xs text-emerald-200">Uploaded: {uploadedFile}</p>}

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: Why did VA deny my migraines claim, and what evidence do I need next?"
          className="mt-4 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Educational use only. Not legal or medical advice.</p>
          <Button onClick={askAI} className="bg-blue-500 hover:bg-blue-600">Ask AI</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingCard({ title, price, points, action, featured, onClick }) {
  return (
    <Card className={`${featured ? "border-blue-400/40 bg-blue-500/10 shadow-2xl shadow-blue-500/20" : "border-white/10 bg-white/5"}`}>
      <CardContent className="p-8">
        {featured && <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold">Best Value</span>}
        <h3 className="mt-4 text-2xl font-bold">{title}</h3>
        <p className="mt-4 text-4xl font-bold">{price}</p>
        <div className="mt-8 grid gap-4 text-slate-300">
          {points.map((p) => <div key={p} className="flex gap-3"><Check className="text-emerald-300" /> {p}</div>)}
        </div>
        <Button onClick={onClick} className={`mt-8 w-full py-4 ${featured ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/15"}`}>{action}</Button>
      </CardContent>
    </Card>
  );
}

function Stat({ title, value }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="p-6">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
