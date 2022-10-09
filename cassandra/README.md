# Cassandra

## Užduotis

Sumodeliuokite nesudėtingą sritį Cassandra duomenų bazėje. Parašykite programą naudojančią duomenų bazę ir leidžiančią atlikti kelias operacijas pasirinktoje srityje. Su programa pateikite duomenų modelio diagramą. Savybės sričiai:

1. Egzistuoja bent kelios esybės
2. Yra bent dvi savybės su vienas-su-daug sąryšiu
3. Panaudojimo atvejuose bent vienai esybei reikalingos kelios užklausos pagal skirtingus parametrus

Pavyzdžiui, banke saugome klientus, jų sąskaitas (vienas su daug sąryšis) ir kreditines korteles. Sąskaitų norime ieškoti pagal klientą (rasti visas jo sąskaitas) bei pagal sąskaitos numerį, klientų norime ieškoti pagal jų kliento ID arba asmens kodą. Kredito kortelių norime ieškoti pagal jų numerį, taip pat norime rasti sąskaitą susietą su konkrečia kortele.

Bent vienoje situacijoje prasmingai panaudokite Cassandra compare-and-set operacijas (hint: IF) INSERT ar UPDATE sakinyje. Pavyzdžiui, norime sukurti naują sąskaitą su kodu tik jei ji neegzistuoja. Norime pervesti pinigus, tik jei likutis pakankamas.

Užklausose **ALLOW FILTERING** naudoti negalima!

---

## Užduoties interpretacija

Užduočiai atlikti pasirinkta filmų sritis (alia IMDB), kurioje dalyvauja dvi esybės - aktoriai ir filmai.

---

## Duomenų modeliavimas Cassandra aplinkoje

- Išsiaiškinti srities reikalavimus.
- Nustatyti esybes bei jų tarpusavio ryšius - [Conceptual data model](#conceptual-data-model).
- Nustatyti sistemos reikalavimus ir užklausas - [Application workflow and access patterns](#application-workflow-and-access-patterns).
- Sudaryti duomenų lenteles - Logical data model.
- Padaryti taip, kad viskas veiktų - [Physical data model](#physical-data-model).
- Taisyti ir optimizuoti.

<p align="center">
  <img src="./diagrams/data modeling methodology.png" alt="Data modeling methodology" width="800"/>  
</p>

### Conceptual data model

Konceptinis duomenų modelis parodo, kokios esybės egzistuoja sistemoje, kaip jos tarpusavyje susijusios, ir kokius parametrus jos turi.

<p align="center">
  <img src="./diagrams/conceptual data model.png" alt="Conceptual data model" width="600"/>  
</p>

### Application workflow and access patterns

Šiame etape nustatyti sistemos reikalavimai bei užklausos:

- Q1: Show all films in the database
- Q2: Show film details
- Q3: Find films by title
- Q4: Find films by title released after a given date
- Q5: Find films featuring an actor
- Q6: Find films featuring an actor who played character by the given name
- Q7: Find films that has character by the given name
- Q8: Show all actors in the database
- Q9: Show actor details
- Q10: Find actors by the last name
- Q11: Find actors who played character by the given name
- Q12: Find actors who played in a move
- Q13: Find all characters in the movie
- Q14: Find all characters played by the actor

<p align="center">
  <img src="./diagrams/application workflow and access patterns.png" alt="Application workflow and access patterns" width="600"/>  
</p>

### Physical data model

Fiziniame duomenų lygmenyje pateikiamos visos reikalingos lentelės bei atributai su nurodytais tipais.

Lentelės ir jų atributai buvo supaprastinti iki minimumo, nadangi duomenys į lenteles buvo suvedami rankiniu būdu:

- `actorID` ir `filmID` atributai turėtų būti pateikti kaip `TIMEUUID` tipai. Tai užtikrintų kiekvienos lentelės unikalumą bei būtų galima atsekti, kuriuo metu buvo sukurtas objektas. Tačiau buvo pasirinktas `INT` tipas, nes lenteles reikėjo pildyti rankiniu būdu, kur `INT` buvo naudoti paprasčiau nei kad `TIMEUUID`.

- Visose lentelėse palikti tik *svarbiausi* atributai, kurie reikalingi kad užtikrinti pilnavertį sistemos darbą. Lentlės galėtų būti papildytos papildomais atributais, tačiau tai apsunkintų rankinį duomenų suvedimą.

<p align="center">
  <img src="./diagrams/physical data model.png" alt="physical data model" width="700"/>  
</p>

---

## Prerequisites

- Install [node.js](https://nodejs.org/en/)
- Install [Cassandra](https://www.javatpoint.com/how-to-install-cassandra-on-mac): `brew install cassandra`
- You probably need Java installed as well. I don't know.

## Launch program

1. Install npm modules: `npm install`
2. Launch MongoDB server: `npm run startServer`
3. Execute the program: `npm run start`

### Demo

```bash
> Start building tables
  Created characters_by_actor table
  Created actors_by_character table
  Created characters_by_film table
  Created actors_by_film table
  Created films_by_actor table
  Created actors table
  Created actors_by_lastName table
  Created films table
  Created films_by_character table
  Created films_by_title table
> End building tables

> Q1: Show all films in the database:
{ filmid: 5, releasedate: 2005-01-01T00:00:00.000Z, title: 'title:1' }
{ filmid: 1, releasedate: 2001-01-01T00:00:00.000Z, title: 'title:1' }
{ filmid: 2, releasedate: 2002-01-01T00:00:00.000Z, title: 'title:2' }
{ filmid: 4, releasedate: 2004-01-01T00:00:00.000Z, title: 'title:4' }
{ filmid: 3, releasedate: 2003-01-01T00:00:00.000Z, title: 'title:3' }

> Q2: Show film details (filmID = 1):
{ filmid: 1, releasedate: 2001-01-01T00:00:00.000Z, title: 'title:1' }

> Q3: Find films by title (title = "title:1"):
{ title: 'title:1', releasedate: 2005-01-01T00:00:00.000Z, filmid: 5 }
{ title: 'title:1', releasedate: 2001-01-01T00:00:00.000Z, filmid: 1 }

> Q4: Find films by title (title = "title:1") released after 2004-01-01:
{ title: 'title:1', releasedate: 2005-01-01T00:00:00.000Z, filmid: 5 }

> Q5: Find films featuring an actor (actorID = 1):
{ actorid: 1, character: 'character:1', title: 'title:1', filmid: 1 }
{ actorid: 1, character: 'character:2', title: 'title:2', filmid: 2 }
{ actorid: 1, character: 'character:3', title: 'title:3', filmid: 3 }
{ actorid: 1, character: 'character:4', title: 'title:4', filmid: 4 }
{ actorid: 1, character: 'character:5', title: 'title:1', filmid: 5 }

> Q6: Find films featuring an actor (actorID = 1) who played character by the name "character:6":
{ actorid: 2, character: 'character:6', title: 'title:1', filmid: 1 }
{ actorid: 2, character: 'character:6', title: 'title:3', filmid: 3 }

> Q7: Find films that has character by name "character:6":
{
  character: 'character:6',
  title: 'title:1',
  filmid: 1,
  actorid: 2,
  lastname: 'lastName:2'
}
{
  character: 'character:6',
  title: 'title:3',
  filmid: 3,
  actorid: 2,
  lastname: 'lastName:2'
}

> Q8: Show all actors in the database:
{ actorid: 5, lastname: 'lastName:4' }
{ actorid: 1, lastname: 'lastName:1' }
{ actorid: 2, lastname: 'lastName:2' }
{ actorid: 4, lastname: 'lastName:1' }
{ actorid: 3, lastname: 'lastName:3' }

> Q9: Show actor details (actorID = 1)
{ actorid: 1, lastname: 'lastName:1' }

> Q10: Find actors by the lastname "lastName:1"
{ lastname: 'lastName:1', actorid: 4 }
{ lastname: 'lastName:1', actorid: 1 }

> Q11: Find actors who played character by the name "character:7"
{
  character: 'character:7',
  actorid: 2,
  filmid: 4,
  lastname: 'lastName:2',
  title: 'title:4'
}
{
  character: 'character:7',
  actorid: 2,
  filmid: 5,
  lastname: 'lastName:2',
  title: 'title:1'
}
{
  character: 'character:7',
  actorid: 4,
  filmid: 1,
  lastname: 'lastName:1',
  title: 'title:1'
}
{
  character: 'character:7',
  actorid: 4,
  filmid: 3,
  lastname: 'lastName:1',
  title: 'title:3'
}

> Q12: Find actors who played in move (movieID = 3):
{
  filmid: 3,
  lastname: 'lastName:1',
  actorid: 1,
  character: 'character:3',
  title: 'title:3'
}
{
  filmid: 3,
  lastname: 'lastName:1',
  actorid: 4,
  character: 'character:7',
  title: 'title:3'
}
{
  filmid: 3,
  lastname: 'lastName:2',
  actorid: 2,
  character: 'character:6',
  title: 'title:3'
}

> Q13: Find all characters in the movie (movieID = 1)
{
  filmid: 1,
  character: 'character:1',
  title: 'title:1',
  actorid: 1,
  lastname: 'lastName:1'
}
{
  filmid: 1,
  character: 'character:2',
  title: 'title:1',
  actorid: 3,
  lastname: 'lastName:3'
}
{
  filmid: 1,
  character: 'character:6',
  title: 'title:1',
  actorid: 2,
  lastname: 'lastName:2'
}
{
  filmid: 1,
  character: 'character:7',
  title: 'title:1',
  actorid: 4,
  lastname: 'lastName:1'
}

> Q14: Find all characters played by actor (actorID = 1)
{
  actorid: 1,
  character: 'character:1',
  title: 'title:1',
  filmid: 1,
  lastname: 'lastName:1'
}
{
  actorid: 1,
  character: 'character:2',
  title: 'title:2',
  filmid: 2,
  lastname: 'lastName:1'
}
{
  actorid: 1,
  character: 'character:3',
  title: 'title:3',
  filmid: 3,
  lastname: 'lastName:1'
}
{
  actorid: 1,
  character: 'character:4',
  title: 'title:4',
  filmid: 4,
  lastname: 'lastName:1'
}
{
  actorid: 1,
  character: 'character:5',
  title: 'title:1',
  filmid: 5,
  lastname: 'lastName:1'
}
```
