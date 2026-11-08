# Sam's Kitchen: Web Client

React single-page app for Sam's Kitchen, a single-restaurant food ordering and delivery platform for Bangladesh. It serves three kinds of users from one codebase: customers who order food, an admin who runs the kitchen and menu, and riders who deliver and get paid out.

The REST API lives in `../sam's-kitchen-server`. See its README for the endpoints, order lifecycle rules and server configuration.

## Roles

Roles are stored in the database (`rolesCollection`), and an account's role is read from there on every request. Nothing about a role is hard-coded in the sign-in flow.

| Role         | How you get it                                                                                    | What you can do                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Customer** | Chosen at registration, or on the onboarding screen after a first Google or Facebook sign-in      | Browse the menu, order, pay, track orders, review dishes                                                        |
| **Rider**    | Chosen the same way, then approved by the admin. Delivery details are collected during onboarding | Accept prepared orders in your thana, verify pickup and delivery with codes, request cashouts                   |
| **Admin**    | `role: "admin"` set on the user document in MongoDB (there is no in-app way)                      | Manage the menu, browse users, prepare orders in the kitchen, review rider applications, pay out rider cashouts |

A new rider sees an "under review" notice on the dashboard, and the rider menu stays hidden, until an admin approves the application.

If the application is rejected, the rider keeps the account, sees the admin's reason on the dashboard, and can update the details and apply again, or switch to a customer account. Admins can re-open a rejected application from the Rejected tab.

Only customers can order. Admins and riders do not see the cart icon or any add-to-cart / order buttons, and `/placeOrder` and the payment page are customer-only. Visitors who are not signed in still see the buttons and are sent to login when they click them. The API enforces the same rule.

## Features

**Customers**

- Browse the menu and offers with search, sorting, price range, availability and discount filters; dish reviews with photos
- Cart stored in the browser; checkout with a Bangladesh region / district / thana address
- Pay by card (Stripe) or mobile and bank methods (SSLCommerz)
- Order tracking timeline, PDF receipt, live notifications
- Light and dark themes (dark by default), responsive down to 315px wide

**Admin**

- Dashboard with revenue, order and user analytics, including every order status
- **Kitchen Orders:** confirmed orders wait here while the chef cooks; "Mark as prepared" releases them to riders. Tabs: To prepare and Prepared
- **All Orders:** every order in the system in a table (cards on phones), with status chips and counts, search (order ID, customer, phone, area, dish), payment, period (today, 7 or 30 days, this month) and sort filters, the paid total for the current filter, and an expandable row with items, address, rider and the price breakdown
- Add, edit and delete foods (whole-taka prices, live "customers will pay" preview); search the menu by name, availability, offers and price; search and filter users by role and sign-in method; review rider applications (Pending and Rejected tabs, search, region filter), approve them, or reject them with a reason the rider will see
- **Cashout Requests:** see each rider's payout details, send the money, then mark the request cashed out with a proof image

**Riders**

- Dashboard with earnings, deliveries and an availability switch
- Pending Deliveries: offers for prepared orders in your thana, and your active deliveries; email-code verification at pickup and delivery
- **Cashouts:** one request for your full available balance, with a payout method (bKash, Nagad, Rocket, card or bank) and its details; see the status and the admin's proof once paid

## Order statuses in the UI

`pending` (unpaid) → `confirmed` (paid, being cooked) → `prepared` (ready, waiting for a rider) → `assigned` → `picked` → `delivered`, or `cancelled` while unpaid.

Delivery charge: ৳30 for one cart line, ৳50 for more than one, free when the order total reaches ৳1000. The checkout form calculates it.

## Tech stack

- React 19, React Router 7, Vite 7
- Tailwind CSS 4 and DaisyUI 5
- TanStack Query, Axios, React Hook Form
- Ant Design (pagination, ratings), React Select (every dropdown), Recharts, Framer Motion, jsPDF, React Toastify
- Firebase Authentication (email/password, Google, Facebook)
- Stripe and SSLCommerz checkout, Cloudinary image uploads

## Getting started

Requires Node.js 20 or later and a running API (see the server README).

```sh
npm ci
npm run dev        # http://localhost:5173
```

The Vite dev server runs on port `5173` and proxies `/api/*` to the API at `http://127.0.0.1:3000`, removing the `/api` prefix. Start the API first.

### Environment

Create `.env.local` (already git-ignored). Never commit it or paste its values anywhere public.

| Variable                                                                                                         | Purpose                                                                                         |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `VITE_apiKey`, `VITE_authDomain`, `VITE_projectId`, `VITE_storageBucket`, `VITE_messagingSenderId`, `VITE_appId` | Firebase web app config                                                                         |
| `VITE_cloudinary_cloud_name`, `VITE_cloudinary_preset_name`                                                      | Cloudinary cloud and an **unsigned** upload preset (food photos, review photos, cashout proofs) |
| `VITE_payment_key`                                                                                               | Stripe **publishable** key                                                                      |
| `VITE_Api_Url`                                                                                                   | API base URL for production builds. In development the proxy is used instead.                   |

### Scripts

| Command           | Does                          |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the dev server          |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Preview the production build  |
| `npm run lint`    | Run ESLint                    |

## Routes

| Route                                                                                   | Access    | Purpose                                                                                            |
| --------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `/`, `/allFoods`, `/offers`, `/foods/:foodId`, `/about`                                 | Public    | Menu and offers (search, sort, price and availability filters), dish details, info                 |
| `/login`, `/register`                                                                   | Public    | Sign in and sign up (role chosen here). These pages have their own layout, without the site navbar |
| `/onboarding`                                                                           | Signed in | Choose a role after a first provider sign-in                                                       |
| `/placeOrder`                                                                           | Customer  | Checkout                                                                                           |
| `/dashboard`                                                                            | Signed in | Role-specific overview                                                                             |
| `/dashboard/manageProfile`, `/dashboard/myOrders`, `/dashboard/order-tracking/:orderId` | Signed in | Profile, order history, tracking                                                                   |
| `/dashboard/payment/:orderId`                                                           | Customer  | Pay for an order                                                                                   |
| `/dashboard/kitchenOrders`                                                              | Admin     | Prepare confirmed orders                                                                           |
| `/dashboard/allOrders`                                                                  | Admin     | Browse and filter every order                                                                      |
| `/dashboard/cashoutRequests`                                                            | Admin     | Pay out rider cashouts                                                                             |
| `/dashboard/addFood`, `/dashboard/manageFoods`, `/dashboard/editFood/:foodId`           | Admin     | Menu management                                                                                    |
| `/dashboard/manageUsers`, `/dashboard/pendingRiders`                                    | Admin     | Browse users, review rider applications (pending and rejected)                                     |
| `/dashboard/pendingDeliveries`, `/dashboard/completedDeliveries`                        | Rider     | Offers, active and past deliveries                                                                 |
| `/dashboard/cashouts`                                                                   | Rider     | Request and track cashouts                                                                         |
| `/forbidden`                                                                            | Public    | Shown when a role guard blocks access                                                              |

Access is enforced by the guards in `src/Routes` (`PrivateRoutes`, `AdminRoutes`, `RiderRoutes`, `CustomerRoutes`). The role comes from the database through `GET /users/me`, and role definitions (labels, descriptions, which roles people can pick) come from `GET /roles`. `SessionGate` keeps anyone without a role inside `/onboarding`. Riders start as pending applications and see a notice until an admin approves them.

## Project structure

```
public/                 regions.json and outlets.json (delivery coverage), favicon, _redirects (Netlify SPA fallback)
index.html
vite.config.js          dev server and /api proxy
firebase.json, .firebaserc
src/
├── main.jsx
├── Router/             route table
├── Routes/             SessionGate, Private / Admin / Rider / Customer guards
├── Layouts/            RootLayout and DashboardLayout (thin Outlet wrappers), PublicFrame (header, navbar, footer), DashboardFrame (header, role-based sidebar, content area), ShellContext
├── Contexts/           Auth (Firebase auth provider), Confirm (promise-based confirmation dialog)
├── Firebase/           Firebase initialisation
├── Hooks/              useAuth, useAxios, useAxiosSecure, useUserProfile, useUserRole, useRoles, useCanOrder, useImageUpload, useConfirm
├── CartUtils/          localStorage cart helpers
├── lib/                money (whole-taka helpers), dashboardLinks (menu per role), authErrors, redirect (safe post-sign-in destination), cashoutMethods, formatters, generateReceipt
├── Components/
│   ├── Auth/           sign-in shell, 3D order scene, role cards, rider details form, tilt effect
│   ├── Forms/          Field, TextAreaField, SelectField, PasswordField, FormKit (page, section, image dropzone, action bar)
│   ├── Skeletons/      Skeleton (primitive), CardSkeletons (one per card), PageSkeletons (one per page), RouteSkeleton (picks the page skeleton for guards and lazy routes and draws the real header, navbar and sidebar around it when needed)
│   ├── Charts/         ChartKit (KPI cards, panels, tooltips)
│   └── Shared/         AppSelect, AppPagination, ListToolbar, PageHeading, FilterTabs, EmptyResults, Avatar, LazyImage, LazyMount, FoodListing, FoodFilters, header, cart, food card, notifications, ...
├── assets/             images
└── Pages/
    ├── Home, AllFoods, Offers, FoodDetails, AboutUs
    ├── PlaceOrder      checkout form
    ├── Login, Register, Onboarding, Forbidden, ErrorPage
    └── Dashboard/      role dashboards, MyOrders, OrderTracking, Payment,
                        KitchenOrders, CashoutRequests, RiderCashouts,
                        PendingDeliveries, CompletedDeliveries, ...
```

## How it talks to the API

- `useAxios` is a public Axios instance (`/api` in development, `VITE_Api_Url` in production) with cookies enabled.
- `useAxiosSecure` is used for protected calls. Protected endpoints also expect the signed-in user's `?email=` query parameter.
- Notifications use the API's server-sent event stream for live updates, with a periodic refresh as a fallback.

## Search and filters

Every list page has a search box and the filters that make sense for it, built from `Components/Shared/ListToolbar`. Filtering runs on the server (see the API reference in the server README), and pages keep the previous results on screen while a new search loads.

| Page                       | Search                              | Filters and sorting                     |
| -------------------------- | ----------------------------------- | --------------------------------------- |
| All foods, Offers          | Name, description                   | Price range, availability, offers, sort |
| Dish reviews               | None                                | Sort, star rating, with photos          |
| My orders                  | Order ID, dish, address             | Status (also the count tiles), sort     |
| Kitchen orders             | Order ID, customer, thana, dish     | Arrival order                           |
| Pending deliveries         | Order ID, customer, area, dish      | Applies to offers and active deliveries |
| Completed deliveries       | Order ID, customer, area, dish      | Sort                                    |
| Rider cashouts (history)   | None                                | Status, payout method, sort             |
| Cashout requests (admin)   | Rider name, email, transaction ID   | Payout method, sort                     |
| Manage foods (admin)       | Name, description                   | Availability, offers, sort              |
| Manage users (admin)       | Name, email                         | Role, sign-in method, sort              |
| Rider applications (admin) | Name, email, phone, thana, district | Pending or rejected tab, region, sort   |

## Sign-in, roles and onboarding

- `AuthProvider` treats an email and password account as signed out until its email is verified. A first-time Google or Facebook sign-in creates the account without a role.
- Registering with email and password stores the role chosen on the form.
- `SessionGate` wraps every route. Anyone signed in without a role (or a rider without delivery details) is sent to `/onboarding`, then on to where they were headed.
- Role guards and menus read the role from `useUserProfile` (`GET /users/me`), never from the browser.
- After sign-in or onboarding, people are sent to the page they were headed for (`lib/redirect.js`). The auth pages are never a destination, and anyone already signed in who opens `/login` or `/register` is sent on to the site.

## Amounts

Every amount is a whole taka and is never shown or saved with decimals. `src/lib/money.js` is the single place for the maths: the discounted unit price is rounded first, so item lines, subtotals, discounts and totals always add up. Foods, orders and payments are rounded again on the server.

## Design system

- Palette: deep teal and saffron in dark mode, ivory and teal in light mode (DaisyUI themes and tokens at the top of `src/index.css`).
- Type: Fraunces for headings, Manrope for body text.
- Depth: raised "keycap" primary buttons, layered card shadows, and pointer-driven 3D tilt (`Tilt3D`) on the auth scene and the 404 and 403 pages.

## Lazy loading

- **Images:** food, cart, search, review and menu-management images use `Components/Shared/LazyImage`. It loads when the image nears the viewport, shows a shimmer until it has loaded, fades in, and falls back to an icon if the file is broken. Put it inside a `relative` box with a fixed size or aspect ratio. The hero dish and the main image on the dish page load right away (`priority`).
- **Food cards:** on the menu and offers pages each card mounts through `Components/Shared/LazyMount`, so cards far down the list stay as skeletons until they are about 400px from the screen.
- **Notifications:** the list and its code load the first time the panel opens (or on hover or focus of the bell), and the data is fetched when the browser is idle or the panel opens. Older updates load by themselves as you scroll to the end of the list.
- **Pages:** every page except the always-needed layout is code-split with `React.lazy`, and each shows its own skeleton while the code loads.

## UI conventions

- Every dropdown is `Components/Shared/AppSelect` (React Select with the `.select__*` theme in `index.css`). Do not use a native `<select>`. Selects and their options always show a pointer cursor (a disabled one shows not-allowed), and options change colour without any transition so hovering never flickers.
- Pagination is `Components/Shared/AppPagination`, right aligned.
- Every card and every page has its own skeleton in `Components/Skeletons` (`CardSkeletons.jsx` for cards, `PageSkeletons.jsx` for pages). A skeleton repeats the wrapper classes, spacing and sizes of the real thing, so nothing moves when the data arrives. When you change a card or page layout, change its skeleton in the same commit. Do not reuse one skeleton for a different card.
- Route guards, `SessionGate` and the lazy route fallbacks use `RouteSkeleton`, which looks at the URL and shows the skeleton of the page that is about to appear. Add new routes to its table, with the frame the page lives in (`"public"`, `"dashboard"` or `null` for pages with their own full-page layout). A path that is not in the table gets the 404 skeleton, and `/forbidden` has its own 403 skeleton.
- The header, navbar, footer and dashboard sidebar are never replaced by a skeleton. `PublicFrame` and `DashboardFrame` hold them, and both the real layouts and `RouteSkeleton` render through these frames, so they stay put on first load. A guard that sits outside the layout (`SessionGate`, `PrivateRoutes`) gets the real frame drawn around the skeleton; a guard already inside a layout does not, because `ShellContext` tells `RouteSkeleton` a frame is present. The navbar avatar and the sidebar profile card and role links show small placeholders until the session and role are known.
- Spacing: the top gap of public pages comes from `<main>` in `PublicFrame` (`pt-5 sm:pt-8`), so a page and its skeleton use only `mb-16` at the bottom, never `my-16`. Keep a skeleton's outer wrapper identical to the page's.
- Dashboard layout: every dashboard list page uses the same outer wrapper, `w-full space-y-6 pb-8`, so all of them have the width of the Kitchen Orders page (the dashboard `main` already limits the width, so pages add no `max-w-*` of their own). Each starts with `PageHeading`, the same heading card as Manage Profile (eyebrow, title, short description, optional back link and actions on the right). When you add or change a page, change its skeleton's wrapper and heading (`ListHeadingSkeleton`) the same way. Tabs and filter chips above a list use `FilterTabs`, so the active tab looks the same everywhere. The chart range tabs on the admin and rider dashboards (`Segmented` in `ChartKit`) are the same component: 7D, 14D and 30D show single days and 12M shows one bar per month, January to December, from `monthly`. Only Manage Profile (every role) keeps its own narrower layout; add and edit food use `FormPage` with `standard`, and the dashboards, payment and order tracking pages use `PageHeading` too. The rider pending notice stays a centred card.
- Feedback uses React Toastify. Anything that needs a yes or no (deleting a dish, rejecting a rider, cancelling an order) uses `useConfirm()`, which opens the themed dialog from `Contexts/Confirm`. Pass `input: { label, placeholder, maxLength }` to ask for a short note too; the promise then resolves to the note, or to `null` if cancelled (rejecting a rider asks for a reason this way). SweetAlert2 is not used.
- Lists use `ListToolbar` for search and filters and `EmptyResults` for "nothing matches". Dashboard list pages start with `PageHeading`.
- People appear as `Avatar` (photo, with initials if there is none). Food and review images use `LazyImage`, which shows a "No image" panel that fills the same box when the file is missing.
- Forms use `Components/Forms` (`Field`, `TextAreaField`, `SelectField`, `FormPage`, `FormSection`, `ImageDropzone`, `FormActions`).
- Buttons show `cursor: not-allowed` while disabled or loading and `cursor: pointer` otherwise (one block at the end of `index.css`).
- Layouts are checked down to 315px wide: avoid fixed widths, and wrap tables in `overflow-x-auto`.

## Deployment

Build with `npm run build` and publish `dist/`. `public/_redirects` provides the single-page-app fallback on Netlify, and `firebase.json` / `.firebaserc` are there for Firebase Hosting. Set the `VITE_*` variables in your host.

The dish share link in `src/Components/Shared/ShareFood.jsx` is hard-coded to the production site URL. Change it if you deploy to another domain.

## Known limitations

- Order totals and the delivery charge are calculated in the browser and sent to the API as is.
- There are no automated tests yet.