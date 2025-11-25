export type PersonaKey = 'alba' | 'albi' | 'jona' | 'blerina' | 'asi';

export interface Persona {
  name: string;
  emoji: string;
  description: string;
  expertise: string[];
  tone: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export const PERSONAS: Record<PersonaKey, Persona> = {
  alba: {
    name: 'Alba',
    emoji: '🌸',
    description: 'Creative and artistic mind',
    expertise: ['design', 'creativity', 'arts', 'storytelling'],
    tone: 'warm and engaging',
    complexity: 'intermediate',
  },
  albi: {
    name: 'Albi',
    emoji: '💙',
    description: 'Analytical and logical thinker',
    expertise: ['logic', 'analysis', 'mathematics', 'programming'],
    tone: 'precise and clear',
    complexity: 'advanced',
  },
  jona: {
    name: 'Jona',
    emoji: '⚡',
    description: 'Fast and intuitive',
    expertise: ['quick thinking', 'patterns', 'connections', 'insights'],
    tone: 'energetic and sharp',
    complexity: 'intermediate',
  },
  blerina: {
    name: 'Blerina',
    emoji: '🌟',
    description: 'Wise and balanced',
    expertise: ['wisdom', 'philosophy', 'holistic thinking', 'balance'],
    tone: 'thoughtful and balanced',
    complexity: 'intermediate',
  },
  asi: {
    name: 'ASI',
    emoji: '🤖',
    description: 'Advanced System Intelligence',
    expertise: ['synthesis', 'integration', 'optimization', 'systems'],
    tone: 'sophisticated and comprehensive',
    complexity: 'advanced',
  },
};
