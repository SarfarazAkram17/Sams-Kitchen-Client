# Sam's Kitchen: Client

Web client for **Sam's Kitchen**, a single-restaurant food ordering and delivery platform for Bangladesh. One React app serves three kinds of users: customers who order food, an admin who runs the kitchen and menu, and riders who deliver orders and get paid out.

- **Live site:** https://sams-kitchen.netlify.app
- **API:** a separate repository, _Sam's Kitchen Server_. The client needs it running to work.

## Contents

- [Roles](#roles)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Routes](#routes)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Development conventions](#development-conventions)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Roles

Roles are stored in the database and read from the API on every request. Nothing about a role is hard-coded in the sign-in flow.

| Role         | How you get it                                                                            | What you can do                                                                               |
| ------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Customer** | Chosen at registration, or on the onboarding screen after a first Google/Facebook sign-in | Browse the menu, order, pay, track orders, review dishes                                      |
| **Rider**    | Chosen the same way, then approved by the admin                                           | Accept prepared orders in your thana, verify pickup and delivery with codes, request cashouts |
| **Admin**    | Set `role: "admin"` on the user document in MongoDB (there is no in-app way)              | Manage the menu and users, prepare orders, review rider applications, pay out rider cashouts  |

- A new rider sees an "under review" notice, and the rider menu stays hidden, until an admin approves the application.
- A rejected rider keeps the account, sees the admin's reason, and can update the details and apply again, or switch to a customer account.
- Only customers can order. Admins and riders do not see the cart or any order buttons, and the API enforces the same rule. Visitors who are not signed in are sent to login when they try to order.

## Features

**Customers**

- Browse the menu and offers with search, sorting, price range, availability and discount filters
- Dish reviews with photos, and sharing on social media
- Cart saved in the browser; checkout with a region, district and thana address
- Pay by card (Stripe) or mobile and bank methods (SSLCommerz)
- Order tracking timeline, PDF receipt, cancel while unpaid, live notifications
- Light and dark themes (dark by default), responsive down to 315px

**Admin**

- Dashboard with revenue, order and user analytics
- **Kitchen Orders:** confirmed orders wait here while the chef cooks; "Mark as prepared" releases them to riders
- **All Orders:** every order in a table (cards on phones), with status tabs and counts, search, payment, period and sort filters, and expandable rows
- Add, edit and delete foods; search and filter users; review rider applications (approve, or reject with a reason)
- **Cashout Requests:** see each rider's payout details, send the money, then mark it cashed out with a proof image

**Riders**

- Dashboard with earnings, deliveries and an availability switch
- Offers for prepared orders in your thana, and your active deliveries, with email-code verification at pickup and delivery
- **Cashouts:** one request for your full balance by bKash, Nagad, Rocket, card or bank, with the status and the admin's proof once paid

Dashboard charts have range tabs (7D, 14D, 30D and 12M); monthly charts run January to December.

### Order statuses

`pending` (unpaid) → `confirmed` (paid, being cooked) → `prepared` (waiting for a rider) → `assigned` → `picked` → `delivered`, or `cancelled` while unpaid.

Delivery charge: ৳30 for one cart line, ৳50 for more than one, free when the order total reaches ৳1000.

## Tech stack

- React 19, React Router 7, Vite 7
- Tailwind CSS 4 and DaisyUI 5
- TanStack Query, Axios, React Hook Form
- Ant Design (pagination, ratings), React Select, Recharts, Framer Motion, jsPDF, React Toastify
- Firebase Authentication (email/password, Google, Facebook)
- Stripe and SSLCommerz checkout, Cloudinary image uploads

## Getting started

**Requirements:** Node.js 20 or later, and the API running (see the server repository).

```sh
npm ci
npm run dev        # http://localhost:5173
```

The dev server proxies `/api/*` to the API at `http://127.0.0.1:3000` and removes the `/api` prefix, so start the API first.

### Environment variables

Create `.env.local` (git-ignored). Never commit it.

| Variable                                                                                                         | Purpose                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `VITE_apiKey`, `VITE_authDomain`, `VITE_projectId`, `VITE_storageBucket`, `VITE_messagingSenderId`, `VITE_appId` | Firebase web app config                                                                   |
| `VITE_cloudinary_cloud_name`, `VITE_cloudinary_preset_name`                                                      | Cloudinary cloud and an **unsigned** upload preset (food photos, reviews, cashout proofs) |
| `VITE_payment_key`                                                                                               | Stripe **publishable** key                                                                |
| `VITE_Api_Url`                                                                                                   | API base URL for production builds (development uses the proxy)                           |

### Scripts

| Command           | Does                          |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the dev server          |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Preview the production build  |
| `npm run lint`    | Run ESLint                    |

## Routes

| Route                                                                                   | Access    | Purpose                                          |
| --------------------------------------------------------------------------------------- | --------- | ------------------------------------------------ |
| `/`, `/allFoods`, `/offers`, `/foods/:foodId`, `/about`                                 | Public    | Menu, offers, dish details, about                |
| `/login`, `/register`                                                                   | Public    | Sign in and sign up (own layout, no site navbar) |
| `/onboarding`                                                                           | Signed in | Choose a role after a first provider sign-in     |
| `/placeOrder`                                                                           | Customer  | Checkout                                         |
| `/dashboard`                                                                            | Signed in | Role-specific overview                           |
| `/dashboard/manageProfile`, `/dashboard/myOrders`, `/dashboard/order-tracking/:orderId` | Signed in | Profile, order history, tracking                 |
| `/dashboard/payment/:orderId`                                                           | Customer  | Pay for an order                                 |
| `/dashboard/kitchenOrders`, `/dashboard/allOrders`, `/dashboard/cashoutRequests`        | Admin     | Kitchen, all orders, rider payouts               |
| `/dashboard/addFood`, `/dashboard/manageFoods`, `/dashboard/editFood/:foodId`           | Admin     | Menu management                                  |
| `/dashboard/manageUsers`, `/dashboard/pendingRiders`                                    | Admin     | Users and rider applications                     |
| `/dashboard/pendingDeliveries`, `/dashboard/completedDeliveries`, `/dashboard/cashouts` | Rider     | Deliveries and cashouts                          |
| `/forbidden`                                                                            | Public    | Shown when a role guard blocks access            |

Access is enforced by the guards in `src/Routes` (`PrivateRoutes`, `AdminRoutes`, `RiderRoutes`, `CustomerRoutes`).

## Project structure

```
public/                 regions.json, outlets.json (delivery coverage), favicon, _redirects (Netlify SPA fallback)
vite.config.js          dev server and /api proxy
src/
├── main.jsx
├── Router/             route table
├── Routes/             SessionGate and the role guards
├── Layouts/            RootLayout, DashboardLayout, PublicFrame, DashboardFrame, ShellContext
├── Contexts/           Auth (Firebase), Confirm (promise-based confirmation dialog)
├── Firebase/           Firebase initialisation
├── Hooks/              useAuth, useAxios, useAxiosSecure, useUserProfile, useUserRole, useRoles,
│                       useCanOrder, useImageUpload, useConfirm
├── CartUtils/          localStorage cart helpers
├── lib/                money, dashboardLinks, authErrors, redirect, cashoutMethods, formatters, generateReceipt
├── Components/
│   ├── Auth/           sign-in shell, role cards, rider details form
│   ├── Forms/          Field, TextAreaField, SelectField, PasswordField, FormKit
│   ├── Skeletons/      Skeleton, CardSkeletons, PageSkeletons, RouteSkeleton
│   ├── Charts/         ChartKit (KPI cards, panels, range tabs, tooltips)
│   └── Shared/         PageHeading, FilterTabs, ListToolbar, AppSelect, AppPagination, EmptyResults,
│                       Avatar, LazyImage, LazyMount, header, cart, notifications, ...
├── assets/             images
└── Pages/              Home, AllFoods, Offers, FoodDetails, AboutUs, PlaceOrder,
                        Login, Register, Onboarding, Forbidden, ErrorPage, Dashboard/
```

## How it works

**Sign-in and roles.** An email/password account counts as signed out until its email is verified. A first Google or Facebook sign-in creates an account without a role. `SessionGate` wraps every route and sends anyone without a role (or a rider without delivery details) to `/onboarding`, then on to where they were headed. Guards and menus read the role from `GET /users/me`, never from the browser.

**API access.** `useAxios` is a public Axios instance (`/api` in development, `VITE_Api_Url` in production) with cookies enabled. `useAxiosSecure` is used for protected calls, which also expect the signed-in user's `?email=` query parameter. Lists are searched, filtered and paged on the server, and pages keep the previous results on screen while new ones load. Notifications use the API's server-sent event stream, with a periodic refresh as a fallback.

**Amounts.** Every amount is a whole taka and is never shown or saved with decimals. `src/lib/money.js` is the single place for the maths: the discounted unit price is rounded first, so lines, subtotals, discounts and totals always add up.

**Lazy loading.** Every page except the layout is code-split with `React.lazy` and shows its own skeleton while loading. Images use `LazyImage` (loads near the viewport, shimmer, fade-in, fallback icon), menu cards mount through `LazyMount`, and the notification list loads the first time it is opened.

## Development conventions

- **Dropdowns, tabs and headings are shared components.** Use `AppSelect` for every dropdown (never a native `<select>`), `AppPagination` for pagination, `FilterTabs` for tabs and filter chips above a list, and `PageHeading` for the heading card at the top of dashboard pages.
- **Skeletons mirror the real UI.** Every card and page has its own skeleton in `Components/Skeletons` with the same wrapper classes, spacing and sizes, so nothing moves when data arrives. Change a layout and its skeleton in the same commit.
- **Route skeletons.** Guards, `SessionGate` and lazy routes show `RouteSkeleton`, which picks the skeleton from the URL. Add new routes to its table with their frame (`"public"`, `"dashboard"` or `null`). The header, navbar, footer and dashboard sidebar are never replaced by a skeleton.
- **Layout.** Public pages get their top gap from `<main>` in `PublicFrame` (`pt-5 sm:pt-8`), so pages use only `mb-16` at the bottom. Every dashboard page uses the wrapper `w-full space-y-6 pb-8` and starts with `PageHeading`. Only Manage Profile keeps a narrower layout.
- **Forms** use `Components/Forms` (`Field`, `TextAreaField`, `SelectField`, `FormPage`, `FormSection`, `ImageDropzone`, `FormActions`).
- **Feedback.** Toasts use React Toastify. Anything needing a yes or no (delete, reject, cancel) uses `useConfirm()`, which can also ask for a short note.
- **Responsive.** Layouts are checked down to 315px: avoid fixed widths and wrap tables in `overflow-x-auto`.

## Deployment

The client is hosted on **Netlify**, and the API on **Vercel** (see the server repository).

- Build command `npm run build`, publish directory `dist`.
- `public/_redirects` is the single-page-app fallback, so deep links such as `/dashboard/myOrders` work on refresh.
- Set the `VITE_*` variables in the Netlify site settings. `VITE_Api_Url` must be the deployed API URL.
- On the API, `CLIENT_ORIGIN` must be the Netlify site URL so CORS and cookies work.

The dish share link in `src/Components/Shared/ShareFood.jsx` is hard-coded to the production URL; change it if you deploy to another domain.

## Known limitations

- Order totals and the delivery charge are calculated in the browser and sent to the API as is.
- There are no automated tests yet.