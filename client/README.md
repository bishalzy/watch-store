# Frontend - Online Watch Store

This is the frontend for the Online Watch Store built with **React 18**, **Tailwind CSS**, **TypeScript**, and **Vite**.

---

## Environment Variables

Create a `.env` file at the root of the `client/` directory (`client/.env`) using [`client/.env.example`](.env.example) as reference:

```env
VITE_APP_API_URL="http://localhost:5000/api"
```

---

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The development server will run at `http://localhost:5173`.

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   # Run a single component test
   npm test Button.test.tsx

   # Run all tests
   npm run test
   ```

---

## Key Algorithms

### Fuzzy Search (Levenshtein Distance)
The store implements an in-browser fuzzy search for the watch catalog using the **Levenshtein Distance** algorithm (located in [`src/utils/algorithm.ts`](./src/utils/algorithm.ts)). It calculates edit distances between search terms and watch names/categories to provide resilient, typo-tolerant search suggestions and filtered results.

---

## Project Structure & Components

### `components/ui/`

##### AIChat Components (`components/ui/AIChat/`)
- [`AIChatWidget.tsx`](./src/components/ui/AIChat/AIChatWidget.tsx): Floating trigger button styled in the store's dark luxury aesthetic (`#1a1a1a`, white border, cyan `#1bddf3` spark accent) to launch the AI Watch Assistance.
- [`AIChatWindow.tsx`](./src/components/ui/AIChat/AIChatWindow.tsx): The conversational chat drawer matching the `SidePanelContainer` style (`border-b-2 border-b-white`, `RxCross1` close button). Features formatted markdown text (bolding, custom bullet points), suggestion chips, an animated typing indicator, and viewport anchoring (`block: "start"`) so incoming AI messages start at the top of the viewport rather than auto-scrolling to the bottom of the card list.
- [`AIChatProductCard.tsx`](./src/components/ui/AIChat/AIChatProductCard.tsx): Interactive watch recommendation cards embedded in AI responses. Displays watch thumbnail, category tag, live stock status badge, formatted price, "View Watch" page link, and direct "Add to Cart" action button.

##### Backdrop component
Creates the dark, blurry background overlay when modal popups or side panels appear. Handles outside clicks and smooth fade-out animations.

##### ConfirmModal component
Dialog modal used when a confirmation prompt is required (e.g., product deletion by an administrator).

##### Error component
Standardized error message presentation across forms and data-fetching views.

##### FetchStatusDisplay component
Container wrapper handling loading spinners, error states, and empty states uniformly across data-driven views.

##### FormFieldWrapper component
Wraps form input fields, labels, and validation error messages consistently.

##### ProductForms component
Reusable form components used in both adding new watches and updating existing watches (`UpdateProductForm.tsx` and `AdminProductPage.tsx`).

##### SidePanel component
Slide-in panel container used for the Cart and User Authentication forms (Login/Register). Features smooth transition animations and backdrop integration.

##### SuccessMessage component
Notification banner shown upon successfully adding or updating products and categories.

##### UserFormMenu component
Modal drawer wrapping the Login and Registration forms with seamless switching between tabs.

---

### `store/` (Zustand State Management)
- [`chatStore.ts`](./src/store/chatStore.ts): Manages AI Assistance conversational state, message history, multi-turn context window, loading state, and drawer visibility (`isOpen`, `sendMessage`, `clearChat`, `toggleChat`).
- `cartStore.ts`: Manages shopping cart items, quantities, local storage synchronization, and price subtotals.
- `authStore.ts`: Authentication status, login check, and JWT verification state.
- `userStore.ts`: Current logged-in user profile, role (`USER` vs `ADMIN`), and user ID.
- `uiStore.ts`: Navigation bar height, drawer toggles (cart, user menu), and modal visibility.
- `navbarStore.ts`: Global search bar input state for catalog filtering.

---

### `services/` (API Client Layer)
- [`services/api/chat/chatAPI.ts`](./src/services/api/chat/chatAPI.ts): Axios client communicating with `POST /api/chat`.
- `services/api/auth/authAPI.ts`: User authentication, login, registration, and token validation.
- `services/api/product/productAPI.ts`: Public catalog and product category retrieval.
- `services/api/admin/adminProductAPI.ts`: Admin product creation, update, and deletion endpoints.
- `services/api/order/orderAPI.ts`: Order placement and customer order history.

---

### `types/`
- [`types/chatType.ts`](./src/types/chatType.ts): Data contracts for `ChatMessage`, `ChatMessageDTO`, `ChatRequestDTO`, and `ChatResponseDTO`.
- `types/productType.ts`: `ProductDTO` and product category types.
- `types/authType.ts`: Authentication request/response interfaces.
- `types/cartType.ts`: Cart item structures.

---

### `hooks/`
- `useForm.ts`: Generic form validation and submission handler with dirty-field tracking.
- `useProductForm.ts`: Specialized hook handling product form data and multipart image file uploads.
- `useDirtyField.ts`: Tracks whether form inputs have been touched or modified.
- `useSortedList.ts`: Generic hook for sorting list data (e.g. price low-high, A-Z, newest).
