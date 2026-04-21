// Curated gentle daily affirmations for MindBloom
export const affirmations = [
  "You are doing better than you think.",
  "It's okay to rest. You don't have to earn calm.",
  "Small steps still move you forward.",
  "Your feelings are valid, exactly as they are.",
  "You are worthy of softness today.",
  "Breathe — this moment is enough.",
  "You don't have to carry everything alone.",
  "Gentleness with yourself is strength.",
  "Even on quiet days, you are growing.",
  "You are allowed to take up space.",
  "This feeling will pass, like all weather does.",
  "You are loved, more than you realize.",
  "Progress is not always loud. Yours counts too.",
  "It's safe to slow down.",
  "You are not behind. You are right where you need to be.",
];

export function getAffirmationForToday(): string {
  // Stable per-day pick so it feels like a "daily" message
  const today = new Date();
  const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  return affirmations[seed % affirmations.length];
}
