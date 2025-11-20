def quiz_generation_prompt(text: str, level: str = "medium", num_questions: int = 5) -> str:
    """
    Builds a structured prompt for Gemini to generate MCQs of given difficulty.
    """

    difficulty_description = {
        "easy": "Basic recall or definition-level questions.",
        "medium": "Conceptual and application-level questions.",
        "hard": "Advanced analytical or scenario-based questions."
    }.get(level.lower(), "Conceptual and application-level questions.")

    return f"""
You are an expert educator and test designer.

Generate {num_questions} {level.capitalize()}-level multiple choice questions (MCQs)
based on the following study material:

{text}

Each question should match this format:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "Short explanation for the correct answer."
  }}
]

Guidelines:
- Difficulty level: {difficulty_description}
- Make options plausible and avoid repetition.
- Ensure explanations are concise and accurate.
- The "answer" should be the letter of the correct option (e.g., "A", "B", "C", or "D").
- Return only valid JSON array.
"""
