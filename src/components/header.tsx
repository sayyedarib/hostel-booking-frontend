import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  return (
    <>
      <div className="flex w-full justify-between px-20 py-4 fixed">
        <h1 className="text-red-500 text-3xl">AligarhHostel</h1>

        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}
