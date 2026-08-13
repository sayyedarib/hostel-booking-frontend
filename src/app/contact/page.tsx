"use client";

import { useState } from "react";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/landing-page/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { siteConfig } from "@/config/site";
import { logger } from "@/lib/utils";

const { address, email, phone, mapUrl } = siteConfig.contact;

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setIsSending(true);
    try {
      const response = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      // The outcome used to be a TODO on both branches, so a visitor got no
      // signal at all — the form just sat there whether it worked or not.
      toast({
        title: "Message sent",
        description: "Thanks for getting in touch. We'll reply shortly.",
      });
      form.reset();
    } catch (error) {
      logger("error", "Contact form submission failed", { error });
      toast({
        variant: "destructive",
        title: "Message not sent",
        description: `Please try again, or call us on ${phone}.`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Header className="fixed left-0 right-0 top-0 z-30" />

      <main id="main-content" className="bg-white">
        <section className="px-4 pb-8 pt-28 text-center md:pt-36">
          <h1 className="text-3xl font-extrabold text-[#212529] md:text-4xl">
            Contact us
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Questions about rooms, rent or moving in? Send us a message, or come
            and see the place — parents are always welcome to visit.
          </p>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 lg:grid-cols-2 lg:px-8">
          <section aria-labelledby="form-heading">
            <h2 id="form-heading" className="mb-4 text-xl font-bold">
              Send a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={5} required />
              </div>
              <Button
                type="submit"
                disabled={isSending}
                className="w-full rounded-full py-3 font-bold"
              >
                {isSending ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          </section>

          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="mb-4 text-xl font-bold">
              Visit or call
            </h2>
            <ul className="mb-6 space-y-4">
              <li className="flex items-start gap-3">
                <span className="rounded-lg bg-primary/20 p-2">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Phone</p>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="text-gray-600 hover:underline"
                  >
                    {phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="rounded-lg bg-primary/20 p-2">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="break-all text-gray-600 hover:underline"
                  >
                    {email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="rounded-lg bg-primary/20 p-2">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Address</p>
                  <address className="not-italic text-gray-600">
                    {address.street}
                    <br />
                    {address.locality}, {address.region} {address.postalCode}
                  </address>
                </div>
              </li>
            </ul>

            <iframe
              src={mapUrl}
              title={`Map showing ${siteConfig.name} in ${address.locality}`}
              width="100%"
              height="320"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl border-0"
            />
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
