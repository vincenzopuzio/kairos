const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function request(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `Request failed: ${res.statusText}`);
    }

    if (res.status === 204) return null;
    return res.json();
}

export async function login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
    });

    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    return data;
}

export const fetchTasks = (includeBlocked = true, projectId?: string, parentId?: string) => {
    let path = `/tasks/?include_blocked=${includeBlocked}`;
    if (projectId) path += `&project_id=${projectId}`;
    if (parentId) path += `&parent_id=${parentId}`;
    return request(path);
};

export const fetchProjects = () => request("/projects/");
export const createTask = (data: any) => request("/tasks/", { method: "POST", body: JSON.stringify(data) });
export const updateTask = ({ id, ...data }: any) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const fetchStakeholders = () => request("/stakeholders/");
export const createStakeholder = (data: any) => request("/stakeholders/", { method: "POST", body: JSON.stringify(data) });
export const updateStakeholder = ({ id, ...data }: any) => request(`/stakeholders/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteStakeholder = (id: string) => request(`/stakeholders/${id}`, { method: "DELETE" });

export const fetchStrategicGoals = () => request("/strategic-goals/");
export const createStrategicGoal = (data: any) => request("/strategic-goals/", { method: "POST", body: JSON.stringify(data) });
export const updateStrategicGoal = ({ id, ...data }: any) => request(`/strategic-goals/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteStrategicGoal = (id: string) => request(`/strategic-goals/${id}`, { method: "DELETE" });

export const fetchTimeline = () => request("/timeline/");
export const fetchSettings = () => request("/settings/");
export const updateSettings = (data: any) => request("/settings/", { method: "PATCH", body: JSON.stringify(data) });

export const strategicChat = (message: string, history?: any[]) => request("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, history })
});

export const fetchMilestones = (projectId: string) => request(`/projects/${projectId}/milestones`);
export const createMilestone = (projectId: string, data: any) => request(`/projects/${projectId}/milestones`, { method: "POST", body: JSON.stringify(data) });
export const updateMilestone = (id: string, data: any) => request(`/milestones/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteMilestone = (id: string) => request(`/milestones/${id}`, { method: "DELETE" });

export const dailyPlanner = (data: any) => request("/ai/daily-planner", { method: "POST", body: JSON.stringify(data) });
export const weeklyPlanner = (data: any) => request("/ai/weekly-planner", { method: "POST", body: JSON.stringify(data) });
export const quarterlyRoadmap = () => request("/ai/quarterly-roadmap", { method: "POST" });

export const fetchProjectTemplates = () => request("/project-templates");
export const applyProjectTemplate = (projectId: string, templateId: string) => request(`/projects/${projectId}/apply-template/${templateId}`, { method: "POST" });

export const fetchProjectDependencies = (projectId: string) => request(`/projects/${projectId}/dependencies`);
export const addProjectDependency = (projectId: string, dependsOnId: string) => request(`/projects/${projectId}/dependencies/${dependsOnId}`, { method: "POST" });
export const removeProjectDependency = (projectId: string, dependsOnId: string) => request(`/projects/${projectId}/dependencies/${dependsOnId}`, { method: "DELETE" });

export const fetchKb = (search?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    return request(`/kb/?${params}`);
};
export const createKbEntry = (data: any) => request("/kb/", { method: "POST", body: JSON.stringify(data) });
export const updateKbEntry = (id: string, data: any) => request(`/kb/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteKbEntry = (id: string) => request(`/kb/${id}`, { method: "DELETE" });
export const askKb = (query: string) => request("/ai/ask-kb", { method: "POST", body: JSON.stringify({ query }) });

export const fetchPrinciples = () => request("/principles/");
export const updatePrinciple = (id: string, data: any) => request(`/principles/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const updateProject = (id: string, data: any) => request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const createProject = (data: any) => request("/projects/", { method: "POST", body: JSON.stringify(data) });
export const deleteProject = (id: string) => request(`/projects/${id}`, { method: "DELETE" });
