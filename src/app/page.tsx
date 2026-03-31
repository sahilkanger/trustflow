import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Star,
  ArrowRight,
  Zap,
  Globe,
  Code,
  Shield,
  Twitter,
  Check,
} from "lucide-react";

const testimonials = [
  {
    text: "I imported 15 tweets praising our product and had a wall of love on our landing page in under 3 minutes. Our trial signups went up 28% that week.",
    author: "Sarah Chen",
    title: "Head of Growth",
    company: "Launchpad.io",
    rating: 5,
  },
  {
    text: "We were screenshotting tweets and manually pasting them. Now I just paste tweet URLs and they show up beautifully on our site. Wish I had this months ago.",
    author: "Marcus Johnson",
    title: "Founder",
    company: "ShipFast",
    rating: 5,
  },
  {
    text: "The 'Powered by TrustFlow' link on our free widget brought us 12 new signups last month. It literally markets itself.",
    author: "Priya Patel",
    title: "Founder",
    company: "CloudKitchen",
    rating: 5,
  },
];

const features = [
  {
    icon: Twitter,
    title: "Import Tweets in One Click",
    description:
      "Paste a tweet URL. We pull the content, author, and avatar. It becomes a testimonial card on your wall of love instantly.",
  },
  {
    icon: Globe,
    title: "Collection Pages",
    description:
      "Custom-branded page your customers can submit testimonials through. Share the link, get social proof.",
  },
  {
    icon: Code,
    title: "Embed in One Line",
    description:
      "Copy a single script tag. A beautiful wall of love renders on your landing page. No design work required.",
  },
  {
    icon: Shield,
    title: "Approve Before Publishing",
    description:
      "Every testimonial is reviewed by you before it goes live. Full control over what visitors see.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get your wall of love up today",
    features: [
      "1 space",
      "10 testimonials",
      "Tweet import",
      "Wall of Love embed",
      "Collection page",
      "TrustFlow branding on widget",
    ],
    cta: "Start for free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Remove branding. Unlimited proof.",
    features: [
      "3 spaces",
      "Unlimited testimonials",
      "Remove TrustFlow branding",
      "Unlimited tweet imports",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              T
            </div>
            <span className="text-lg font-bold">TrustFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Wall of Love
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Start for free
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-indigo-50 px-4 py-1.5 mb-8">
            <Twitter className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-sm text-indigo-700 font-medium">
              Import tweets. Collect forms. Embed anywhere.
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Add a{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              wall of love
            </span>{" "}
            to your SaaS landing page in 2 minutes
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your landing page is losing signups without social proof. Import
            tweets praising your product, collect testimonials, and embed a
            beautiful wall of love — in one line of code.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 h-12">
                Start collecting for free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#demo">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12"
              >
                See it in action
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Free forever. No credit card required.
          </p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-4">
            Built for SaaS founders who don&apos;t have time to mess around
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-gray-400 font-semibold text-lg">
            <span>Indie Hackers</span>
            <span>Solo Founders</span>
            <span>SaaS Teams</span>
            <span>Startups</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Three steps. Infinite social proof.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Go from zero to a wall of love in under 5 minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Import or Collect",
                description:
                  "Paste tweet URLs that praise your product. Or share a collection link with customers. Testimonials flow in.",
              },
              {
                step: "2",
                title: "Approve the best",
                description:
                  "Review what comes in. Approve the ones that sell. Reject the rest. You control the narrative.",
              },
              {
                step: "3",
                title: "Embed & convert",
                description:
                  "One script tag. Your landing page gets a wall of love. Visitors see proof. Signups go up.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              From zero to wall of love in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No bloat. Just the features that put social proof on your landing
              page.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 mb-4">
                  <feature.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Wall of Love
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our users are saying
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {t.author}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free. Upgrade when you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlighted
                    ? "border-indigo-600 bg-white shadow-lg ring-1 ring-indigo-600 relative"
                    : "bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your landing page needs social proof. Add it now.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Import your tweets, get a wall of love, embed it in one line. Free
            forever.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 h-12">
                Start for free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs">
              T
            </div>
            <span className="font-semibold text-sm">TrustFlow</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TrustFlow. Social proof that grows
            itself.
          </p>
        </div>
      </footer>
    </div>
  );
}
