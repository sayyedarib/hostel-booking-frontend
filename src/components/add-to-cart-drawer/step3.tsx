import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AddToCartStep3 = ({ handleBack }: { handleBack: () => void }) => {
  return (
    <>
      <div className="mx-auto w-full md:w-1/2 lg:w-1/3">
        <DrawerHeader>
          <DrawerTitle>Guest Information</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <div className="grid grid-cols-1 gap-2">
          <Input
            type="text"
            placeholder="Name"
            className="h-12 rounded-lg p-4 w-full"
          />
          <Input
            type="email"
            placeholder="Email"
            className="h-12 rounded-lg p-4 w-full"
          />
          <Input
            type="tel"
            placeholder="Phone"
            className="h-12 rounded-lg p-4 w-full"
          />
        </div>
        <DrawerFooter>
          <Button>Next</Button>
        </DrawerFooter>
      </div>
    </>
  );
};
