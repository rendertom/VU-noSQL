# REDIS

## Užduotis

Sumodeliuokite raktas-reikšmė duomenų bazę bei parašykite ją naudojančią programą įgyvendindami šiuos reikalavimus:

1. Egzistuoja bent viena esybė su sudėtiniu raktų (pavyzdžiui: viešbučio kambariai pagal lokaciją ir numerį, žmonės pagal vardą ir pavardę, pastatai pagal adresą - miestą, gatvę, namo numerį). Toks raktas neturi būti prieštaringas, t.y. komponentai turi būti aiškiai išskirti ir vienų komponentų reikšmės neturi painiotis su kitų. Pavyzdžiui asmuo Jonas Vakaris Jonaitis, kurio vardas Jonas Vakaris, o pavardė Jonaitis, turi neturėti rakto kolizijos su asmeniu Jonas Vakaris Jonaitis, kurio vardas Jonas, o pavardė Vakaris Jonaitis.

2. Programoje turi egzistuoti viena ar daugiau transakcijų, jų įgyvendinimui panaudokite Redis atomines operacijas, MULTI transakcijas. Atsiskaitant reikia parodyti, kad panaudotos priemonės būtinos užtikrinti duomenų teisingumą.  Pavyzdžiui: (1) duomenų bazė laiko sąskaitas, leidžia pervesti pinigus iš vienos į kitą, nenueinant į minusą ir nepadarant klaidos; (2) viešbučių kambarių rezervavimo sistema užtikrina, kad du keliautojai nerezervuos to paties kambario; (3) bilietų rezervacijos sistema su nurodytais skirtingų klasių bilietais užtikrina, kad kiekvienoje klasėje nebus parduota daugiau bilietų, nei nurodytos ribos.

(Hint: https://redis.io/docs/manual/transactions/)

Programą įkelti abiems autoriams prieš atsiskaitant. Atsiskaitant reikės pakomentuoti programą ir veikimo mechanizmus, bei Redis pagrindus. Būkite pasiruošę!

## Prerequisites

- Install [node.js](https://nodejs.org/en/)
- Install [redis](https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/): `brew install redis`

## Launch program

1. Install npm modules: `npm install`
2. Launch redis server: `npm run startServer`
3. Launch redis monitor: `npm run monitor`
4. Execute the program: `npm run start`

### Demo

```bash
> Create a new user? Y/N: Y
  Enter first name: Lady
  Enter last name: Gaga
  Enter user balance: 100
  Created new user Lady Gaga
> Create a new user? Y/N: Y
  Enter first name: John
  Enter last name: Doe
  Enter user balance: 0
  Created new user John Doe
> Create a new user? Y/N: N
> Make a transfer? Y/N: Y
  From user: Lady Gaga
  To user: John Doe
  Amount to transfer: 50
  Transaction succeeded
  From user balance:  50
  To user balance:  50
```
