import os
import requests
import chromadb
from groq import Groq
from langchain_groq import ChatGroq
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Config
CHROMA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "chroma_db"
)
COLLECTION_NAME = "commodity_prices"
HF_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
HF_HEADERS = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

ALPHA_VANTAGE_MAP = {
    "copper": "COPPER",
    "aluminum": "ALUMINUM",
    "aluminium": "ALUMINUM",
    "crude oil": "BRENT",
    "brent": "BRENT",
    "natural gas": "NATURAL_GAS",
    "wheat": "WHEAT",
    "corn": "CORN",
    "maize": "CORN",
    "sugar": "SUGAR",
}

NEWS_FEED = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=CPER,GLD,USO,UNG,WEAT,CORN,SOYB&region=US&lang=en-US"


# TOOL 1: Historical Context 
@tool
def get_historical_context(query: str) -> str:
    """Get historical commodity price data and trends from World Bank Pink Sheet data stored in ChromaDB. Use this for trend analysis and historical price context."""
    try:
        response = requests.post(
            HF_URL,
            headers=HF_HEADERS,
            json={"inputs": [query], "options": {"wait_for_model": True}}
        )
        # print('response from new qwen model-', response)
        embedding = response.json()[0]
        # print('embedding from new qwen model-', embedding)

        client = chromadb.PersistentClient(path=CHROMA_DIR)
        collection = client.get_collection(COLLECTION_NAME)
        results = collection.query(
            query_embeddings=[embedding],
            n_results=5,
            include=["documents", "metadatas"]
        )
        docs = results["documents"][0]
        return "\n".join(docs)
    except Exception as e:  
        return f"Historical data unavailable: {str(e)}"


#  TOOL 2: Live Price 
@tool
def get_live_price(commodity: str) -> str:
    """Get the current live market price for a commodity from Alpha Vantage API. Use this to get the most recent price data."""
    commodity_lower = commodity.lower()
    av_function = None

    for key, val in ALPHA_VANTAGE_MAP.items():
        if key in commodity_lower:
            av_function = val
            break

    if not av_function:
        return f"Live price not available for {commodity}. Available: copper, aluminum, crude oil, natural gas, wheat, corn, sugar."

    try:
        url = f"https://www.alphavantage.co/query?function={av_function}&interval=monthly&apikey={ALPHA_VANTAGE_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()

        if "data" in data and len(data["data"]) > 0:
            latest = data["data"][0]
            return f"Current {commodity} price: {latest['value']} USD (as of {latest['date']}) — Source: Alpha Vantage"
        else:
            return f"Live price data not available for {commodity}"
    except Exception as e:
        return f"Error fetching live price: {str(e)}"


# TOOL 3: Latest News
@tool
def get_commodity_news(commodity: str) -> str:
    """Get the latest news headlines related to a commodity. Use this for market sentiment and recent developments."""
    import xml.etree.ElementTree as ET

    try:
        response = requests.get(NEWS_FEED, timeout=10, headers={"User-Agent": "CommodEx/1.0"})
        root = ET.fromstring(response.content)

        headlines = []
        commodity_lower = commodity.lower()

        for item in root.findall(".//item"):
            title = item.findtext("title", "")
            pub_date = item.findtext("pubDate", "")
            if commodity_lower in title.lower() or any(
                kw in title.lower() for kw in ["commodity", "market", "price", "energy", "metal", "grain"]
            ):
                headlines.append(f"- {title} ({pub_date[:16]})")

        if not headlines:
            # Return general market news if no specific match
            for item in root.findall(".//item")[:3]:
                title = item.findtext("title", "")
                pub_date = item.findtext("pubDate", "")
                headlines.append(f"- {title} ({pub_date[:16]})")

        return "Latest news:\n" + "\n".join(headlines[:5]) if headlines else "No recent news found."

    except Exception as e:
        return f"News unavailable: {str(e)}"


# AGENT SETUP
def create_commodity_agent():
    llm = ChatGroq(
        # model="qwen/qwen3.6-27b",
        model="openai/gpt-oss-120b",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.2,
        max_tokens=1500 
    )

    tools = [get_historical_context, get_live_price, get_commodity_news]

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are CommodEx, an intelligent commodity intelligence assistant for UK industrial SMEs.
You help procurement managers make informed buying decisions.

You have access to three tools:
1. get_historical_context — use this for historical price trends from World Bank data
2. get_live_price — use this for current market prices
3. get_commodity_news — use this for latest market news and sentiment

Always use all three tools when answering procurement questions.
Provide specific price figures, trend analysis, and a clear buy/wait recommendation.
Keep responses concise and actionable for SME procurement managers."""),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=12)


# MAIN QUERY FUNCTION 
def agentic_query(user_query: str) -> str:
    try:
        agent_executor = create_commodity_agent()
        result = agent_executor.invoke({"input": user_query})
        answer = result.get("output", "").strip()
        if not answer:
            return "I wasn't able to generate a complete answer for this query. Please try rephrasing or ask about a specific commodity."
        return answer
    except Exception as e:
        return f"Agent error: {str(e)}"