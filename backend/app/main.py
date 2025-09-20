from fastapi import Form
from fastapi import Request, FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import shutil
import uuid
import boto3
from dotenv import load_dotenv
from .converter import convert_pptx_to_pdf

app = FastAPI(title="pptx -> pdf converter")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "converted"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load .env
load_dotenv()
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION")

# --- Helpers ---


def upload_to_s3(file_path: str) -> str:
    """Uploads a file to S3 and returns public URL"""
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    file_name = os.path.basename(file_path)
    s3.upload_file(file_path, AWS_BUCKET, file_name,
                   ExtraArgs={"ACL": "public-read"})
    return f"https://{AWS_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{file_name}"

# --- Endpoints ---


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """Step 1: Upload the PPTX and return a file_id"""
    if not file.filename.endswith(".pptx"):
        raise HTTPException(
            status_code=400, detail="Only .pptx files are supported")

    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    size = os.path.getsize(file_path)
    return {"file_id": file_id, "filename": file.filename, "size": size}


@app.post("/convert/")
async def convert_file(request: Request, file_id: str = Form(...)):
    """
    Convert an already uploaded PPTX (by file_id) to PDF
    and return a download URL.
    """
    # Find the file in UPLOAD_DIR
    matching_files = [f for f in os.listdir(
        UPLOAD_DIR) if f.startswith(file_id)]
    if not matching_files:
        raise HTTPException(status_code=404, detail="File not found")

    input_path = os.path.join(UPLOAD_DIR, matching_files[0])

    try:
        pdf_path = convert_pptx_to_pdf(input_path, OUTPUT_DIR)

        # Upload to S3 if configured
        if all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET, AWS_REGION]):
            download_url = upload_to_s3(pdf_path)
            return {"download_url": download_url}

        # Otherwise serve locally
        host = str(request.base_url).rstrip("/")
        file_name = os.path.basename(pdf_path)
        return {"download_url": f"{host}/local-files/{file_name}"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Conversion failed: {str(e)}")

# --- Static files ---
app.mount("/local-files", StaticFiles(directory=OUTPUT_DIR), name="local-files")
