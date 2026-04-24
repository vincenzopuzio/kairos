import os
import abc
import json
from typing import Optional, List
from core.config import settings

try:
    from azure.storage.blob import BlobServiceClient
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False

class BaseStorageProvider(abc.ABC):
    @abc.abstractmethod
    async def save(self, key: str, content: str) -> str:
        """Saves content and returns the storage path/URI."""
        pass

    @abc.abstractmethod
    async def load(self, path: str) -> str:
        """Loads content from the storage path."""
        pass

    @abc.abstractmethod
    async def delete(self, path: str) -> None:
        """Deletes content at the storage path."""
        pass

class FileSystemStorageProvider(BaseStorageProvider):
    def __init__(self, base_path: str = settings.KB_LOCAL_PATH):
        self.base_path = base_path
        os.makedirs(self.base_path, exist_ok=True)

    async def save(self, key: str, content: str) -> str:
        path = os.path.join(self.base_path, f"{key}.txt")
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return path

    async def load(self, path: str) -> str:
        if not os.path.exists(path):
            return ""
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    async def delete(self, path: str) -> None:
        if os.path.exists(path):
            os.remove(path)

class AzureBlobStorageProvider(BaseStorageProvider):
    def __init__(self):
        if not AZURE_AVAILABLE:
            raise ImportError("azure-storage-blob not installed")
        self.client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
        self.container = settings.AZURE_KB_CONTAINER

    async def save(self, key: str, content: str) -> str:
        blob_client = self.client.get_blob_client(container=self.container, blob=f"{key}.txt")
        blob_client.upload_blob(content, overwrite=True)
        return blob_client.url

    async def load(self, path: str) -> str:
        # Path is the URL or just the blob name? Let's assume path is blob name for internal use
        # or we extract blob name from URL
        blob_name = path.split("/")[-1]
        blob_client = self.client.get_blob_client(container=self.container, blob=blob_name)
        return blob_client.download_blob().readall().decode("utf-8")

    async def delete(self, path: str) -> None:
        blob_name = path.split("/")[-1]
        blob_client = self.client.get_blob_client(container=self.container, blob=blob_name)
        blob_client.delete_blob()

def get_storage_provider() -> BaseStorageProvider:
    if settings.KB_STORAGE_PROVIDER == "azure" and settings.AZURE_STORAGE_CONNECTION_STRING:
        return AzureBlobStorageProvider()
    return FileSystemStorageProvider()
