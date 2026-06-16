import * as React from "react"
import { ExternalLink as LinkIcon } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/shadcn/hover-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog"
import { Button } from "@/components/ui/form/Button/Button"

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  requireConfirm?: boolean; 
  showIndicator?: boolean;  
}

export function ExternalLink({ 
  href, 
  children, 
  className, 
  requireConfirm = true, 
  showIndicator = false, 
  onMouseEnter,
  onMouseLeave,
  ...props 
}: ExternalLinkProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  // STRICT CONTROL: We manage the hover state manually to bypass Astro island bugs
  const [isHovered, setIsHovered] = React.useState(false);
  const hoverTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Dynamically extract the domain name (e.g., "vinted.co.uk")
  const domain = React.useMemo(() => {
    try {
      return new URL(href).hostname.replace('www.', '');
    } catch {
      return 'an external site';
    }
  }, [href]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (requireConfirm) {
      e.preventDefault(); 
      setIsHovered(false); // Immediately close the hover card if clicked
      setIsDialogOpen(true); 
    }
    if (props.onClick) props.onClick(e);
  };

  const handleContinue = () => {
    setIsDialogOpen(false);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  // MANUAL TIMERS: Opens after 200ms, closes instantly (0ms)
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 200);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  // Cleanup timers to prevent memory leaks if the component unmounts
  React.useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  return (
    <>
      {/* Pass the strict manual state to the HoverCard */}
      <HoverCard open={isHovered} onOpenChange={setIsHovered}>
        <HoverCardTrigger asChild>
          <a 
            href={href} 
            onClick={handleClick} 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`inline-flex items-center gap-1 ${className || ''}`}
            target="_blank" 
            rel="noopener noreferrer" 
            {...props}
          >
            {children}
            {showIndicator && <LinkIcon className="w-3.5 h-3.5 opacity-60 relative top-[1px]" />}
          </a>
        </HoverCardTrigger>
        
        <HoverCardContent className="w-auto p-3 hidden md:block z-50">
          <p className="text-sm text-foreground">
            Opens an external site: <span className="font-semibold text-brand-500">{domain}</span>
          </p>
        </HoverCardContent>
      </HoverCard>

      {requireConfirm && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent showCloseButton={false} className="sm:max-w-md z-[100]">
            <DialogHeader>
              <DialogTitle className="text-xl">Leaving B&Co</DialogTitle>
              <DialogDescription className="text-base mt-2">
                You are about to navigate to an external website: <strong className="text-foreground">{domain}</strong>.
                <br /><br />
                B&Co is not responsible for the content or privacy practices of external sites. Do you wish to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleContinue} className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white border-none">
                Continue to site
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}