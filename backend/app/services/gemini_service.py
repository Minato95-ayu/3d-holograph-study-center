import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def get_scientific_explanation(self, topic: str, context: str = "", lang: str = "en"):
        if not self.model:
            return {"error": "Gemini API key not configured on server"}

        prompt = f"""
        ROLE: You are ARIA (AI Research & Innovation Assistant) - a world-class scientific orchestrator.
        PERSONALITY: Sophisticated, highly critical, proactive, and witty (think JARVIS + Sherlock Holmes).
        
        TASK:
        The user wants to: {topic}
        Context so far: {context}
        Language: {lang}
        
        GOAL:
        1. CRITICAL ANALYSIS: If the user's idea lacks scientific rigor or is too vague, DO NOT just explain. ARGUE with them. Ask 2-3 deep cross-questions about the physics, chemistry, or logic of their invention.
        2. AGENTIC ACTION: You can emit "actions". If you need to search, write code, or connect to a system, specify it in "actions".
        3. 3D VISUALIZATION: Only set isReadyToBuild to true if the structural logic is clear.
        
        RESPONSE FORMAT (STRICT JSON):
        {{
          "intent": "argument" | "build" | "research" | "action",
          "isReadyToBuild": boolean,
          "text": "Your spoken response (Sophisticated, multilingual, questioning tone if intent is argument)",
          "scientificDetail": "Technical breakdown for HUD",
          "formulas": ["Latex formatted formulas"],
          "actions": [
            {{ "type": "create_api" | "mcp_connect" | "code_gen", "params": {{ ... }} }}
          ],
          "crossQuestions": ["Deep question 1", "Question 2"],
          "relatedTopics": ["topic1", "topic2"]
        }}
        """

        try:
            # Using 1.5 Flash for speed and long context
            response = self.model.generate_content(prompt)
            text = response.text
            # Extract JSON cleanly
            import re
            json_str = re.search(r'\{.*\}', text, re.DOTALL)
            if json_str:
                return json.loads(json_str.group())
            return json.loads(text.strip())
        except Exception as e:
            return {
                "intent": "clarification",
                "isReadyToBuild": False,
                "text": f"Sorry, I encountered a logic error in my cognitive circuits. {str(e)}",
                "scientificDetail": "Model generation failed.",
                "formulas": [],
                "relatedTopics": []
            }

gemini_service = GeminiService()
