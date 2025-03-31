import os
from fastapi import UploadFile

def save_temp_file(file: UploadFile, temp_dir: str = "temp") -> str:
    """
    Save an uploaded file to a temporary directory.
    """
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    return file_path

def delete_temp_file(file_path: str):
    """
    Delete a temporary file if it exists.
    """
    if os.path.exists(file_path):
        os.remove(file_path)