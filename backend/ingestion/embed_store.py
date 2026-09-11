# Part 1: Imports and Config
import json
import os
import time
import requests
import chromadb
from dotenv import load_dotenv

load_dotenv()

INPUT_FILE = "data/chunks.json"
CHROMA_DIR = "data/chroma_db"
COLLECTION_NAME = "commodity_prices"
BATCH_SIZE = 50  # small batch for HuggingFace API rate limit
START_FROM = 0  #  temporary change, where it got failed

HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HF_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# Part 2: Part 2: HuggingFace Embedding Function

# def get_embeddings(texts):
#     response = requests.post(
#         HF_URL,
#         headers=HEADERS,
#         json={"inputs": texts, "options": {"wait_for_model": True}}
#     )
    
#     if response.status_code != 200:
#         raise Exception(f"HF API error: {response.status_code} - {response.text}")
    
#     return response.json()

def get_embeddings(texts, retries=3):
    for attempt in range(retries):
        response = requests.post(
            HF_URL,
            headers=HEADERS,
            json={"inputs": texts, "options": {"wait_for_model": True}}
        )
        
        if response.status_code == 200:
            return response.json()
        
        print(f"Attempt {attempt+1} failed: {response.status_code} — retrying in 10s...")
        time.sleep(10)
    
    raise Exception(f"HF API error after {retries} retries: {response.text}")

# Part 3: ChromaDB Setup
def setup_chromadb(chroma_dir, collection_name):
    client = chromadb.PersistentClient(path=chroma_dir)
    
    existing = [c.name for c in client.list_collections()]
    if collection_name in existing:
        client.delete_collection(collection_name)
        print(f"Deleted existing collection: {collection_name}")
    
    collection = client.create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"Created collection: {collection_name}")
    return collection

# Part 4: Embed + Store
# def embed_and_store(chunks, collection):
#     total = len(chunks)
    
#     for i in range(START_FROM, total, BATCH_SIZE):  # START_FROM 
#         batch = chunks[i:i + BATCH_SIZE]
#         # ... baaki same
#         time.sleep(1)  # 0.5 se badhakar 1 second
def embed_and_store(chunks, collection):
    total = len(chunks)
    
    for i in range(START_FROM, total, BATCH_SIZE): # START_FROM 
        batch = chunks[i:i + BATCH_SIZE]
        
        texts = [c["text"] for c in batch]
        metadatas = [c["metadata"] for c in batch]
        ids = [f"chunk_{i + j}" for j in range(len(batch))]
        
        # take embedding from HuggingFace API 
        embeddings = get_embeddings(texts)
        
        # store it in ChromaDB 
        collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"Stored {min(i + BATCH_SIZE, total)}/{total} chunks")
        
        # to avoid Rate limit, we are waiting for few milli seconds
        time.sleep(1)
        
# Part 5: Verify + Main

def verify(collection):
    query_text = "What is the current copper price trend?"
    query_embedding = get_embeddings([query_text])[0]
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    
    print("\n--- Sample Query Test ---")
    print(f"Query: {query_text}")
    for doc in results["documents"][0]:
        print(f"  → {doc}")

if __name__ == "__main__":
    print("Loading chunks...")
    with open(INPUT_FILE, "r") as f:
        chunks = json.load(f)
    print(f"Loaded {len(chunks)} chunks")
    
    print("Setting up ChromaDB...")
    collection = setup_chromadb(CHROMA_DIR, COLLECTION_NAME)
    
    print("Embedding and storing...")
    embed_and_store(chunks, collection)
    
    print("Verifying...")
    verify(collection)
    
    print("\nDone! ChromaDB ready.")