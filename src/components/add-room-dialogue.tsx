import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom } from "@/db/queries";

export default function AddRoomDialogue() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomCode: "",
    floor: 0,
    gender: "male",
    propertyId: 1,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (formData: { roomCode: string; floor: number; gender: string; propertyId: number }) => 
      createRoom(formData.roomCode, formData.floor, formData.gender, formData.propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoomData"] });
      setIsDialogOpen(false);
    },
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsDialogOpen(true)}>Add New Room</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              type="text"
              id="roomCode"
              name="roomCode"
              value={formData.roomCode}
              onChange={handleFormChange}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="floor">Floor</Label>
            <Input
              type="number"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleFormChange}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="gender">Gender</Label>
            <Input
              type="text"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}