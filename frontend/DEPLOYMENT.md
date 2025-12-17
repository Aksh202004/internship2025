# Tanishq Jewelry E-Commerce Frontend

## 🚀 Live Demo
[View Live Site](https://your-vercel-url.vercel.app)

## 📋 Overview
A modern, responsive jewelry e-commerce platform built with React, featuring an elegant UI inspired by Tanishq's design aesthetic.

## ✨ Features

### Implemented
- 🏠 **Dynamic Homepage** - Auto-playing hero carousel, product categories, announcement bar
- 💍 **Product Pages** - Full product details with advanced zoom, lens magnification, reviews
- 🛒 **Shopping Cart** - Full cart management with quantity controls, order summary
- ❤️ **Wishlist** - Save favorite items with slide-in sidebar
- 👤 **User Profile** - Profile management with editable details
- 🔐 **Authentication** - Login/Signup with smooth transitions, form validation
- 📱 **Mobile Responsive** - Fully optimized for all devices (768px, 480px breakpoints)
- 🔍 **Advanced Zoom** - Pan/drag zoomed images, lens magnification, zoom controls
- 🎯 **Filters & Sort** - Product filtering by category, material, price, occasion

### Pages
- ✅ HomePage (`/`)
- ✅ ProductDetailPage (`/product/:id`)
- ✅ CartPage (`/cart`)
- ✅ UserProfilePage (`/profile`)
- ✅ RingsPage (`/rings`)
- ✅ AuthPage (`/login`, `/signup`)
- ⚙️ CheckoutPage (`/checkout`) - Structure in place
- 📝 Other category pages (Earrings, Pendants, Bracelets, Necklaces) - Basic structure

## 🛠️ Tech Stack
- **React** 19.2.0
- **React Router** 7.9.6
- **Context API** (State Management)
- **CSS3** (Custom styling with responsive design)
- **Font Awesome** 5.15.3 (Icons)
- **Session Storage** (Cart/Wishlist persistence)

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm/yarn

### Setup
```bash
# Clone repository
git clone https://github.com/your-username/internship.git
cd internship/frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Build for Production
```bash
npm run build
```

## 📁 Project Structure
```
frontend/
├── public/           # Static assets
├── src/
│   ├── assets/      # Images
│   ├── components/  # Reusable components (Header, Footer, Cart, Wishlist, Lens)
│   ├── context/     # Context providers (Cart, Wishlist)
│   ├── pages/       # Page components
│   └── App.js       # Main app component
└── package.json
```

## 🎨 Key Components

### Components
- **Header** - Navigation with cart/wishlist badges, search bar
- **Footer** - 4-column footer with newsletter signup
- **Cart** - Slide-in cart sidebar
- **Wishlist** - Slide-in wishlist sidebar
- **Lens** - Magnifying glass component for product images

### Context Providers
- **CartContext** - Shopping cart state management
- **WishlistContext** - Wishlist state management

## 🔧 Configuration

### Environment Variables (Coming Soon)
Create `.env` file:
```env
REACT_APP_API_URL=your_api_url
REACT_APP_SITE_NAME=Tanishq Jewelry
```

## 📝 Development Status

### Completed
- ✅ Core UI/UX design
- ✅ Mobile responsiveness
- ✅ Cart/Wishlist functionality
- ✅ Product zoom features
- ✅ Authentication UI
- ✅ Form validations

### In Progress
- ⚙️ Backend integration
- ⚙️ Payment gateway
- ⚙️ Order management
- ⚙️ Search functionality

### Planned
- 📋 Product reviews submission
- 📋 Order tracking
- 📋 Email notifications
- 📋 Admin dashboard

## 🐛 Known Issues
- ⚠️ Logo placeholder (add actual logo to `/public/logo.png`)
- ⚠️ Checkout page incomplete (payment integration pending)
- ⚠️ Search bar non-functional (backend integration needed)
- ⚠️ Social login buttons (OAuth integration pending)

## 🤝 Contributing
This is an internship project. Contributions and feedback are welcome!

## 📄 License
Private project - All rights reserved

## 👥 Team
- Developer: [Your Name]
- Project: Internship E-Commerce Platform

## 📞 Contact
For any queries, reach out at: your.email@example.com

---

**Note:** This is a frontend-only implementation. Backend API integration is in progress.
