Design a detailed implementation plan for a full-featured chat system in a Next.js 16 + React 19 + Tailwind CSS v4 + Shadcn UI project with FSD (Feature-Sliced Design) architecture.

## Project Context

- **Framework**: Next.js 16.0.1, App Router with `[locale]` routing
- **Styling**: Tailwind CSS v4 with CSS variables, Shadcn UI components (Button, Dialog, Sheet, Popover, Avatar, Badge, ScrollArea, Tabs, Input, etc.)
- **State Management**: Zustand v5
- **Icons**: Lucide React
- **i18n**: next-intl
- **Fonts**: Inter + JetBrains Mono
- **Brand Color**: #198BFF (blue)
- **FSD Layers**: app/, entities/, features/, widgets/, shared/, screens/
- **Existing entities**: Property (with images, price, area, bedrooms, etc.), User, Filter
- **Existing Property card components**: PropertyCard (vertical), PropertyCardHorizontal (detailed)
- **Current chat page**: Placeholder at `src/app/[locale]/chat/page.tsx`
- **Sidebar**: Fixed left sidebar with navigation items (search, chat, profile, settings), chat has badge "3"
- **Mock data pattern**: generateMockProperties() falls back on API errors

## Requirements

### 1. Chat Types

- **User-to-user messaging** (P2P)
- **Support chat** (default for all users)
- **AI Agent chat** (default for all users) - this is the PRIMARY feature

### 2. AI Agent Chat (High Priority)

The AI agent searches for properties and sends them to the user in chat.

**Property object handling:**

- When user is **online**: receive property objects one-by-one in real-time
- When user has **2+ unviewed** property objects: they batch into a single "unsorted pack" card
- User can **swipe/scroll horizontally** through the pack to review properties
- Each property card in chat should be interactive (like/dislike/save/view details)

**Filtering:**

- Filter by **days** (today, yesterday, this week, etc.)
- Filter by **user-created search filters** — user can select which filter presets to see results for
- Can toggle between "all filters" or "specific filters"

**Settings panel:**

- Edit search parameters (link to filter editing)
- **Notification timing**: set "offline notification hours" (e.g., 7:00-22:00)
- **Notification frequency**: immediately, no more than every 15 min, every 30 min, every hour, etc.

### 3. UI/UX Requirements

- Professional real estate service UI
- Light/dark theme support
- Responsive (desktop focus, mobile-friendly)
- All interactive elements should be clickable and functional
- Ready for backend synchronization (mock API endpoints)

## Design the FSD Structure

Please design:

1. **Entities layer** (`entities/chat/`):
   - Types: Chat, Message, ChatType, Conversation, PropertyBatch
   - UI: MessageBubble, ChatAvatar, PropertyBatchCard

2. **Features layer** (`features/chat/`):
   - chat-messages: sending/receiving messages
   - chat-filters: day filter, search filter selection
   - chat-settings: notification settings, search params
   - chat-property-actions: like/dislike/save on property cards in chat

3. **Widgets layer** (`widgets/chat/`):
   - ChatSidebar: conversation list (users, support, AI agent)
   - ChatWindow: message display area with input
   - ChatHeader: conversation info, settings access
   - AIAgentPropertyFeed: the property batch viewer with horizontal scrolling

4. **Screens layer** (`screens/chat-page/`):
   - Full page composition

5. **Mock API** (`app/api/chat/`):
   - GET /api/chat/conversations
   - GET /api/chat/messages/:conversationId
   - POST /api/chat/messages
   - GET /api/chat/ai-properties (batched property feed)
   - PUT /api/chat/settings

6. **Zustand Store**:
   - chatStore: conversations, active conversation, messages, unread counts
   - aiAgentStore: property batches, filters, settings, notification preferences

Please provide a detailed plan with:

- File structure for each FSD layer
- Key types/interfaces
- Component hierarchy and composition
- Store shape
- Mock API response shapes
- UI layout description (how the chat page looks)
- The property batch card UX (how batching, swiping, filtering works)
- How settings panel is organized

Focus on making the AI agent chat experience exceptional - it's the core differentiator.
