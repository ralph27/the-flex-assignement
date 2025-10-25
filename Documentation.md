# Reviews Dashboard Documentation

## Overview

The Reviews Dashboard is a comprehensive management system for monitoring and approving guest reviews across multiple properties and booking channels. It provides real-time analytics, filtering capabilities, and an approval workflow for public-facing reviews.

---

## Architecture

### Data Flow

```
Hostaway API → API Routes → State Management → Components
     ↓              ↓              ↓              ↓
Mock Fallback → Storage Layer → Dashboard UI → Property Pages
```

### Key Components

- **API Integration**: Hostaway API with automatic mock data fallback
- **State Persistence**: File-based storage (`data/reviews-state.json`)
- **Review Normalization**: Transforms Hostaway format to unified schema
- **Approval System**: Persistent approval status across sessions

---

## Dashboard Features

### 1. Statistics Cards

Located at the top of the dashboard, four key metric cards provide at-a-glance insights:

#### Average Rating
- **Calculation**: Mean of all review ratings (out of 10.0)
- **Display**: One decimal precision (e.g., "9.4")
- **Trend Indicator**: Shows percentage change vs. previous 30-day period
- **Colors**: 
  - Green ↑ for positive trends
  - Red ↓ for negative trends

#### Total Reviews
- **Count**: All reviews in the system
- **Subtitle**: Shows filtered count if filters are active
- **Updates**: Real-time with data refresh

#### Approved Reviews
- **Count**: Reviews marked for public display
- **Percentage**: Shows approval rate relative to total
- **Calculation**: `(approvedReviews / totalReviews) * 100`

#### Pending Reviews
- **Count**: Reviews awaiting approval
- **Calculation**: `totalReviews - approvedReviews`
- **Action Indicator**: Shows backlog requiring attention

---

### 2. Filters Panel

Advanced filtering system supporting multiple dimensions:

#### Property Filter
- **Options**: "All Properties" + unique property list
- **Source**: Extracted from review data
- **ID Format**: Normalized slug (e.g., `2b-n1-a-29-shoreditch-heights`)

#### Channel Filter
- **Options**: "All Channels" + active channels
- **Supported Channels**:
  - Airbnb
  - Booking.com
  - Vrbo
  - Direct bookings
  - Google (when integrated)

#### Minimum Rating Filter
- **Options**:
  - All Ratings
  - 9+ Stars
  - 8+ Stars
  - 7+ Stars
- **Logic**: Inclusive (≥ selected value)

#### Date Range Filter
- **Options**:
  - All Time
  - Last 7 days
  - Last 30 days
  - Last 90 days
- **Implementation**: Uses `date-fns` library for date calculations

#### Status Filter
- **Options**:
  - All Reviews
  - Approved Only
  - Pending Approval
- **Use Case**: Quick access to reviews requiring action

#### Reset Functionality
- **Button**: "Reset all" in top-right corner
- **Action**: Clears all filters to default state

---

### 3. Trends Chart System

Two interactive charts provide visual analytics:

#### A. Rating Trend Chart (Line Chart)

**Purpose**: Track rating performance over time

**Features**:
- **Dual Lines**:
  - Light blue: Daily average ratings
  - Dark blue: 7-day rolling average (smoothed trend)
- **Time Window**: Last 30-90 days (adaptive based on data)
- **Gap Handling**: Line breaks for periods with no reviews (>3 days)
- **Y-Axis**: Fixed 0-10 scale
- **X-Axis**: Date labels (e.g., "Dec 15")

**Calculations**:
```javascript
// Daily Average
avgRating = sum(ratingsForDay) / count(ratingsForDay)

// 7-Day Rolling Average
rollingAvg = sum(last7DaysRatings) / count(last7DaysReviews)
```

**Technical Implementation**:
- Uses Recharts `LineChart` component
- UTC date normalization prevents timezone issues
- `connectNulls={false}` for daily avg (shows gaps)
- `connectNulls={true}` for rolling avg (smooth line)

#### B. Reviews by Channel Chart (Bar Chart)

**Purpose**: Compare performance across booking channels

**Features**:
- **Dual Bars**:
  - Blue: Number of reviews per channel
  - Green: Average rating per channel
- **Sorting**: Automatic by channel name
- **Tooltips**: Show exact values on hover

**Metrics**:
- Count: Total reviews from each channel
- Average Rating: Mean rating for channel-specific reviews

---

### 4. Reviews Table

Comprehensive data table with interactive features:

#### Columns

| Column | Content | Features |
|--------|---------|----------|
| **Guest & Review** | Guest name + review text preview | Text truncated to 2 lines, expandable via modal |
| **Property** | Listing name | Full property name display |
| **Rating** | Overall rating + category count | Bold rating with ⭐, shows # of categories |
| **Date** | Review submission date | Formatted as "MMM dd, yyyy" |
| **Channel** | Booking platform | Colored badge (blue) |
| **Actions** | View + Approval buttons | Interactive controls |

#### Row Features
- **Hover Effect**: Light gray background on hover
- **Click to View**: Eye icon opens detailed modal
- **Approval Toggle**: Button changes state and color

#### Approval Button States

**Pending State**:
- Text: "Approve"
- Colors: Gray background, dark text
- Action: Marks review as approved

**Approved State**:
- Text: "✓ Approved"
- Colors: Green background, dark green text
- Icon: Checkmark
- Action: Toggles to pending (removes approval)

---

### 5. Review Detail Modal

Full-screen modal for in-depth review examination:

#### Header Section
- **Guest Name**: Large, bold title
- **Date**: Formatted submission date
- **Close Button**: X icon in top-right

#### Rating Display
- **Overall Score**: Large numeric display (e.g., "9.8")
- **Star Icon**: Yellow ⭐
- **Property Name**: Shows which listing
- **Channel Badge**: Colored pill showing booking platform

#### Review Text
- **Full Content**: Complete review without truncation
- **Formatting**: Leading, readable text style

#### Category Ratings Grid
- **Layout**: 2-column grid
- **Display Format**: "Category Name: X/10"
- **Categories Supported**:
  - Cleanliness
  - Communication
  - Accuracy
  - Location
  - Check In
  - Value
  - Respect House Rules

#### Footer Actions
- **Status Display**: Shows current approval state
- **Toggle Button**:
  - Green: "Approve Review" (if pending)
  - Red: "Remove Approval" (if approved)
- **Auto-close**: Modal closes after action

---

## Approval Mechanism

### Workflow

```
1. Review arrives from API → Auto-set to pending (approved: false)
2. Manager reviews in dashboard
3. Manager clicks "Approve"
4. API call updates state
5. State persisted to JSON file
6. Dashboard refreshes
7. Approved reviews appear on property pages
```

### State Management

#### Storage Location
- **File**: `data/reviews-state.json`
- **Format**: JSON with reviews array + metadata
- **Persistence**: Survives server restarts

#### State Schema
```json
{
  "reviews": [
    {
      "id": 7453,
      "approved": true,
      // ... other review fields
    }
  ],
  "lastUpdated": "2025-10-25T10:25:02.132Z"
}
```

#### Approval Preservation
When fetching new data from Hostaway:
1. Load existing state from JSON
2. Extract set of approved review IDs
3. Fetch fresh data from API
4. Merge: preserve `approved: true` for matching IDs
5. Save updated state

### API Endpoints

#### POST `/api/reviews/approve`
Updates review approval status

**Request Body**:
```json
{
  "reviewId": 7453,
  "approved": true  // optional, toggles if omitted
}
```

**Response**:
```json
{
  "success": true,
  "review": { /* updated review object */ }
}
```

**Error Responses**:
- 400: Invalid review ID
- 404: Review not found
- 500: Server error

#### GET `/api/reviews/hostaway`
Fetches and normalizes all reviews

**Response**:
```json
{
  "success": true,
  "count": 15,
  "data": [ /* array of normalized reviews */ ],
  "lastUpdated": "2025-10-25T10:25:02.132Z",
  "source": "hostaway" | "mock" | "mock-fallback",
  "error": "optional error message"
}
```

---

## Property Page Integration

### Review Display Rules

**Visibility**:
- Only `approved: true` reviews are shown
- Filtered by matching `listingId`
- Sorted by date (newest first)

### Review Cards

Each approved review displays:
- Guest name (bold header)
- Submission date
- Overall rating (large, with ⭐)
- Full review text
- Top 3 category ratings (as colored pills)
- Channel badge

### Summary Section
- **Average Rating**: Calculated from approved reviews only
- **Review Count**: Shows number of approved reviews
- **"Verified guests"**: Label for credibility

---

## Technical Details

### Date Handling
- **Timezone**: All dates normalized to UTC
- **Display Format**: Local-friendly formatting via `date-fns`
- **Chart Dates**: UTC midnight to prevent day-shift bugs

### Performance Optimizations
- **Lazy Loading**: Charts only render when data available
- **Memoization**: Expensive calculations cached
- **Responsive Design**: Mobile-friendly breakpoints

### Error Handling
- **API Failures**: Automatic fallback to mock data
- **Missing Data**: Graceful degradation with empty states
- **Network Issues**: Retry mechanism with user feedback

---

## API Status Banner

Visual indicator of data source:

### Connected State (Green)
- **Icon**: Green checkmark
- **Message**: "✓ Connected to Hostaway API"
- **Details**: Shows last update timestamp

### Mock Data State (Yellow)
- **Icon**: Yellow warning
- **Message**: "⚠ Using Mock Data"
- **Details**: Explains connection failure
- **Error Display**: Shows specific API error if available

---

## Statistics Calculations

### Average Rating
```javascript
avgRating = sum(allReviewRatings) / count(allReviews)
// Rounded to 1 decimal place
```

### Trend Calculation
```javascript
recentPeriod = reviews from last 30 days
previousPeriod = reviews from 31-60 days ago

recentAvg = average(recentPeriod)
previousAvg = average(previousPeriod)

trend = ((recentAvg - previousAvg) / previousAvg) * 100
```

### Category Breakdown
Each review may have up to 7 categories:
- Overall rating = mean of all category ratings
- Missing categories ignored in calculation

---

## Filter Logic

Filters are applied cumulatively (AND logic):

```javascript
filteredReviews = reviews.filter(review => {
  return (
    matchesProperty(review) &&
    matchesChannel(review) &&
    meetsMinRating(review) &&
    withinDateRange(review) &&
    matchesApprovalStatus(review)
  );
});
```

---

## Best Practices

### For Property Managers
1. **Regular Review**: Check dashboard daily for new reviews
2. **Quick Approval**: Approve high-quality reviews promptly
3. **Quality Control**: Only approve reviews that represent your brand well
4. **Response Time**: Aim to approve within 24 hours

### For Developers
1. **Data Validation**: Always validate review data structure
2. **Error Boundaries**: Wrap components in error handlers
3. **State Sync**: Ensure approval state stays in sync across UI
4. **Testing**: Test with various data volumes and edge cases

---

## Troubleshooting

### Dashboard shows "Using Mock Data"
- **Cause**: Hostaway API credentials invalid or network issue
- **Solution**: Check environment variables, verify API key

### Approval not persisting
- **Cause**: File system write permissions
- **Solution**: Verify `data/` directory is writable

### Charts not rendering
- **Cause**: Invalid date formats in review data
- **Solution**: Check `submittedAt` field format

### Filters not working
- **Cause**: State update race condition
- **Solution**: Refresh page, check console for errors

---

## Google Reviews Integration

### Overview

The system supports integration with Google Places API to fetch and display reviews from Google Maps alongside reviews from booking platforms.

### Features

#### 1. Place Search & Configuration

**GooglePlaceConfig Component**:
- Search for properties on Google Maps by name
- Preview search results with ratings and review counts
- Select and link the correct Google Place to a listing
- One-click sync of Google reviews

**Search Flow**:
```
1. Enter property name or address
2. Click "Search"
3. Review results showing:
   - Place name
   - Star rating
   - Total review count
   - Place ID
4. Select matching place via radio button
5. Click "Sync Reviews Now"
```

#### 2. Review Normalization

Google reviews are automatically normalized to match the internal schema:

**Mapping**:
- `authorAttribution.displayName` → `guestName`
- `text.text` (or `originalText.text`) → `reviewText`
- `rating` → `overallRating` (1-5 scale)
- `publishTime` → `date`
- Channel automatically set to "Google"
- Type set to "guest-to-host"
- **Auto-approved**: `approved: true` by default

**ID Generation**:
```javascript
// Extracts numeric ID from review resource name
// Falls back to timestamp if extraction fails
id = parseInt(review.name.split("/").pop().replace(/\D/g, ""))
```

#### 3. API Endpoints

##### GET `/api/google/search`
Search for places by text query

**Parameters**:
- `q` (required): Search query string

**Response**:
```json
{
  "places": [
    {
      "id": "places/ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Property Name",
      "rating": 4.8,
      "totalRatings": 245,
      "url": "https://maps.google.com/?cid=..."
    }
  ]
}
```

##### GET `/api/google/place`
Get details for a specific place

**Parameters**:
- `placeId` (required): Google Place ID (format: `places/ChIJ...`)

**Response**:
```json
{
  "id": "places/ChIJ...",
  "name": "Property Name",
  "rating": 4.8,
  "userRatingCount": 245,
  "googleMapsUri": "https://maps.google.com/?cid=..."
}
```

##### GET `/api/google/reviews`
Fetch reviews for a place and normalize them

**Parameters**:
- `placeId` (required): Google Place ID
- `listingId` (required): Internal listing identifier
- `listingName` (required): Property name

**Response**:
```json
{
  "place": { /* place details */ },
  "reviews": [ /* normalized reviews */ ],
  "rawReviews": [ /* original Google format */ ],
  "attributionRequired": true
}
```

#### 4. Server Actions

##### `syncGoogleReviews()`
Fetches and normalizes Google reviews for a property

**Parameters**:
- `placeId`: Google Place ID
- `listingId`: Internal listing ID
- `listingName`: Property name

**Returns**:
```typescript
{
  success: boolean;
  reviews?: NormalizedReview[];
  error?: string;
}
```

**Side Effects**:
- Revalidates `/dashboard` and `/reviews` paths
- Updates cache with new reviews

##### `searchGooglePlaces()`
Searches Google Places by text query

**Parameters**:
- `query`: Search string

**Returns**:
```typescript
{
  success: boolean;
  places?: GooglePlaceDetails[];
  error?: string;
}
```

#### 5. Display & Attribution

**GoogleReviewCard Component**:
Displays individual Google reviews with required attribution

**Features**:
- Guest name and review date
- Star rating (1-5 scale)
- Full review text
- **Google attribution footer**: Shows Google logo + "Powered by Google" text

**Attribution Requirements**:
```jsx
<div className="flex items-center gap-2 text-xs text-gray-500">
  <img src="[Google logo URL]" alt="Google" />
  <span>Powered by Google</span>
</div>
```

**Compliance**:
- Required by Google Places API Terms of Service
- Must be displayed on all Google reviews
- Logo and text must be clearly visible

#### 6. Technical Implementation

**GooglePlacesClient Class**:
```typescript
class GooglePlacesClient {
  // Search for places
  async searchText(query: string): Promise<GooglePlaceDetails[]>
  
  // Get detailed place information
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails>
  
  // Get reviews for a place
  async getReviews(placeId: string): Promise<GooglePlaceReview[]>
}
```

**Authentication**:
- API Key: Set via `GOOGLE_PLACES_API_KEY` environment variable
- Header: `X-Goog-Api-Key: YOUR_API_KEY`

**Caching**:
- Search results: 24 hours (`revalidate: 86400`)
- Place details: 6 hours (`revalidate: 21600`)

### Limitations & Considerations

#### API Restrictions
1. **Review Count**: Google typically returns only ~5 most recent reviews
2. **Historical Data**: Full review history not available via API
3. **Update Frequency**: Reviews may be delayed vs. Google Maps website
4. **Rate Limits**: Subject to Google Places API quotas

### Setup Instructions

#### 1. Obtain API Key
```bash
1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable "Places API (New)"
4. Create API key with Places API access
5. Restrict key to your domain (production)
```

#### 2. Configure Environment
```bash
# .env.local
GOOGLE_PLACES_API_KEY=AIza...your-key-here
```

#### 3. Verify Installation
```bash
# Test search endpoint
curl "https://your-domain.com/api/google/search?q=Your+Property+Name"

# Should return places array
```

#### 4. Link Properties
1. Navigate to property configuration
2. Use GooglePlaceConfig component
3. Search for property
4. Select correct place from results
5. Sync reviews

### Integration Workflow

```
Property Manager Flow:
1. Open property settings
2. Search for property on Google
3. Confirm correct place by reviewing rating/count
4. Click "Sync Reviews Now"
5. Google reviews appear in dashboard
6. Reviews auto-approved (unless manually changed)
7. Display on property page with attribution

Technical Flow:
User Input → API Search → Place Selection → 
Review Fetch → Normalization → Storage → 
Display with Attribution
```

### Error Handling

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| "API key not configured" | Missing env variable | Set `GOOGLE_PLACES_API_KEY` |
| "Place not found" | Invalid Place ID | Re-search and re-link |
| "API quota exceeded" | Too many requests | Implement rate limiting |
| "Permission denied" | API key restrictions | Check API key settings |

**Error Response Format**:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

## Future Enhancements

Potential improvements for consideration:
- Bulk approval operations
- Review response functionality
- Email notifications for new reviews
- Advanced sentiment analysis
- Export to CSV/PDF
- Mobile app version
- Multi-language support
- Custom approval workflows
- Automatic Google review sync scheduling
- Review photo integration
- Multi-location Google Places management