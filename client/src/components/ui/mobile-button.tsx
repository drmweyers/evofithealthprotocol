import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
      },
      size: {
        default: "min-h-[44px] px-4 py-2",
        sm: "min-h-[36px] rounded-md px-3",
        lg: "min-h-[48px] rounded-md px-8 text-base",
        xl: "min-h-[56px] rounded-md px-10 text-lg",
        icon: "min-h-[44px] min-w-[44px] p-0",
        iconSm: "min-h-[36px] min-w-[36px] p-0",
        iconLg: "min-h-[48px] min-w-[48px] p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(mobileButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileButton.displayName = "MobileButton"

export { MobileButton, mobileButtonVariants }