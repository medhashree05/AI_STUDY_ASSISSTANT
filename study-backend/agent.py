import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from itertools import cycle
# ------------------ SETUP ------------------
load_dotenv()
api_keys = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
]

api_keys = [key for key in api_keys if key]

if not api_keys:
    raise ValueError("❌ No API keys found")

print(f"✅ Loaded {len(api_keys)} API keys")


# Create rotating cycle
key_cycle = cycle(api_keys)

def get_model():
    key = next(key_cycle)
    genai.configure(api_key=key)
    return genai.GenerativeModel("gemini-2.5-flash")





# ------------------ TOOLS ------------------

def summarize(text):
    prompt = f"""
    Summarize the topic into EXACTLY 5 bullet points.

    Rules:
    - Plain text only (NO *, NO markdown)
    - Each point in new line
    - Simple and clean

    Example:
    1. Point one
    2. Point two

    Topic:
    {text}
    """
    model = get_model()
    return model.generate_content(prompt).text


def explain(text):
    prompt = f"""
    Explain this topic clearly.

    Format:
    - Short introduction (2 lines)
    - Key points (bullet style)
    - Example at end

    Rules:
    - No markdown (**, *)
    - Clean readable text

    Topic:
    {text}
    """
    model = get_model()
    return model.generate_content(prompt).text

def generate_quiz(text):
    all_questions = ""

    for i in range(4):
        prompt = f"""
        Generate 5 MCQs.

        STRICT FORMAT (VERY IMPORTANT):

        Q:
        Question text

        A: Option A
        B: Option B
        C: Option C
        D: Option D

        ANSWER: A

        No extra text.
        No explanation.
        No markdown.

        Topic:
        {text}
        """
        model = get_model()
        response = model.generate_content(prompt)
        all_questions += response.text + "\n\n"

    return all_questions


# ------------------ TOOL MAP ------------------

tools = {
    "summarize": summarize,
    "explain": explain,
    "quiz": generate_quiz
}


# ------------------ PLANNING ------------------

def plan_steps(task):
    prompt = f"""
    You are an AI study assistant.

    Task: {task}

    Available tools:
    - summarize
    - explain
    - quiz

    Return STRICT JSON only:
    {{
        "steps": ["summarize", "explain"]
    }}
    """
    model = get_model()
    response = model.generate_content(prompt)
    return response.text


# ------------------ PARSING ------------------

def get_steps(task):
    response_text = plan_steps(task)

    print("Raw Plan:", response_text)

    try:
        # Clean unwanted markdown if present
        response_text = response_text.strip().replace("```json", "").replace("```", "")
        steps = json.loads(response_text)["steps"]
    except Exception as e:
        print("Parsing error:", e)
        steps = ["summarize"]  # fallback

    return steps


# ------------------ AGENT ------------------

def agent(task, content):

    steps = get_steps(task)
    print("Agent Steps:", steps)

    result = {}

    for step in steps:
        if step in tools:
            print(f"Running tool: {step}")
            result[step] = tools[step](content)

    return result


# ------------------ TEST ------------------

if __name__ == "__main__":

    task = "Summarize, explain and generate quiz"
    content = "Machine Learning is a subset of Artificial Intelligence that allows systems to learn from data."

    output = agent(task, content)

    print("\n FINAL OUTPUT:\n")
    print(output)