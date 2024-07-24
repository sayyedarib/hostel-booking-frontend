import SearchBar from "@/components/search-bar";

export default function Home() {
  return (
    <main className="min-h-screen w-100vw bg-[url('/bg.jpg')] bg-cover flex flex-col gap-10 items-center justify-center">
      <h1 className="text-7xl font-extrabold text-white">Welcome to Aligarh</h1>
      <SearchBar />
    </main>
  );
}
