# Project Structure

## Overview
This document outlines the structure and organization of the Tanishq Jewelry Store frontend application.

## Directory Structure

```
frontend/
│
├── public/                      # Static files served directly
│   ├── index.html              # Main HTML template
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
│
├── src/                        # Source code
│   │
│   ├── assets/                 # Static assets (images, fonts, etc.)
│   │   └── images/             # Product images
│   │       ├── bracelet.avif
│   │       ├── ear-ring.avif
│   │       ├── hero-image.avif
│   │       ├── necklace.webp
│   │       ├── pendant.avif
│   │       ├── placeholder.png
│   │       └── ring.webp
│   │
│   ├── components/             # Reusable React components
│   │   ├── Header.js          # Navigation header
│   │   ├── Header.css
│   │   ├── Footer.js          # Site footer
│   │   ├── Footer.css
│   │   ├── Cart.js            # Cart sidebar component
│   │   ├── Cart.css
│   │   ├── Wishlist.js        # Wishlist sidebar component
│   │   └── Wishlist.css
│   │
│   ├── context/               # React Context for state management
│   │   ├── CartContext.js     # Shopping cart state
│   │   └── WishlistContext.js # Wishlist state
│   │
│   ├── pages/                 # Page-level components
│   │   ├── HomePage.js        # Landing page
│   │   ├── HomePage.css
│   │   ├── RingsPage.js       # Product listing page
│   │   ├── RingsPage.css
│   │   ├── ProductDetailPage.js  # Product details
│   │   ├── ProductDetailPage.css
│   │   ├── CartPage.js        # Full cart page
│   │   ├── CartPage.css
│   │   ├── CheckoutPage.js    # Checkout process
│   │   ├── CheckoutPage.css
│   │   ├── UserProfilePage.js # User profile
│   │   ├── UserProfilePage.css
│   │   ├── EarringsPage.js    # Category pages
│   │   ├── PendantsPage.js
│   │   ├── BraceletsPage.js
│   │   └── NecklacesPage.js
│   │
│   ├── App.js                 # Main application component
│   ├── App.css               # Global application styles
│   ├── index.js              # Application entry point
│   ├── index.css             # Global CSS reset and base styles
│   ├── reportWebVitals.js    # Performance monitoring
│   ├── setupTests.js         # Test configuration
│   └── App.test.js           # App component tests
│
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Locked versions of dependencies
├── README.md                 # Project documentation
└── .gitignore               # Git ignore rules
```

## Component Hierarchy

```
App (with WishlistProvider & CartProvider)
├── Header
│   ├── Wishlist (sidebar)
│   └── Cart (sidebar)
├── Main Content (Routes)
│   ├── HomePage
│   ├── RingsPage
│   ├── ProductDetailPage
│   ├── CartPage
│   ├── CheckoutPage
│   ├── UserProfilePage
│   └── Category Pages
└── Footer
```

## State Management

### Context Providers

**WishlistContext**
- Manages wishlist items
- Provides: `wishlistItems`, `addToWishlist`, `removeFromWishlist`, `isInWishlist`, `clearWishlist`, `wishlistCount`
- Storage: Session Storage

**CartContext**
- Manages shopping cart
- Provides: `cartItems`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `getCartTotal`, `cartCount`
- Storage: Session Storage

## Routing Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page with featured products |
| `/rings` | RingsPage | Rings category listing |
| `/earrings` | EarringsPage | Earrings category listing |
| `/pendants` | PendantsPage | Pendants category listing |
| `/bracelets` | BraceletsPage | Bracelets category listing |
| `/necklaces` | NecklacesPage | Necklaces category listing |
| `/product/:id` | ProductDetailPage | Individual product details |
| `/cart` | CartPage | Full shopping cart view |
| `/checkout` | CheckoutPage | Checkout process |
| `/profile` | UserProfilePage | User account management |

## Styling Approach

- **CSS Modules**: Each component has its own CSS file
- **Global Styles**: `index.css` and `App.css` for global styling
- **Responsive Design**: Mobile-first approach with media queries
- **Color Scheme**: 
  - Primary: `#d9534f` (Red)
  - Background: `#f8f8f8`
  - Text: `#333`
  - Border: `#eaeaea`

## Key Features by Component

### Header
- Navigation menu
- Search bar
- Wishlist icon with badge
- Cart icon with badge
- User profile dropdown

### Wishlist Sidebar
- Slide-in animation
- Product list with images
- Add to cart functionality
- Remove from wishlist
- Clickable product links

### Cart Sidebar
- Slide-in animation
- Product list with quantity controls
- Price calculations
- Checkout button
- View full cart link

### Product Pages
- Product grid layout
- Image display
- Add to wishlist button
- Add to cart button
- Price and rating display

## Data Flow

1. **User Action** → Component
2. **Component** → Context API
3. **Context API** → Session Storage
4. **Session Storage** → Persist on refresh
5. **Context API** → Update all subscribed components
