"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-store-border bg-store-surface" />;
  }

  const goTo = (index: number) => setActiveIndex((index + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative flex h-[380px] items-center justify-center overflow-hidden rounded-3xl border border-store-border bg-store-surface sm:h-[460px] lg:h-[560px]">
        <Image
          src={images[activeIndex]}
          alt={`${alt} image ${activeIndex + 1}`}
          fill
          className="object-contain p-4"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={activeIndex === 0}
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border bg-store-surface transition",
                index === activeIndex ? "border-store-gold ring-2 ring-store-gold" : "border-store-border hover:border-store-gold/60"
              )}
            >
              <Image src={url} alt={`${alt} thumbnail ${index + 1}`} fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
