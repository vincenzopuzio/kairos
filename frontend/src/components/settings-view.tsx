import { useState, useEffect } from "react"
import { useOsSettings, useUpdateOsSettings } from "@/hooks/useSettings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SettingsView() {
    const { data: settings, isLoading } = useOsSettings()
    const { mutateAsync: updateSettings } = useUpdateOsSettings()

    const [formData, setFormData] = useState<any>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (settings) {
            setFormData(settings)
        }
    }, [settings])

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        await updateSettings(formData)
        setIsSaving(false)
    }

    if (isLoading) {
        return <div className="h-64 w-full bg-secondary animate-pulse rounded-xl" />
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12">
            <div className="flex flex-col mb-8 border-b pb-6">
                <h1 className="text-4xl font-black tracking-tight text-foreground">OS Configuration</h1>
                <p className="text-muted-foreground font-medium mt-2">Adjust physical execution boundaries and subjective daily cognitive rhythms.</p>
            </div>

            <Card className="border-2 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                <CardHeader>
                    <CardTitle className="text-2xl font-extrabold text-primary">Hard Capacity Boundaries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Work Hours (Weekly)</label>
                            <Input
                                type="number"
                                className="text-xl font-bold h-14"
                                value={formData.max_weekly_work_hours || ""}
                                onChange={(e) => handleChange("max_weekly_work_hours", parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Combined Hours (Work + Strategic)</label>
                            <Input
                                type="number"
                                className="text-xl font-bold h-14 border-amber-500/50 focus-visible:ring-amber-500 bg-amber-500/5"
                                value={formData.max_weekly_combined_hours || ""}
                                onChange={(e) => handleChange("max_weekly_combined_hours", parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-extrabold">Cognitive Day Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <datalist id="day-templates">
                        {['Focus & Planning', 'Deep Work', 'Meetings & Code Reviews', 'Wrapping Up & Learning', 'Offline', 'Client Delivery', 'Code Refactoring'].map(t => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="flex items-center gap-4 bg-secondary/20 p-2 rounded-md">
                            <label className="w-28 text-sm font-bold uppercase tracking-wider text-muted-foreground text-right">{day}</label>
                            <Input
                                list="day-templates"
                                className="flex-1 font-semibold bg-background h-12 text-md shadow-sm"
                                value={formData[`day_template_${day}`] || ""}
                                onChange={(e) => handleChange(`day_template_${day}`, e.target.value)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 shadow-sm bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-2xl font-extrabold flex items-center gap-2">Semantic AI Guidelines 🧠</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80 mb-4 font-medium">Explain your personal definitions mapping strictly what "Deep Work" or "Offline" means. The AI will parse this intelligently to structure your timelines.</p>
                    <textarea
                        className="flex min-h-[160px] w-full rounded-md border border-input bg-background/80 px-4 py-4 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-foreground tracking-wide leading-relaxed"
                        value={formData.template_definitions || ""}
                        onChange={(e) => handleChange("template_definitions", e.target.value)}
                        placeholder="Deep work must be > 2 hours. Morning meetings are prohibited..."
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving} size="lg" className="font-extrabold text-lg px-12 h-14 shadow-md transition-all hover:scale-[1.02]">
                    {isSaving ? "Locking..." : "Lock Configuration"}
                </Button>
            </div>
        </div>
    )
}
