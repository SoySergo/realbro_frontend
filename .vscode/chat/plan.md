Chat System Implementation Plan — RealBro Frontend
Overview
Full-featured chat system with 3 chat types: P2P, Support, AI Agent. AI Agent is the primary feature — it sends property objects that batch, filter, and are interactable. All follows existing FSD architecture, Tailwind v4 + Shadcn UI + Zustand patterns.

File Structure
Entities: src/entities/chat/

entities/chat/
index.ts
model/
index.ts
types.ts # Chat, Message, Conversation, PropertyBatch, AIAgentSettings types
ui/
index.ts
message-bubble/ui.tsx # Text/system/AI-status message rendering
chat-avatar/ui.tsx # Avatar for AI (bot icon), Support, User
property-batch-card/ui.tsx # Compact property card for chat context
property-batch-carousel/ui.tsx # Horizontal snap-scroll carousel of batched properties
conversation-item/ui.tsx # Row in sidebar conversation list
typing-indicator/ui.tsx # "AI is searching..." dots animation
Features: src/features/chat-\*/

features/chat-messages/
model/store.ts # chatStore (Zustand) — conversations, messages, unread, send
model/hooks.ts # useChatMessages, useSendMessage
ui/send-message-form/ui.tsx # Input + send button
ui/message-list/ui.tsx # Scrollable message list with auto-scroll

features/chat-filters/
model/store.ts # dayFilter, selectedFilterIds, showAllFilters
ui/day-filter/ui.tsx # Horizontal pills: Today | Yesterday | This Week | All
ui/search-filter-selector/ui.tsx # Dropdown to pick which search filter presets to show

features/chat-settings/
model/store.ts # AIAgentSettings: hours, frequency, linked filters
ui/notification-settings/ui.tsx # Time range + frequency radio pickers
ui/search-params-link/ui.tsx # Links to edit search filters

features/chat-property-actions/
model/store.ts # likedIds, dislikedIds, savedIds sets
ui/property-action-buttons/ui.tsx # ThumbsUp/ThumbsDown/Bookmark/ExternalLink buttons
Widgets: src/widgets/chat/

widgets/chat/
index.ts
ui/chat-sidebar/ui.tsx # Conversation list with tabs (All | AI | Support | Users) + search
ui/chat-window/ui.tsx # Message area + input + AI filter bar
ui/chat-header/ui.tsx # Conversation info, settings gear for AI agent
ui/ai-agent-property-feed/ui.tsx # Specialized property feed with filters + batch carousels
ui/chat-settings-panel/ui.tsx # Sheet sliding from right — AI notification/filter settings
ui/chat-layout/ui.tsx # Desktop (sidebar+window) / Mobile (toggle) orchestration
Screen: src/screens/chat-page/

screens/chat-page/
index.ts
ui/ui.tsx # ChatPage composition — imports ChatLayout widget
Mock API: src/app/api/chat/

app/api/chat/
conversations/route.ts # GET — list conversations (AI, Support, P2P users)
messages/[conversationId]/route.ts # GET — messages for conversation
messages/route.ts # POST — send message
ai-properties/route.ts # GET — batched AI property feed with filter params
settings/route.ts # GET + PUT — AI notification settings
Shared: src/shared/api/chat.ts
API client functions with mock fallbacks (same pattern as properties.ts).

i18n: messages/{en,ru,fr}.json
New "chat" namespace with all labels.

Key Types (entities/chat/model/types.ts)

type ChatType = 'p2p' | 'support' | 'ai-agent';
type MessageType = 'text' | 'property' | 'property-batch' | 'system' | 'ai-status';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
type PropertyAction = 'like' | 'dislike' | 'save' | 'view';
type DayFilter = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'all';
type NotificationFrequency = 'immediately' | '15min' | '30min' | '1hour' | '2hours';

interface ChatMessage {
id, conversationId, senderId, type: MessageType, content: string
properties?: Property[] // Single or batch
status: MessageStatus, createdAt, readAt?
metadata?: { filterName?, filterId?, batchId?, actionTaken? }
}

interface Conversation {
id, type: ChatType, title, avatar?, participants: string[]
lastMessage?: ChatMessage, unreadCount, isPinned, createdAt, updatedAt
aiSettings?: AIAgentSettings
}

interface AIAgentSettings {
isActive, notificationStartHour (0-23), notificationEndHour (0-23)
notificationFrequency: NotificationFrequency
linkedFilterIds: string[]
}

interface PropertyBatch {
id, properties: Property[], filterId?, filterName?, receivedAt, isViewed
}
Desktop Layout

+--+-------------------+-----------------------------+
| | Chat Sidebar | Chat Window |
|S | (280px) | (flex-1) |
|I | | |
|D | [AI Agent] (pin) | ChatHeader |
|E | [Support] (pin) | ───────────────── |
|B | [Maria G.] (2) | [Day filter pills] (AI) |
|A | [Jose M.] | [Filter selector] (AI) |
|R | | ───────────────── |
| | Search input | Messages / Property feed |
|16| | - text messages |
|px| | - property cards |
| | | - batch carousels |
| | | ───────────────── |
| | | [Message input] [Send] |
+--+-------------------+-----------------------------+
Global sidebar (16px collapsed) stays from layout.tsx
Chat sidebar (280px) is internal to chat page
Settings: Sheet sliding from right when gear icon clicked (AI agent only)
Mobile: full-screen toggle between sidebar and window
Property Batch UX
Single Property (user online)
Inline compact card: image, price, area, bedrooms, address, transport + action buttons (like/dislike/save/view). Badge shows which filter found it.

Batched Properties (2+ unviewed)
Horizontal snap-scroll carousel:

Header: "5 new properties" + filter badge
Cards scroll horizontally with scroll-snap-type: x mandatory
Card width: 280px desktop, full-width mobile
Dot indicators below
Each card has like/dislike/save/view buttons
Counter: "3 of 5 reviewed"
Properties merge into batch when 2+ are unviewed; new arrivals append to existing batch
Settings Panel (Sheet)
Search Parameters — linked filters as badges, "Edit" links to /search, "+ Link another filter"
Notifications — Active hours (Select: From/To), Frequency (radio: immediately / 15min / 30min / 1h / 2h)
Agent Status — Active/Paused toggle, stats (days running, total found)
Zustand Stores
chatStore: conversations[], activeConversationId, messages: Record<string, ChatMessage[]>, isLoading states, fetchConversations(), fetchMessages(), sendMessage(), addIncomingMessage(), markAsRead(), simulateAIPropertyMessage()

chatFilterStore: dayFilter, selectedFilterIds, showAllFilters + setters

chatSettingsStore: settings: AIAgentSettings, updateSettings(), fetchSettings()

propertyActionsStore: likedIds, dislikedIds, savedIds (Sets), toggleLike/Dislike/Save(), markViewed()

Styling
Outgoing bubbles: bg-brand-primary text-white
Incoming bubbles: bg-background-secondary text-text-primary
AI messages: bg-brand-primary-light border border-brand-primary/20
Property cards: bg-card border border-border rounded-xl (matches existing)
Filter pills: bg-background-tertiary (active: bg-brand-primary text-white)
Unread badge: bg-error text-white
All support light/dark theme via CSS variables
Implementation Sequence
Phase 1: Foundation
entities/chat/model/types.ts — all types
shared/api/chat.ts — API client + mock generators
app/api/chat/\* — 5 mock API routes
i18n "chat" namespace in en/ru/fr
Phase 2: Entity UI
ChatAvatar, MessageBubble, PropertyBatchCard, PropertyBatchCarousel, ConversationItem, TypingIndicator
Phase 3: Feature Stores
chatStore, chatFilterStore, chatSettingsStore, propertyActionsStore
Phase 4: Feature UI
SendMessageForm, MessageList, DayFilter, SearchFilterSelector, NotificationSettings, PropertyActionButtons
Phase 5: Widget Composition
ChatSidebar, ChatHeader, ChatWindow, AIAgentPropertyFeed, ChatSettingsPanel, ChatLayout
Phase 6: Screen + Page
screens/chat-page/ composition
Update app/[locale]/chat/page.tsx
Update sidebar badge to use chatStore.totalUnread()
Phase 7: Polish
Real-time simulation (setInterval for mock AI property messages)
Loading skeletons, mobile layout, theme testing
Verification
pnpm build — no TypeScript errors
Navigate to /chat — full chat UI loads
Click AI Agent conversation — property feed with filter pills renders
Property batch carousel — horizontal scroll snaps between cards
Like/dislike/save buttons — visual feedback, state persists
Settings panel — opens Sheet, all controls interactive
Day filter / search filter selector — filters property messages
P2P / Support chats — text messaging works
Dark mode toggle — all chat components render correctly
Mobile viewport — sidebar/window toggle, touch swipe on carousels
