
# Project Name

## Overview

This client-side JavaScript web application provides a convenient way for group members to keep track of events.
It lets users sign up for public events and keep track of events they're attending.

Developed for the COMP 1800 course, applying User-Centred Design practices, agile project management processes, and Firebase backend services.

---

## Features

Example:
- Create events with optional tags
- List events as private/public
- Sign up for events
- Search for events
  - Filter by tags
  - Search inside title and description

---

## Technologies Used

Example:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase for hosting
- **Database**: Firestore
- **API**: OpenWeatherMap API
- **Other Libraries**: 
  - @algolia/autocomplete-js
  - date-fns
  - @fastify/deepmerge
  - @fortawesome/fontawesome-svg-core
  - add-to-calendar-button
  - cally
  - dotenv
  - tailwindcss
  - zustand
  - daisyui
- **Dev Dependencies**:
  - vite
  - eslint
---

## Usage

Example:
1. Run `npm i`
2. Run `npm run dev`
3. Open your browser and visit `http://localhost:5173`

---

## Project Structure

Example:
```
CalSync/
├── src/
│   ├── assets/
│   │   └── ...
│   ├── components/
│   │   ├── bottom-navbar.html
│   │   └── top-navbar.html
│   ├── pages/
│   │   └── template.html
│   ├── scripts/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── app.js
│   │   ├── authentication.js
│   │   ├── CalSyncApi.js
│   │   ├── components.js
│   │   ├── create.js
│   │   ├── eventPage.js
│   │   ├── firebaseAPI_DTC13.js
│   │   ├── hydrate.js
│   │   ├── main.js
│   │   ├── profile.js
│   │   ├── search.js
│   │   ├── store.js
│   │   └── support.js
│   ├── Event.d.ts
│   └── vite-env.d.ts
├── styles/
│   ├── style.css
│   └── index.css
├── .env
├── package.json
├── README.md
├── create.html
├── event.html
├── index.html
├── login.html
├── main.html
├── profile.html
├── search.html
├── support.html
├── package-lock.json
├── window.d.ts
├── .firebaserc
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── vite.config.js
├── tailwind.config.js
└── .gitignore
```

---

## Contributors
- Jimmy Cho - BCIT CST Student with a passion for creating user-friendly applications. Fun fact: Loves playing Baldur's Gate
- **Anderson** - BCIT CST Student, Frontend enthusiast with a knack for creative design. Fun fact: Has a collection of over 50 houseplants.
- **Deniz Gunay** - BCIT CST Student and Fullstack Software Engineer. Fun fact: I'm addicted to Path of Exile. 

---

## Acknowledgments

Example:
- Icons sourced from [FontAwesome](https://fontawesome.com/).

---

## Limitations and Future Work
### Limitations

Example:
- Search is not server-side due to Firestore limitations.

### Future Work

Example: 
- Add Google Calendar integration
- Add Discord integration

---

## License

Example:
This project is licensed under the MIT License. See the LICENSE file for details.
