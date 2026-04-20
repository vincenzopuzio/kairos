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
