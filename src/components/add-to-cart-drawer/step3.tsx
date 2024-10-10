import { useState } from "react";
import { MoveLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateAddressAndGuardian } from "@/db/queries";

import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export const AddToCartStep3 = ({
  handleNext,
  handleBack,
}: {
  handleNext: () => void;
  handleBack: () => void;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [guardianName, setGuardianName] = useState<string>("");
  const [guardianPhone, setGuardianPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const createMutation = useMutation({
    mutationFn: updateAddressAndGuardian,
    onSuccess: (data) => {
      if (data.status === "error") {
        toast({
          variant: "destructive",
          title: "Error in creating address or updating address",
          description: "Please try again",
        });

        return;
      }

      queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
      setLoading(false);
      handleNext();
    },
    onError: (error) => {
      setLoading(false);
      console.error("Error creating guest:", error);
      toast({
        variant: "destructive",
        title: "Error creating guest",
        description: "Please try again",
      });
    },
  });

  const handleSubmit = async () => {
    setLoading(true);

    createMutation.mutate({
      address,
      city,
      state,
      pin,
      guardianName,
      guardianPhone,
    });
  };

  return (
    <div className="mx-auto space-y-4 w-full md:w-1/2 lg:w-1/3 p-3 bg-white shadow-lg rounded-lg">
      <DrawerHeader>
        <DrawerTitle className="flex items-center text-2xl font-semibold">
          <MoveLeft onClick={handleBack} className="mr-2 cursor-pointer" />
          <span>Address & Guardian Details</span>
        </DrawerTitle>
      </DrawerHeader>
      <div>
        <Label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700"
        >
          Address
        </Label>
        <Input
          id="city"
          type="text"
          placeholder="e.g. ABC 123, XYZ Colony"
          className="rounded-lg p-2 w-full border border-gray-300"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div>
          <Label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Mumbai"
            className="rounded-lg p-2 w-full border border-gray-300"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State
          </Label>
          <Input
            id="state"
            type="text"
            placeholder="Maharashtra"
            className="rounded-lg p-2 w-full border border-gray-300"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <div>
          <Label
            htmlFor="pin"
            className="block text-sm font-medium text-gray-700"
          >
            PIN Code
          </Label>
          <Input
            id="pin"
            type="text"
            placeholder="400001"
            className="rounded-lg p-2 w-full border border-gray-300"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label
          htmlFor="guardianName"
          className="block text-sm font-medium text-gray-700"
        >
          Guardian Name
        </Label>
        <Input
          id="guardianName"
          type="text"
          placeholder="Peter Parker Senior I"
          className="rounded-lg p-2 w-full border border-gray-300"
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label
          htmlFor="guardianPhone"
          className="block text-sm font-medium text-gray-700"
        >
          Guardian Phone
        </Label>
        <Input
          id="guardianPhone"
          type="text"
          placeholder="8604078498"
          className="rounded-lg p-2 w-full border border-gray-300"
          value={guardianPhone}
          onChange={(e) => setGuardianPhone(e.target.value)}
          required
        />
      </div>
      <Button
        onClick={handleSubmit}
        className="w-full text-black"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          "Next"
        )}
      </Button>
    </div>
  );
};
