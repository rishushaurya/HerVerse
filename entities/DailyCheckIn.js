{
  "name": "DailyCheckIn",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "Check-in date"
    },
    "mood": {
      "type": "number",
      "minimum": 1,
      "maximum": 5,
      "description": "Mood scale 1-5"
    },
    "energy": {
      "type": "number",
      "minimum": 1,
      "maximum": 5,
      "description": "Energy level 1-5"
    },
    "sleep_hours": {
      "type": "number",
      "description": "Hours of sleep"
    },
    "stress_level": {
      "type": "number",
      "minimum": 1,
      "maximum": 5,
      "description": "Stress level 1-5"
    },
    "physical_discomfort": {
      "type": "string",
      "description": "Any physical discomfort notes"
    },
    "water_intake": {
      "type": "number",
      "description": "Glasses of water"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    }
  },
  "required": [
    "date",
    "mood"
  ]
}