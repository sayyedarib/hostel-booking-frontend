import { Home, Phone } from "lucide-react";

export default function Footer() {
  return (
    <>
      <footer className="w-full flex flex-wrap items-center justify-between px-14 gap-4 bg-black">
        <div className="flex flex-col gap-3">
          <h3 className="text-3xl lg:text-6xl text-red-500">Contact Us</h3>
          <div className="text-lg flex items-center gap-1 text-neutral-300">
            <Phone />
            <p>+91 8791476473</p>
          </div>
          <div className="text-lg flex items-center gap-1 text-neutral-300">
            <Home />
            <p>
              Campus View Appartment, beside Kings Academy, Saheh bagh, Aligarh,
              UP
            </p>
          </div>
        </div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3525.6832432481247!2d78.06761257621882!3d27.911692216447786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a541ade61277%3A0xfce35e0d6df25523!2sKHAN%20GROUP%20OF%20PG%20(Boys%20%26%20Girls)!5e0!3m2!1sen!2sin!4v1721985887604!5m2!1sen!2sin"
          className="w-52 h-52 md:w-96 md:h-96 rounded-lg"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </footer>
    </>
  );
}
