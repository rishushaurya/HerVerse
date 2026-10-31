{
  "name": "Exercise",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date"
    },
    "activity_type": {
      "type": "string",
      "enum": [
        "yoga",
        "walking",
        "running",
        "gym",
        "dance",
        "swimming",
        "cycling",
        "other"
      ]
    },
    "duration": {
      "type": "number",
      "description": "Duration in minutes"
    },
    "intensity": {
      "type": "string",
      "enum": [
        "light",
        "moderate",
        "intense"
      ],
      "default": "moderate"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "date",
    "activity_type",
    "duration"
  ]
}