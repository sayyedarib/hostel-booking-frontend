import { Calendar } from "@/components/ui/calendar";

import { OccupiedDateRange } from "@/interface";

export default function AddToCartStep2({
  occupiedDateRanges,
}: {
  occupiedDateRanges: OccupiedDateRange[];
}) {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Add to Cart</h1>
        <p className="text-sm text-gray-600">
          Select the dates you want to book
        </p>
      </div>
      <div>
        <Calendar
          showOutsideDays={false}
          modifiers={{
            booked: (date) => {
              return occupiedDateRanges?.some((range) => {
                return (
                  date >= new Date(range.startDate) &&
                  date <= new Date(range.endDate)
                );
              });
            },
          }}
          onDayClick={(date, modifiers) => {
            console.log(date);
          }}
        />
      </div>
    </div>
  );
}
