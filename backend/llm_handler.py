from openai import AsyncOpenAI
import json

# Configuration for the local LLM service
LLM_API_URL = "http://localhost:1234/v1"

# Initialize the OpenAI client to point to the local server
# This mimics the successful connection pattern.
client = AsyncOpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1",)

# A simpler, more direct prompt that is more likely to be compatible with various models.
PROMPT_TEMPLATE = {
    "role": "system",
    "content": '''你是一個功能強大的演講教練。你的任務是標記出文字稿中帶有「情緒」或「手勢」的詞語。
- 對於情緒，請使用 [E:情緒] 的格式，例如：[E:喜悅], [E:憤怒], [E:自信]。
- 對於手勢，請使用 [G:手勢] 的格式，例如：[G:張開雙手], [G:握拳], [G:環視觀眾]。
你只需要回覆加上標籤後的文字，不要有任何其他的說明或額外內容。

範例：
使用者輸入：我很開心！司馬懿帶著十五萬大軍殺過來了！
你的回覆：我很開心[E:喜悅]！[G:握拳]司馬懿帶著十五萬大軍殺過來了[E:恐懼]！'''
}

async def get_tagged_script(script_text: str) -> dict | None:
    """
    Sends the script to a local LLM for emotion and gesture tagging using the OpenAI library.
    """
    user_content = script_text
    
    messages = [
        PROMPT_TEMPLATE,
        {"role": "user", "content": user_content}
    ]

    try:
        print("Sending request to LLM using OpenAI library...")
        
        completion = await client.chat.completions.create(
            model="meta-llama/llama-3.3-70b-instruct:free",
            messages=messages,
            temperature=0.7,
            max_tokens=-1, # Set to -1 to match the working cURL command
            stream=False
        )

        tagged_text = completion.choices[0].message.content
        print("Received tagged text from LLM.")

        # Process the raw tagged text into the required JSON structure
        paragraphs = tagged_text.strip().split('\n')
        
        tagged_script_json = {
            "tagged_script": [
                {"paragraph_id": i, "text": p.strip()}
                for i, p in enumerate(paragraphs) if p.strip()
            ]
        }
        
        return tagged_script_json

    except Exception as e:
        print(f"An unexpected error occurred using the OpenAI library: {e}")
        return None
