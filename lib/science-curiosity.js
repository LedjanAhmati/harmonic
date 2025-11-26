// lib/science-curiosity.js - Open Source Science & Curiosity Data
// Facts from Wikipedia, OpenStax, and other open sources

export class ScienceCuriosity {
  constructor() {
    this.facts = [
      // Physics
      {
        id: 'phys_001',
        category: 'Physics',
        fact: 'Light travels at 299,792,458 meters per second in vacuum',
        source: 'OpenStax Physics',
        verified: true,
        year: 2023
      },
      {
        id: 'phys_002',
        category: 'Physics',
        fact: 'A neutron star is so dense that a teaspoon would weigh 6 billion tons',
        source: 'NASA Open Science',
        verified: true,
        year: 2023
      },
      // Biology
      {
        id: 'bio_001',
        category: 'Biology',
        fact: 'The human brain contains approximately 86 billion neurons',
        source: 'Nature Neuroscience',
        verified: true,
        year: 2023
      },
      {
        id: 'bio_002',
        category: 'Biology',
        fact: 'DNA has a double helix structure discovered by Watson, Crick, and Franklin',
        source: 'OpenStax Biology',
        verified: true,
        year: 2023
      },
      // Chemistry
      {
        id: 'chem_001',
        category: 'Chemistry',
        fact: 'Water has a molecular weight of 18.015 g/mol (H2O)',
        source: 'NIST Open Data',
        verified: true,
        year: 2023
      },
      {
        id: 'chem_002',
        category: 'Chemistry',
        fact: 'Gold is element 79 with atomic number 79',
        source: 'Wikipedia Chemistry',
        verified: true,
        year: 2023
      },
      // Space
      {
        id: 'space_001',
        category: 'Space',
        fact: 'The Earth is approximately 4.54 billion years old',
        source: 'USGS Open Science',
        verified: true,
        year: 2023
      },
      {
        id: 'space_002',
        category: 'Space',
        fact: 'A year on Mars is 687 Earth days',
        source: 'NASA Open Data',
        verified: true,
        year: 2023
      },
      // Technology
      {
        id: 'tech_001',
        category: 'Technology',
        fact: 'The first computer bug was an actual moth in 1947',
        source: 'Wikipedia History',
        verified: true,
        year: 2023
      },
      {
        id: 'tech_002',
        category: 'Technology',
        fact: 'The internet was created by Tim Berners-Lee in 1989',
        source: 'Open History',
        verified: true,
        year: 2023
      },
      // Medicine
      {
        id: 'med_001',
        category: 'Medicine',
        fact: 'Penicillin was discovered by Alexander Fleming in 1928',
        source: 'OpenStax Medicine',
        verified: true,
        year: 2023
      },
      {
        id: 'med_002',
        category: 'Medicine',
        fact: 'The average human heart beats 100,000 times per day',
        source: 'NIH Open Health Data',
        verified: true,
        year: 2023
      }
    ];

    this.categories = [
      'Physics',
      'Chemistry',
      'Biology',
      'Space',
      'Technology',
      'Medicine',
      'Earth Science',
      'Astronomy'
    ];
  }

  /**
   * Get first science fact (deterministic, no random)
   */
  getRandomFact() {
    return this.facts[0] || null;
  }

  /**
   * Get facts by category
   */
  getFactsByCategory(category) {
    return this.facts.filter(f => f.category === category);
  }

  /**
   * Search facts by keyword
   */
  searchFacts(keyword) {
    const search = keyword.toLowerCase();
    return this.facts.filter(f =>
      f.fact.toLowerCase().includes(search) ||
      f.category.toLowerCase().includes(search)
    );
  }

  /**
   * Get all categories
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Get interesting trivia (deterministic - first N facts)
   */
  getTrivia(count = 5) {
    return this.facts.slice(0, count);
  }

  /**
   * Get daily fact (based on date)
   */
  getDailyFact(date = new Date()) {
    const day = date.getDate();
    return this.facts[day % this.facts.length];
  }

  /**
   * Add new fact (for expansion)
   */
  addFact(fact, category, source, verified = false) {
    const id = `${category.toLowerCase().slice(0, 4)}_${this.facts.length.toString().padStart(3, '0')}`;
    this.facts.push({
      id,
      category,
      fact,
      source,
      verified,
      year: new Date().getFullYear()
    });
    return { id, status: 'added' };
  }

  /**
   * Get statistics about facts
   */
  getStats() {
    return {
      totalFacts: this.facts.length,
      totalCategories: this.categories.length,
      verifiedFacts: this.facts.filter(f => f.verified).length,
      sources: [...new Set(this.facts.map(f => f.source))].length,
      lastUpdated: new Date().toISOString()
    };
  }
}

export default new ScienceCuriosity();
