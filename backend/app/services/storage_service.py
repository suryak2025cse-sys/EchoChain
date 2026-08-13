import os
from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageDriver(ABC):
    @abstractmethod
    def save(self, file_bytes: bytes, filename: str) -> str:
        """Save file bytes and return storage path / identifier."""
        pass

    @abstractmethod
    def delete(self, file_path: str) -> bool:
        """Delete file from storage location."""
        pass

    @abstractmethod
    def get_file_bytes(self, file_path: str) -> bytes:
        """Retrieve raw file bytes for serving/processing."""
        pass


class LocalStorageDriver(StorageDriver):
    def __init__(self, base_dir: str = "storage/audio"):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def save(self, file_bytes: bytes, filename: str) -> str:
        full_path = os.path.join(self.base_dir, filename)
        with open(full_path, "wb") as f:
            f.write(file_bytes)
        return full_path

    def delete(self, file_path: str) -> bool:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

    def get_file_bytes(self, file_path: str) -> bytes:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Storage file not found: {file_path}")
        with open(file_path, "rb") as f:
            return f.read()


# Default storage driver instance (Local dev storage)
storage_driver: StorageDriver = LocalStorageDriver()
