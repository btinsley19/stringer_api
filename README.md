# Stringer Events Explorer

A modern web dashboard for visualizing and exploring Stringer's events and posts data.

## Features

- **Dashboard**: KPI cards and interactive charts showing event and post analytics
- **Events Browser**: Filterable table of events with detailed information
- **Posts Explorer**: Grid view of posts with media and metadata
- **Sources Analysis**: Aggregated view of content sources
- **Advanced Filtering**: Search, category, date range, and tag-based filtering
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: URL-based filters with React hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stringer_api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── events/           # Events page
│   ├── posts/            # Posts page
│   ├── sources/          # Sources page
│   └── about/            # About page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── charts/          # Chart components
│   ├── filters/         # Filter components
│   └── layout/          # Layout components
└── lib/                 # Utilities and business logic
    ├── api/            # API clients
    ├── hooks/          # Custom React hooks
    └── utils/          # Utility functions
```

## API Integration

The application is designed to work with the Stringer API:

- **Events Endpoint**: `GET /api/events`
- **Posts Endpoint**: `GET /api/posts`

Currently using mock data for development. Real API integration will be added in future versions.

## Development Status

This is an MVP implementation with the following phases:

- ✅ **Phase 1**: Foundation (Project setup, types, API clients, basic routing)
- 🔄 **Phase 2**: Data Layer (Data fetching hooks, error handling)
- ⏳ **Phase 3**: Dashboard (KPI cards, charts, global filters)
- ⏳ **Phase 4**: Events Page (Table, sorting, detail drawer)
- ⏳ **Phase 5**: Posts Page (Grid, filters, post drawer)
- ⏳ **Phase 6**: Sources & About (Aggregation, configuration)
- ⏳ **Phase 7**: Polish & QA (Loading states, error handling, responsive design)

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Follow the component naming conventions
4. Add proper error handling and loading states
5. Ensure responsive design for all new components

## License

This project is part of the Purpose Driven Incubator initiative.
