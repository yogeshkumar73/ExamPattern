# Smart Lab RAG Integration with NVIDIA Nemotron 3.5

## Overview
This implementation integrates NVIDIA Nemotron 3.5 Content Safety model via OpenRouter API to provide:
- **Dynamic Question Generation**: AI-powered coding questions tailored to user difficulty
- **Content Safety Checking**: Automatic moderation of generated content
- **RAG (Retrieval-Augmented Generation)**: Context-aware question generation
- **Production-Ready SaaS**: Error handling, fallbacks, and rate limiting

## Architecture

### Components

1. **Open Router Service** (`lib/services/openRouterService.ts`)
   - Manages API communication with NVIDIA Nemotron 3.5
   - Handles content safety checks
   - Implements RAG-enhanced question generation
   - Batch processing support

2. **Content Generation API** (`app/api/ai/content-generation/route.ts`)
   - POST endpoint for question generation and safety checks
   - GET endpoint for documentation
   - Supports three actions:
     - `generate-questions`: Create coding problems
     - `check-safety`: Validate content
     - `rag-questions`: Generate with context

3. **Smart Lab Component** (`components/lab-games.tsx`)
   - Dynamic question fetching
   - Difficulty-adaptive question selection
   - Loading states and error handling
   - Fallback to mock questions

## Setup Instructions

### 1. Get Open Router API Key
1. Visit https://openrouter.io/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key starting with `sk_live_`

### 2. Configure Environment Variables
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Add your Open Router API key
OPEN_ROUTER_API_KEY=sk_live_your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

## API Endpoints

### POST /api/ai/content-generation

#### Generate Questions
```bash
curl -X POST http://localhost:3000/api/ai/content-generation \
  -H "Content-Type: application/json" \
  -d {
    "action": "generate-questions",
    "topic": "Binary Trees",
    "difficulty": "Medium",
    "category": "Data Structures",
    "count": 3
  }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "title": "Problem Title",
        "description": "Problem description...",
        "difficulty": "Medium",
        "category": "Data Structures",
        "tags": ["tag1", "tag2"],
        "boilerplate": "function solve() { ... }",
        "testCases": [...]
      }
    ],
    "isSafe": true
  },
  "timestamp": "2026-06-07T..."
}
```

#### Check Content Safety
```bash
curl -X POST http://localhost:3000/api/ai/content-generation \
  -H "Content-Type: application/json" \
  -d {
    "action": "check-safety",
    "text": "Content to check",
    "context": "Educational"
  }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isSafe": true,
    "score": 0.95,
    "issues": []
  },
  "timestamp": "2026-06-07T..."
}
```

#### RAG-Enhanced Questions
```bash
curl -X POST http://localhost:3000/api/ai/content-generation \
  -H "Content-Type: application/json" \
  -d {
    "action": "rag-questions",
    "topic": "Graph Algorithms",
    "difficulty": "Hard",
    "category": "Algorithms",
    "contextDocuments": ["BFS algorithm...", "DFS algorithm..."]
  }
```

## Features

### 1. Dynamic Question Generation
- Difficulty scales with user rank (Bronze/Silver/Gold/Platinum)
- Topic-based generation
- Includes boilerplate code and test cases
- Cached fallback to mock questions

### 2. Content Safety
- Automatic moderation of all generated content
- Detects hate speech, violence, and inappropriate content
- Safety score (0-1) for each piece of content

### 3. Error Handling
- Graceful fallback to mock questions
- Automatic retry logic
- User-friendly error messages
- Logging for debugging

### 4. Performance
- Open Router uses free tier with good performance
- Questions cached in client memory
- Minimal API calls per match

## Production Checklist

✅ Error handling and validation
✅ API key management via environment variables
✅ Fallback strategies implemented
✅ Rate limiting ready (Upstash integration)
✅ Content safety checking enabled
✅ TypeScript type safety
✅ Proper logging
✅ Documentation complete

## Cost Optimization

- **Free Tier**: NVIDIA Nemotron 3.5 is available free on OpenRouter
- **No API Call Limits**: Reasonable usage on free tier
- **Batch Processing**: Supports generating multiple questions at once
- **Caching**: Consider implementing client-side question cache to reduce API calls

## Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Test Smart Lab section
# Navigate to the Smart Lab tab and click "Start PvE Match"
# Questions should load dynamically
```

### API Testing
```bash
# Test endpoint directly
curl http://localhost:3000/api/ai/content-generation

# Test question generation
curl -X POST http://localhost:3000/api/ai/content-generation \
  -H "Content-Type: application/json" \
  -d '{"action":"generate-questions","topic":"Arrays","difficulty":"Easy","category":"Data Structures"}'
```

## Troubleshooting

### No Open Router API Key
- **Error**: "OPEN_ROUTER_API_KEY not configured"
- **Fix**: Add key to `.env.local` and restart dev server

### Questions Not Loading
- **Check**: Network tab in browser DevTools
- **Fix**: Verify API key is valid and has quota
- **Fallback**: Mock questions should load automatically

### Slow Question Generation
- **Typical**: First call takes 3-5 seconds
- **Optimization**: Implement question pre-generation
- **Cache**: Store generated questions in database

## Advanced Features

### Batch Processing
```javascript
const requests = [
  { topic: "Arrays", difficulty: "Easy", category: "Data Structures" },
  { topic: "Trees", difficulty: "Medium", category: "Data Structures" },
];
const results = await generateBatch(requests);
```

### Custom RAG Context
```javascript
const contextDocs = [
  "Definition of binary search tree...",
  "AVL tree balancing rules...",
];
const result = await generateRAGQuestions(
  "BST Operations",
  "Hard",
  "Data Structures",
  contextDocs
);
```

## Security

- API key is never exposed to frontend
- All validation happens server-side
- Content is sanitized before display
- CORS headers are properly configured

## Future Enhancements

1. **Database Caching**: Cache generated questions in MongoDB
2. **Difficulty Calibration**: Adapt question difficulty based on user performance
3. **Analytics**: Track which topics need more questions
4. **Custom RAG**: Integrate with user study materials
5. **Batch Pregeneration**: Generate questions during off-peak hours

## Support

For issues or questions:
1. Check error logs in browser console
2. Verify environment variables
3. Test API directly with curl
4. Check Open Router dashboard for API status

## References

- [Open Router Documentation](https://openrouter.io/docs)
- [NVIDIA Nemotron Models](https://openrouter.io/models?query=nemotron)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [RAG Concepts](https://docs.llamaindex.ai/en/stable/getting_started/concepts.html)
