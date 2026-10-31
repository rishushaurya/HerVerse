{
  "name": "Task",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Task date"
    },
    "time": {
      "type": "string",
      "description": "Task time (HH:MM format)"
    },
    "duration": {
      "type": "number",
      "description": "Duration in minutes"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "normal",
        "high"
      ],
      "default": "normal"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed",
        "skipped"
      ],
      "default": "pending"
    },
    "reminders": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "time": {
            "type": "string"
          },
          "enabled": {
            "type": "boolean"
          }
        }
      }
    },
    "category": {
      "type": "string",
      "enum": [
        "personal",
        "work",
        "health",
        "self-care",
        "other"
      ],
      "default": "personal"
    }
  },
  "required": [
    "title",
    "date"
  ]
}