export default function PageSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-10 w-48 rounded bg-gray-800" />
        <div className="h-4 w-72 rounded bg-gray-800" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded border border-gray-800 bg-gray-900/50"
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-6 w-40 rounded bg-gray-800" />

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded border border-gray-800 bg-gray-900/50"
          />
        ))}
      </div>
    </div>
  );
}