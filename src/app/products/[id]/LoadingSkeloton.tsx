import Header from "@/components/shared/Header";
import React from "react";

const LoadingSkeloton = () => {
  return (
    <>
      <Header isProductPage={true} />
      <main className="container mx-auto px-4 pt-8 pb-[5rem]">
        <div className="animate-pulse">
          <div className="h-6 w-64 bg-gray-200 rounded mb-8" />

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/5">
              <div className="relative aspect-square mb-4 bg-gray-200 rounded-lg" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg"
                  />
                ))}
              </div>
            </div>

            <div className="md:w-3/5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-32 h-6 bg-gray-200 rounded" />
                <div className="flex gap-4">
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-gray-200 rounded-xl"
                    />
                  ))}
                </div>
              </div>

              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>

              <div className="h-8 w-1/3 bg-gray-200 rounded" />

              <div>
                <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                <div className="flex gap-4">
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="w-24 h-10 bg-gray-200 rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="w-32 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoadingSkeloton;
