import { useEffect } from "react"
import { useAppStore } from "@/stores/useAppStore"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { Calendar, User, Search, Settings, Zap } from "lucide-react"

export function CommandBar() {
    const { commandBarOpen, setCommandBarOpen } = useAppStore()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Allow overriding default browser actions for Mac/Win matching "cmdK or ctrlK"
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setCommandBarOpen(!commandBarOpen)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [commandBarOpen, setCommandBarOpen])

    return (
        <CommandDialog open={commandBarOpen} onOpenChange={setCommandBarOpen}>
            <CommandInput placeholder="Ask AI an architectural question or execute a command..." />
            <CommandList>
                <CommandEmpty>No AI context results found.</CommandEmpty>
                <CommandGroup heading="AI Actions">
                    <CommandItem onSelect={() => {
                        setCommandBarOpen(false)
                        useAppStore.getState().setPlannerModalOpen(true)
                    }}>
                        <Zap className="mr-2 h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-amber-500">Generate Pydantic-AI Daily Planner</span>
                        <CommandShortcut>⌘↵</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => {
                        setCommandBarOpen(false)
                        useAppStore.getState().setTaskModalOpen(true)
                    }}>
                        <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>New Task (Gap Filler)</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => {
                        setCommandBarOpen(false)
                        useAppStore.getState().setProjectModalOpen(true)
                    }}>
                        <Settings className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Initialize New Project Epic</span>
                    </CommandItem>
                    <CommandItem onSelect={() => {
                        setCommandBarOpen(false)
                        useAppStore.getState().setCurrentView('knowledge_base')
                    }}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Search Knowledge Base (RAG)</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="App Settings">
                    <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Switch Developer Identity</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
