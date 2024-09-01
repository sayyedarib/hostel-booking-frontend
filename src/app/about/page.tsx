"use server";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/container";
import Link from "next/link";

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <section className="py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-800">About Our Hostel</h1>
          <p className="mt-4 text-lg text-gray-600">
            Providing a conducive environment for students aged 12-25 to excel
            in their studies and achieve their dreams.
          </p>
        </section>

        <section className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-semibold text-gray-800">
                Our Mission
              </h2>
              <p className="mt-4 text-gray-600">
                Our mission is to offer the best facilities and environment for
                students to focus on their studies and excel in competitive
                exams like AMUEEE and JEE.
              </p>
            </div>
            <div className="relative w-full h-64 md:h-auto">
              <Image
                src="/mission.png"
                alt="Our Mission"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <h2 className="text-3xl font-semibold text-center text-gray-800">
            Our Facilities
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {facilities.map((facility) => (
              <Card key={facility.title} className="shadow-lg bg-none">
                <CardHeader>
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    width={300}
                    height={200}
                    className="rounded-lg mx-auto"
                  />
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {facility.title}
                  </CardTitle>
                  <p className="text-gray-600">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <h2 className="text-3xl font-semibold text-center text-gray-800">
            Our Achievements
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {achievements.map((achievement) => (
              <Card key={achievement.title} className="shadow-lg">
                <CardContent className="text-center">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {achievement.title}
                  </CardTitle>
                  <p className="text-gray-600">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16 bg-white">
          <h2 className="text-3xl font-semibold text-center text-gray-800">
            Our Team
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="shadow-lg">
                <CardHeader>
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="rounded-full mx-auto"
                  />
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {member.name}
                  </CardTitle>
                  <p className="text-gray-600">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-3xl font-semibold text-gray-800">Join Us</h2>
          <p className="mt-4 text-gray-600">
            We are always looking for passionate students to join our hostel. If
            you are dedicated to your studies, we would love to have you.
          </p>
          <Button className="mt-8">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </section>
      </Container>
    </div>
  );
}

const facilities = [
  {
    title: "Study Environment",
    description:
      "A quiet and conducive environment for focused study sessions.",
    image: "/img/rooms/Room_7_1.jpeg",
  },
  {
    title: "Food Services",
    description:
      "Nutritious and delicious meals prepared by our in-house chefs. We care about your health! and time",
    image: "/food-service.png",
  },
  {
    title: "Safe Environment for Girls",
    description:
      "We provide a safe, secure and isolated environment for girls.",
    image: "/girls-env.png",
  },
];

const achievements = [
  {
    title: "Topper in AMUEEE",
    description: "Our students have consistently topped the AMUEEE exams.",
    image: "/img/achievements/amueee_topper.jpg",
  },
  {
    title: "JEE Selections",
    description: "Numerous students have secured top ranks in JEE exams.",
    image: "/img/achievements/jee_selections.jpg",
  },
  {
    title: "Competitive Exam Success",
    description:
      "Our hostel has a track record of success in various competitive exams.",
    image: "/img/achievements/competitive_exam_success.jpg",
  },
];

const team = [
  {
    name: "Zeeshan Khan",
    role: "Founder",
    image: "/zeeshan.png",
  },
  {
    name: "Aarib",
    role: "Developer",
    image: "/Aarib.jpeg",
  },
];
