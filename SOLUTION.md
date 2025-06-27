#   Solution Summary & Implementation Notes

## Backend

### 1. Error Handling Middleware
- Refactored `errorHandler` into a proper Express middleware that returns consistent JSON errors.
- Removed insecure dynamic code execution (`Function.constructor`) to improve security and maintainability.

### 2. External Token Fetch (`getCookie`)
- Replaced the broken external API call with a mock implementation for local development.
- Introduced a local mock server (`mockTokenServer.js`) serving tokens at `http://localhost:4000/api/token`.
- `getCookie` was preserved in structure but now fetches from the mock server, simulating a real API call safely.

### 3. Development Workflow
- Updated `package.json` scripts:
  - `npm run start:api`: Starts backend only.
  - `npm run start:mock`: Starts mock token server.

### 4. Logging
- Created custom logging middleware:
  - Logs requests/responses with status and IP.
  - Uses structured JSON.
  - Stores logs in daily files under a dedicated `/logs` folder.
  - Uses only built-in `fs` (non-blocking) — no external libs.

### 5. Performance Optimizations
- Refactored blocking I/O in routes to use async/await with `fs.promises`.
- Added smart caching in `/api/stats`: recalculates only if the data file is modified.

### 6. Data Validation
- POST `/api/items` now includes validation for required fields (`name`, `price`, `category`) with proper type checks.
- Prevents invalid data from being saved.

### 7. Search & Filtering
- Enhanced `/api/items` with improved query search:
  - Normalizes text (case-insensitive, accent-insensitive).
  - Escapes special characters to prevent RegExp errors.
  - Allows combining `q` (query) and `limit` parameters safely.

### 8. Testing (Jest + Supertest)
- Unit tests for items and stats routes, covering:
  - Valid and invalid POST payloads.
  - GET with search queries and limits.
  - Error scenarios such as JSON parsing failure.
- Used `fs.promises` mocking and `nock` to isolate external dependencies.

### General Suggestions from Comments
- Use async/non-blocking I/O for all file operations.
- Validate all incoming data, especially for POST/PUT endpoints.
- Normalize and sanitize user input for search and filtering.
- Use utility modules where possible to avoid code duplication.
- Keep logging and error handling robust and centralized.


## How to Run the Project

1. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```

2. **Start both the mock token server and the backend API:**
   ```sh
   npm run dev:all
   ```
   - This will start:
     - The mock token server at `http://localhost:4000/api/token`
     - The backend API at `http://localhost:3001`

3. **Access your API as usual.**
   - All token requests will be handled by the local mock server, ensuring reliable development without external dependencies.

4. **Frontend:**
   ```sh
   cd frontend
   npm install
   npm start
   ```
   - The frontend proxies `/api` requests to `http://localhost:3001`.

## Frontend

### 1. Memory Leak Fix
- Fixed a memory leak in `Items.js` by using an `active` flag in the data-fetching `useEffect`, preventing state updates after unmount.

### 2. Pagination & Search
- Implemented server-side pagination and search in the item list, fully integrated with backend API (`q`, `page`, `limit`).
- The UI updates page and search state smoothly, with no flicker or memory leaks.

### 3. Performance (Virtualization)
- Integrated `react-window` (`FixedSizeGrid`) for virtualized, high-performance rendering of large item lists.
- The grid is fully responsive and adapts to window size, with no scrollbars and a modern, clean layout.

### 4. UI/UX Modernization
- Refactored the item grid and cards for a visually modern, pleasant, and responsive look:
  - Modern card design with shadows, rounded corners, and consistent spacing.
  - Skeleton loaders for smooth loading states.
  - Modernized search bar, select, and pagination controls with gradients, pill shapes, and improved accessibility.
  - The "Total" count is now visually highlighted in a pill, matching the overall UI style.
  - All controls are responsive and visually consistent.
- All major inline styles can be migrated to CSS for further maintainability if desired.

### 5. General Improvements
- All frontend code is idiomatic, clean, and uses React best practices.
- The UI is robust, performant, and visually appealing, matching the design requirements.

## Notes

- The mock token was only done because I wasn't getting any reponse from the endpoint initially implemented in the getCookies function.
