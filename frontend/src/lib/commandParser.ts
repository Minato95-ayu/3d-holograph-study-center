/**
 * ARIA Voice Command Parser
 * Converts voice input to structured commands
 * Format: "ARIA, [verb] [object] [parameters]"
 */

export type CommandVerb =
  | 'show'
  | 'add'
  | 'remove'
  | 'zoom'
  | 'rotate'
  | 'run'
  | 'reset'
  | 'save'
  | 'explain'
  | 'compare'
  | 'help'
  | 'level'
  | 'stop'
  | 'explode'
  | 'assemble';

export interface Command {
  verb: CommandVerb;
  object?: string;
  target?: string;
  direction?: 'in' | 'out' | 'left' | 'right' | 'up' | 'down';
  level?: number;
  parameters?: Record<string, any>;
  confidence: number;
  rawInput: string;
}

/**
 * Regex patterns for common voice commands
 * Ordered by likelihood of use
 */
const COMMAND_PATTERNS: Record<CommandVerb, RegExp> = {
  show: /(?:show|display|reveal|bring.*up|dikhao|dekhao|dikhao me)\s+(?:me\s+)?(?:a\s+)?(?:the\s+)?([\w\s]+)/i,
  explain: /(?:explain|tell\s+me|describe|what\s+is|samjhao|batao|kya\s+hai)\s+(?:the\s+)?([\w\s]+)/i,
  zoom: /(?:zoom|ander\s+jao|baahar\s+aao|zoom\s+karo)\s+(?:in(?:to)?|out|to)\s+(?:the\s+)?([\w\s]+)?/i,
  rotate: /(?:rotate|ghumao|ghuma\s+do)\s+(?:the\s+engine\s+)?([\w\s]+)?\s*(?:left|right)?/i,
  run: /(?:run|start|execute|begin|shuru\s+karo|chalao)\s+(?:the\s+)?(?:simulation|experiment|test)/i,
  add: /(?:add|jodo|lagao)\s+(?:a\s+)?(?:the\s+)?([\w\s]+)/i,
  remove: /(?:remove|delete|detach|take\s+out|hatao|nikalo)\s+(?:the\s+)?([\w\s]+)/i,
  reset: /(?:reset|restart|clear|dubara\s+shuru|saaf\s+karo)/i,
  save: /(?:save|store|export|mehfooz|surakshit)\s+(?:the\s+)?(?:results|data|experiment)?/i,
  compare: /(?:compare|compare\s+with|versus|muqabla|tulna)\s+(?:the\s+)?([\w\s]+)?/i,
  level: /(?:go\s+to|change\s+to|switch\s+to)\s+(cell|tissue|organ|system|organism)\s+(?:level)?/i,
  stop: /(?:stop|pause|halt|cancel|ruko|bas)/i,
  help: /(?:help|what\s+can\s+you\s+do|how\s+do\s+i|guide|madad)/i,
  explode: /(?:explode|disassemble|open\s+model|kholo)/i,
  assemble: /(?:assemble|close\s+model|band\s+karo)/i,
};

// Known experiment objects defined in COMMAND_PATTERNS


/**
 * Parse voice input into a structured command
 * Uses regex patterns first for speed, falls back to fuzzy matching
 */
export function parseCommand(input: string): Command {
  const normalized = input.toLowerCase().trim();

  // Remove "aria" prefix if present
  const cleanInput = normalized.replace(/^aria\s*[,:]?\s*/i, '').trim();

  console.log(`🎤 Parsing: "${cleanInput}"`);

  // Try each pattern
  for (const [verb, pattern] of Object.entries(COMMAND_PATTERNS)) {
    const match = cleanInput.match(pattern);
    if (match) {
      const command: Command = {
        verb: verb as CommandVerb,
        object: match[1] ? match[1].toLowerCase() : undefined,
        confidence: 0.95,
        rawInput: input,
      };

      // Extract direction for zoom/rotate commands
      if (verb === 'zoom') {
        if (/in/.test(cleanInput)) command.direction = 'in';
        else if (/out/.test(cleanInput)) command.direction = 'out';
      }

      if (verb === 'rotate') {
        if (/left/.test(cleanInput)) command.direction = 'left';
        else if (/right/.test(cleanInput)) command.direction = 'right';
      }

      console.log(`✅ Matched ${verb}:`, command);
      return command;
    }
  }

  // If no pattern matched, try fuzzy matching on first word
  const firstWord = cleanInput.split(/\s+/)[0];
  const bestMatch = findClosestVerb(firstWord);

  if (bestMatch.confidence > 0.6) {
    return {
      verb: bestMatch.verb,
      confidence: bestMatch.confidence,
      rawInput: input,
    };
  }

  // Default to "show" if completely unknown
  console.warn(`⚠️ Unknown command: "${cleanInput}", defaulting to 'show'`);
  return {
    verb: 'show',
    confidence: 0.3,
    rawInput: input,
  };
}

/**
 * Find the closest verb using Levenshtein distance
 */
function findClosestVerb(
  word: string
): { verb: CommandVerb; confidence: number } {
  let best = { verb: 'show' as CommandVerb, distance: Infinity };

  for (const verb of Object.keys(COMMAND_PATTERNS) as CommandVerb[]) {
    const distance = levenshteinDistance(word, verb);
    if (distance < best.distance) {
      best = { verb, distance };
    }
  }

  // Convert distance to confidence (0-1)
  const confidence = Math.max(0, 1 - best.distance / 5);
  return { verb: best.verb, confidence };
}

/**
 * Calculate Levenshtein distance between two strings
 * (Minimal edits needed to transform one to other)
 */
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Execute a parsed command
 * (To be called from the main App component)
 */
export async function executeCommand(
  command: Command,
  callbacks: {
    onShow?: (object: string) => void;
    onExplain?: (object: string) => void;
    onZoom?: (direction: string, target?: string) => void;
    onRotate?: (direction: string) => void;
    onRun?: () => void;
    onAdd?: (object: string) => void;
    onRemove?: (object: string) => void;
    onReset?: () => void;
    onSave?: () => void;
    onCompare?: () => void;
    onLevel?: (level: string) => void;
    onStop?: () => void;
  }
): Promise<void> {
  console.log(`⚡ Executing command:`, command);

  switch (command.verb) {
    case 'show':
      callbacks.onShow?.(command.object || 'engine');
      break;

    case 'explain':
      callbacks.onExplain?.(command.object || 'engine');
      break;

    case 'zoom':
      callbacks.onZoom?.(command.direction || 'in', command.object);
      break;

    case 'rotate':
      callbacks.onRotate?.(command.direction || 'right');
      break;

    case 'run':
      callbacks.onRun?.();
      break;

    case 'add':
      callbacks.onAdd?.(command.object || 'component');
      break;

    case 'remove':
      callbacks.onRemove?.(command.object || 'component');
      break;

    case 'reset':
      callbacks.onReset?.();
      break;

    case 'save':
      callbacks.onSave?.();
      break;

    case 'compare':
      callbacks.onCompare?.();
      break;

    case 'level':
      callbacks.onLevel?.(command.object || 'system');
      break;

    case 'stop':
      callbacks.onStop?.();
      break;

    case 'help':
      console.log(getHelpText());
      break;
  }
}

/**
 * Get helpful information about available commands
 */
function getHelpText(): string {
  return `
ARIA Lab - Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 VIEW COMMANDS:
  • "Show me an engine"
  • "Explain the piston"
  • "Zoom into cylinder"
  • "Rotate left/right"

⚙️  EXPERIMENT COMMANDS:
  • "Add turbo"
  • "Remove valve"
  • "Run the simulation"
  • "Reset the lab"

💾 DATA COMMANDS:
  • "Save results"
  • "Compare engines"
  • "Stop simulation"

Try saying: "ARIA, show me an engine"
`;
}

/**
 * Example usage:
 *
 * const input = "show me a car engine";
 * const command = parseCommand(input);
 *
 * await executeCommand(command, {
 *   onShow: (obj) => console.log(`Loading ${obj}`),
 *   onExplain: (obj) => console.log(`Explaining ${obj}`),
 *   onRun: () => console.log("Running simulation"),
 * });
 */
