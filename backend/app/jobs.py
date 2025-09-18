# import uuid
# from typing import Dict

# jobs: Dict[str, dict] = {}

# def create_job() -> str:
#     job_id = str(uuid.uuid4())
#     jobs[job_id] = {"status": "pending", "url": None, "error": None}
#     return job_id

# def update_job(job_id: str, status: str, url: str = None, error: str = None):
#     if job_id in jobs:
#         jobs[job_id].update({"status": status, "url": url, "error": error})

# def get_job(job_id: str):
#     return jobs.get(job_id)
