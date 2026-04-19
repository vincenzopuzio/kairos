const API_URL = "http://localhost:8000/api/v1";

export async function fetchTasks(includeBlocked = true) {
    const res = await fetch(`${API_URL}/tasks/?include_blocked=${includeBlocked}`);
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
