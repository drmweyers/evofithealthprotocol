# Specialized Protocols API Endpoint Specifications

**Document Type:** API Technical Specification  
**Version:** 1.0  
**Created:** December 2024  
**Base URL:** `https://api.evofithealthprotocol.com/v1`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Common Response Formats](#common-response-formats)
3. [Longevity Mode Endpoints](#longevity-mode-endpoints)
4. [Parasite Cleanse Endpoints](#parasite-cleanse-endpoints)
5. [Shared Protocol Endpoints](#shared-protocol-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

All endpoints require authentication using Bearer tokens in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {},
  "metadata": {
    "timestamp": "2024-12-20T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

---

## Longevity Mode Endpoints

### 1. Create Longevity Protocol
**POST** `/protocols/longevity/create`

Creates a new longevity-focused meal plan based on user preferences.

#### Request Body
```json
{
  "userId": "string",
  "config": {
    "enabled": true,
    "intensity": "mild|moderate|intensive",
    "strategies": {
      "caloricRestriction": true,
      "intermittentFasting": true,
      "highAntioxidant": true,
      "supplements": true
    },
    "eatingWindow": 8,
    "startTime": "08:00",
    "duration": 7
  },
  "preferences": {
    "dietaryRestrictions": ["vegetarian", "gluten-free"],
    "cuisineType": "mediterranean",
    "allergies": ["nuts"],
    "region": "north-america",
    "measurementSystem": "metric|imperial"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "protocolId": "lng_123456",
    "userId": "user_123",
    "createdAt": "2024-12-20T10:30:00Z",
    "mealPlan": {
      "days": [
        {
          "day": 1,
          "date": "2024-12-21",
          "totalCalories": 1800,
          "calorieReduction": "10%",
          "meals": [
            {
              "type": "breakfast",
              "time": "08:00",
              "name": "Antioxidant Berry Bowl",
              "calories": 350,
              "ingredients": [
                {
                  "name": "blueberries",
                  "amount": 100,
                  "unit": "g",
                  "benefits": "High in anthocyanins for brain health"
                }
              ],
              "instructions": "...",
              "longevityBenefits": [
                "Activates sirtuins",
                "Reduces oxidative stress"
              ]
            }
          ],
          "supplements": [
            {
              "name": "resveratrol",
              "dosage": "250mg",
              "timing": "with breakfast",
              "purpose": "Activates longevity genes"
            }
          ],
          "fastingPeriod": {
            "start": "20:00",
            "end": "08:00",
            "duration": 12
          }
        }
      ]
    },
    "shoppingList": {
      "categories": {
        "produce": [
          {
            "item": "blueberries",
            "quantity": "2 cups",
            "preferredSource": "organic"
          }
        ],
        "supplements": [
          {
            "item": "resveratrol",
            "quantity": "30 capsules",
            "recommendedBrand": "Life Extension"
          }
        ]
      }
    },
    "lifestyleTips": [
      "Maintain consistent meal timing",
      "Stay hydrated during fasting periods"
    ]
  }
}
```

### 2. Update Longevity Protocol
**PUT** `/protocols/longevity/{protocolId}`

Updates an existing longevity protocol configuration.

#### Request Body
```json
{
  "config": {
    "intensity": "moderate",
    "eatingWindow": 10
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "protocolId": "lng_123456",
    "updatedAt": "2024-12-20T11:00:00Z",
    "changes": {
      "intensity": {
        "old": "mild",
        "new": "moderate"
      },
      "eatingWindow": {
        "old": 8,
        "new": 10
      }
    }
  }
}
```

### 3. Get Longevity Protocol Details
**GET** `/protocols/longevity/{protocolId}`

Retrieves details of a specific longevity protocol.

#### Query Parameters
- `includeProgress` (boolean): Include progress tracking data
- `includeMeals` (boolean): Include detailed meal information

#### Response
```json
{
  "success": true,
  "data": {
    "protocolId": "lng_123456",
    "status": "active",
    "config": {},
    "progress": {
      "daysCompleted": 3,
      "totalDays": 7,
      "adherenceScore": 85,
      "metricsTracked": {
        "averageCalorieReduction": "12%",
        "fastingWindowAdherence": "100%",
        "supplementCompliance": "90%"
      }
    }
  }
}
```

### 4. Get Longevity Ingredients
**GET** `/protocols/longevity/ingredients`

Returns database of longevity-promoting ingredients.

#### Query Parameters
- `category` (string): antioxidants|anti-inflammatory|omega3
- `region` (string): Filter by regional availability

#### Response
```json
{
  "success": true,
  "data": {
    "ingredients": [
      {
        "id": "ing_001",
        "name": "blueberries",
        "category": "antioxidants",
        "compounds": ["anthocyanins", "vitamin C"],
        "benefits": ["brain health", "cellular repair"],
        "regionalAvailability": {
          "north-america": {
            "available": true,
            "seasonal": "May-September",
            "alternatives": ["frozen blueberries"]
          }
        }
      }
    ]
  }
}
```

---

## Parasite Cleanse Endpoints

### 1. Create Parasite Cleanse Protocol
**POST** `/protocols/parasite-cleanse/create`

Creates a new parasite cleanse protocol.

#### Request Body
```json
{
  "userId": "string",
  "config": {
    "enabled": true,
    "duration": 14,
    "includeHerbs": true,
    "intensity": "gentle|moderate|intensive",
    "dietOnly": false,
    "includeConventionalAdvice": true
  },
  "preferences": {
    "dietaryRestrictions": ["vegan"],
    "allergies": ["tree nuts"],
    "region": "europe",
    "measurementSystem": "metric"
  },
  "medicalInfo": {
    "hasExistingConditions": false,
    "medications": [],
    "isPregnant": false,
    "isNursing": false
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "protocolId": "prc_789012",
    "userId": "user_123",
    "createdAt": "2024-12-20T10:30:00Z",
    "protocol": {
      "phases": [
        {
          "phase": 1,
          "name": "Initial Cleanse",
          "days": "1-7",
          "description": "Intensive parasite elimination phase",
          "dailyProtocol": {
            "morning": {
              "time": "06:00",
              "onEmpty": true,
              "items": [
                {
                  "type": "supplement",
                  "name": "wormwood",
                  "dosage": "200mg",
                  "instructions": "Take with 8oz water"
                },
                {
                  "type": "food",
                  "name": "raw garlic",
                  "amount": "2 cloves",
                  "preparation": "Crush and let sit for 10 minutes"
                }
              ]
            },
            "meals": [
              {
                "type": "breakfast",
                "time": "07:00",
                "name": "Cleansing Green Juice",
                "ingredients": [
                  {
                    "name": "celery",
                    "amount": "4 stalks",
                    "purpose": "Alkalizing"
                  }
                ],
                "avoidFoods": ["sugar", "dairy", "processed foods"]
              }
            ],
            "evening": {
              "time": "20:00",
              "items": [
                {
                  "type": "supplement",
                  "name": "black walnut",
                  "dosage": "250mg"
                }
              ]
            }
          }
        }
      ],
      "herbProtocol": {
        "schedule": [
          {
            "week": 1,
            "herbs": [
              {
                "name": "wormwood",
                "dosage": "200mg",
                "frequency": "2x daily",
                "timing": "empty stomach"
              }
            ]
          }
        ],
        "warnings": [
          "Do not use if pregnant or nursing",
          "May interact with blood thinners"
        ]
      },
      "shoppingList": {
        "herbs": [
          {
            "item": "wormwood capsules",
            "quantity": "60 capsules",
            "source": "health food store",
            "alternatives": ["artemisia tea"]
          }
        ],
        "foods": [
          {
            "category": "anti-parasitic",
            "items": ["garlic", "pumpkin seeds", "papaya"]
          }
        ]
      },
      "disclaimer": "This protocol is for educational purposes..."
    }
  }
}
```

### 2. Track Cleanse Progress
**POST** `/protocols/parasite-cleanse/{protocolId}/progress`

Records daily progress for a cleanse protocol.

#### Request Body
```json
{
  "day": 3,
  "compliance": {
    "supplements": {
      "morning": true,
      "evening": true
    },
    "diet": {
      "adherence": 90,
      "avoidedFoods": true
    }
  },
  "symptoms": {
    "digestive": "improved",
    "energy": "moderate",
    "notes": "Mild headache in afternoon"
  },
  "completedMeals": ["breakfast", "lunch", "dinner"]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "progressId": "prg_345678",
    "protocolId": "prc_789012",
    "day": 3,
    "overallProgress": "21%",
    "adherenceScore": 95,
    "recommendations": [
      "Increase water intake to help with detox symptoms",
      "Consider adding ginger tea for headache relief"
    ]
  }
}
```

### 3. Get Cleanse Safety Check
**POST** `/protocols/parasite-cleanse/safety-check`

Validates safety of cleanse protocol based on user's medical information.

#### Request Body
```json
{
  "userId": "string",
  "medicalInfo": {
    "conditions": ["diabetes"],
    "medications": ["metformin"],
    "allergies": ["tree nuts"],
    "isPregnant": false,
    "age": 45
  },
  "proposedProtocol": {
    "herbs": ["wormwood", "black walnut", "cloves"],
    "duration": 14
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "isSafe": false,
    "warnings": [
      {
        "level": "high",
        "type": "allergy",
        "message": "Black walnut may trigger tree nut allergy",
        "recommendation": "Use alternative herbs"
      }
    ],
    "alternatives": [
      {
        "herb": "black walnut",
        "alternative": "pau d'arco",
        "reason": "Similar anti-parasitic properties without nut allergens"
      }
    ],
    "requiresMedicalConsultation": true
  }
}
```

---

## Shared Protocol Endpoints

### 1. List User Protocols
**GET** `/protocols/user/{userId}`

Returns all protocols for a specific user.

#### Query Parameters
- `type` (string): longevity|parasite-cleanse|all
- `status` (string): active|completed|paused|all
- `limit` (integer): Number of results
- `offset` (integer): Pagination offset

#### Response
```json
{
  "success": true,
  "data": {
    "protocols": [
      {
        "protocolId": "lng_123456",
        "type": "longevity",
        "status": "active",
        "startDate": "2024-12-20",
        "progress": 42,
        "nextMealTime": "12:00"
      },
      {
        "protocolId": "prc_789012",
        "type": "parasite-cleanse",
        "status": "completed",
        "startDate": "2024-11-15",
        "endDate": "2024-11-29",
        "completionRate": 95
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

### 2. Generate Protocol PDF
**POST** `/protocols/{protocolId}/export/pdf`

Generates a PDF version of the protocol.

#### Request Body
```json
{
  "options": {
    "includeShoppingList": true,
    "includeRecipes": true,
    "includeSupplementSchedule": true,
    "language": "en",
    "measurementSystem": "metric"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "pdfUrl": "https://cdn.evofitprotocol.com/exports/protocol_lng_123456.pdf",
    "expiresAt": "2024-12-21T10:30:00Z",
    "sizeBytes": 2457600
  }
}
```

### 3. Get Regional Ingredients
**GET** `/protocols/ingredients/regional`

Returns ingredient availability and alternatives by region.

#### Query Parameters
- `region` (string): Required region code
- `ingredientIds` (array): Specific ingredients to check

#### Response
```json
{
  "success": true,
  "data": {
    "region": "asia",
    "ingredients": [
      {
        "id": "ing_wormwood",
        "name": "wormwood",
        "availability": "limited",
        "localName": "青蒿 (qing hao)",
        "sources": ["traditional medicine shops"],
        "alternatives": [
          {
            "name": "sweet wormwood",
            "localName": "甜蒿",
            "effectiveness": "comparable"
          }
        ]
      }
    ]
  }
}
```

### 4. Protocol Analytics
**GET** `/protocols/analytics/user/{userId}`

Returns analytics and insights for user's protocol history.

#### Query Parameters
- `timeRange` (string): 7d|30d|90d|all
- `metrics` (array): adherence|outcomes|preferences

#### Response
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "timeRange": "30d",
    "analytics": {
      "protocolsCompleted": 3,
      "averageAdherence": 87,
      "mostSuccessfulType": "longevity",
      "insights": [
        {
          "type": "pattern",
          "message": "Higher adherence with Mediterranean cuisine preferences"
        },
        {
          "type": "recommendation",
          "message": "Consider longer eating windows for better compliance"
        }
      ],
      "trends": {
        "adherenceByDayOfWeek": {
          "monday": 92,
          "tuesday": 88,
          "wednesday": 85,
          "thursday": 87,
          "friday": 82,
          "saturday": 78,
          "sunday": 80
        }
      }
    }
  }
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_PROTOCOL_CONFIG` | 400 | Invalid protocol configuration provided |
| `MEDICAL_CONTRAINDICATION` | 400 | Protocol conflicts with medical information |
| `PROTOCOL_NOT_FOUND` | 404 | Requested protocol does not exist |
| `UNAUTHORIZED_ACCESS` | 403 | User not authorized to access this protocol |
| `INGREDIENT_UNAVAILABLE` | 400 | Required ingredients not available in region |
| `PROTOCOL_ALREADY_ACTIVE` | 409 | User already has an active protocol of this type |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "MEDICAL_CONTRAINDICATION",
    "message": "Protocol cannot be created due to medical contraindications",
    "details": {
      "contraindications": [
        {
          "type": "pregnancy",
          "affectedIngredients": ["wormwood", "black walnut"],
          "severity": "high"
        }
      ],
      "recommendations": [
        "Consult healthcare provider before proceeding",
        "Consider diet-only cleanse option"
      ]
    }
  }
}
```

---

## Rate Limiting

All endpoints are rate limited to prevent abuse:

- **Protocol Creation**: 10 requests per hour per user
- **Protocol Updates**: 30 requests per hour per user
- **Read Operations**: 100 requests per hour per user
- **PDF Generation**: 5 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703074800
```

---

## Webhook Events

The API supports webhooks for protocol events:

### Available Events
- `protocol.created`
- `protocol.updated`
- `protocol.completed`
- `protocol.abandoned`
- `progress.updated`
- `milestone.reached`

### Webhook Payload Example
```json
{
  "event": "protocol.completed",
  "timestamp": "2024-12-20T10:30:00Z",
  "data": {
    "protocolId": "lng_123456",
    "userId": "user_123",
    "type": "longevity",
    "completionRate": 95,
    "duration": 7
  }
}
```

---

## API Versioning

The API uses URL versioning. Current version is `v1`. 

Breaking changes will result in a new version (e.g., `v2`). Non-breaking changes will be added to the current version with appropriate notices.

### Version Headers
```
X-API-Version: 1.0
X-API-Deprecated: false
```

---

_This specification is subject to change. Always refer to the latest version in the developer portal._
