import AddGuest from "@/components/add-guest";
import DatePickerWithRange from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SearchBar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <div
        className={cn(
          className,
          "lg:w-1/2 bg-white rounded-[40px] h-16 flex shadow-xl border-gray-100 border-[1px]",
        )}
      >
        <DatePickerWithRange className="h-full rounded-[40px] w-1/3" />
        <AddGuest className="w-1/3" />
        <Button className="w-1/3 h-full bg-red-500 rounded-[40px]">
          Search
        </Button>
      </div>
    </>
  );
}
