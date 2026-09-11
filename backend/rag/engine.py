# import os
# import requests
# import chromadb
# from groq import Groq
# from dotenv import load_dotenv

# load_dotenv()

# # Config
# CHROMA_DIR = os.path.join(
#     os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
#     "data", "chroma_db"
# )
# COLLECTION_NAME = "commodity_prices"

# HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
# HF_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
# HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# def get_embedding(text: str):
#     response = requests.post(
#         HF_URL,
#         headers=HEADERS,
#         json={"inputs": [text], "options": {"wait_for_model": True}}
#     )
#     if response.status_code != 200:
#         raise Exception(f"HF API error: {response.status_code}")
#     return response.json()[0]


# def retrieve_context(user_query: str, n_results: int = 5):
#     client = chromadb.PersistentClient(path=CHROMA_DIR)
#     collection = client.get_collection(COLLECTION_NAME)
#     query_embedding = get_embedding(user_query)
#     results = collection.query(
#         query_embeddings=[query_embedding],
#         n_results=n_results,
#         include=["documents", "metadatas"]
#     )
#     return results["documents"][0], results["metadatas"][0]


# def build_prompt(user_query: str, docs: list, metadatas: list):
#     context = "\n".join([
#         f"- {doc} (Source: {meta['source']}, Date: {meta['date']})"
#         for doc, meta in zip(docs, metadatas)
#     ])
#     return f"""You are CommodEx, an intelligent commodity price assistant
# for UK industrial SMEs. You help procurement managers make informed
# buying decisions based on historical price data.

# CONTEXT (Historical Price Data):
# {context}

# USER QUESTION: {user_query}

# Answer using the context above. Be specific about price levels,
# trends, and whether it is a good time to buy. Keep the answer
# concise and actionable for an SME procurement manager."""


# def generate_response(prompt: str):
#     response = groq_client.chat.completions.create(
#         model="openai/gpt-oss-120b",
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.3,
#         max_tokens=500
#     )
#     return response.choices[0].message.content


# def query(user_query: str):
#     docs, metadatas = retrieve_context(user_query)
#     prompt = build_prompt(user_query, docs, metadatas)
#     return generate_response(prompt)