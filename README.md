# LetsTalk - Equal Engagement Social Platform

A social media platform built on the principle of equal engagement, where everyone's voice matters equally.

## Concept

LetsTalk addresses engagement inequality on traditional social media by implementing a unique **response-to-post** system. Users must respond to posts before they can create their own, ensuring balanced participation and meaningful conversations.

## Features

### Core Mechanics
- **Response Credits System**: Earn 1 credit per relevant response (max 3 credits)
- **Post Creation**: Requires 1 credit to create a post
- **Daily Post Limit**: Maximum 3 posts per day to encourage quality over quantity
- **Relevance Validation**: Keyword-based algorithm ensures responses are relevant to original posts
- **Unlimited Responses**: Respond to posts as many times as you want to earn credits

### User Management
- **Authentication**: Simple email/password signup and login
- **User Profiles**: Customizable profile with emoji avatars and bio
- **Friend System**: Add friends by email, accept/reject friend requests
- **Friend-Only Feed**: See only posts from your friends

### Post & Response Features
- **Create Posts**: Share thoughts, feelings, activities (500 character limit)
- **Respond to Posts**: Engage with friends' posts with relevant responses (300 character limit)
- **Delete Posts**: Remove your own posts within any timeframe (get 1 credit back)
- **Delete Responses**: Remove your responses within 2 minutes (lose 1 credit)
- **Welcome Posts**: New users must respond to a welcome post to unlock the platform

### Design
- **Coffee Shop Aesthetic**: Warm, inviting design with earthy brown tones
- **Responsive**: Works on desktop and mobile devices
- **Real-time Updates**: See changes immediately
- **Live Validation**: Get instant feedback on response relevance

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Storage**: Browser LocalStorage (no backend required)
- **Validation**: Custom keyword-based relevance algorithm
- **Hosting**: Can be hosted anywhere (GitHub Pages, Netlify, Vercel, etc.)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/lets-talk-social-app.git
cd lets-talk-social-app
```

2. Open `index.html` in your browser:
   - Double-click the file
   - Or drag it into your browser
   - Or use a local server (VS Code Live Server, Python SimpleHTTPServer, etc.)

### Usage

1. **Sign Up**: Create an account with email and password
2. **Complete Welcome**: Respond to a welcome post to earn your first credit
3. **Add Friends**: Go to Friends tab and add friends by their email
4. **Start Engaging**: Respond to friends' posts to earn credits
5. **Create Posts**: Use your credits to share your own thoughts

## Project Structure

```
lets-talk-social-app/
├── index.html          # Main HTML structure
├── styles.css          # Coffee shop aesthetic styling
├── app.js             # Core application logic
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Key Features Explained

### Response Credit System
- Earn credits by responding to posts with relevant content
- Spend credits to create your own posts
- Maximum 3 credits at any time
- Get 1 credit refunded when you delete a post

### Relevance Validation
The app uses a keyword-based algorithm to ensure responses are relevant:
- Extracts keywords from both post and response
- Filters out common stop words
- Calculates relevance score based on common words
- Provides feedback: Valid, Warning, or Invalid
- Prevents short/generic responses (minimum 3 words)

### Daily Limits
- 3 posts per day maximum
- Resets at midnight
- Encourages thoughtful posting over spam

### Delete Windows
- **Posts**: Can be deleted anytime (credit refunded)
- **Responses**: Can only be deleted within 2 minutes (credit deducted)

## Future Enhancements

Potential features for future development:
- React migration for better state management
- Real backend (Node.js + PostgreSQL)
- AI-based relevance validation (Claude API)
- Image uploads for posts
- Notifications system
- Search and discovery features
- Post categories and tags
- User reputation system

## Local Storage Data

The app stores the following data in your browser's localStorage:
- `users`: Array of user accounts
- `posts`: Array of all posts
- `welcomePosts`: Welcome posts for new users
- `friendRequests`: Pending friend requests
- `currentUser`: Email of logged-in user

**Note**: Clearing browser data will delete all accounts and posts.

## Contributing

This is a prototype project. Feel free to fork and experiment!

## License

MIT License - Feel free to use this project for learning and experimentation.

## Author

Created as part of a software engineering mentorship program.

---

**LetsTalk** - Where everyone's voice matters equally ☕
