const mongoose = require('mongoose');
const { Schemas, Models } = require('./schemas');

// Connect to a dummy in-memory database or just validate without connecting if possible.
// Since we just want to test schema validation, we can instantiate documents without saving.

async function testSchemas() {
    console.log('Testing Schemas...');

    try {
        // 1. Test Product Schema with Jewelry Fields
        const productData = {
            title: 'Diamond Ring',
            price: 50000,
            metalDetails: {
                type: 'Gold',
                purity: '18k'
            },
            gemstoneDetails: [{
                type: 'Diamond',
                count: 1,
                clarity: 'VVS',
                color: 'E',
                cut: 'Round',
                shape: 'Round'
            }],
            certification: {
                authority: 'IGI',
                certificateId: 'IGI123456'
            },
            gender: 'Women',
            occasion: ['Wedding', 'Engagement']
        };

        const product = new Models.Product(productData);
        await product.validate();
        console.log('✅ Product Schema validation passed');

        // 2. Test User Schema with Purchased Products
        const userData = {
            email: 'test@example.com',
            purchasedProducts: [product._id]
        };
        const user = new Models.User(userData);
        await user.validate();
        console.log('✅ User Schema validation passed');

        // 3. Test Review Schema with Ranking Fields
        const reviewData = {
            user: user._id,
            product: product._id,
            rating: 5,
            isVerifiedPurchase: true,
            hasImages: true,
            detailScore: 85,
            qualityRating: 5,
            valueRating: 4
        };
        const review = new Models.Review(reviewData);
        await review.validate();
        console.log('✅ Review Schema validation passed');

        console.log('All validations passed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

testSchemas();
