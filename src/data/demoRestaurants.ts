
import type { Restaurant } from '../types';

// Demo restaurants for development/testing
export const demoRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Sushi Delight',
    vicinity: '123 Main St, City',
    rating: 4.7,
    user_ratings_total: 345,
    price_level: 3,
    photos: [{ photo_reference: 'demo1', width: 400, height: 300 }],
    geometry: { location: { lat: 35.658, lng: 139.701 } },
    opening_hours: { open_now: true },
    types: ['restaurant', 'food', 'japanese'],
    distance: 450,
    duration: 320,
    reviews: [
      {
        author_name: 'John D.',
        rating: 5,
        text: 'Amazing fresh sushi! The chef really knows his craft. Loved the ambiance too.',
        time: 1623459876,
        relative_time_description: '2 months ago'
      }
    ],
    reviewSummary: 'Exceptional fresh sushi with great atmosphere. Known for omakase sets and attentive service.'
  },
  {
    id: 'r2',
    name: 'Burger Factory',
    vicinity: '456 Oak St, City',
    rating: 4.2,
    user_ratings_total: 213,
    price_level: 2,
    photos: [{ photo_reference: 'demo2', width: 400, height: 300 }],
    geometry: { location: { lat: 35.659, lng: 139.702 } },
    opening_hours: { open_now: true },
    types: ['restaurant', 'food', 'burger'],
    distance: 650,
    duration: 520,
    reviews: [
      {
        author_name: 'Mary S.',
        rating: 4,
        text: 'Juicy burgers and great fries. Can get crowded during lunch.',
        time: 1629459876,
        relative_time_description: '1 month ago'
      }
    ],
    reviewSummary: 'Popular burger spot with quality ingredients. Best known for their specialty burgers and craft beers.'
  },
  {
    id: 'r3',
    name: 'Pasta Palace',
    vicinity: '789 Elm St, City',
    rating: 4.5,
    user_ratings_total: 187,
    price_level: 3,
    photos: [{ photo_reference: 'demo3', width: 400, height: 300 }],
    geometry: { location: { lat: 35.657, lng: 139.703 } },
    opening_hours: { open_now: false },
    types: ['restaurant', 'food', 'italian'],
    distance: 850,
    duration: 720,
    reviews: [
      {
        author_name: 'Robert T.',
        rating: 5,
        text: 'Authentic Italian pasta! The carbonara is to die for.',
        time: 1625459876,
        relative_time_description: '3 weeks ago'
      }
    ],
    reviewSummary: 'Authentic Italian pasta restaurant with homemade noodles. Known for carbonara and intimate dining experience.'
  },
  {
    id: 'r4',
    name: 'Vegan Vitality',
    vicinity: '101 Pine St, City',
    rating: 4.3,
    user_ratings_total: 156,
    price_level: 2,
    photos: [{ photo_reference: 'demo4', width: 400, height: 300 }],
    geometry: { location: { lat: 35.656, lng: 139.704 } },
    opening_hours: { open_now: true },
    types: ['restaurant', 'food', 'vegan', 'vegetarian'],
    distance: 950,
    duration: 820,
    reviews: [
      {
        author_name: 'Lisa M.',
        rating: 4,
        text: 'Creative vegan dishes that don\'t compromise on taste. The jackfruit tacos are amazing!',
        time: 1627459876,
        relative_time_description: '2 weeks ago'
      }
    ],
    reviewSummary: 'Creative plant-based menu with seasonal ingredients. Excellent for vegans and vegetarians with gluten-free options.'
  },
  {
    id: 'r5',
    name: 'Spice Garden',
    vicinity: '202 Cedar St, City',
    rating: 4.6,
    user_ratings_total: 278,
    price_level: 2,
    photos: [{ photo_reference: 'demo5', width: 400, height: 300 }],
    geometry: { location: { lat: 35.655, lng: 139.705 } },
    opening_hours: { open_now: true },
    types: ['restaurant', 'food', 'indian'],
    distance: 1050,
    duration: 920,
    reviews: [
      {
        author_name: 'David W.',
        rating: 5,
        text: 'Best Indian food in the city! The butter chicken is phenomenal and the naan bread is so fluffy.',
        time: 1624459876,
        relative_time_description: '1 month ago'
      }
    ],
    reviewSummary: 'Authentic Indian cuisine with extensive menu. Known for rich curries, fresh naan, and accommodating spice levels.'
  }
];
