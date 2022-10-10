# MongoDB

## Užduotis

Sumodeliuokite duomenų bazę tinkamą dokumentų modeliui (modelį pateikite grafiniu formatu). Parašykite programą, kuri atlieka operacijas pagal reikalavimus.

Dalykinėje srityje turi būti bent 3 esybės. Sumodeliuokite bent dvi atskirose kolekcijose, bent dvi esybės turinčios kompozicijos sąryšį turi būti modeliuojamos tame pačiame dokumente (angl. embedded).

Parašykite užklausas:

1) Įdėtinėms (angl. embedded) esybėms gauti (banko pavyzdžiu - visas, visų klientų sąskaitas).
2) Bent vieną agreguojančią užklausą (banko pavyzdžiu - visų klientų balansus)
3) Parašykite tą pačią agreguojančią užklausą (kaip ir #2 punkte) su map-reduce

Užduotį galima atlikti naudojant bet kurią programavimo kalbą. Nenaudokite banko dalykinės srities.

---

![ER diagram](./diagrams/ER%20diagram.png)

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
> Collections in the "laboras" database:
[ 'reviews', 'movies' ]

> Listing embeded "recent_reviews" and "studio" properties for a movie "movie 1":
Recent reviews (2): [
  { rating: 5, reviewID: 'review:1', text: 'Review for movie 1' },
  { rating: 3, reviewID: 'review:2', text: 'Review for movie 1' }
]
Studio: {
  address: 'Vasaros g. 5',
  director: 'Dėdė Vania',
  title: 'Bobų vasara'
}

> Calculate average rating using aggregation:
movie 1:
  Average rating: 3.4
  Number of ratings: 5
movie 2:
  Average rating: 1
  Number of ratings: 5

> Calculate average rating using mapReduce:
[
  { _id: 'movie:1', value: { averageRating: 3.4, ratingsCount: 5 } },
  { _id: 'movie:2', value: { averageRating: 1, ratingsCount: 5 } }
]

> Listing all reviews for a movie "movie 1":
[
  { rating: 5, text: 'Review for movie 1' },
  { rating: 3, text: 'Review for movie 1' },
  { rating: 3, text: 'Review for movie 1' },
  { rating: 3, text: 'Review for movie 1' },
  { rating: 3, text: 'Review for movie 1' }
]

> Movie "movie 1" BEFORE submiting a review:
{
  _id: 'movie:1',
  director: 'Dėdė Vania',
  recent_reviews: [
    { rating: 5, reviewID: 'review:1', text: 'Review for movie 1' },
    { rating: 3, reviewID: 'review:2', text: 'Review for movie 1' }
  ],
  releaseDate: '2000-01-01',
  studio: {
    address: 'Vasaros g. 5',
    director: 'Dėdė Vania',
    title: 'Bobų vasara'
  },
  title: 'movie 1'
}

> Movie "movie 1" AFTER submiting a review:
{
  _id: 'movie:1',
  director: 'Dėdė Vania',
  recent_reviews: [
    {
      rating: 11,
      reviewID: new ObjectId("633dc254cd673ca7d57356e3"),
      text: 'Best of the best!'
    },
    { rating: 5, reviewID: 'review:1', text: 'Review for movie 1' }
  ],
  releaseDate: '2000-01-01',
  studio: {
    address: 'Vasaros g. 5',
    director: 'Dėdė Vania',
    title: 'Bobų vasara'
  },
  title: 'movie 1'
}

> Calculate average rating using aggregation:
movie 1:
  Average rating: 4.666666666666667
  Number of ratings: 6
movie 2:
  Average rating: 1
  Number of ratings: 5
```
