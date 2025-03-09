import RedisManager from "../components/RedisManager";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Next.js with Redis and Tailwind CSS
        </h1>
        <RedisManager />
      </div>
    </div>
  );
}
