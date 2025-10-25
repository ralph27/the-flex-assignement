# 🚀 Flex Living Reviews Dashboard

A comprehensive review management system for Flex Living properties, integrating Hostaway reviews with an intuitive dashboard and public-facing property pages.

## ✅ Features

  * **Hostaway Integration:** Fetches reviews from Hostaway API with mock data fallback.
  * **Manager Dashboard:** Filter, search, and manage all reviews.
  * **Review Approval System:** Control which reviews appear publicly.
  * **Analytics & Trends:** Visualize performance metrics and rating trends.
  * **Public Property Pages:** Display approved reviews in Flex Living style.
  * **Multi-Channel Support:** Airbnb, Booking.com, Vrbo, Direct bookings.
  * **Google Reviews Ready:** Infrastructure for Google Places API integration.

## 🛠️ Tech Stack

  * **Frontend:** Next.js 14 (App Router), React, TypeScript
  * **Styling:** Tailwind CSS
  * **Charts:** Recharts
  * **Icons:** Lucide React
  * **API:** Next.js API Routes
  * **Storage:** JSON file-based persistence

## 🔧 Setup Instructions

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Create Data Directory**

    ```bash
    mkdir data
    ```

3.  **Environment Variables (Optional)**
    Create `.env.local` for Google Reviews:

    ```ini
    GOOGLE_PLACES_API_KEY=your_api_key_here
    ```

4.  **Run Development Server**

    ```bash
    npm run dev
    ```

    Visit `http://localhost:3000`

## 📡 API Endpoints

### `GET /api/reviews/hostaway`

Fetches and normalizes all reviews from Hostaway (or mock data).

**Successful Response (Hostaway):**

```json
{
  "success": true,
  "count": 15,
  "data": [...],
  "lastUpdated": "2025-01-15T10:30:00Z",
  "source": "hostaway"
}
```

**Fallback Response (Mock Data):**

```json
{
  "success": true,
  "count": 15,
  "data": [...],
  "lastUpdated": "2025-01-15T10:30:00Z",
  "source": "Mock"
}
```

### `POST /api/reviews/approve`

Toggles review approval status.

**Request Body:**

```json
{
  "reviewId": 7453,
  "approved": true
}
```

## 💡 Key Design Decisions

### Data Normalization

All reviews are normalized to a consistent schema regardless of source:

  * Averaged category ratings
  * Standardized property IDs
  * Unified date formats
  * Channel tracking

### Approval System

  * Reviews default to unapproved.
  * Only approved reviews appear on public pages.
  * Managers can toggle approval with one click.
  * Approval state persists between sessions.

### Filtering Architecture

Multi-dimensional filtering:

  * Property selection
  * Channel filtering
  * Minimum rating threshold
  * Date range filtering
  * Approval status

### Performance Optimization

  * Lazy loading for charts
  * Optimistic UI updates

### Fallback Strategy

  * **Primary:** Hostaway API
  * **Fallback:** Mock data (15 realistic reviews)
  * Graceful error handling

## 🧪 Testing Guide

(Assuming Step 1 is running the dashboard)

2.  **Public Pages**

      * Visit `/property/2b-n1-a-29-shoreditch-heights`
      * Verify only **approved** reviews show
      * Check responsive design
      * Test different screen sizes

3.  **API Testing**

    ```bash
    # Fetch all reviews
    curl http://localhost:3000/api/reviews/hostaway

    # Approve a review
    curl -X POST http://localhost:3000/api/reviews/approve \
      -H "Content-Type: application/json" \
      -d '{"reviewId": 7453, "approved": true}'
    ```

## 🔮 Future Enhancements

  * **Authentication:** Add manager login system
  * **Webhooks:** Real-time review notifications
  * **Analytics:** Advanced sentiment analysis
  * **Export:** CSV/PDF report generation
  * **AI Insights:** Auto-categorize recurring issues
  * **Multi-language:** Support international reviews
  * **Email Notifications:** Alert managers of new reviews