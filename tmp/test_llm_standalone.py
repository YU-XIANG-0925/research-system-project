import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

# 1. 載入環境變數
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1"

if not OPENROUTER_API_KEY:
    print("錯誤: 未找到 OPENROUTER_API_KEY 環境變數。請檢查 .env 檔案。")
    exit(1)

print(f"API Key found: {OPENROUTER_API_KEY[:5]}... (masked)")

# 2. 初始化 Client (包含 Timeout 設定)
client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url=OPENROUTER_API_URL,
    timeout=30.0 
)

PROMPT_TEMPLATE = {
    "role": "system",
    "content": '''你是一個功能強大的演講教練。你的任務是標記出文字稿中帶有「情緒」或「手勢」的詞語。
- 對於情緒，請使用 [E:情緒] 的格式。
- 對於手勢，請使用 [G:手勢] 的格式。
只回覆標記後的文字。'''
}

async def test_llm_call():
    test_text = "大家好，今天非常高興能站在這裡。"
    messages = [
        PROMPT_TEMPLATE,
        {"role": "user", "content": test_text}
    ]

    print("\n開始發送請求到 OpenRouter (Model: meta-llama/llama-3.3-70b-instruct:free)...")
    try:
        completion = await client.chat.completions.create(
            model="meta-llama/llama-3.3-70b-instruct:free",
            messages=messages,
            temperature=0.7,
            # max_tokens=-1, # 移除這行，這是潛在的問題源
            stream=False
        )
        
        result = completion.choices[0].message.content
        print("\n--- 成功收到回覆 ---")
        print(result)
        print("--------------------")
        
    except Exception as e:
        print(f"\n[錯誤] 請求失敗: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm_call())
