# Database Models Specification (SQLModel)

All database entity models must strictly inherit from `SQLModel` and specify `table=True`. Timestamp fields (`created_at`, `updated_at`) should be standardized utilizing server default functions.

## Enums
### StatusEnum
- `backlog`
- `todo`
- `in_progress`
- `blocked`
- `done`

### HealthEnum
- `on_track`
- `at_risk`
- `delayed`

## Table: Task
- **id**: UUID (Primary Key, default=`uuid.uuid4`, indexed)
- **title**: String (Nullable=False, Max Length=255)
- **description**: Text (Nullable=True)
- **status**: Enum (`StatusEnum`, default=`todo`)
- **priority**: Integer (Range 1 to 4, where 1 is highest/Critical)
- **deadline**: DateTime (with timezone, Nullable=True)
- **project_id**: UUID (Foreign Key -> `Project.id`, Nullable=True, OnDelete="CASCADE")
- **blocked_by_stakeholder_id**: UUID (Foreign Key -> `Stakeholder.id`, Nullable=True)
- **is_deep_work**: Boolean (default=False) - Indicates if completing the task definitively requires a protected `Deep Work Slot`.
- **created_at**: DateTime (default=`func.now()`)
- **updated_at**: DateTime (default=`func.now()`, onupdate=`func.now()`)

## Table: Project
- **id**: UUID (Primary Key, default=`uuid.uuid4`)
- **name**: String (Nullable=False, Unique=True, index=True)
- **external_deadline**: DateTime (with timezone)
- **health_status**: Enum (`HealthEnum`, default=`on_track`)
- **created_at**: DateTime (default=`func.now()`)

## Table: Stakeholder
- **id**: UUID (Primary Key, default=`uuid.uuid4`)
- **name**: String (Nullable=False, Unique=True)
- **role**: String (Nullable=False) - e.g., "Manager", "Dev", "Client"
- **created_at**: DateTime (default=`func.now()`)
