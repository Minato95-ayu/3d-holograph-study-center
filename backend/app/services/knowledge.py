import wikipediaapi
import logging
import re
from deep_translator import GoogleTranslator

logger = logging.getLogger("studo-knowledge")

# Domain-specific formula databases
FORMULA_DB = {
    # Physics
    "energy": ["E = mc²", "E = hf", "KE = ½mv²"],
    "force": ["F = ma", "F = G(m₁m₂)/r²", "F = qvB"],
    "motion": ["v = u + at", "s = ut + ½at²", "v² = u² + 2as"],
    "wave": ["v = fλ", "E = hf", "c = 3×10⁸ m/s"],
    "electricity": ["V = IR", "P = IV", "Q = CV"],
    "quantum": ["E = hf", "λ = h/mv", "ΔxΔp ≥ ℏ/2"],
    # Chemistry
    "water": ["2H₂ + O₂ → 2H₂O", "H₂O → H⁺ + OH⁻"],
    "photosynthesis": ["6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂"],
    "respiration": ["C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP"],
    "dna": ["A=T (2H bonds)", "G≡C (3H bonds)", "Chargaff: A/T = G/C = 1"],
    "acid": ["pH = -log[H⁺]", "Ka = [H⁺][A⁻]/[HA]"],
    # Mathematics
    "pythagorean": ["a² + b² = c²"],
    "quadratic": ["x = (-b ± √(b²-4ac)) / 2a"],
    "circle": ["A = πr²", "C = 2πr"],
    "sphere": ["V = (4/3)πr³", "SA = 4πr²"],
    "derivative": ["d/dx(xⁿ) = nxⁿ⁻¹", "d/dx(eˣ) = eˣ", "d/dx(sin x) = cos x"],
    "integration": ["∫xⁿdx = xⁿ⁺¹/(n+1) + C", "∫eˣdx = eˣ + C"],
}

# Fun facts database
FUN_FACTS = {
    "dna": "If you uncoiled all the DNA in your body, it would stretch 10 billion miles — beyond Pluto!",
    "water": "Water is the only natural substance that exists in all three states at Earth's surface temperature.",
    "caffeine": "Caffeine blocks adenosine receptors in your brain — this is why it prevents sleepiness.",
    "quantum": "According to quantum mechanics, a particle can be in two places at once — until observed.",
    "black hole": "Time passes slower near a black hole due to extreme gravity — called gravitational time dilation.",
    "atom": "99.9999999% of an atom is empty space. If a proton were a football, the electron would orbit 10km away.",
    "brain": "The human brain has ~86 billion neurons, each making up to 10,000 connections.",
    "light": "Light from the Sun takes 8 minutes 20 seconds to reach Earth.",
    "heart": "Your heart beats about 100,000 times per day — 3 billion times in a lifetime.",
}

class KnowledgeService:
    def __init__(self):
        self.wiki = wikipediaapi.Wikipedia(
            user_agent="StudoSpatialOS/2.0 (https://studo-os.example.com; contact@example.com)",
            language='en',
            extract_format=wikipediaapi.ExtractFormat.WIKI
        )

    def _extract_formulas(self, query: str, summary: str) -> list:
        """Extract relevant formulas based on query keywords."""
        formulas = []
        q_lower = query.lower()
        
        for keyword, fmls in FORMULA_DB.items():
            if keyword in q_lower or keyword in summary.lower()[:200]:
                formulas.extend(fmls)
                if len(formulas) >= 4:
                    break
        
        return formulas[:4]  # Max 4 formulas

    def _extract_components(self, summary: str) -> list:
        """Extract key components/parts from summary text."""
        # Find capitalized terms that likely are component names
        components = []
        
        # Pattern: find "consists of", "made of", "contains" followed by items
        patterns = [
            r'consists? of ([^.]+)',
            r'made of ([^.]+)',
            r'contains? ([^.]+)',
            r'composed of ([^.]+)',
            r'has ([^.]{5,50})',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, summary[:500], re.IGNORECASE)
            for match in matches[:2]:
                # Extract individual items
                items = re.split(r',|and ', match)
                for item in items[:4]:
                    item = item.strip().strip('.')
                    if 2 < len(item) < 40:
                        components.append(item.capitalize())
        
        # Remove duplicates
        seen = set()
        unique = []
        for c in components:
            if c.lower() not in seen:
                seen.add(c.lower())
                unique.append(c)
        
        return unique[:6]  # Max 6 components

    def _get_fun_fact(self, query: str) -> str:
        """Get a fun fact related to the query."""
        q_lower = query.lower()
        for keyword, fact in FUN_FACTS.items():
            if keyword in q_lower:
                return fact
        return ""

    def _detect_domain(self, query: str, summary: str) -> str:
        """Detect the knowledge domain."""
        q = query.lower() + " " + summary.lower()[:300]
        
        if any(w in q for w in ['atom', 'molecule', 'chemical', 'element', 'reaction', 'bond', 'dna', 'protein']):
            return 'chemistry'
        elif any(w in q for w in ['force', 'energy', 'quantum', 'gravity', 'velocity', 'mass', 'wave', 'particle']):
            return 'physics'
        elif any(w in q for w in ['cell', 'organism', 'gene', 'evolution', 'species', 'heart', 'brain', 'blood']):
            return 'biology'
        elif any(w in q for w in ['integral', 'derivative', 'equation', 'theorem', 'polynomial', 'matrix', 'vector']):
            return 'mathematics'
        elif any(w in q for w in ['planet', 'star', 'galaxy', 'universe', 'orbit', 'space', 'solar']):
            return 'astronomy'
        else:
            return 'general'

    async def get_summary(self, query: str):
        try:
            # 1. Translate query to English if it's in Hindi/Hinglish
            english_query = query
            is_hindi = False
            
            try:
                translated = GoogleTranslator(source='auto', target='en').translate(query)
                if translated and translated.strip().lower() != query.strip().lower():
                    english_query = translated
                    is_hindi = True
            except Exception as e:
                logger.error(f"Translation to EN failed: {e}")

            logger.info(f"Original Query: {query} | English Query: {english_query} | Is Hindi: {is_hindi}")

            # 2. Fetch knowledge using English query
            page = self.wiki.page(english_query)
            
            if page.exists():
                raw_summary = page.summary
                display_summary = raw_summary[:1200]
                
                formulas = self._extract_formulas(english_query, raw_summary)
                components = self._extract_components(raw_summary)
                fun_fact = self._get_fun_fact(english_query)
                domain = self._detect_domain(english_query, raw_summary)
                
                sentences = raw_summary.split('. ')
                ario_intro = '. '.join(sentences[:2]) + '.' if len(sentences) >= 2 else raw_summary[:300]
                
                # 3. Translate response back to Hindi if needed
                if is_hindi:
                    try:
                        ario_intro = GoogleTranslator(source='en', target='hi').translate(ario_intro)
                        if fun_fact:
                            fun_fact = GoogleTranslator(source='en', target='hi').translate(fun_fact)
                    except Exception as e:
                        logger.error(f"Translation to HI failed: {e}")

                return {
                    "title": page.title,
                    "summary": display_summary,
                    "ario_intro": ario_intro,
                    "url": page.fullurl,
                    "exists": True,
                    "query": english_query, # Send back the english query so frontend 3D engine knows what to render
                    "original_query": query,
                    "formulas": formulas,
                    "components": components,
                    "fun_fact": fun_fact,
                    "domain": domain,
                    "language": "hi" if is_hindi else "en"
                }
            else:
                msg = f"No information found for '{english_query}' in the knowledge archive."
                if is_hindi:
                    msg = GoogleTranslator(source='en', target='hi').translate(msg)
                return {
                    "exists": False,
                    "message": msg,
                    "query": english_query,
                    "original_query": query,
                    "formulas": [],
                    "components": [],
                    "fun_fact": "",
                    "domain": "general",
                    "language": "hi" if is_hindi else "en"
                }
        except Exception as e:
            logger.error(f"Knowledge fetch error: {str(e)}")
            return {
                "exists": False,
                "message": "Failed to connect to the knowledge archive.",
                "query": query,
                "formulas": [],
                "components": [],
                "domain": "general",
            }

knowledge_service = KnowledgeService()
