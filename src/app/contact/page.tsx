"use client";

import React, { useState, useRef } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger("info", "submitting contact form...");
    setLoading(true);

    const formData = {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
      message: messageRef.current?.value,
    };

    logger("info", "form data", formData);

    try {
      const response = await fetch("/api/email/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      console.log("Message sent successfully");
      // Add user feedback for success
    } catch (error) {
      console.error("Error sending message:", error);
      // Add user feedback for error
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white">
      <div
        id="map"
        className="relative overflow-hidden bg-cover bg-[50%] bg-no-repeat"
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3525.6832432481247!2d78.06761257621882!3d27.911692216447786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a541ade61277%3A0xfce35e0d6df25523!2sKHAN%20GROUP%20OF%20PG%20(Boys%20%26%20Girls)!5e0!3m2!1sen!2sin!4v1721985887604!5m2!1sen!2sin"
          width="100%"
          height="480"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="container px-6 md:px-12">
        <div className="block rounded-lg px-6 py-12 backdrop-blur-3xl md:py-16 md:px-12 -mt-[100px]">
          <div className="flex flex-wrap">
            <div className="mb-12 w-full shrink-0 grow-0 basis-auto md:px-3 lg:mb-0 lg:w-5/12 lg:px-6 text-black">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" ref={nameRef} />
                </div>
                <div className="relative">
                  <Label htmlFor="email">Email address</Label>
                  <Input type="email" id="email" ref={emailRef} />
                </div>
                <div className="relative">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={3} ref={messageRef} />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-blue-500 mt-4 text-white px-6 py-2.5 text-xs font-medium uppercase leading-normal transition duration-200 ease-in-out hover:bg-sky-600 focus:bg-sky-700"
                >
                  Send
                </Button>
              </form>
            </div>
            <ContactInfoSection />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;

const ContactInfoSection = () => {
  return (
    <div className="w-full shrink-0 grow-0 basis-auto lg:w-7/12">
      <div className="flex flex-wrap">
        <ContactInfo
          icon={<Mail className="h-6 w-6" />}
          title="Email"
          details={["support@aligarhhostel.com"]}
        />
        <ContactInfo
          icon={<Phone className="h-6 w-6" />}
          title="Phone"
          details={["+91 879147673"]}
        />
        <ContactInfo
          icon={<MapPin className="h-6 w-6" />}
          title="Address"
          details={[
            "Khan Group of PG and Hostels (Boys & Girls), Campus View Appartment, Near Sultan Jahan Coaching Center, beside Wings Academy, Shamshad Market, Aligarh, Uttar Pradesh 202002",
          ]}
        />
        {/* Add other contact information sections here */}
      </div>
    </div>
  );
};

const ContactInfo = ({
  icon,
  title,
  details,
}: {
  icon: React.ReactNode;
  title: string;
  details: string[];
}) => (
  <div className="mb-12 w-full shrink-0 grow-0 basis-auto md:w-6/12 md:px-3 lg:w-full lg:px-6 xl:w-6/12 text-black">
    <div className="flex items-start">
      <div className="shrink-0">
        <div className="inline-block rounded-md bg-blue-500 p-4">{icon}</div>
      </div>
      <div className="ml-6 grow">
        <p className="mb-2 font-bold">{title}</p>
        {details.map((detail, index) => (
          <p key={index} className="text-sm text-neutral-500">
            {detail}
          </p>
        ))}
      </div>
    </div>
  </div>
);
