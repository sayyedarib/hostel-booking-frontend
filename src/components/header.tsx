import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <div
        className={cn(
          className,
          "flex w-full justify-between px-4 md:px-20 py-4 backdrop-blur-3xl shadow-md",
        )}
      >
        <Link href="/" className="text-red-500 text-3xl">AligarhHostel</Link >

        {/* <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar> */}
      </div>
    </>
  );
}
