module.exports = [
  {
    _id: 'movie:1',
    title: 'movie 1',
    top_actors: [
      { _id: 'actor:1', name: 'Actor 1' },
      { _id: 'actor:2', name: 'Actor 2' },
    ],
    recent_reviews: [
      { _id: 'review:1', rating: 5, text: 'Review for movie 1' },
      { _id: 'review:2', rating: 3, text: 'Review for movie 1' },
    ],
  },
  {
    _id: 'movie:2',
    title: 'movie 2',
    top_actors: [{ _id: 'actor:3', name: 'Actor 3' }],
    recent_reviews: [{ _id: 'review:6', rating: 1, text: 'Review for movie 2' }],
  },
];
