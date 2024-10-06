"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsersData } from "@/db/queries";

export default function UsersPage() {
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await getUsersData();
      if (response.status === "success" && response.data !== null) {
        return response.data;
      }
      throw new Error("Failed to fetch users");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching users</div>;

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            {/* Add more table headers as needed */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <Link href={`/admin-dashboard/users/${user.id}`}>
                <TableCell>{user.name}</TableCell>
              </Link>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              {/* Add more table cells as needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
