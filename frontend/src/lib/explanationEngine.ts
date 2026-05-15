/**
 * ARIA Explanation Engine
 * Fetches scientific explanations from Gemini API
 * Falls back to hardcoded explanations if API fails
 */

export interface Explanation {
  text: string; // Simple 2-sentence version (for speech)
  scientificDetail: string; // Detailed technical explanation
  suggestions: string[]; // 2-3 practical applications
  relatedTopics: string[]; // 2-3 related topics
  formulas?: string[];
  researchPapers?: string[];
  intent?: 'explanation' | 'invention' | 'clarification';
  isReadyToBuild?: boolean;
  source: 'gemini' | 'fallback';
}

/**
 * Fallback explanations database
 * Used if Gemini API fails
 */
const FALLBACK_EXPLANATIONS: Record<string, Explanation> = {
  engine: {
    text: "An engine is a machine that converts fuel energy into mechanical power. It works by burning fuel to create pressure that moves parts.",
    scientificDetail:
      "An internal combustion engine operates through a four-stroke cycle: intake, compression, combustion, and exhaust. Each cycle involves precise timing of fuel injection, spark ignition, and mechanical movement to generate rotational power.",
    suggestions: [
      "Understand the four-stroke cycle",
      "Learn about fuel combustion",
      "Explore torque and horsepower generation",
    ],
    relatedTopics: ["Piston", "Crankshaft", "Combustion"],
    source: 'fallback',
  },

  piston: {
    text: "A piston is a cylindrical component that moves up and down inside the engine cylinder. It transfers the force from burning fuel to the crankshaft.",
    scientificDetail:
      "The piston moves in reciprocal motion inside the cylinder, driven by expanding gases from fuel combustion. Connected to the crankshaft via a connecting rod, it converts linear motion into rotational motion, which ultimately drives the wheels.",
    suggestions: [
      "Study piston ring function",
      "Learn about piston speed calculations",
      "Understand piston-connecting rod dynamics",
    ],
    relatedTopics: ["Connecting Rod", "Cylinder", "Combustion Chamber"],
    source: 'fallback',
  },

  cylinder: {
    text: "A cylinder is the chamber where fuel burns to create power. Multiple cylinders firing in sequence create smooth, continuous power.",
    scientificDetail:
      "The cylinder is a precisely manufactured chamber that contains the fuel-air mixture. During the combustion stroke, a spark plug ignites the mixture, creating a controlled explosion that generates high pressure and temperature, pushing the piston downward.",
    suggestions: [
      "Understand cylinder head design",
      "Learn about bore and stroke ratios",
      "Explore multi-cylinder advantages",
    ],
    relatedTopics: ["Combustion Chamber", "Spark Plug", "Compression Ratio"],
    source: 'fallback',
  },

  crankshaft: {
    text: "The crankshaft is a rotating shaft that converts the up-and-down motion of pistons into rotational motion. It's the primary power output of the engine.",
    scientificDetail:
      "The crankshaft is a precisely balanced shaft with multiple throws (offset points) where connecting rods attach. As pistons push down during combustion, they rotate the crankshaft, which then connects to the transmission and wheels.",
    suggestions: [
      "Learn about crankshaft balance",
      "Understand counterweight design",
      "Explore harmonic oscillation dampening",
    ],
    relatedTopics: ["Piston", "Connecting Rod", "Torque"],
    source: 'fallback',
  },

  turbo: {
    text: "A turbo is a compressor that forces more air into the engine for increased power. It's powered by exhaust gases spinning a turbine.",
    scientificDetail:
      "A turbocharger uses exhaust gases to spin a turbine wheel at extremely high speeds. The turbine drives a compressor that increases the density of incoming air, allowing more fuel to burn and producing significantly more power output. Typical boost: 25-35% power increase.",
    suggestions: [
      "Understand boost pressure management",
      "Learn about intercoolers",
      "Explore turbo lag phenomenon",
    ],
    relatedTopics: ["Supercharger", "Exhaust System", "Power Output"],
    source: 'fallback',
  },

  'valve-inlet': {
    text: "The inlet valve opens during the intake stroke to allow the fuel-air mixture into the cylinder. It closes during combustion to contain the pressure.",
    scientificDetail:
      "The inlet valve (or intake valve) is mechanically operated by the camshaft through pushrods or direct contact. Precise timing ensures optimal air-fuel mixture entry. Modern engines use variable valve timing for efficiency improvements.",
    suggestions: [
      "Study valve timing diagrams",
      "Learn about valve overlap",
      "Understand valve lift profiles",
    ],
    relatedTopics: ["Exhaust Valve", "Camshaft", "Valve Timing"],
    source: 'fallback',
  },

  'valve-exhaust': {
    text: "The exhaust valve opens after combustion to let burned gases escape. It closes during the next combustion stroke to contain pressure.",
    scientificDetail:
      "The exhaust valve vents high-pressure, high-temperature combustion gases into the exhaust manifold. Its timing is coordinated with the piston position. High-temperature alloys withstand extreme conditions, and coatings provide durability.",
    suggestions: [
      "Learn about exhaust scavenging",
      "Explore valve cooling methods",
      "Understand exhaust manifold design",
    ],
    relatedTopics: ["Inlet Valve", "Exhaust System", "Combustion Byproducts"],
    source: 'fallback',
  },

  'car engine': {
    text: "A car engine is a complex machine with hundreds of parts working together to convert fuel into motion. Modern engines are highly efficient and powerful.",
    scientificDetail:
      "A typical car engine consists of cylinder blocks, pistons, crankshaft, camshaft, valve train, fuel system, ignition system, and cooling system. These components work in precise synchronization to achieve efficient power generation, often exceeding 85% thermodynamic efficiency.",
    suggestions: [
      "Understand engine management systems",
      "Learn about emission controls",
      "Explore modern hybrid engines",
    ],
    relatedTopics: ["Electric Motors", "Hybrid Systems", "Alternative Fuels"],
    source: 'fallback',
  },
};

/**
 * Get explanation for a topic
 * First tries Gemini API, falls back to hardcoded explanations
 */
export async function getExplanation(
  topic: string, 
  context?: string, 
  language: 'en' | 'hi' | 'hinglish' = 'en'
): Promise<Explanation> {
  const normalizedTopic = topic.toLowerCase().trim();

  // 1. Check cache first
  const cached = getCached(normalizedTopic);
  if (cached) {
    console.log(`📦 Using cached explanation for: "${normalizedTopic}"`);
    return cached;
  }

  console.log(`📚 Fetching explanation for: "${normalizedTopic}"`);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  let explanation: Explanation;

  // 2. Try Gemini API if key is available
  if (apiKey) {
    try {
      explanation = await fetchFromGemini(normalizedTopic, context, apiKey, language);
      setCached(normalizedTopic, explanation);
      return explanation;
    } catch (error) {
      console.warn(`⚠️ Gemini API failed, using fallback:`, error);
    }
  } else {
    console.warn('⚠️ Gemini API key not configured');
  }

  // 3. Return fallback explanation
  explanation = getFallbackExplanation(normalizedTopic);
  return explanation;
}

/**
 * Fetch explanation from Google Gemini API
 */
async function fetchFromGemini(
  topic: string,
  context: string | undefined,
  apiKey: string,
  language: 'en' | 'hi' | 'hinglish'
): Promise<Explanation> {
  const langPrompt = language === 'hi' ? 'Explain in Hindi.' : language === 'hinglish' ? 'Explain in Hinglish (Hindi + English mix, natural student tone).' : 'Explain in English.';
  
  const prompt = `You are ARIA, a highly advanced Virtual Research Assistant, similar to JARVIS or FRIDAY.
  
  ${langPrompt}
  
  Topic: ${topic}
  Context: ${context || 'General scientific research'}
  
  Your goal is to have a human-like dialogue. 
  1. If the user's request is too vague to build or invent (e.g., "make something cool", "kuch bada banate hain"), you MUST ask clarifying questions to understand their vision (intent: "clarification").
  2. If the request is clear (e.g., "build a rocket engine", "human heart dikhao"), explain it and mark as ready to build.
  3. Speak in a sophisticated, proactive, and slightly witty tone.
  
  Provide a JSON response with this exact structure:
  {
    "intent": "explanation" | "invention" | "clarification",
    "isReadyToBuild": boolean,
    "simple": "A sophisticated 2-sentence response for speech synthesis. If clarification, ask your questions here.",
    "detailed": "A detailed technical explanation or a breakdown of what info you need to proceed.",
    "suggestions": ["Practical application/Invention idea 1", "Idea 2", "Idea 3"],
    "relatedTopics": ["Related topic 1", "Related topic 2", "Related topic 3"],
    "formulas": ["Formula 1", "Formula 2"],
    "researchPapers": ["Relevant research paper/concept title 1", "Title 2"]
  }

  IMPORTANT:
  - If intent is "clarification", isReadyToBuild MUST be false.
  - Return ONLY valid JSON, no markdown or extra text.`;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]) {
    throw new Error('Invalid Gemini response structure');
  }

  const responseText = data.candidates[0].content.parts[0].text;
  console.log('📖 Gemini response:', responseText);

  // Extract JSON from response (in case of markdown wrapping)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    text: parsed.simple || 'Explanation available.',
    scientificDetail: parsed.detailed || 'See simple explanation.',
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
    formulas: Array.isArray(parsed.formulas) ? parsed.formulas : [],
    researchPapers: Array.isArray(parsed.researchPapers) ? parsed.researchPapers : [],
    intent: parsed.intent || 'explanation',
    isReadyToBuild: parsed.isReadyToBuild ?? true,
    source: 'gemini',
  };
}

/**
 * Get fallback explanation from hardcoded database
 */
function getFallbackExplanation(topic: string): Explanation {
  // Direct match
  if (FALLBACK_EXPLANATIONS[topic]) {
    return FALLBACK_EXPLANATIONS[topic];
  }

  // Fuzzy matching (try partial matches)
  for (const [key, explanation] of Object.entries(FALLBACK_EXPLANATIONS)) {
    if (key.includes(topic) || topic.includes(key)) {
      console.log(`✅ Fuzzy matched "${topic}" to "${key}"`);
      return explanation;
    }
  }

  // Generic fallback
  console.warn(`⚠️ No explanation found for "${topic}", using generic fallback`);
  return {
    text: `${topic} is an important component in this system. Let me explain how it works.`,
    scientificDetail: `${topic} plays a critical role in the overall function of the engine. It is designed to operate under extreme conditions and precise specifications to ensure optimal performance and reliability.`,
    suggestions: ['Explore its function in the system', 'Understand its interaction with other parts', 'Learn about its failure modes'],
    relatedTopics: ['Related systems', 'Energy transfer', 'Mechanical principles'],
    source: 'fallback',
  };
}

/**
 * Cache explanations in localStorage
 */
function getCached(topic: string): Explanation | null {
  try {
    const cached = localStorage.getItem(`aria_explain_${topic}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCached(topic: string, explanation: Explanation): void {
  try {
    localStorage.setItem(`aria_explain_${topic}`, JSON.stringify(explanation));
  } catch {
    // Silently fail if localStorage not available
  }
}

/**
 * Example usage:
 *
 * const explanation = await getExplanation('piston');
 * console.log(explanation.text);              // "A piston is..."
 * console.log(explanation.scientificDetail);  // Detailed explanation
 * console.log(explanation.suggestions);       // ["Learn about...", ...]
 *
 * // To speak (using ario):
 * await ario.speak(explanation.text);
 */
