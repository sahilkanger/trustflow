/**
 * Lightweight sentiment analysis — no external API dependency.
 * Runs on every testimonial submission to score sentiment.
 * Businesses on AI-enhanced plans get richer insights.
 */

const POSITIVE_WORDS = new Set([
  "amazing", "awesome", "best", "brilliant", "excellent", "exceptional",
  "fantastic", "great", "incredible", "love", "loved", "outstanding",
  "perfect", "phenomenal", "recommend", "remarkable", "superb", "terrific",
  "transformed", "wonderful", "easy", "fast", "helpful", "impressive",
  "intuitive", "reliable", "seamless", "smooth", "stellar", "thrilled",
  "delighted", "grateful", "happy", "pleased", "satisfied", "thank",
  "thanks", "joy", "beautiful", "clean", "elegant", "powerful",
  "efficient", "effective", "game-changer", "revolutionary", "innovative",
]);

const NEGATIVE_WORDS = new Set([
  "awful", "bad", "broken", "buggy", "complicated", "confusing",
  "disappointing", "disaster", "fail", "failed", "frustrating", "hate",
  "horrible", "issue", "issues", "lack", "missing", "nightmare", "poor",
  "problem", "problems", "slow", "terrible", "ugly", "uncomfortable",
  "unreliable", "useless", "waste", "worse", "worst", "annoying",
  "clunky", "difficult", "error", "errors", "glitch", "mediocre",
]);

const INTENSIFIERS = new Set([
  "very", "really", "extremely", "absolutely", "incredibly", "highly",
  "totally", "completely", "truly", "super",
]);

const NEGATORS = new Set([
  "not", "no", "never", "neither", "nobody", "nothing", "nowhere",
  "hardly", "barely", "doesn't", "don't", "didn't", "won't", "wouldn't",
  "couldn't", "shouldn't", "isn't", "aren't", "wasn't", "weren't",
]);

export function analyzeSentiment(text: string): {
  score: number; // -1 to 1
  summary: string;
} {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : "";
    const isNegated = NEGATORS.has(prevWord);
    const isIntensified = INTENSIFIERS.has(prevWord);
    const multiplier = isIntensified ? 1.5 : 1;

    if (POSITIVE_WORDS.has(word)) {
      if (isNegated) {
        score -= 0.5 * multiplier;
        negativeCount++;
      } else {
        score += 1 * multiplier;
        positiveCount++;
      }
    } else if (NEGATIVE_WORDS.has(word)) {
      if (isNegated) {
        score += 0.5 * multiplier;
        positiveCount++;
      } else {
        score -= 1 * multiplier;
        negativeCount++;
      }
    }
  }

  // Normalize to -1 to 1
  const totalSignals = positiveCount + negativeCount;
  const normalizedScore =
    totalSignals === 0
      ? 0
      : Math.max(-1, Math.min(1, score / (totalSignals * 1.2)));

  // Generate summary
  let summary: string;
  if (normalizedScore > 0.5) {
    summary = "Highly positive testimonial expressing strong satisfaction";
  } else if (normalizedScore > 0.2) {
    summary = "Positive testimonial with favorable feedback";
  } else if (normalizedScore > -0.2) {
    summary = "Neutral or mixed feedback";
  } else if (normalizedScore > -0.5) {
    summary = "Mildly negative feedback with some concerns";
  } else {
    summary = "Negative testimonial expressing dissatisfaction";
  }

  return {
    score: Math.round(normalizedScore * 100) / 100,
    summary,
  };
}
