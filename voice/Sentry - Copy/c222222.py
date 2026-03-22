import os
from openai import OpenAI

# 1. SETUP
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")
LOG_FILE = "D:/Dev/Sentry/sentry_log.txt"

def get_log_summary():
    if not os.path.exists(LOG_FILE):
        return "The log is currently empty."
    with open(LOG_FILE, "r") as f:
        # Get the last 20 lines so the AI has enough context
        return "".join(f.readlines()[-20:])

print("--- SENTRY CHAT ACTIVE ---")
print("Ask me about the house (or type 'quit' to exit)")

while True:
    import speech_recognition as sr

def listen():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source)
    try:
        return r.recognize_google(audio) # Turns your voice to text
    except:
        return ""

# Now, instead of user_input = input(), use:
# user_input = listen()
    if user_input.lower() == 'quit':
        break

    # Get the latest "Memory" from the M.2 drive
    history = get_log_summary()

    # The Prompt: Telling the AI to be your assistant
    prompt = (
        f"You are a helpful AI assistant. Below is the security log from Dale's house.\n"
        f"--- LOG START ---\n{history}\n--- LOG END ---\n"
        f"Dale is asking: {user_input}"
    )

    try:
        response = client.chat.completions.create(
            model="local-model",
            messages=[{"role": "user", "content": prompt}]
        )
        print(f"\nSentry AI: {response.choices[0].message.content}")
    except Exception as e:
        print(f"Error talking to AI: {e}")