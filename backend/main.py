import json
import os
from datetime import date
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field, model_validator

load_dotenv()

app = FastAPI(title="Personalized Travel Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class TripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=120)
    start_date: date
    end_date: date
    budget: float = Field(gt=0)
    travelers: int = Field(ge=1, le=30)
    travel_style: str = "Balanced"
    interests: List[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date.")
        if (self.end_date - self.start_date).days > 30:
            raise ValueError("Maximum trip length is 31 days.")
        return self


class Activity(BaseModel):
    time: str
    place: str
    description: str
    cost: float = Field(ge=0)


class DayPlan(BaseModel):
    day: int
    title: str
    activities: List[Activity]


class TripResponse(BaseModel):
    destination: str
    summary: str
    days: List[DayPlan]
    estimated_total: float = Field(ge=0)
    tips: List[str]


@app.get("/")
def home():
    return {"message": "Travel Planner API is running"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/itinerary", response_model=TripResponse)
def create_itinerary(request: TripRequest):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Add your GROQ_API_KEY to backend/.env and restart the backend."
        )

    day_count = (request.end_date - request.start_date).days + 1

    prompt = f"""
Create a personalized travel itinerary as valid JSON.

Destination: {request.destination}
Start date: {request.start_date}
End date: {request.end_date}
Number of days: {day_count}
Total group budget in INR: {request.budget}
Number of travellers: {request.travelers}
Travel style: {request.travel_style}
Interests: {", ".join(request.interests)}

Return exactly this JSON structure:
{{
  "destination": "string",
  "summary": "short overview",
  "days": [
    {{
      "day": 1,
      "title": "day theme",
      "activities": [
        {{
          "time": "9:00 AM",
          "place": "place name",
          "description": "short description",
          "cost": 300
        }}
      ]
    }}
  ],
  "estimated_total": 1200,
  "tips": ["travel tip"]
}}

Requirements:
- Return exactly {day_count} days.
- Suggest about three activities per day.
- Keep costs non-negative and in INR.
- Make estimates appropriate to the destination and budget.
- Do not claim real-time availability or confirmed bookings.
- Do not invent certainty about opening times.
- Output JSON only, without markdown.
"""

    try:
        client = Groq(api_key=api_key)

        result = client.chat.completions.create(
            model=os.getenv(
                "GROQ_MODEL",
                "llama-3.3-70b-versatile"
            ),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a careful travel planner. "
                        "Return only JSON matching the requested schema."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        content = result.choices[0].message.content
        itinerary = TripResponse.model_validate(json.loads(content))

        if len(itinerary.days) != day_count:
            raise ValueError(
                "The AI returned the wrong number of days. Please try again."
            )

        return itinerary

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate itinerary: {error}"
        )