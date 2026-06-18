import * as React from "react"
import { X } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/shadcn/carousel"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/shadcn/dialog"
import { Skeleton } from "@/components/ui/shadcn/skeleton"
import { ExternalLink } from "@/components/ui/content/ExternalLink"

export interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
  url: string;
  condition?: string;
  size?: string;
}

interface ShopCarouselProps {
  products: Product[];
  storeName: "Vinted" | "eBay";
}

function ProductCard({ product, storeName, gradientStyle }: { product: Product, storeName: string, gradientStyle: React.CSSProperties }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const [loadedImages, setLoadedImages] = React.useState<Record<number, boolean>>({});
  
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showToggle, setShowToggle] = React.useState(false);
  
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current && !isExpanded) {
        const isTruncated = textRef.current.scrollHeight > textRef.current.clientHeight + 2;
        setShowToggle(isTruncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    
    return () => window.removeEventListener('resize', checkTruncation);
  }, [product.description, isExpanded]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <Dialog>
      {/* HARDWARE ACCELERATION: Added transform-gpu to stop the text below from glitching */}
      <div className="card bg-surface-primary shadow-sm hover:shadow-lg transition-shadow border border-border flex flex-col group overflow-hidden rounded-2xl transform-gpu">
        
        <DialogTrigger asChild>
          <figure 
            className="relative z-10 w-full aspect-[3/4] overflow-hidden bg-surface-secondary cursor-pointer shadow-lg"
            onMouseLeave={() => setActiveIndex(0)}
          >
            <Skeleton className="absolute inset-0 w-full h-full rounded-none" />

            {product.images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt={`${product.title} - Image ${i + 1}`} 
                onLoad={() => handleImageLoad(i)}
                className="absolute inset-0 object-cover w-full h-full"
                style={{
                  opacity: activeIndex === i && loadedImages[i] ? 1 : 0,
                  zIndex: activeIndex === i ? 0 : -10
                }}
                loading={i === 0 ? "eager" : "lazy"} 
                decoding="async"
              />
            ))}

            <div className="absolute inset-0 z-10 hidden md:flex">
              {product.images.map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-full"
                  onMouseEnter={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </figure>
        </DialogTrigger>

        <div className="card-body p-5 flex flex-col flex-grow">
          <h2 className="card-title flex items-start justify-between text-foreground text-lg mb-2 gap-4 h-[3.5rem]">
            <span className="line-clamp-2 leading-snug">{product.title}</span>
            <span className="font-bold whitespace-nowrap text-brand-500 shrink-0">{product.price}</span>
          </h2>

          <div className="flex flex-col gap-0.5 mb-3 text-sm text-foreground h-[2.5rem] justify-start">
            {product.condition && (
              <span><span className="font-semibold opacity-80">Condition:</span> {product.condition}</span>
            )}
            {product.size && (
              <span><span className="font-semibold opacity-80">Size:</span> {product.size}</span>
            )}
          </div>

          <div className="flex-grow flex flex-col items-start w-full">
            <div className="transition-all duration-200 w-full min-h-[2.5rem]">
              <p 
                ref={textRef}
                className={`text-sm text-foreground-muted ${isExpanded ? '' : 'line-clamp-2'}`}
              >
                {product.description}
              </p>
            </div>
            
            <div className="h-[1.5rem] mt-1.5 w-full flex items-start">
              {showToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs font-semibold text-foreground cursor-pointer hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
          
          <div className="card-actions justify-end mt-5">
            <ExternalLink 
              href={product.url}
              requireConfirm={false} 
              showIndicator={false}
              className="btn border-none rounded-xl text-white w-full opacity-90 hover:opacity-100 hover:scale-[1.02] transition-all shadow-sm flex justify-center items-center"
              style={gradientStyle}
            >
            Buy on {storeName}
          </ExternalLink>
        </div>
        </div>
      </div>

      {isMounted && (
        <DialogContent 
          showCloseButton={false}
          className="max-w-none sm:max-w-none w-screen h-screen bg-transparent border-none shadow-none p-0 flex flex-col justify-center"
        >
          <DialogTitle className="sr-only">{product.title} Lightbox View</DialogTitle>

          <Carousel 
            opts={{ align: "center", loop: true, startIndex: activeIndex }}
            plugins={[WheelGesturesPlugin()]} 
            className="w-full h-full flex items-center justify-center group/lightbox-nav"
          >
            <CarouselContent className="h-full ml-0">
              {product.images.map((img, i) => (
                <CarouselItem key={i} className="h-full flex items-center justify-center pl-0">
                  <div className="relative flex items-center justify-center w-full h-full p-4 md:p-8">
                    
                    <DialogClose asChild>
                      <div role="button" className="absolute inset-0 z-0 cursor-pointer md:cursor-default" aria-label="Close Lightbox" />
                    </DialogClose>

                    {/* HARDWARE ACCELERATION: Added transform-gpu to offload trackpad scrolling to graphics card */}
                    <div className="relative z-10 group/lightbox pointer-events-auto w-[85vw] sm:w-[60vw] md:w-auto md:h-[85vh] aspect-[3/4] rounded-lg shadow-2xl drop-shadow-2xl overflow-hidden bg-black/5 shrink-0 transform-gpu will-change-transform">
                      
                      <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                      
                      <img 
                        src={img} 
                        alt={`${product.title} - Expanded Image ${i + 1}`} 
                        onLoad={() => handleImageLoad(i)}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                        style={{ opacity: loadedImages[i] ? 1 : 0 }}
                      />

                      <DialogClose className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-background/60 hover:bg-background backdrop-blur-md transition-all text-foreground outline-none opacity-100 md:opacity-0 md:group-hover/lightbox:opacity-100">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="sr-only">Close</span>
                      </DialogClose>

                      <CarouselPrevious className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 left-3 md:left-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 transition-opacity duration-300 delay-500 md:group-hover/lightbox-nav:opacity-100 md:group-hover/lightbox-nav:delay-0 disabled:opacity-0 disabled:hidden" />
                      <CarouselNext className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 right-3 md:right-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 transition-opacity duration-300 delay-500 md:group-hover/lightbox-nav:opacity-100 md:group-hover/lightbox-nav:delay-0 disabled:opacity-0 disabled:hidden" />
                    </div>

                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </DialogContent>
      )}
    </Dialog>
  )
}

export function ShopCarousel({ products, storeName }: ShopCarouselProps) {
  if (!products || products.length === 0) return null;

  const gradientStyle = { background: 'linear-gradient(135deg, #ff0055, #ff2e43)' };

  return (
      <Carousel 
        opts={{ 
          align: "start", 
          dragFree: false,
          breakpoints: {
            '(min-width: 1024px)': { watchDrag: products.length > 3 }
          }
        }} 
        plugins={[WheelGesturesPlugin()]} 
        className="w-full px-4 md:px-0 group [&_.overflow-hidden]:rounded-2xl"
      >
        <CarouselContent className="-ml-4 items-start">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-4 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <ProductCard product={product} storeName={storeName} gradientStyle={gradientStyle} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 left-0 md:-left-6 bg-background shadow-md border-border opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 disabled:opacity-0 disabled:hidden disabled:pointer-events-none top-0 mt-56 lg:mt-56 -translate-y-1/2" />
        <CarouselNext className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 right-0 md:-right-6 bg-background shadow-md border-border opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 disabled:opacity-0 disabled:hidden disabled:pointer-events-none top-0 mt-56 lg:mt-56 -translate-y-1/2" />
      </Carousel>
  )
}