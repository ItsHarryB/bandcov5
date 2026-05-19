import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/shadcn/carousel"

export interface CarouselImage {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    // We removed mx-auto so it can fill whatever column it's placed in
    <Carousel 
    opts={{
        align: "start",
        loop: true,
    }}
    className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface-primary shadow-sm aspect-video relative flex items-center justify-center">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Moved buttons INSIDE the image (left-4 / right-4).
        Added bg-background/80 (translucent) and hover states so they pop over photos!
      */}
      <CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-none shadow-sm" />
      <CarouselNext className="right-4 bg-background/80 hover:bg-background border-none shadow-sm" />
    </Carousel>
  )
}