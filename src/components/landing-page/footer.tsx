import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { legalNav, primaryNav } from "@/config/routes";
import { siteConfig } from "@/config/site";

const { address, email, phone } = siteConfig.contact;

/** Headline links, kept visually large to anchor the footer. */
const featuredLinks = [
  { href: "/rooms", label: "rooms & beds" },
  { href: "/room-facilities", label: "rooms & facilities" },
  { href: "/about", label: "about us" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-100 px-4 pb-24 pt-8 md:px-10 md:pb-8">
      <div className="w-full rounded-3xl bg-black px-6 py-10 text-white md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            {featuredLinks.map((link) => (
              <h2
                key={link.href}
                className="mb-3 text-2xl font-bold md:text-4xl lg:text-5xl"
              >
                <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </h2>
            ))}
          </div>

          <nav aria-label="Footer">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
              Explore
            </h3>
            <ul className="space-y-3 text-sm md:text-base">
              {primaryNav.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="hover:underline">
                    {route.label}
                  </Link>
                </li>
              ))}
              {legalNav.map((route) => (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    className="text-gray-300 hover:underline"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
              Get in touch
            </h3>
            <ul className="space-y-4 text-sm md:text-base">
              <li className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="hover:underline"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${email}`}
                  className="break-all hover:underline"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <address className="not-italic text-gray-300">
                  {address.street}, {address.locality}, {address.region}{" "}
                  {address.postalCode}
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-300 pt-6 text-sm text-gray-700 md:flex-row">
        <Link href="/" aria-label={`${siteConfig.name} home`}>
          <Image
            src="/logo.png"
            alt={`${siteConfig.name} logo`}
            width={353}
            height={274}
            sizes="120px"
            className="h-auto w-[120px]"
          />
        </Link>
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
