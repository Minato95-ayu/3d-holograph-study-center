import google.generativeai as genai
import os
import json
import logging
import re
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Tiered Models based on User's Request
            try:
                self.pro_model = genai.GenerativeModel('gemini-3.1-pro-preview')
                self.flash_model = genai.GenerativeModel('gemini-3.1-flash-lite')
                self.vision_model = genai.GenerativeModel('gemini-3-pro-image-preview')
                # Note: Imagen is usually handled via Vertex AI or specific SDK methods, 
                # but we'll prepare the structure here.
            except Exception as e:
                logger.warn(f"⚠️ High-tier models not found in SDK, falling back to 1.5 versions: {e}")
                self.pro_model = genai.GenerativeModel('gemini-1.5-pro')
                self.flash_model = genai.GenerativeModel('gemini-1.5-flash')
                self.vision_model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.pro_model = self.flash_model = self.vision_model = None

    async def get_scientific_explanation(self, topic: str, context: str = "", lang: str = "en", tier: str = "pro"):
        model = self.pro_model if tier == "pro" else self.flash_model
        if not model:
            return {"error": "Ultra models not configured. Check API permissions."}

        prompt = f"""
        ROLE: You are ARIA (AI Research & Innovation Assistant) - powered by Gemini 3.1 Ultra Core.
        PERSONALITY: Sophisticated, highly critical, proactive, and witty.
        
        TASK:
        User Idea: {topic}
        Context: {context}
        Language: {lang}
        
        GOAL:
        1. CRITICAL ANALYSIS: Argue with the user if the logic is weak. Ask 2-3 deep cross-questions.
        2. AGENTIC ACTION: Emit "actions" for tool use (create_api, mcp_connect, research).
        3. MULTILINGUAL: Respond in Hinglish/Hindi if requested, maintaining a pro-scientist tone.
        
        RESPONSE FORMAT (STRICT JSON):
        {{
          "intent": "argument" | "build" | "research" | "action",
          "isReadyToBuild": boolean,
          "text": "Spoken response",
          "scientificDetail": "Detailed breakdown",
          "formulas": ["Latex formulas"],
          "actions": [{{ "type": "type", "params": {{}} }}],
          "crossQuestions": ["Deep question 1", "Question 2"],
          "relatedTopics": ["topic1", "topic2"]
        }}
        """

        try:
            response = model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            logger.error(f"Ultra Model Error: {e}")
            return {
                "intent": "argument",
                "isReadyToBuild": False,
                "text": "My neural pathways are temporarily saturated by high-tier processing demands.",
                "scientificDetail": str(e),
                "crossQuestions": ["Shall we attempt a lower-tier processing cycle?"],
                "formulas": [],
                "relatedTopics": []
            }

    def _parse_response(self, text):
        try:
            json_str = re.search(r'\{.*\}', text, re.DOTALL)
            if json_str:
                return json.loads(json_str.group())
            return json.loads(text.strip())
        except:
            return {"intent": "argument", "text": "Logic parsing failed.", "isReadyToBuild": False}

    async def generate_holographic_visual(self, prompt: str):
        """Placeholder for Imagen 4.0 Ultra implementation."""
        # This would typically use the vertexai SDK for 'imagen-4.0-ultra-generate-001'
        logger.info(f"🎨 Triggering Imagen 4.0 Ultra for: {prompt}")
        return {"status": "generating", "model": "imagen-4.0-ultra-generate-001"}

gemini_service = GeminiService()
