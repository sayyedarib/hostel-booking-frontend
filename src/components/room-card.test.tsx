import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { RoomCard } from "@/interface";

// The drawer pulls in the whole booking stack; the card only needs to know
// whether it rendered.
vi.mock("./add-to-cart-drawer", () => ({
  default: ({ roomId }: { roomId: number }) => (
    <button data-testid="add-to-cart">Add Bed to Cart {roomId}</button>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { RoomCardComponent } from "./room-card";

const baseRoom: RoomCard = {
  id: 12,
  buildingName: "Campus View Apartment",
  roomCode: "G2-105",
  imageUrls: ["https://example.com/room.jpg"],
  gender: "male",
  bedCount: 4,
  availableForBooking: true,
  occupiedCount: 1,
};

const renderRoom = (overrides: Partial<RoomCard> = {}) =>
  render(<RoomCardComponent roomData={{ ...baseRoom, ...overrides }} />);

describe("RoomCardComponent", () => {
  it("shows the room code and how many beds are free", () => {
    renderRoom();
    expect(screen.getByText(/G2-105/)).toBeInTheDocument();
    expect(screen.getByText(/3 available/)).toBeInTheDocument();
    expect(screen.getByText(/4 max/)).toBeInTheDocument();
  });

  it("offers booking when the room is open and has a free bed", () => {
    renderRoom();
    expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
    expect(screen.queryByText(/No Space Available/)).not.toBeInTheDocument();
  });

  // Regression: a room flagged available with every bed occupied used to show
  // an enabled "Add Bed to Cart" button next to "Available Beds: 0".
  it("refuses booking when every bed is occupied, even if flagged available", () => {
    renderRoom({ bedCount: 4, occupiedCount: 4, availableForBooking: true });
    expect(screen.getByText(/No Space Available/)).toBeInTheDocument();
    expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
  });

  it("refuses booking when the admin has closed the room", () => {
    renderRoom({ availableForBooking: false });
    expect(screen.getByText(/No Space Available/)).toBeInTheDocument();
  });

  it("treats a null availability flag as closed", () => {
    renderRoom({ availableForBooking: null });
    expect(screen.getByText(/No Space Available/)).toBeInTheDocument();
  });

  it("never reports a negative bed count when data is inconsistent", () => {
    renderRoom({ bedCount: 2, occupiedCount: 5 });
    expect(screen.getByText(/0 available/)).toBeInTheDocument();
  });

  it("falls back to a placeholder when the room has no photos", () => {
    renderRoom({ imageUrls: [] });
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/img/fall_back_room.png",
    );
  });

  it("gives the photo a descriptive alt text rather than 'thumbnail'", () => {
    renderRoom();
    expect(
      screen.getByAltText("Room G2-105 at Campus View Apartment"),
    ).toBeInTheDocument();
  });

  // Regression: the rating was `4.{Math.floor(Math.random() * 10)}`, which
  // fabricated a score and differed between server and client render.
  it("renders identical markup across renders", () => {
    const first = renderRoom().container.innerHTML;
    const second = renderRoom().container.innerHTML;
    expect(first).toBe(second);
  });
});
