"""Cybersecurity awareness survey results (Google Forms export, 31 respondents)."""

SURVEY = {
    "title": "Cybersecurity Awareness Survey",
    "respondents": 31,
    "questions": [
        {
            "id": "age",
            "order": 0,
            "question": "Age",
            "responses": 30,
            "chart": "bar",
            "options": [
                {"label": "16", "count": 1},
                {"label": "18", "count": 6},
                {"label": "19", "count": 9},
                {"label": "20", "count": 4},
                {"label": "22", "count": 2},
                {"label": "23", "count": 3},
                {"label": "24", "count": 1},
                {"label": "25", "count": 1},
                {"label": "28", "count": 1},
                {"label": "29", "count": 1},
                {"label": "40", "count": 1},
            ],
        },
        {
            "id": "heard",
            "order": 1,
            "question": "Have you heard about cybersecurity before?",
            "responses": 31,
            "chart": "hbar",
            "options": [
                {"label": "Yes", "count": 30},
                {"label": "No", "count": 1},
            ],
        },
        {
            "id": "frequency",
            "order": 2,
            "question": "How often do you use the internet?",
            "responses": 31,
            "chart": "pie",
            "options": [
                {"label": "Less than 1 hour/day", "count": 4},
                {"label": "1–3 hours/day", "count": 11},
                {"label": "3–5 hours/day", "count": 7},
                {"label": "More than 5 hours/day", "count": 9},
            ],
        },
        {
            "id": "device",
            "order": 3,
            "question": "Which device do you mainly use to access the internet?",
            "responses": 31,
            "chart": "pie",
            "options": [
                {"label": "Smartphone", "count": 25},
                {"label": "Laptop", "count": 4},
                {"label": "Desktop", "count": 2},
                {"label": "Tablet", "count": 0},
            ],
        },
    ],
}
