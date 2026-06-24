import * as React from "react"
import { X } from "lucide-react" 
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/shadcn/carousel"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/shadcn/dialog"
import { Skeleton } from "@/components/ui/shadcn/skeleton"

export interface CarouselImage {
  src: string;
  fullSrc: string; 
  width?: number;
  height?: number;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>()
  const [dialogApi, setDialogApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({})

  if (!images || images.length === 0) return null;

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    if (dialogApi) {
      dialogApi.scrollTo(index, true);
    }
  }

  const handleImageLoad = (key: string) => {
    setLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <Dialog>
      {/* 1. THE MAIN PAGE CAROUSEL */}
      <Carousel 
        setApi={setMainApi}
        opts={{ align: "start", loop: true }}
        plugins={[WheelGesturesPlugin()]}
        className="w-full group"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <DialogTrigger asChild>
                  <div 
                    onClick={() => handleImageClick(index)}
                    className="overflow-hidden rounded-2xl border border-border bg-surface-primary shadow-sm aspect-[4/3] relative flex items-center justify-center cursor-pointer"
                  >
                    <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                    
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      onLoad={() => handleImageLoad(`main-${index}`)}
                      ref={(img) => {
                        if (img && img.complete && !loadedImages[`main-${index}`]) {
                          handleImageLoad(`main-${index}`);
                        }
                      }}
                      className="absolute inset-0 object-cover w-full h-full transition-opacity duration-300"
                      style={{ opacity: loadedImages[`main-${index}`] ? 1 : 0 }}
                      loading={index === 0 ? "eager" : "lazy"} 
                      decoding="async"
                    />
                  </div>
                </DialogTrigger>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 left-4 bg-background/80 hover:bg-background border-none shadow-sm opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 disabled:opacity-0 disabled:hidden" />
        <CarouselNext className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 right-4 bg-background/80 hover:bg-background border-none shadow-sm opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 disabled:opacity-0 disabled:hidden" />
      </Carousel>

      {/* 2. THE FULL-SCREEN LIGHTBOX */}
      <DialogContent 
        showCloseButton={false}
        className="max-w-none sm:max-w-none w-screen h-screen bg-transparent border-none shadow-none p-0 flex flex-col justify-center"
      >
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>

        <Carousel 
          setApi={setDialogApi}
          opts={{ align: "center", loop: true, startIndex: selectedIndex }}
          plugins={[WheelGesturesPlugin()]}
          className="w-full h-full flex items-center justify-center"
        >
          <CarouselContent className="h-full ml-0">
            {images.map((image, index) => (
              <CarouselItem key={index} className="h-full flex items-center justify-center pl-0">
                
                <DialogClose asChild>
                  <div className="absolute inset-0 z-0 cursor-default" />
                </DialogClose>

                <div className="relative z-10 flex items-center justify-center w-full h-full p-4 md:p-8 pointer-events-none">
                  
                  {/* PROPER OPTION 1 FIX:
                      Using w-fit h-fit mx-auto completely shrink-wraps the native image tag.
                      This guarantees absolutely zero empty bars and mathematically prevents any clipping.
                      The buttons will stay perfectly anchored to the true edges of the photo. */}
                  <div className="relative group/lightbox pointer-events-auto transform-gpu will-change-transform rounded-lg shadow-2xl drop-shadow-2xl flex items-center justify-center w-fit h-fit mx-auto">
                    
                    {/* The native high-res image sets the physical boundaries of the wrapper natively. */}
                    <img 
                      src={image.fullSrc} 
                      alt={image.alt} 
                      width={image.width}
                      height={image.height}
                      onLoad={() => handleImageLoad(`lightbox-${index}`)}
                      className="relative w-auto h-auto max-h-[85vh] max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] object-contain rounded-lg cursor-grab active:cursor-grabbing transition-opacity duration-300"
                      style={{ opacity: loadedImages[`lightbox-${index}`] ? 1 : 0 }}
                      loading="lazy"
                      decoding="async"
                    />

                    {/* The thumbnail exactly overlays the footprint defined by the high-res image. */}
                    <img 
                      src={image.src} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none transition-opacity duration-500"
                      style={{ opacity: loadedImages[`lightbox-${index}`] ? 0 : 1 }}
                    />

                    <DialogClose className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-background/60 hover:bg-background backdrop-blur-md transition-all text-foreground outline-none opacity-100 md:opacity-0 md:group-hover/lightbox:opacity-100">
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="sr-only">Close</span>
                    </DialogClose>

                    <CarouselPrevious className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 left-3 md:left-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 transition-opacity duration-300 delay-500 md:group-hover/lightbox:opacity-100 md:group-hover/lightbox:delay-0 disabled:opacity-0 disabled:hidden" />
                    <CarouselNext className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 right-3 md:right-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 transition-opacity duration-300 delay-500 md:group-hover/lightbox:opacity-100 md:group-hover/lightbox:delay-0 disabled:opacity-0 disabled:hidden" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}