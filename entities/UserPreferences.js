{
  "name": "UserPreferences",
  "type": "object",
  "properties": {
    "language": {
      "type": "string",
      "enum": [
        "english",
        "hindi",
        "kannada"
      ],
      "default": "english"
    },
    "age_range": {
      "type": "string",
      "enum": [
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55+",
        "prefer_not_to_say"
      ]
    },
    "life_stage": {
      "type": "string",
      "enum": [
        "student",
        "working",
        "homemaker",
        "caregiver",
        "other"
      ]
    },
    "reminder_style": {
      "type": "string",
      "enum": [
        "gentle",
        "normal",
        "minimal"
      ],
      "default": "gentle"
    },
    "planner_usage": {
      "type": "string",
      "enum": [
        "daily",
        "weekly",
        "monthly"
      ],
      "default": "daily"
    },
    "health_tracking": {
      "type": "string",
      "enum": [
        "full",
        "basic"
      ],
      "default": "basic"
    },
    "period_tracking": {
      "type": "boolean",
      "default": false
    },
    "mental_health_checkins": {
      "type": "string",
      "enum": [
        "yes",
        "sometimes",
        "no"
      ],
      "default": "sometimes"
    },
    "onboarding_completed": {
      "type": "boolean",
      "default": false
    },
    "theme": {
      "type": "string",
      "enum": [
        "light",
        "soft_dark"
      ],
      "default": "light"
    },
    "average_cycle_length": {
      "type": "number",
      "default": 28
    },
    "last_period_start": {
      "type": "string",
      "format": "date"
    },
    "phone_number": {
      "type": "string",
      "description": "User's phone number"
    },
    "pin": {
      "type": "string",
      "description": "4-digit app PIN"
    },
    "dob": {
      "type": "string",
      "format": "date",
      "description": "Date of birth"
    },
    "city": {
      "type": "string",
      "description": "City"
    },
    "state": {
      "type": "string",
      "description": "State"
    },
    "blood_group": {
      "type": "string",
      "enum": [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ],
      "description": "Emergency blood group"
    }
  },
  "required": []
}