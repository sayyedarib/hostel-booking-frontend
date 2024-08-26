"use server"
import { Check } from 'lucide-react';

const services = [
  { name: "WiFi", description: "High-speed internet access throughout the hostel" },
  { name: "24/7 Electricity", description: "Uninterrupted power supply with backup" },
  { name: "Water Supply", description: "Continuous water supply" },
  { name: "Purified Drinking Water", description: "Free access to purified drinking water" },
  { name: "Washing Machine", description: "Laundry facilities available for residents" },
  { name: "Air Cooler", description: "Air cooling system in rooms" },
  { name: "Almirah", description: "Personal storage space in each room" },
  { name: "Study Tables", description: "Dedicated study area in rooms" },
  { name: "Attached Washrooms", description: "Private bathrooms in select rooms" },
  { name: "Shared Washrooms", description: "Clean, well-maintained shared bathrooms" },
  { name: "Lift/Elevator", description: "Easy access to all floors" },
  { name: "Room Cleaning", description: "Free regular room cleaning service" },
  { name: "Food Service (Optional)", description: "Breakfast, lunch, and dinner available at INR 3000/month" },
];

export default function Services() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <p className="mb-6">At AligarhHostel.com, we provide a range of services to ensure a comfortable and productive stay for our residents:</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow">
            <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Room Types and Rates</h2>
        <ul className="list-disc pl-5">
          <li>2-seater: INR 5000 per bed</li>
          <li>3-seater: INR 4500 per bed</li>
          <li>4-seater: INR 4000 per bed</li>
        </ul>
        <p className="mt-2">Security deposit: INR 1000 (refundable if no damage)</p>
      </div>

      <p className="mt-6 text-sm text-gray-600">
        Note: Smoking and drinking are strictly prohibited in the hostel premises.
      </p>
    </div>
  );
}