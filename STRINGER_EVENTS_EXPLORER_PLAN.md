# Stringer Events Explorer - Implementation Plan

## Project Overview

**Stringer Events Explorer** is an MVP web dashboard for visualizing Stringer's `/events` and `/posts` endpoints. It provides filtering, browsing, and quick insights through a clean, modern, responsive interface.

### Tech Stack
- **Frontend**: React/Next.js (existing project)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: lucide-react
- **Charts**: recharts
- **State Management**: URL-based filters with local state

## Architecture

### Data Layer
```
src/
├── lib/
│   ├── api/
│   │   ├── events.ts          # Events API client
│   │   ├── posts.ts           # Posts API client
│   │   └── types.ts           # TypeScript interfaces
│   ├── utils/
│   │   ├── tag-parser.ts      # Parse stringified tags
│   │   ├── filters.ts         # Filter utilities
│   │   └── formatters.ts      # Date/string formatters
│   └── hooks/
│       ├── use-events.ts      # Events data hook
│       ├── use-posts.ts       # Posts data hook
│       └── use-filters.ts     # Global filter state
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── charts/                # Chart components
│   ├── filters/               # Filter components
│   └── layout/                # Layout components
└── app/
    ├── dashboard/             # Dashboard page
    ├── events/                # Events page
    ├── posts/                 # Posts page
    ├── sources/               # Sources page
    └── about/                 # About page
```

## Data Models

### Event Interface
```typescript
interface Event {
  id: string;
  event: string;
  description: string | null;
  headline_highlights: string[];
  tags: string; // Stringified set: "{\"tag1\",\"tag2\"}"
  category: string[];
  summary: string[];
  image: string | null;
  sub_event_id: string | null;
  super_event_id: string | null;
  posts_count: number;
  view_count: number;
  location: string;
  location_geom: string | null;
  created_at: string;
  updated_at: string;
  source_name: string;
  source_website_url: string | null;
}
```

### Post Interface
```typescript
interface Post {
  id: string;
  title: string;
  body: string;
  media: string | null;
  media_type: "photo" | "video" | null;
  location: string | null;
  date_occurred: string | null;
  created_at: string;
  updated_at: string;
  source_url: string | null;
  external_url: string | null;
  category: string | null;
  event: string | null; // Linked event ID
}
```

### API Response Interfaces
```typescript
interface ApiResponse<T> {
  status: number;
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

## Pages & Components

### 1. Dashboard Page (`/dashboard`)

#### KPI Cards
- **Total Events**: Count of loaded events
- **Total Posts**: Sum of `posts_count` from events
- **Unique Categories**: Distinct categories across events
- **Unique Tags**: Parsed unique tags from events

#### Charts
1. **Top Events by Posts** (Bar Chart)
   - X-axis: Event titles (truncated to 30 chars)
   - Y-axis: Posts count
   - Click handler: Opens Event Detail Drawer
   - Limit: Top 12 events

2. **Categories Share** (Donut Chart)
   - Data: Category frequency across events
   - Colors: Distinct colors for each category
   - Legend: Category names with counts

3. **Top Tags** (Horizontal Bar Chart)
   - Data: Parsed tags frequency (top 20)
   - X-axis: Tag names (truncated)
   - Y-axis: Frequency count

4. **Activity Over Time** (Line Chart)
   - X-axis: Time buckets (hour/day)
   - Y-axis: Event count
   - Data: Events grouped by `updated_at`

#### Global Filters
- Search box (full-text search)
- Category multi-select
- Min posts slider (≥ N posts)
- Date range picker

### 2. Events Page (`/events`)

#### Events Table/List
- **Columns**: Event | Posts | Categories | Location | Source | Updated
- **Sorting**: Posts desc (default), Updated desc, A→Z
- **Filters**: Search, Category, Min Posts, Date Range
- **Pagination**: Cursor-based with "Load More"

#### Event Detail Drawer
- **Header**: Title, posts count, location, updated date
- **Tags Section**: Parsed tags as chips
- **Categories Section**: Categories as chips
- **Summaries**: Accordion with expandable paragraphs
- **Source Block**: Name + website link
- **Image Preview**: If available
- **Related Posts**: Button to fetch posts for this event

### 3. Posts Page (`/posts`)

#### Posts List
- **Layout**: Card grid with thumbnails
- **Fields**: Title, Source, Location, Date Occurred, Category, Event Link Badge
- **Filters**: Source, Category, Has Media, Linked/Unlinked, Date Range

#### Post Detail Drawer
- **Content**: Title, body (formatted), media viewer
- **Metadata**: Source links, location, date occurred
- **Actions**: "Open Event" button if linked to event

### 4. Sources Page (`/sources`)

#### Sources Grid
- **Cards**: Source name, event count, post count
- **Click Action**: Filter to show events/posts from that source
- **Sorting**: By event count, post count, alphabetical

### 5. About Page (`/about`)

#### Content Sections
- **How it Works**: Explanation of semantic tagging, cosine similarity
- **Events vs Posts**: Data relationship explanation
- **API Configuration**: 
  - Base URL input (default: https://stringer.news/api)
  - API Key storage (localStorage, not used in MVP)
  - Connection status indicator

## Component Architecture

### Core Components

#### `EventCard`
```typescript
interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  showDetails?: boolean;
}
```

#### `PostCard`
```typescript
interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
  showThumbnail?: boolean;
}
```

#### `FilterBar`
```typescript
interface FilterBarProps {
  filters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
  availableCategories: string[];
  availableTags: string[];
}
```

#### `DetailDrawer`
```typescript
interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}
```

### Chart Components

#### `TopEventsChart`
- Bar chart with click handlers
- Truncated labels
- Responsive design

#### `CategoriesChart`
- Donut chart with legend
- Color-coded categories
- Hover interactions

#### `TagsChart`
- Horizontal bar chart
- Top 20 tags
- Scrollable if needed

#### `ActivityChart`
- Line chart with time buckets
- Responsive to date range filter
- Smooth animations

## State Management

### Global Filters State
```typescript
interface GlobalFilters {
  search: string;
  categories: string[];
  minPosts: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  tags: string[];
}
```

### URL Synchronization
- Filters stored in URL query parameters
- Shareable URLs for filtered views
- Browser back/forward support

### Data Fetching Strategy
- **Initial Load**: Fetch first 50 events/posts
- **Pagination**: Cursor-based with "Load More" buttons
- **Caching**: Simple in-memory cache for recent requests
- **Error Handling**: Retry mechanisms with exponential backoff

## Data Processing

### Tag Parsing Utility
```typescript
function parseTags(tagsString: string): string[] {
  try {
    // Replace { } with [ ] and unescape quotes
    const jsonString = tagsString
      .replace(/^{/, '[')
      .replace(/}$/, ']')
      .replace(/\\"/g, '"');
    
    return JSON.parse(jsonString);
  } catch {
    // Fallback: split by comma and clean
    return tagsString
      .replace(/[{}"]/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
}
```

### Category Aggregation
- Count category appearances across events
- Handle both array (events) and string (posts) formats
- Create category frequency maps

### Time Bucketing
- Group events by hour/day based on `updated_at`
- Handle timezone considerations
- Create activity timeline data

## Styling & UX

### Design System
- **Colors**: Minimal palette with semantic colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent padding/margins using Tailwind scale
- **Cards**: Subtle shadows, rounded corners, hover effects
- **Chips**: Rounded, clickable, with remove actions

### Responsive Design
- **Mobile**: Stacked layout, collapsible filters
- **Tablet**: Grid adjustments, touch-friendly interactions
- **Desktop**: Full sidebar filters, multi-column layouts

### Loading States
- **Skeleton Loaders**: For tables, cards, and charts
- **Progressive Loading**: Show partial data while fetching more
- **Error Boundaries**: Graceful error handling with retry options

### Empty States
- **No Data**: Helpful messages with clear actions
- **No Results**: "Clear filters" suggestions
- **Loading Errors**: Retry buttons with error details

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
1. Set up project structure and dependencies
2. Create TypeScript interfaces and API clients
3. Implement tag parsing and utility functions
4. Set up basic routing and layout

### Phase 2: Data Layer (Days 2-3)
1. Implement events and posts API clients
2. Create data fetching hooks with error handling
3. Set up global filter state management
4. Implement URL synchronization

### Phase 3: Dashboard (Days 3-4) ✅ COMPLETED
1. ✅ Build KPI cards with real data
2. ✅ Implement all four charts with recharts
3. ✅ Add global filter bar
4. ✅ Connect filters to data fetching

### Phase 4: Events Page (Days 4-5) ✅ COMPLETED
1. ✅ Create events table/list component (basic implementation)
2. ✅ Implement sorting and pagination
3. ✅ Build event detail drawer
4. ✅ Add related posts functionality

### Phase 5: Posts Page (Days 5-6) ✅ COMPLETED
1. ✅ Create posts list with thumbnails (basic implementation)
2. ✅ Implement post filters (source, category, has media, linked/unlinked)
3. ✅ Build post detail drawer with formatted content and media viewer
4. ✅ Add media viewer for photos and videos

### Phase 6: Sources & About (Days 6-7) ⏳ PENDING
1. ✅ Build sources aggregation page (basic implementation)
2. ✅ Create about page with explanations
3. ❌ Add API configuration UI
4. ❌ Implement localStorage for API key

### Phase 7: Polish & QA (Days 7-8)
1. Add loading states and error handling
2. Implement empty states
3. Test tag parsing edge cases
4. Verify responsive design
5. Performance optimization

## Acceptance Criteria

### Functional Requirements
- [ ] Dashboard displays all 4 KPI cards with live data
- [ ] All 4 charts render correctly with real data
- [ ] Events table supports search, filtering, and sorting
- [ ] Event detail drawer shows complete event information
- [ ] Posts list supports all specified filters
- [ ] Post detail drawer displays formatted content
- [ ] Sources page aggregates and displays source statistics
- [ ] About page explains the system and allows API configuration

### Technical Requirements
- [ ] Tags parsed correctly from stringified sets
- [ ] Categories counted and displayed accurately
- [ ] Filters persist in URL and are shareable
- [ ] Clicking chips adds items to filters
- [ ] Pagination works with cursor-based API
- [ ] Loading states show during data fetching
- [ ] Error states provide retry options
- [ ] Empty states guide user actions

### UX Requirements
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Long titles truncated appropriately
- [ ] Charts are interactive and clickable
- [ ] Drawers slide in smoothly
- [ ] Filters are intuitive and discoverable
- [ ] Loading performance is acceptable
- [ ] Error messages are helpful and actionable

### Code Quality
- [ ] TypeScript interfaces match API responses
- [ ] Components are reusable and well-structured
- [ ] API client ready for authentication injection
- [ ] Error handling is comprehensive
- [ ] Code is documented and maintainable

## Future Enhancements (Post-MVP)

### Authentication
- OAuth flow for API key management
- User preferences and saved filters
- Personal dashboards

### Advanced Features
- Real-time updates via WebSocket
- Export functionality (CSV, PDF)
- Advanced analytics and insights
- Custom chart configurations
- Data visualization improvements

### Performance
- Virtual scrolling for large datasets
- Advanced caching strategies
- Background data prefetching
- Progressive web app features

This plan provides a comprehensive roadmap for building the Stringer Events Explorer MVP while maintaining flexibility for future enhancements.

## Current Implementation Status

**Last Updated**: December 2024

### ✅ Completed Phases
- **Phase 1: Foundation** - Project setup, types, API clients, basic routing
- **Phase 2: Data Layer** - Data fetching hooks, error handling, global filter state, URL synchronization  
- **Phase 3: Dashboard** - KPI cards, all 4 charts, global filter bar, filter integration
- **Phase 4: Events Page** - Sorting, pagination, event detail drawer, related posts navigation
- **Phase 5: Posts Page** - Post filters, detail drawer, media viewer, global filter integration

### 🔄 Current Phase: Phase 6 - Sources & About
**Next Tasks**:
1. Add API configuration UI with base URL input and API key storage
2. Implement localStorage for API key management
3. Add connection status indicator
4. Enhance about page with API configuration section

### ⏳ Upcoming Phases
- **Phase 7: Polish & QA** - Loading states, error handling, responsive design

### 🎯 Key Achievements
- ✅ Full dashboard with interactive charts and real-time filtering
- ✅ Global filter system with search, categories, tags, date range, min posts, and event filtering
- ✅ Events page with sorting, pagination, and detailed event drawer
- ✅ Posts page with comprehensive filtering, detail drawer, and media viewer
- ✅ Related posts navigation from events to filtered posts view
- ✅ Post-specific filters (media type, event linking, categories)
- ✅ Media viewer with photo/video support and error handling
- ✅ Responsive design with modern UI components
- ✅ Tag parsing from stringified sets working correctly
- ✅ All pages have proper implementations with comprehensive data flow

## Phase 5 Implementation Details

### New Components Created
- **`PostFilters.tsx`** - Comprehensive post filtering with search, categories, media type, event linking, and date range
- **`PostCard.tsx`** - Reusable post card component with media indicators and metadata display
- **`PostDetailDrawer.tsx`** - Full-featured post detail modal with media viewer, formatted content, and navigation

### Enhanced Features
- **Post-Specific Filters**: Media type (photo/video/all), event linking status (linked/unlinked/all), categories
- **Media Viewer**: Support for both photos and videos with error handling and fallback options
- **Global Filter Integration**: Posts page respects global filters while providing local post-specific filtering
- **Navigation Integration**: Clicking "View Event" in post detail navigates to events page with event selected
- **Responsive Design**: All new components work seamlessly across mobile, tablet, and desktop

### Technical Improvements
- **Filter Logic**: Enhanced `filterPosts` function to support null/undefined values for optional filters
- **State Management**: Local post filter state combined with global filters for comprehensive filtering
- **Error Handling**: Media loading errors gracefully handled with fallback UI
- **Performance**: Efficient filtering and rendering with proper React patterns
