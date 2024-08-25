"use client";
import { usePathname, useSearchParams, redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Share,
  Zap,
  Wifi,
  ShowerHead,
  CircleParking,
  Droplets,
  Fan,
  LampDesk,
  DoorOpen,
  Soup,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Room({ params }: { params: { roomid: string } }) {
  const pathname = usePathname();
  // const [roomData, setRoomData] = useState<RoomDataType | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setIsLinkCopied(true);
  };

  useEffect(() => {
    if (!isLinkCopied) return;
    const timeout = setTimeout(() => {
      setIsLinkCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isLinkCopied]);
  return <></>;

  // return (
  //   <>
  //     <div className="max-w-full lg:w-2/3 h-auto flex justify-center mx-auto">
  //       <div className="mt-24 md:mt-32 border-neutral-600 py-2 space-y-4 px-4">
  //         <div className="max-w-[calc(100%-5rem)] h-auto md:h-[400px] px-2 mx-auto">
  //           {roomData?.imageUrls.length! >= 1 && (
  //             <div className="md:grid-cols-4 md:grid-rows-2 gap-2 rounded-xl md:grid hidden">
  //               {roomData?.imageUrls.map((imgURL, index) => (
  //                 <Image
  //                   height={0}
  //                   width={0}
  //                   key={imgURL}
  //                   sizes="100vw"
  //                   src={imgURL}
  //                   className={`w-full h-auto ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
  //                   alt="room-image"
  //                 />
  //               ))}
  //             </div>
  //           )}
  //           {roomData?.imageUrls.length! >= 1 && (
  //             <Carousel className="md:hidden">
  //               <CarouselContent>
  //                 {roomData?.imageUrls.map((imgURL) => (
  //                   <CarouselItem key={imgURL}>
  //                     <Image
  //                       height={0}
  //                       width={0}
  //                       sizes="100vw"
  //                       src={imgURL}
  //                       className="w-full h-auto"
  //                       alt="room-image"
  //                     />
  //                   </CarouselItem>
  //                 ))}
  //               </CarouselContent>
  //               <CarouselPrevious />
  //               <CarouselNext />
  //             </Carousel>
  //           )}
  //         </div>

  //         <div className="flex justify-between">
  //           <div className="flex flex-col">
  //             {!roomData?.buildingName && !roomData?.roomNumber ? (
  //               <div className="flex flex-col gap-2">
  //                 <Skeleton className="w-[100px] h-[30px]" />
  //                 <Skeleton className="w-[50px] h-[20px]" />
  //               </div>
  //             ) : (
  //               <>
  //                 <span className="text-3xl">{roomData?.buildingName}</span>
  //                 <span className="text-xl text-neutral-500">
  //                   Room: {roomData?.roomNumber}
  //                 </span>
  //               </>
  //             )}
  //           </div>
  //           <Dialog>
  //             <DialogTrigger asChild>
  //               <Button variant="outline" size="icon">
  //                 <Share className="cursor-pointer" />
  //               </Button>
  //             </DialogTrigger>
  //             <DialogContent className="sm:max-w-md">
  //               <DialogHeader>
  //                 <DialogTitle>Share link</DialogTitle>
  //                 <DialogDescription>Share room</DialogDescription>
  //               </DialogHeader>
  //               <div className="flex items-center space-x-2">
  //                 <div className="grid flex-1 gap-2">
  //                   <Label htmlFor="link" className="sr-only">
  //                     Link
  //                   </Label>
  //                   <Input
  //                     id="link"
  //                     defaultValue={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${pathname}`}
  //                     readOnly
  //                   />
  //                 </div>
  //                 <Button
  //                   type="submit"
  //                   onClick={() =>
  //                     copyLink(
  //                       `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${pathname}`,
  //                     )
  //                   }
  //                   size="sm"
  //                   className="px-3"
  //                 >
  //                   <span className="sr-only">Copy</span>
  //                   <Copy className="h-4 w-4" />
  //                 </Button>
  //               </div>
  //               {isLinkCopied && (
  //                 <p className="text-blue-500">Link is copied!</p>
  //               )}
  //               <DialogFooter className="sm:justify-start">
  //                 <DialogClose asChild>
  //                   <Button type="button" variant="secondary">
  //                     Close
  //                   </Button>
  //                 </DialogClose>
  //               </DialogFooter>
  //             </DialogContent>
  //           </Dialog>
  //         </div>

  //         <div className="flex flex-wrap justify-between w-full gap-8">
  //           <div className="flex flex-wrap gap-8">
  //             <div className="flex flex-col gap-2">
  //               <h2 className="text-2xl mb-3 text-neutral-900">
  //                 Free Services
  //               </h2>
  //               <ul className="text-md font-thin space-y-2 text-neutral-500">
  //                 <li className="flex gap-2">
  //                   <Wifi />
  //                   Free WIFI
  //                 </li>
  //                 {/* <li className="flex gap-2">Daily Room Cleaning for free</li> */}
  //                 <li className="flex gap-2">
  //                   <Droplets /> Purified Water
  //                 </li>
  //                 <li className="flex gap-2">
  //                   <Zap />
  //                   24*7 Electricity
  //                 </li>
  //                 <li className="flex gap-2">
  //                   <CircleParking />
  //                   Free Parking
  //                 </li>
  //               </ul>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <h2 className="text-2xl mb-3 text-neutral-900">Inside Room</h2>
  //               <ul className="text-md font-thin space-y-2 text-neutral-500">
  //                 <li className="flex gap-2">
  //                   <DoorOpen />
  //                   Dedicated almirah with lock to every individual
  //                 </li>
  //                 <li className="flex gap-2">
  //                   <LampDesk />
  //                   Dedicated Workspace to every individual
  //                 </li>
  //                 <li className="flex gap-2">
  //                   <ShowerHead />
  //                   Attached washroom
  //                 </li>
  //                 <li className="flex gap-2">
  //                   <Fan />
  //                   Air Cooler
  //                 </li>
  //               </ul>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <h2 className="text-2xl mb-3 text-neutral-900">
  //                 At walking distance
  //               </h2>
  //               <ul className="text-md font-thin space-y-2 text-neutral-500">
  //                 <li className="flex gap-2">
  //                   <GraduationCap />
  //                   AMU Campus (Main Gate)
  //                 </li>
  //                 <li className="flex gap-2">
  //                   <Soup />
  //                   Restraunts and hotels
  //                 </li>
  //               </ul>
  //             </div>
  //           </div>
  //           <BedReservationCard
  //             className="md:w-[400px] w-full"
  //             roomData={roomData!}
  //           />
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // );
}
