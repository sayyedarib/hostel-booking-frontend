"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Loader } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DocumentUpload from "@/components/document-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getUserDataById,
  getUserTransactions,
  updateUserPersonalDetails,
  updateUserImageUrl,
} from "@/db/queries";
import { createClient } from "@/lib/supabase/client";

export default function UserProfilePage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["userData"],
    queryFn: () => getUserDataById(),
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getUserTransactions(),
  });

  const { mutate: updateUserDetails } = useMutation({
    mutationFn: (data: FormData) =>
      updateUserPersonalDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });

  useEffect(() => {
    if (user?.data?.[0]?.applicantPhoto) {
      setPreviewUrl(user.data[0].applicantPhoto);
    }
  }, [user]);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const fileName = `${new Date().getTime()}`;
      const { data, error } = await supabase.storage
        .from("user_photo")
        .upload(fileName, file);
      if (error) {
        console.error("Error uploading photo:", error);
      } else {
        console.log("Photo uploaded successfully:", data);
        const { data: publicUrlData } = supabase.storage
          .from("user_photo")
          .getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;
        updateUserImageUrl({ imageUrl });
        queryClient.invalidateQueries({ queryKey: ["userData"] });
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-center gap-3">
          <Avatar className="w-28 h-28">
            <AvatarImage
              src={previewUrl || user?.data?.[0]?.applicantPhoto}
              alt="Avatar"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user?.data?.[0]?.name}</CardTitle>
            <Button onClick={() => inputRef.current?.click()}>
              Upload Photo
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUploadPhoto}
          />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              {user?.data && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      console.log("phone: ", formData.get("phone"));
                      updateUserDetails(formData);
                    }}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Full Name
                      </h3>
                      <Input
                        name="name"
                        className="mt-1"
                        defaultValue={user.data[0].name}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Email Address
                      </h3>
                      <Input
                        name="email"
                        className="mt-1"
                        defaultValue={user.data[0].email}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Phone Number
                      </h3>
                      <Input
                        name="phone"
                        className="mt-1"
                        defaultValue={user.data[0].phone}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </h3>
                      <Input
                        name="dob"
                        className="mt-1"
                        type="date"
                        defaultValue={
                          user.data[0].dob
                            ? new Date(user.data[0].dob)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Address
                      </h3>
                      <Input
                        name="address"
                        className="mt-1"
                        defaultValue={user.data[0].address ?? ""}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        City
                      </h3>
                      <Input
                        name="city"
                        className="mt-1"
                        defaultValue={user.data[0].city ?? ""}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        State
                      </h3>
                      <Input
                        name="state"
                        className="mt-1"
                        defaultValue={user.data[0].state ?? ""}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">PIN</h3>
                      <Input
                        name="pin"
                        className="mt-1"
                        defaultValue={user.data[0].pin ?? ""}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Guardian Name
                      </h3>
                      <Input
                        name="guardianName"
                        className="mt-1"
                        defaultValue={user.data[0].guardianName ?? ""}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Guardian Phone
                      </h3>
                      <Input
                        name="guardianPhone"
                        className="mt-1"
                        defaultValue={user.data[0].guardianPhone ?? ""}
                      />
                    </div>
                    <Button className="mt-4" type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </TabsContent>
            <TabsContent value="transactions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTransactions ? (
                    <TableRow>
                      <TableCell colSpan={4}>Loading transactions...</TableCell>
                    </TableRow>
                  ) : (
                    transactions?.data?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toDateString()}
                        </TableCell>
                        <TableCell>
                          {transaction.verified ? "Verified" : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="documents">
              <div className="flex gap-4 justify-center flex-wrap">
                <DocumentUpload
                  title="User ID Document"
                  imageUrl={user?.data?.[0]?.userIdImage ?? ""}
                  field="user_id_image"
                />
                <DocumentUpload
                  title="Guardian Photo"
                  imageUrl={user?.data?.[0]?.guardianPhoto ?? ""}
                  field="guardian_photo"
                />
                <DocumentUpload
                  title="Guardian ID Document"
                  imageUrl={user?.data?.[0]?.guardianIdImage ?? ""}
                  field="guardian_id_image"
                />
                <DocumentUpload
                  title="Signature"
                  imageUrl={user?.data?.[0]?.signature ?? ""}
                  field="signature"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
