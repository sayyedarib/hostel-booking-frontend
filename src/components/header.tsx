import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  return (
    <>
      <div className="flex w-full justify-between px-4 md:px-20 py-4 fixed top-0 backdrop-blur-lg bg-green-100 z-99">
        <h1 className="text-red-500 text-3xl">AligarhHostel</h1>

        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}
