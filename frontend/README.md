# Tanishq Jewelry Store - Frontend

A modern, responsive e-commerce web application for a luxury jewelry store built with React. This project features a complete shopping experience with an elegant UI, product browsing, wishlist management, shopping cart functionality, and user profile management.

## 🚀 Features

- **Hero Carousel**: Auto-playing carousel with smooth transitions showcasing featured collections
- **Product Catalog**: Browse jewelry items by categories (Rings, Necklaces, Earrings, Pendants, Bracelets)
- **Advanced Filters**: Filter products by category, material, price range, and occasion
- **Product Details**: View detailed information about each product with customization options
- **Wishlist**: Save favorite items with session persistence
- **Shopping Cart**: Add items to cart with quantity management and real-time calculations
- **User Profile**: Manage personal details and view wishlist
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Session Storage**: Cart and wishlist persist during browser session
- **Smooth Animations**: Elegant transitions and hover effects throughout

## 📁 Project Structure

```
frontend/
├── public/              # Static files and index.html
├── src/
│   ├── assets/
│   │   └── images/      # Product images and assets
│   ├── components/
│   │   ├── Header.js/css      # Navigation with cart/wishlist badges
│   │   ├── Footer.js/css      # Site footer
│   │   ├── Cart.js/css        # Slide-in cart sidebar
│   │   └── Wishlist.js/css    # Slide-in wishlist sidebar
│   ├── context/
│   │   ├── CartContext.js     # Shopping cart state management
│   │   └── WishlistContext.js # Wishlist state management
│   ├── pages/
│   │   ├── HomePage.js/css           # Landing page with carousel
│   │   ├── RingsPage.js/css          # Product listing with filters
│   │   ├── ProductDetailPage.js/css  # Product details
│   │   ├── CartPage.js/css           # Full cart view
│   │   ├── CheckoutPage.js/css       # Checkout process
│   │   ├── UserProfilePage.js/css    # User profile
│   │   └── [Category]Page.js         # Other category pages
│   ├── App.js           # Main application with routing
│   ├── App.css          # Global styles
│   └── index.js         # Application entry point
├── package.json         # Dependencies and scripts
├── README.md           # Project documentation
├── PROJECT_STRUCTURE.md # Detailed structure guide
└── CHANGELOG.md        # Version history
```

## 🛠️ Technologies Used

- **React** 19.2.0 - Modern UI library with hooks
- **React Router DOM** 7.9.6 - Client-side routing
- **Context API** - Global state management
- **Session Storage** - Browser-based data persistence
- **Font Awesome** 5.15.3 - Icon library
- **Google Fonts** (Playfair Display) - Elegant typography
- **CSS3** - Modern styling with animations and transitions

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏃 Available Scripts

- `npm start` - Run development server (port 3000)
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (one-way operation)

## 🎨 Key Components

### Context Providers
- **WishlistContext**: Manages wishlist state with session storage
  - `addToWishlist()`, `removeFromWishlist()`, `isInWishlist()`, `clearWishlist()`
- **CartContext**: Manages shopping cart with quantity and options
  - `addToCart()`, `removeFromCart()`, `updateQuantity()`, `getCartTotal()`, `clearCart()`

### Pages
- **HomePage**: Hero carousel + category grid + new arrivals
- **RingsPage**: Product grid with sidebar filters (category, material, price, occasion)
- **ProductDetailPage**: Product images, customization options, reviews, related products
- **CartPage**: Full cart view with order summary
- **CheckoutPage**: Checkout flow (placeholder)
- **UserProfilePage**: Editable user details + wishlist display

### Components
- **Header**: Navigation bar with dropdown menus, search, cart/wishlist with badge counters
- **Footer**: Site information, useful links, newsletter signup
- **Cart**: Slide-in sidebar with cart items and quick actions
- **Wishlist**: Slide-in sidebar with saved items

## 💾 State Management

The application uses React Context API for efficient global state management:
- **Session Storage**: Cart and wishlist data persists during browser session
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Real-time Counters**: Badge counters update instantly
- **Performance Optimization**: useCallback and useMemo for optimized re-renders

## 🎯 Code Quality

- **Clean Code**: Well-organized, readable code with proper naming conventions
- **Component Reusability**: DRY principle followed throughout
- **Performance**: Optimized with React hooks (useCallback, useMemo)
- **Accessibility**: Semantic HTML and ARIA labels
- **Responsive**: Mobile-first design approach
- **No Console Logs**: Production-ready code
- **Documented**: Comprehensive README and structure documentation

## 🌟 Future Enhancements

- Backend API integration with REST/GraphQL
- User authentication and authorization
- Real database integration (MongoDB/PostgreSQL)
- Advanced search functionality
- Product filtering and sorting
- Order tracking system
- Payment gateway integration (Stripe/PayPal)
- Email notifications
- Admin dashboard
- Product reviews and ratings
- Inventory management
- Multi-language support
- Wishlist sharing
- Product comparison feature

## 📄 License

This project is part of an internship assignment.
