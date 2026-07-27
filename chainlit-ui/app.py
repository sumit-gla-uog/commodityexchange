import chainlit as cl
import sys
import os

# Add root to path so backend modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.rag.engine import query

@cl.on_chat_start
async def start():
    await cl.Message(
        content="""Welcome to **Commodity Exchange ** - Your AI Commodity Intelligence Assistant!

I can help you with:
- Commodity price trends (copper, wheat, oil, aluminium...)
- Buying recommendations for UK industrial SMEs
- Historical price analysis

Ask me anything about commodity prices!"""
    ).send()

@cl.on_message
async def main(message: cl.Message):
    async with cl.Step(name="Retrieving commodity data..."):
        response = query(message.content)
    await cl.Message(content=response).send()