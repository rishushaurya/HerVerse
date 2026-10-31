{
  "name": "SymptomLog",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date"
    },
    "symptom_type": {
      "type": "string",
      "enum": [
        "physical",
        "emotional",
        "digestive",
        "skin",
        "other"
      ]
    },
    "symptom_name": {
      "type": "string",
      "description": "Name of the symptom"
    },
    "severity": {
      "type": "number",
      "minimum": 1,
      "maximum": 5,
      "description": "Severity level 1-5"
    },
    "notes": {
      "type": "string"
    },
    "related_to_cycle": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "date",
    "symptom_name"
  ]
}