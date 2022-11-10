module.exports = [
  {
    _id: 1,
    address: {
      city: 'Vilnius',
      country: 'Lithuania',
      street: 'Vasaros 5',
      zipCode: 1000,
    },
    email: 'antanas_bananas@email.com',
    firstName: 'Antanas',
    lastName: 'Bananas',
    profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg',
    shortPosts: [
      {
        date: Date.now(),
        description: 'Display random posts in WordPress',
        postID: 1,
        title: 'How to Display Random Posts in WordPress',
      },
      {
        date: Date.now(),
        description: 'Abusing message types in message-driven systems may result in bloated messages, unclear intent, or impossible-to-understand data flows.',
        postID: 2,
        title: 'Types of Messages in Message-Driven Systems',
      },
      {
        date: Date.now(),
        description: 'Learn to design and build multilingual software applications for global audiences.',
        postID: 3,
        title: 'Building Multilingual Relational Databases: Approaches and Tradeoffs',
      },
    ],
  },
  {
    _id: 2,
    address: {
      city: 'Kaunas',
      country: 'Lithuania',
      street: 'Baršausko 50',
      zipCode: 3000,
    },
    email: 'zita@gmail.com',
    firstName: 'Teta',
    lastName: 'Zita',
    profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
    shortPosts: [],
  },
];
