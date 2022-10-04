# MongoDB

## Užduotis

Sumodeliuokite duomenų bazę tinkamą dokumentų modeliui (modelį pateikite grafiniu formatu). Parašykite programą, kuri atlieka operacijas pagal reikalavimus.

Dalykinėje srityje turi būti bent 3 esybės. Sumodeliuokite bent dvi atskirose kolekcijose, bent dvi esybės turinčios kompozicijos sąryšį turi būti modeliuojamos tame pačiame dokumente (angl. embedded).

Parašykite užklausas:

1) Įdėtinėms (angl. embedded) esybėms gauti (banko pavyzdžiu - visas, visų klientų sąskaitas).
2) Bent vieną agreguojančią užklausą (banko pavyzdžiu - visų klientų balansus)
3) Parašykite tą pačią agreguojančią užklausą (kaip ir #2 punkte) su map-reduce

Užduotį galima atlikti naudojant bet kurią programavimo kalbą. Nenaudokite banko dalykinės srities.

## Prerequisites

- Install [node.js](https://nodejs.org/en/)
- Install [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/): `brew install mongodb-community@6.0`

## Launch program

1. Install npm modules: `npm install`
2. Launch MongoDB server: `npm run startServer`
   - To stop the server run `npm run stopServer`
3. Execute the program: `npm run start`

### Demo

```bash
Collections in the "laboras" database: [ 'movies', 'actors', 'reviews' ]

---------

> Listing embeded "top_actors" and "recent_reviews" properties for a movie "movie 1":
Top actors (2):  [
  { _id: 'actor:1', name: 'Actor 1' },
  { _id: 'actor:2', name: 'Actor 2' }
]
Recent reviews (2): [
  { _id: 'review:1', rating: 5, text: 'Review for movie 1' },
  { _id: 'review:2', rating: 3, text: 'Review for movie 1' }
]

> Calculate average rating for "movie 1":
Average rating: 3.4
Number of ratings: 5

[
  { _id: 'movie:1', value: { averageRating: 3.4, ratingsCount: 5 } },
  { _id: 'movie:2', value: { averageRating: 1, ratingsCount: 5 } }
]

> Listing all reviews for a movie "movie 1":
[
  { text: 'Review for movie 1', rating: 5 },
  { text: 'Review for movie 1', rating: 3 },
  { text: 'Review for movie 1', rating: 3 },
  { text: 'Review for movie 1', rating: 3 },
  { text: 'Review for movie 1', rating: 3 }
]

> Before submiting a review: {
  _id: 'movie:1',
  title: 'movie 1',
  top_actors: [
    { _id: 'actor:1', name: 'Actor 1' },
    { _id: 'actor:2', name: 'Actor 2' }
  ],
  recent_reviews: [
    { _id: 'review:1', rating: 5, text: 'Review for movie 1' },
    { _id: 'review:2', rating: 3, text: 'Review for movie 1' }
  ]
}

> After submitting a review: {
  _id: 'movie:1',
  title: 'movie 1',
  top_actors: [
    { _id: 'actor:1', name: 'Actor 1' },
    { _id: 'actor:2', name: 'Actor 2' }
  ],
  recent_reviews: [
    { _id: 'review:2', rating: 3, text: 'Review for movie 1' },
    {
      _id: new ObjectId("633c9a1e600eff83b62e6b82"),
      rating: 11,
      text: 'Best of the best!'
    }
  ]
}

> Calculate average rating for "movie 1":
Average rating: 4.666666666666667
Number of ratings: 6
```
