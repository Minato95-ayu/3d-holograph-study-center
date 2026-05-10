import asyncio
from app.services.knowledge import knowledge_service

async def test():
    print("Testing knowledge service...")
    result = await knowledge_service.get_summary("Drone")
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
