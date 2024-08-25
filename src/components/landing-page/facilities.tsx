import Image from "next/image";
const facilities = [
  {
    title: "24/7 Reception",
    icon: "/icons/24_7.png",
  },
  {
    title: "Air Cooler",
    icon: "/icons/air.png",
  },
  {
    title: "CCTV Surveillance",
    icon: "/icons/cc.png",
  },
  {
    title: "Purified Water",
    icon: "/icons/ro.png",
  },
  {
    title: "Food",
    icon: "/icons/food.png",
  },
  {
    title: "Gyeser",
    icon: "/icons/gyeser1.png",
  },
  {
    title: "Iron",
    icon: "/icons/iron.png",
  },
  {
    title: "Washing Machine",
    icon: "/icons/washing_machine.png",
  },
];

export default function Facilities() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 p-2 md:p-4 w-full md:w-3/4 mx-auto">
      {facilities.map((facility, index) => {
        return (
          <div key={index} className="flex flex-col items-center mt-10 gap-3">
            <div className="w-40 h-40 mx-auto flex md:w-60 md:h-60 items-center justify-center gap-2 rounded-full p-1 bg-[#7091E6]">
              <Image src={facility.icon} width={150} height={150} alt="" />
            </div>
            <span className="font-extrabold"> {facility.title}</span>
          </div>
        );
      })}
    </div>
  );
}
