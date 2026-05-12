import os
import edge_tts
import base64
import tempfile
import logging
import asyncio
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("studo-ario-voice")

# Use a highly expressive English voice from Edge TTS
VOICE = "en-US-ChristopherNeural" # alternative: en-US-EricNeural or en-US-GuyNeural

class ArioVoiceService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.groq_api_key) if self.groq_api_key else None
        
        self.system_prompt = """You are ARIO, an advanced Holographic AI Assistant. 
You are currently active in the Studo Spatial OS.
Keep your responses very concise (1-2 sentences). 
Speak in a natural, conversational, and slightly confident tone (like J.A.R.V.I.S).
Do not use emojis or markdown, as your output will be spoken via TTS."""

    async def get_conversational_response(self, text: str) -> str:
        """Get an intelligent response from Groq LLaMA 3, or fallback if no key."""
        if not self.client:
            logger.warning("GROQ_API_KEY not found. Using fallback conversational response.")
            return f"I heard you say: {text}. However, my neural connection to Groq is currently offline. Please add the API key."

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": text}
                ],
                model="llama3-8b-8192",
                temperature=0.7,
                max_tokens=100,
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return "I'm having trouble thinking right now due to a network anomaly."

    async def generate_speech_base64(self, text: str) -> str:
        """Convert text to speech using Edge TTS and return as base64."""
        try:
            # Create a temporary file to save the audio
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            temp_file.close()
            
            # Generate TTS
            communicate = edge_tts.Communicate(text, VOICE, rate="+10%")
            await communicate.save(temp_file.name)
            
            # Read and encode
            with open(temp_file.name, "rb") as f:
                audio_data = f.read()
                
            base64_audio = base64.b64encode(audio_data).decode('utf-8')
            
            # Cleanup
            os.remove(temp_file.name)
            
            return base64_audio
        except Exception as e:
            logger.error(f"TTS generation error: {e}")
            return ""

    async def process_chat(self, user_text: str) -> dict:
        """Main orchestrator: Text -> LLM -> TTS -> Base64"""
        logger.info(f"Processing chat: {user_text}")
        
        # 1. Get LLM response
        ai_response = await self.get_conversational_response(user_text)
        
        # 2. Convert to speech
        audio_b64 = await self.generate_speech_base64(ai_response)
        
        return {
            "success": bool(audio_b64),
            "text": ai_response,
            "audio_base64": audio_b64
        }

ario_voice_service = ArioVoiceService()
