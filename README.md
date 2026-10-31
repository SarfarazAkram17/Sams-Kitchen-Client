# Sam's Kitchen: Web Client

React single-page app for Sam's Kitchen, a single-restaurant food ordering and delivery platform for Bangladesh. It serves three kinds of users from one codebase: customers who order food, an admin who runs the kitchen and menu, and riders who deliver and get paid out.

The REST API lives in `../sam's-kitchen-server`. See its README for the endpoints, order lifecycle rules and server configuration.

## Roles

| Role         | How you get it                                                               | What you can do                                                                                                 |
| ------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Customer** | Default for every new account                                                | Browse the menu, order, pay, track orders, review dishes, apply to become a rider                               |
| **Rider**    | Customer application approved by the admin                                   | Accept prepared orders in your thana, verify pickup and delivery with codes, request cashouts                   |
| **Admin**    | `role: "admin"` set on the user document in MongoDB (there is no in-app way) | Manage the menu, browse users, prepare orders in the kitchen, review rider applications, pay out rider cashouts |

Only customers can order. Admins and riders do not see the cart icon or any add-to-cart / order buttons, and `/placeOrder` and the payment page are customer-only. Visitors who are not signed in still see the buttons and are sent to login when they click them. The API enforces the same rule.

## Features

**Customers**

- Browse the menu, search, offers and discounts, dish reviews with photos
- Cart stored in the browser; checkout with a Bangladesh region / district / thana address
- Pay by card (Stripe) or mobile and bank methods (SSLCommerz)
- Order tracking timeline, PDF receipt, live notifications
- Light and dark themes (dark by default)

**Admin**

- Dashboard with revenue, order and user analytics, including every order status
- **Kitchen Orders:** confirmed orders wait here while the chef cooks; "Mark as prepared" releases them to riders
- Add, edit and delete foods; search and filter users; approve or reject rider applications
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
- Ant Design (pagination, ratings), Recharts, Framer Motion, Lottie, jsPDF, SweetAlert2, React Toastify
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

| Route                                                                                   | Access    | Purpose                                 |
| --------------------------------------------------------------------------------------- | --------- | --------------------------------------- |
| `/`, `/allFoods`, `/offers`, `/foods/:foodId`, `/about`                                 | Public    | Menu, offers, dish details, info        |
| `/login`, `/register`                                                                   | Public    | Sign in and sign up                     |
| `/placeOrder`                                                                           | Customer  | Checkout                                |
| `/dashboard`                                                                            | Signed in | Role-specific overview                  |
| `/dashboard/manageProfile`, `/dashboard/myOrders`, `/dashboard/order-tracking/:orderId` | Signed in | Profile, order history, tracking        |
| `/dashboard/payment/:orderId`                                                           | Customer  | Pay for an order                        |
| `/dashboard/beARider`                                                                   | Customer  | Rider application                       |
| `/dashboard/kitchenOrders`                                                              | Admin     | Prepare confirmed orders                |
| `/dashboard/cashoutRequests`                                                            | Admin     | Pay out rider cashouts                  |
| `/dashboard/addFood`, `/dashboard/manageFoods`, `/dashboard/editFood/:foodId`           | Admin     | Menu management                         |
| `/dashboard/manageUsers`, `/dashboard/pendingRiders`                                    | Admin     | Browse users, review rider applications |
| `/dashboard/pendingDeliveries`, `/dashboard/completedDeliveries`                        | Rider     | Offers, active and past deliveries      |
| `/dashboard/cashouts`                                                                   | Rider     | Request and track cashouts              |
| `/forbidden`                                                                            | Public    | Shown when a role guard blocks access   |

Access is enforced by the guards in `src/Routes` (`PrivateRoutes`, `AdminRoutes`, `RiderRoutes`, `CustomerRoutes`). The role comes from the API (`GET /users/:email/role`).

## Project structure

```
public/                 regions.json and outlets.json (delivery coverage), favicon, _redirects (Netlify SPA fallback)
index.html
vite.config.js          dev server and /api proxy
firebase.json, .firebaserc
src/
├── main.jsx
├── Router/             route table
├── Routes/             Private / Admin / Rider / Customer guards
├── Layouts/            RootLayout, DashboardLayout (role-based sidebar)
├── Contexts/Auth/      Firebase auth provider
├── Firebase/           Firebase initialisation
├── Hooks/              useAuth, useAxios, useAxiosSecure, useUserRole, useCanOrder
├── CartUtils/          localStorage cart helpers
├── lib/                cashoutMethods, formatters, generateReceipt
├── Components/         Charts (ChartKit), Loading, Shared (header, cart, food card, notifications, ...)
├── assets/             images and Lottie animations
└── Pages/
    ├── Home, AllFoods, Offers, FoodDetails, AboutUs
    ├── PlaceOrder      checkout form
    ├── Login, Register, Forbidden, ErrorPage
    └── Dashboard/      role dashboards, MyOrders, OrderTracking, Payment,
                        KitchenOrders, CashoutRequests, RiderCashouts,
                        PendingDeliveries, CompletedDeliveries, ...
```

## How it talks to the API

- `useAxios` is a public Axios instance (`/api` in development, `VITE_Api_Url` in production) with cookies enabled.
- `useAxiosSecure` is used for protected calls. Protected endpoints also expect the signed-in user's `?email=` query parameter.
- Notifications use the API's server-sent event stream for live updates, with a periodic refresh as a fallback.

## Deployment

Build with `npm run build` and publish `dist/`. `public/_redirects` provides the single-page-app fallback on Netlify, and `firebase.json` / `.firebaserc` are there for Firebase Hosting. Set the `VITE_*` variables in your host.

The dish share link in `src/Components/Shared/ShareFood.jsx` is hard-coded to the production site URL. Change it if you deploy to another domain.

## Known limitations

- Order totals and the delivery charge are calculated in the browser and sent to the API as is.
- There are no automated tests yet.