from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, uuid, boto3
from dotenv import load_dotenv

from .converter import convert_pptx_to_pdf


app = FastAPI(title="pptx -> pdf converter")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins= ["http://localhost:3000"],#["*"],  # You can restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "converted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load environment variables
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION")

@app.get("/")
def root():
    return {"message": "Hello World"}

def upload_to_s3(file_path: str) -> str:
    """Uploads a file to S3 and returns its public URL"""
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    file_name = os.path.basename(file_path)
    s3.upload_file(file_path, AWS_BUCKET, file_name, ExtraArgs={"ACL": "public-read"})

    return f"https://{AWS_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{file_name}"


@app.post("/convert/")
async def convert_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pptx"):
        raise HTTPException(status_code=400, detail="Only .pptx files are supported")

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    input_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        pdf_path = convert_pptx_to_pdf(input_path, OUTPUT_DIR)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Optional cleanup: remove uploaded pptx to save space
        if os.path.exists(input_path):
            os.remove(input_path)

    # 🔹 Check if AWS credentials are present
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and AWS_BUCKET and AWS_REGION:
        try:
            s3_url = upload_to_s3(pdf_path)
            return {"download_url": s3_url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")

    # 🔹 Else, fallback to local file serving
    return FileResponse(
        path=pdf_path,
        filename=os.path.basename(pdf_path),
        media_type="application/pdf"
    )
