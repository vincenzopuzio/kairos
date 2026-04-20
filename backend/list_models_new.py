import os
from google import genai

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

try:
    print("Listing models via google-genai...")
    # The new SDK might have a different method
    for m in client.models.list():
        print(f"Model ID: {m.name}")
except Exception as e:
    print(f"Error: {e}")
