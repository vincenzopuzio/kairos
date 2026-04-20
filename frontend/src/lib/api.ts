const API_URL = "http://localhost:8000/api/v1";

export async function fetchTasks(includeBlocked = true, projectId?: string, parentId?: string) {
    let url = `${API_URL}/tasks/?include_blocked=${includeBlocked}`;
    if (projectId) {
        url += `&project_id=${projectId}`;
    }
    if (parentId) {
        url += `&parent_id=${parentId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
}

export async function fetchProjects() {
    const res = await fetch(`${API_URL}/projects/`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
}

export async function createTask(taskData: any) {
    const res = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
}

export async function updateTask({ id, ...data }: { id: string, [key: string]: any }) {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
}

export async function fetchStakeholders() {
    const res = await fetch(`${API_URL}/stakeholders/`);
    if (!res.ok) throw new Error("Failed to fetch stakeholders");
    return res.json();
}

export async function createStakeholder(data: any) {
    const res = await fetch(`${API_URL}/stakeholders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create stakeholder");
    return res.json();
}

export async function updateStakeholder({ id, ...data }: { id: string, [key: string]: any }) {
    const res = await fetch(`${API_URL}/stakeholders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update stakeholder");
    return res.json();
}

export async function deleteStakeholder(id: string) {
    const res = await fetch(`${API_URL}/stakeholders/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete stakeholder");
}

export async function fetchStrategicGoals() {
    const res = await fetch(`${API_URL}/strategic-goals/`);
    if (!res.ok) throw new Error("Failed to fetch strategic goals");
    return res.json();
}

export async function createStrategicGoal(data: any) {
    const res = await fetch(`${API_URL}/strategic-goals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create strategic goal");
    return res.json();
}

export async function updateStrategicGoal({ id, ...data }: { id: string, [key: string]: any }) {
    const res = await fetch(`${API_URL}/strategic-goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update strategic goal");
    return res.json();
}

export async function deleteStrategicGoal(id: string) {
    const res = await fetch(`${API_URL}/strategic-goals/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete strategic goal");
}

export async function fetchTimeline() {
    const res = await fetch(`${API_URL}/timeline/`);
    if (!res.ok) throw new Error("Failed to fetch timeline");
    return res.json();
}

export async function fetchSettings() {
    const res = await fetch(`${API_URL}/settings/`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
}

export async function updateSettings(data: any) {
    const res = await fetch(`${API_URL}/settings/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
}
export async function strategicChat(message: string, history?: any[]) {
    const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error("Failed to reach Strategic Advisor");
    return res.json();
}
