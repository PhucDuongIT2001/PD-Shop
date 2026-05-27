import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={twMerge(clsx("animate-pulse rounded-md bg-gray-200", className))}
      {...props}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col h-full">
      <Skeleton className="w-full aspect-[4/3] rounded-xl mb-4" />
      <div className="flex flex-col flex-grow">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="mt-auto flex items-end justify-between">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
