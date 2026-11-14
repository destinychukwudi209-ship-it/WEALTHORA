
import Link from "next/link";

const features = [
  {
    icon: "📈",
    title: "Investment Plans",
    description:
      "Explore available plans and review their terms before making a decision.",
  },
  {
    icon: "🎯",
    title: "Earn Tasks",
    description:
      "Discover available activities and view their reward conditions.",
  },
  {
    icon: "🤝",
    title: "Affiliate Program",
    description:
      "Invite friends and learn about the affiliate reward programme.",
  },
  {
    icon: "💳",
    title: "Multiple Wallets",
    description:
      "Keep track of your different account balance categories.",
  },
];

const faqs = [
  {
    question: "What is WEALTHORA?",
    answer:
      "WEALTHORA is a platform designed to help members explore plans, tasks, account activity and affiliate features.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Use the Create Account button to register. Follow the instructions shown during registration.",
  },
  {
    question: "Where can I see my account activity?",
    answer:
      "After signing in, visit your dashboard and transactions area to view available account information.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Sign in and visit the Support section to access the available support options.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#102c70]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-4xl font-black italic text-blue-700">
              W↗
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">
                WEALTHORA
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-slate-500">
                INVEST • EARN • GROW
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold md:flex">
            <a href="#home" className="hover:text-blue-600">Home</a>
            <a href="#about" className="hover:text-blue-600">About</a>
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#faq" className="hover:text-blue-600">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border-2 border-blue-700 px-4 py-2.5 text-sm font-bold text-blue-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200"
            >
              Join
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#eaf2ff] to-[#dceaff]"
      >
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-5 py-2 text-sm font-extrabold text-blue-800">
              WELCOME TO WEALTHORA
            </span>

            <h1 className="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-[#102c70] md:text-7xl">
              Your Growth.
              <br />
              Your Journey.
              <br />
              <span className="text-blue-600">Your Future.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Discover a smarter way to explore plans, manage your account,
              complete activities and follow your WEALTHORA journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-blue-700 px-7 py-4 font-extrabold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-800"
              >
                Create Account →
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border-2 border-blue-700 bg-white px-7 py-4 font-extrabold text-blue-800"
              >
                Login
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-6 text-sm font-bold text-slate-600">
              <span>🛡️ Account Security</span>
              <span>⚡ Easy Access</span>
              <span>💬 Support</span>
            </div>
          </div>

          {/* Original WEALTHORA app illustration */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-5 rounded-full bg-blue-300/40 blur-3xl" />
            <div className="relative rounded-[2.5rem] border border-white bg-white p-4 shadow-2xl shadow-blue-200">
              <div className="rounded-[2rem] bg-gradient-to-br from-blue-800 to-blue-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black">W WEALTHORA</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                    Account
                  </span>
                </div>

                <div className="mt-9 rounded-2xl border border-white/20 bg-white/10 p-5">
                  <p className="text-sm text-blue-100">
                    Your account overview
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    Welcome!
                  </p>
                  <p className="mt-2 text-sm text-blue-100">
                    Sign in to view your personal account information.
                  </p>
                  <Link
                    href="/login"
                    className="mt-5 inline-block rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-800"
                  >
                    Open My Dashboard →
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 text-blue-900">
                    <span className="text-2xl">📊</span>
                    <p className="mt-2 text-sm font-bold">Activity</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Account updates
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-blue-900">
                    <span className="text-2xl">👛</span>
                    <p className="mt-2 text-sm font-bold">Wallets</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Balance overview
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-blue-900">
                    <span className="text-2xl">🎯</span>
                    <p className="mt-2 text-sm font-bold">Tasks</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Available activities
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-blue-900">
                    <span className="text-2xl">🤝</span>
                    <p className="mt-2 text-sm font-bold">Referrals</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Affiliate centre
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-blue-100 bg-white px-5 py-3 shadow-xl">
              <p className="text-sm font-black text-blue-800">
                WEALTHORA
              </p>
              <p className="text-xs text-slate-500">Invest • Earn • Grow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20">
        <div className="text-center">
          <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-extrabold text-blue-800">
            OUR FEATURES
          </span>
          <h2 className="mt-5 text-3xl font-black md:text-4xl">
            Everything You Need
            <br />
            <span className="text-blue-600">In One Place</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Explore the tools and services available through your WEALTHORA
            account.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-blue-100 bg-white p-7 text-center shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-4xl">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-lg font-black">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="bg-gradient-to-r from-[#eaf2ff] to-[#f6f9ff] px-5 py-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-800 to-blue-600 p-8 text-white shadow-2xl shadow-blue-200">
            <p className="text-sm font-bold tracking-widest text-blue-200">
              THE WEALTHORA EXPERIENCE
            </p>
            <h2 className="mt-5 text-4xl font-black">
              Your account.
              <br />
              All in one place.
            </h2>
            <div className="mt-8 space-y-4">
              {["Personal account dashboard", "Wallet and activity overview", "Notifications and support"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                  <span className="text-xl text-yellow-300">✓</span>
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-extrabold text-blue-800">
              ABOUT WEALTHORA
            </span>
            <h2 className="mt-6 text-4xl font-black leading-tight">
              A clearer way to follow your financial journey.
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              WEALTHORA brings account information, available activities,
              notifications and support together in one convenient platform.
            </p>
            <p className="mt-4 leading-8 text-slate-600">
              Review the applicable terms and conditions for each product
              before participating. Any stated guarantee must be supported
              by its published written terms and applicable approvals.
            </p>
            <Link
              href="/register"
              className="mt-7 inline-block rounded-xl bg-blue-700 px-7 py-4 font-extrabold text-white"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Terms notice */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-black text-amber-900">
            Important product information
          </h2>
          <p className="mt-2 text-sm leading-7 text-amber-900/80">
            Product availability, eligibility, returns, rewards and withdrawal
            conditions are governed by the applicable written terms. Review
            those terms and all relevant risk disclosures before making
            financial decisions. No figures or account balances are implied
            by this promotional preview.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#f3f7ff] px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-extrabold text-blue-800">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-6 text-4xl font-black">
              Quick Answers.
              <br />
              <span className="text-blue-600">Clear Information.</span>
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Find useful information about getting started and using
              WEALTHORA.
            </p>
            <Link
              href="/support"
              className="mt-7 inline-block rounded-xl border-2 border-blue-700 px-6 py-3 font-bold text-blue-800"
            >
              Contact Support →
            </Link>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  {faq.question}
                  <span className="text-2xl text-blue-600 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#082c80] px-5 pb-8 pt-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 border-b border-white/20 pb-8 md:flex-row md:items-center">
            <div>
              <p className="text-3xl font-black italic">W↗ WEALTHORA</p>
              <p className="mt-1 text-xs tracking-widest text-blue-200">
                INVEST • EARN • GROW
              </p>
            </div>
            <p className="font-semibold text-blue-100">
              Your Growth. Our Priority.
            </p>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/support" className="hover:text-yellow-300">Support</Link>
              <Link href="/login" className="hover:text-yellow-300">Login</Link>
              <Link href="/register" className="hover:text-yellow-300">Register</Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-blue-200 sm:flex-row">
            <p>© {new Date().getFullYear()} WEALTHORA. All rights reserved.</p>
            <p>Invest • Earn • Grow</p>
          </div>
        </div>
      </footer>
    </main>
  );
        }
                
