import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ children, defaultValue, className }: { children: React.ReactNode, defaultValue: string, className?: string }) => {
    const [activeValue, setActiveValue] = React.useState(defaultValue)
    return (
        <div className={cn("space-y-4", className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { activeValue, setActiveValue })
                }
                return child
            })}
        </div>
    )
}

const TabsList = ({ children, className, activeValue, setActiveValue }: any) => (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, { activeValue, setActiveValue })
            }
            return child
        })}
    </div>
)

const TabsTrigger = ({ children, value, activeValue, setActiveValue, className }: any) => (
    <button
        onClick={() => setActiveValue(value)}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            activeValue === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
            className
        )}
    >
        {children}
    </button>
)

const TabsContent = ({ children, value, activeValue, className }: any) => {
    if (value !== activeValue) return null
    return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
