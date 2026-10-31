{
  "name": "PeriodLog",
  "type": "object",
  "properties": {
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "Period start date"
    },
    "end_date": {
      "type": "string",
      "format": "date",
      "description": "Period end date"
    },
    "flow_intensity": {
      "type": "string",
      "enum": [
        "light",
        "medium",
        "heavy"
      ],
      "default": "medium"
    },
    "symptoms": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of symptoms"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    },
    "cycle_length": {
      "type": "number",
      "description": "Calculated cycle length"
    }
  },
  "required": [
    "start_date"
  ]
}