const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
  label: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postalCode: { type: String },
  phone: { type: String },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const ImageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String }
}, { _id: false });

const VariantSchema = new Schema({
  sku: { type: String },
  options: { type: Map, of: String },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  stock: { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  images: [ImageSchema]
}, { _id: false });

const ProductSchema = new Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, index: true },
  description: { type: String },
  sku: { type: String, index: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  discountType: { type: String, enum: ['none', 'percent', 'fixed'], default: 'none' },
  discountValue: { type: Number, default: 0 },
  images: [ImageSchema],
  thumbnails: [String],
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  // Jewelry Specific Fields
  metalDetails: {
    type: { type: String }, // e.g., "Gold", "Silver", "Platinum"
    purity: { type: String } // e.g., "18k", "22k", "925"
  },
  gemstoneDetails: [{
    type: { type: String }, // e.g., "Diamond", "Ruby"
    count: { type: Number },
    clarity: { type: String },
    color: { type: String },
    cut: { type: String },
    shape: { type: String }
  }],
  certification: {
    authority: { type: String }, // e.g., "BIS", "IGI"
    certificateId: { type: String },
    url: { type: String }
  },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids'] },
  occasion: [String], // e.g., "Wedding", "Daily Wear", "Gift"

  materials: [String], // Kept for backward compatibility or generic materials
  tags: [String],
  variants: [VariantSchema],
  stock: { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  // Product dimensions for shipping
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number }
  },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  bestseller: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  metafields: { type: Map, of: Schema.Types.Mixed },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String }
}, { timestamps: true });

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  body: { type: String },
  images: [ImageSchema],
  helpfulCount: { type: Number, default: 0 },
  // Enhanced Review Fields
  isVerifiedPurchase: { type: Boolean, default: false },
  hasImages: { type: Boolean, default: false },
  detailScore: { type: Number, default: 0 }, // Calculated score for sorting
  qualityRating: { type: Number, min: 1, max: 5 },
  valueRating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

const UserSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  addresses: [AddressSchema],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  purchasedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // For review verification
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantOptions: { type: Map, of: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [CartItemSchema]
}, { timestamps: true });

const CustomizationSchema = new Schema({
  ringSize: { type: String },
  engraving: { type: String, maxlength: 50 },
  chainLength: { type: String },
  giftWrap: { type: Boolean, default: false },
  giftMessage: { type: String, maxlength: 200 }
}, { _id: false });

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String },
  variantOptions: { type: Map, of: String },
  customizations: CustomizationSchema,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'returned', 'refunded', 'cancelled'], default: 'pending' },
  returnReason: { type: String }
}, { _id: false });

const PaymentSchema = new Schema({
  provider: { type: String },
  paymentIntentId: { type: String },
  amount: { type: Number },
  currency: { type: String },
  status: { type: String }
}, { _id: false });

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  orderNumber: { type: String, unique: true, index: true },
  items: [OrderItemSchema],
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  subtotal: { type: Number },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' },
  payment: PaymentSchema,
  coupons: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }],
  // Tracking fields
  trackingNumber: { type: String },
  carrier: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  estimatedDelivery: { type: Date },
  notes: { type: String }
}, { timestamps: true });

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  discountType: { type: String, enum: ['fixed', 'percent'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscountAmount: { type: Number },
  minPurchaseAmount: { type: Number },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  perUserLimit: { type: Number },
  validFrom: { type: Date },
  validUntil: { type: Date },
  active: { type: Boolean, default: true },
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const WishlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const Models = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Product: mongoose.models.Product || mongoose.model('Product', ProductSchema),
  Category: mongoose.models.Category || mongoose.model('Category', CategorySchema),
  Review: mongoose.models.Review || mongoose.model('Review', ReviewSchema),
  Cart: mongoose.models.Cart || mongoose.model('Cart', CartSchema),
  Order: mongoose.models.Order || mongoose.model('Order', OrderSchema),
  Coupon: mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema),
  Wishlist: mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema)
};

module.exports = {
  Schemas: {
    AddressSchema,
    ImageSchema,
    VariantSchema,
    ProductSchema,
    CategorySchema,
    ReviewSchema,
    UserSchema,
    CartSchema,
    OrderSchema,
    CouponSchema,
    WishlistSchema,
    PaymentSchema
  },
  Models
};
