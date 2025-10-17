# Provider Episode Fetching Optimization

## Summary
Optimized the episode fetching logic to only load episodes from the **selected provider** instead of fetching from all providers simultaneously. This significantly reduces loading time and API calls.

## Changes Made

### 1. API Endpoint (`src/app/api/episode/[...animeid]/route.js`)
- Added support for `provider` query parameter
- Only fetches episodes from the specified provider when parameter is present
- Falls back to fetching from all providers if no provider is specified (backward compatibility)

**Key Changes:**
```javascript
const selectedProvider = searchParams.get('provider');
const shouldFetchHiAnime = !selectedProvider || selectedProvider === 'hianime';
const shouldFetchAnimePahe = !selectedProvider || selectedProvider === 'animepahe';
```

### 2. Data Fetching Function (`src/lib/getData.js`)
- Updated `getEpisodes()` function to accept optional `provider` parameter
- Passes provider to API endpoint when specified

**Function Signature:**
```javascript
getEpisodes(id, idMal, status, refresh = false, provider = null, retryCount = 0)
```

### 3. Episode List Component (`src/components/videoplayer/EnhancedEpisodeList.js`)
- Initial load now fetches only from the selected provider
- Provider switching triggers a new fetch for that specific provider
- Refresh button only refreshes the currently selected provider

**Key Updates:**
- Initial fetch passes `defaultProvider || onprovider`
- `handleProviderChange()` now fetches episodes when provider changes
- `refreshEpisodes()` only refreshes current provider

## Benefits

1. **Faster Loading**: Episodes appear much quicker since only one provider is queried
2. **Reduced API Calls**: Fewer requests to external APIs
3. **Better UX**: Users see episodes immediately for their selected provider
4. **Lower Server Load**: Less processing and network overhead
5. **Bandwidth Savings**: Only fetches what's needed

## Behavior

### Before
- Fetched episodes from HiAnime AND AnimePahe simultaneously
- Users had to wait for both providers to respond
- Slower initial page load

### After
- Fetches episodes only from the selected provider
- When user switches providers, fetches episodes for the new provider
- Much faster initial load and provider switching

## Backward Compatibility

The API endpoint still supports fetching from all providers if no `provider` parameter is specified, ensuring backward compatibility with any other parts of the application that might use this endpoint.

## Server Switching on Watch Page

Enhanced the existing server selector in the episode list section to properly switch servers:

**Features:**
- Shows all available servers (Server 1, Server 2, etc.)
- Displays separate SUB and DUB options
- Highlights the currently active server
- Switches to the selected server and reloads episodes
- Maintains the same episode number when switching
- Navigates to the new server URL automatically

**Location:** In the "Episode Selection" section above the episode grid

**How it works:**
1. When you click a server button, it fetches episodes from that provider only
2. Finds the same episode number on the new server
3. Navigates to the new server URL with proper parameters
4. Episode list updates to show episodes from the selected server

## Testing

To test the optimization:
1. Navigate to any anime watch page
2. Notice faster episode list loading
3. **NEW:** Use the server selector above the video player to switch servers
4. Switch between SUB/DUB options using the server buttons
5. Episodes should load quickly for each provider
6. Use the refresh button in the episode list to reload episodes for current provider only
7. Server switching maintains your current episode number
