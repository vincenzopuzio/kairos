import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_task_endpoint(client: AsyncClient):
    payload = {
        "title": "API Test Task",
        "priority": 2,
        "status": "todo"
    }
    
    response = await client.post("/api/v1/tasks/", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["title"] == "API Test Task"
    assert data["priority"] == 2
    assert "id" in data

@pytest.mark.asyncio
async def test_get_tasks_endpoint(client: AsyncClient):
    # Setup state
    await client.post("/api/v1/tasks/", json={"title": "Task 1", "priority": 1, "status": "todo"})
    
    # Execute Test
    response = await client.get("/api/v1/tasks/")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Task 1"
