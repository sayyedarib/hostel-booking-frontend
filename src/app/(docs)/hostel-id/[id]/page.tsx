import Image from 'next/image';

const IdCard = () => {
  return (
    <div className="w-[500px] h-[320px] bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-2 bg-yellow-400 p-3 rounded-t-lg">
        <Image
          src="/logo.png"
          alt="Hostel Logo"
          width={60}
          height={60}
        />
        <h1 className="text-2xl font-bold text-center text-gray-800">Campus View Apartment</h1>
      </div>
      <div className="flex-grow p-4 flex">
        <div className="w-1/3 pr-4">
          <Image
            src="/Aarib.jpeg"
            alt="Card Holder"
            width={120}
            height={120}
            className="rounded-lg object-cover border-4 border-yellow-400 shadow-md"
          />
        </div>
        <div className="w-2/3 grid grid-cols-2">
          <p className="text-sm font-semibold"><span className="text-gray-600">Name:</span> John Doe</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Room Code:</span> R-101</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Bed Code:</span> B-03</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Floor:</span> 1st</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Phone:</span> +91 9876543210</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Check-in:</span> 01/01/2023</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Check-out:</span> 31/12/2023</p>
          <p className="text-sm font-semibold"><span className="text-gray-600">Emergency:</span> 1234567890</p>
        </div>
      </div>
      <div className="text-xs text-center text-gray-700 bg-yellow-400 p-2 rounded-b-lg">
        <p className="font-medium">Beside Sultan Jahan Coaching, Shamshad Market,</p>
        <p className="font-medium">Aligarh 202001, Uttar Pradesh, India</p>
        <p className="font-bold mt-1">Phone: +91 9876543210</p>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <IdCard />
    </div>
  );
}
