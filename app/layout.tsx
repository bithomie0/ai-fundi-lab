import type { Metadata } from "next";
import {faqs} from "./site-content";
import "./globals.css";
import "./refinements.css";
import "./experience.css";
import "./launch-refinements.css";
import "./fundi-motion.css";
const siteUrl = "https://theaifundi.com";
const title = "The AI Fundi — Websites, Apps & AI";
const description = "Chris Conley builds websites, applications and practical AI systems for businesses. Explore the work or book a free 15-minute conversation.";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {canonical: "/"},
  authors: [{name: "Chris Conley", url: siteUrl}],
  creator: "Chris Conley",
  applicationName: "The AI Fundi",
  icons: {icon: [{url: "/favicon.svg", type: "image/svg+xml"}, {url: "/favicon.ico"}], apple: "/apple-touch-icon.png"},
  manifest: "/site.webmanifest",
  robots: {index: true, follow: true},
  openGraph: {title, description, url: siteUrl, siteName: "The AI Fundi", type: "website", locale: "en_US", images: [{url: "/og-image.png", width: 1200, height: 630, alt: "The AI Fundi"}]},
  twitter: {card: "summary_large_image", title, description, site: "@theaifundi", images: ["/og-image.png"]},
};
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "WebSite", "@id": siteUrl + "/#website", url: siteUrl, name: "The AI Fundi", description, inLanguage: "en", publisher: {"@id": siteUrl + "/#organization"}},
    {"@type": "Person", "@id": siteUrl + "/#chris", name: "Chris Conley", alternateName: "The AI Fundi", url: siteUrl, jobTitle: "Global AI Innovation Lead", description: "Chris Conley builds websites, applications and practical AI systems for businesses.", image: siteUrl + "/chris-real-photo-960.webp", knowsAbout: ["Website development", "Web applications", "Artificial intelligence", "Business automation", "AI consulting", "Business strategy"]},
    {"@type": "Organization", "@id": siteUrl + "/#organization", name: "The AI Fundi", url: siteUrl, email: "hello@theaifundi.com", logo: siteUrl + "/logo.svg", description, founder: {"@id": siteUrl + "/#chris"}, areaServed: {"@type": "Place", name: "Worldwide"}, contactPoint: {"@type": "ContactPoint", contactType: "Project inquiries", email: "hello@theaifundi.com", url: "https://cal.com/theaifundi/intro"}},
    ...[
      ["Websites", "Business websites, landing pages and redesigns built around your business."],
      ["Applications", "Web applications, internal tools and customer portals."],
      ["AI systems", "Practical automations, content workflows and integrations."],
      ["AI opportunity audits", "A business review to identify useful AI opportunities and agree on priorities and an action plan."],
    ].map(([name, description]) => ({"@type": "Service", name, serviceType: name, description, url: siteUrl + "/#services", provider: {"@id": siteUrl + "/#organization"}, areaServed: {"@type": "Place", name: "Worldwide"}})),
    {"@type": "FAQPage", "@id": siteUrl + "/#faq", mainEntity: faqs.map(([name, text]) => ({"@type": "Question", name, acceptedAnswer: {"@type": "Answer", text}}))},
  ],
};
const init=`try{var p=JSON.parse(localStorage.getItem('fundi-appearance')||'{}');var t=p.theme||'device';var d=document.documentElement;d.dataset.theme=t==='device'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):t;d.dataset.motion=(p.reduce??matchMedia('(prefers-reduced-motion:reduce)').matches)?'reduce':'full';for(var k of ['contrast','mono','underlines','readable'])d.dataset[k]=String(!!p[k]);d.style.fontSize=(p.size||100)+'%'}catch(e){}`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:init}}/></head><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}}/></body></html>}
