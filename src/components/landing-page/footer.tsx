import { Home, Phone } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h3 className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-primary">
          Contact Us
        </h3>
        <div className="text-lg flex items-center gap-1 ">
          <Phone />
          <p>+91 8791476473</p>
        </div>
        <div className="text-lg flex items-center gap-1 max-w-[40vw]">
          <Home size="48" />
          <p>
            Khan Group of PG and Hostels (Boys & Girls), Campus View Appartment,
            Near Sultan Jahan Coaching Center, beside Wings Academy, Shamshad
            Market, Aligarh, Uttar Pradesh 202002
          </p>
        </div>
        <div>
          <Button variant={"link"}>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </Button>
          <Button variant={"link"}>
            <Link href="/terms-of-service">Terms of Service</Link>
          </Button>
        </div>
      </div>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3525.6832432481247!2d78.06761257621882!3d27.911692216447786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a541ade61277%3A0xfce35e0d6df25523!2sKHAN%20GROUP%20OF%20PG%20(Boys%20%26%20Girls)!5e0!3m2!1sen!2sin!4v1721985887604!5m2!1sen!2sin"
        className="w-full h-52 md:w-96 md:h-96 rounded-lg"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </>
  );
}
