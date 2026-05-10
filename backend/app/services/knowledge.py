import wikipediaapi
import logging

logger = logging.getLogger("studo-knowledge")

class KnowledgeService:
    def __init__(self):
        # Wikipedia-API requires a proper User-Agent
        self.wiki = wikipediaapi.Wikipedia(
            user_agent="StudoSpatialOS/1.0 (https://studo-os.example.com; contact@example.com)",
            language='en',
            extract_format=wikipediaapi.ExtractFormat.WIKI
        )

    async def get_summary(self, query: str):
        try:
            page = self.wiki.page(query)
            if page.exists():
                summary = page.summary[:1500] 
                return {
                    "title": page.title,
                    "summary": summary,
                    "url": page.fullurl,
                    "exists": True,
                    "query": query,
                    "discovery": "Historical/Scientific Record",
                    "components": ["Core Structure", "Primary Systems", "Secondary Modules"],
                    "experiment_notes": f"Safety protocols active for {query}. Simulation ready for structural analysis."
                }
            else:
                return {
                    "exists": False,
                    "message": "No knowledge found in spatial archives.",
                    "query": query
                }
        except Exception as e:
            logger.error(f"Wikipedia fetch error: {str(e)}")
            return {"exists": False, "message": "Failed to connect to Knowledge Graph."}

knowledge_service = KnowledgeService()
