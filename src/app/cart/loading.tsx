import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-[80vh] min-w-screen flex justify-center items-center">
      <Image
        src="/Loading.gif"
        width={100}
        height={100}
        alt="loading"
        unoptimized={true}
      />
    </div>
  );
}
