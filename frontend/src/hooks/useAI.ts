import { useMutation } from '@tanstack/react-query'

const API_URL = "http://localhost:8000/api/v1";

interface PlannerRequest {
    available_hours?: number;
    focus_slots_preferred?: boolean;
}

async function generatePlanner(data: PlannerRequest) {
    const res = await fetch(`${API_URL}/ai/daily-planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to generate AI planner. Validate .env keys");
    return res.json();
}
export function useGeneratePlanner() {
    return useMutation({
        mutationFn: generatePlanner
    })
}

async function generateWeeklyPlanner(data: any) {
    const res = await fetch(`${API_URL}/ai/weekly-planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to generate Weekly AI planner.");
    return res.json();
}

export function useGenerateWeeklyPlanner() {
    return useMutation({
        mutationFn: generateWeeklyPlanner
    })
}

async function generateQuarterlyPlanner() {
    const res = await fetch(`${API_URL}/ai/quarterly-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to generate Quarterly Roadmap.");
    return res.json();
}

export function useGenerateQuarterlyPlanner() {
    return useMutation({
        mutationFn: generateQuarterlyPlanner
    })
}
import { strategicChat } from '@/lib/api'

async function askStrategicAdvisor({ message, history }: { message: string, history?: any[] }) {
    return strategicChat(message, history);
}

export function useStrategicChat() {
    return useMutation({
        mutationFn: askStrategicAdvisor
    })
}
