import * as React from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/shadcn/dialog"
import { Button } from "@/components/ui/form/Button/Button"

export function GlobalExternalLinkDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [href, setHref] = React.useState("");

  // Listen for the custom event fired by ANY ExternalLink on the site
  React.useEffect(() => {
    const handleOpen = (e: CustomEvent<{ href: string }>) => {
      setHref(e.detail.href);
      setIsOpen(true);
    };

    window.addEventListener('open-external-dialog', handleOpen as EventListener);
    return () => window.removeEventListener('open-external-dialog', handleOpen as EventListener);
  }, []);

  const domain = React.useMemo(() => {
    try { return new URL(href).hostname.replace('www.', ''); } 
    catch { return 'an external site'; }
  }, [href]);

  const handleContinue = () => {
    setIsOpen(false);
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-md z-[100]">
        
        <DialogClose className="absolute top-3 right-3 z-50 p-2 rounded-full bg-background hover:bg-muted backdrop-blur-md transition-colors duration-200 text-foreground outline-none shadow-sm border border-border cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500">
          <X className="w-4 h-4 md:w-5 md:h-5" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-xl pr-8">Leaving B&Co</DialogTitle>
          <DialogDescription className="text-base mt-2">
            You are about to navigate to an external website: <strong className="text-foreground">{domain}</strong>.
            <br /><br />
            B&Co is not responsible for the content or privacy practices of external sites. Do you wish to continue?
          </DialogDescription>
        </DialogHeader>
        
        {/* FIXED: w-full has been removed from this line to allow edge-to-edge stretching */}
        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleContinue} className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white border-none">
            Continue to site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}