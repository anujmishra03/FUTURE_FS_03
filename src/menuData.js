const MENU_ITEMS = [
  // Signature Coffees
  {
    id: 1,
    name: 'Single-Origin Ethiopian Pour-Over',
    category: 'coffee',
    price: 5.50,
    description: 'Light roast with notes of bergamot, jasmine florals, and wild blueberry. Brewed to order via Chemex.',
    tags: ['Organic', 'Single Origin'],
    badge: "Barista's Choice"
  },
  {
    id: 2,
    name: 'Cardamom & Honey Cortado',
    category: 'coffee',
    price: 4.85,
    description: 'Double shot of house espresso, micro-steamed oat milk, crushed green cardamom pods, and raw wildflower honey.',
    tags: ['Organic'],
    badge: 'Signature'
  },
  {
    id: 3,
    name: 'Kyoto 16-Hour Cold Drip',
    category: 'coffee',
    price: 6.00,
    description: 'Slow-extracted drop by drop over 16 hours. Velvety body with chocolate and toasted hazelnut finish.',
    tags: ['Cold Brew'],
    badge: 'Popular'
  },
  {
    id: 4,
    name: 'Classic Flat White',
    category: 'coffee',
    price: 4.50,
    description: 'Ristretto espresso poured with silky textured whole milk or organic house oat milk.',
    tags: ['Organic'],
    badge: ''
  },

  // Artisan Teas
  {
    id: 5,
    name: 'Imperial Ceremonial Matcha Latte',
    category: 'tea',
    price: 6.25,
    description: 'Stone-ground Uji ceremonial grade matcha, lightly sweetened with pure organic maple syrup and steamed almond milk.',
    tags: ['Vegan', 'Antioxidant Rich'],
    badge: 'Top Rated'
  },
  {
    id: 6,
    name: 'Smoked Earl Grey Reserve',
    category: 'tea',
    price: 4.25,
    description: 'High-altitude Ceylon black tea scented with cold-pressed Calabrian bergamot and dried cornflower petals.',
    tags: ['Organic'],
    badge: ''
  },
  {
    id: 7,
    name: 'Lemongrass Ginger Tisane',
    category: 'tea',
    price: 4.25,
    description: 'Caffeine-free herbal blend of dried Thai lemongrass, crushed fresh ginger root, and peppermint leaves.',
    tags: ['Vegan', 'Gluten-Free', 'Caffeine-Free'],
    badge: 'Wellness'
  },

  // All-Day Brunch
  {
    id: 8,
    name: 'Truffled Smashed Avocado Toast',
    category: 'brunch',
    price: 13.50,
    description: 'Rustic sourdough bread, crushed Haas avocado, marinated heirloom cherry tomatoes, white truffle oil drizzle, and soft-poached free-range egg.',
    tags: ['Vegetarian'],
    badge: "Chef's Pick"
  },
  {
    id: 9,
    name: 'Slow-Simmered Shakshuka',
    category: 'brunch',
    price: 14.50,
    description: 'San Marzano tomatoes, roasted bell peppers, cumin, harissa, baked free-range eggs, crumbled Greek feta, served with grilled sourdough batard.',
    tags: ['Vegetarian', 'Gluten-Free Option'],
    badge: 'House Favorite'
  },
  {
    id: 10,
    name: 'Smoked Salmon Benedict',
    category: 'brunch',
    price: 16.00,
    description: 'House-smoked wild salmon, wilted organic baby spinach, poached eggs, Meyer lemon hollandaise on toasted brioche.',
    tags: ['Seafood'],
    badge: ''
  },
  {
    id: 11,
    name: 'Golden Brioche French Toast',
    category: 'brunch',
    price: 13.00,
    description: 'Thick-cut brioche soaked in vanilla bean custard, served with caramelized bananas, toasted pecans, and 100% Quebec maple syrup.',
    tags: ['Vegetarian'],
    badge: 'Sweet'
  },

  // Fresh Bakery & Pastries
  {
    id: 12,
    name: 'Artisan Sourdough Croissant',
    category: 'bakery',
    price: 4.25,
    description: 'Baked fresh every morning using French cultured butter. 72-hour lamination with crisp honeycomb layers.',
    tags: ['Vegetarian'],
    badge: 'Baked Daily'
  },
  {
    id: 13,
    name: 'Cardamom Pistachio Morning Bun',
    category: 'bakery',
    price: 4.95,
    description: 'Flaky croissant dough rolled with freshly ground green cardamom, cinnamon sugar, and crushed Sicilian pistachios.',
    tags: ['Vegetarian'],
    badge: 'Must Try'
  },
  {
    id: 14,
    name: 'Gluten-Free Almond Lemon Teacake',
    category: 'bakery',
    price: 4.75,
    description: 'Moist flourless cake made with blanched California almonds, infused with Meyer lemon zest and elderflower glaze.',
    tags: ['Gluten-Free', 'Dairy-Free'],
    badge: 'Gluten-Free'
  }
];

module.exports = { MENU_ITEMS };
