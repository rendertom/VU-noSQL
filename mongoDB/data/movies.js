module.exports = [
  {
    _id: 'movie:1',
    director: 'Dėdė Vania',
    recent_reviews: [
      { rating: 5, reviewID: 'review:1', text: 'Review for movie 1' },
      { rating: 3, reviewID: 'review:2', text: 'Review for movie 1' },
    ],
    releaseDate: '2000-01-01',
    studio: {
      address: 'Vasaros g. 5',
      director: 'Dėdė Vania',
      title: 'Bobų vasara'
    },
    title: 'movie 1',
  },
  {
    _id: 'movie:2',
    director: 'Teta Zita',
    recent_reviews: [
      { rating: 1, reviewID: 'review:6', text: 'Review for movie 2' },
    ],
    releaseDate: '2022-02-02',
    studio: {
      address: 'Lukiškių g. 2',
      director: 'Kalėjimo prižiūrėtojas',
      title: 'Karceris'
    },
    title: 'movie 2',
  },
];
