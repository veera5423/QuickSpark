from google import genai
from config import Config

# Initialize client with API key
client = genai.Client(api_key=Config.GEMINI_API_KEY)

def summarize_with_gemini(prompt: str) -> str:
    """
    Generate content using Gemini API for quiz generation.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text
