from fastapi import FastAPI
from pydantic import BaseModel
from agent import agent
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "https://ai-study-assisstant-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RequestData(BaseModel):
    task: str
    content: str

@app.post("/study")
def study(data: RequestData):
    result = agent(data.task, data.content)
    return result