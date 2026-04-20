import asyncio
import uuid
from sqlmodel import select
from core.database import async_session_factory
from models.domain import User
from core.auth_utils import get_password_hash

async def seed_user():
    email = "test@example.com"
    password = "password"
    
    async with async_session_factory() as session:
        result = await session.exec(select(User).where(User.email == email))
        user = result.first()
        
        if user:
            print(f"User {email} already exists.")
            return

        print(f"Seeding user {email}...")
        db_user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=get_password_hash(password)
        )
        session.add(db_user)
        await session.commit()
        print("User seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_user())
