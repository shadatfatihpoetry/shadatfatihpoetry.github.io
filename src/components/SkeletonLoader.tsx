export function SkeletonCard() {
  return (
    <div className="bg-[#FAF8F5]/80 dark:bg-[#1A1817] border border-[#EBE5DE] dark:border-[#2C2724] rounded-xl overflow-hidden p-6 animate-pulse space-y-4">
      <div className="h-44 bg-[#EBE5DE]/60 dark:bg-[#2C2724] rounded-lg w-full" />
      <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-1/3" />
      <div className="h-6 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-[#EBE5DE]/80 dark:bg-[#2C2724]/80 rounded w-full" />
        <div className="h-3 bg-[#EBE5DE]/80 dark:bg-[#2C2724]/80 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-20" />
        <div className="h-3 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-14" />
      </div>
    </div>
  );
}

export function SkeletonReading() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-pulse">
      <div className="h-10 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-2/3 mx-auto" />
      <div className="flex justify-center gap-4">
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-24" />
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-20" />
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-16" />
      </div>
      <div className="h-64 bg-[#EBE5DE]/60 dark:bg-[#2C2724]/60 rounded-xl w-full" />
      <div className="space-y-4 pt-4">
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-full" />
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-11/12" />
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-10/12" />
        <div className="h-4 bg-[#EBE5DE] dark:bg-[#2C2724] rounded w-full" />
      </div>
    </div>
  );
}
