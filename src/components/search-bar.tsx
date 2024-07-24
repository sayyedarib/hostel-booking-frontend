import AddGuest from "@/components/add-guest";
import DatePickerWithRange from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  return (
    <>
      <div className="lg:w-1/2 bg-white rounded-[40px] h-20 flex p-2">
        <DatePickerWithRange className="h-full rounded-[40px] w-1/3" />
        <AddGuest className="w-1/3" />
        <Button className="w-1/3 h-full rounded-[40px]">Search</Button>
      </div>
    </>
  );
}
