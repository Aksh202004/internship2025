import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../services/api';
import { getImageUrl } from '../../lib/supabase';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getAll();
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const productName = review.products?.name || '';
    const customerName = review.customers?.name || '';
    const comment = review.comment || '';
    
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? 'filled' : ''}`}
      ></i>
    ));
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleApprove = async (reviewId) => {
    try {
      await reviewsApi.updateStatus(reviewId, 'approved');
      setReviews(reviews.map((r) =>
        r.id === reviewId ? { ...r, status: 'approved' } : r
      ));
      setShowModal(false);
    } catch (err) {
      console.error('Error approving review:', err);
      alert('Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await reviewsApi.updateStatus(reviewId, 'rejected');
      setReviews(reviews.map((r) =>
        r.id === reviewId ? { ...r, status: 'rejected' } : r
      ));
      setShowModal(false);
    } catch (err) {
      console.error('Error rejecting review:', err);
      alert('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsApi.delete(reviewId);
        setReviews(reviews.filter((r) => r.id !== reviewId));
        setShowModal(false);
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review');
      }
    }
  };

  const getReviewStats = () => {
    const approved = reviews.filter((r) => r.status === 'approved');
    const avgRating = approved.length > 0
      ? (approved.reduce((sum, r) => sum + r.rating, 0) / approved.length).toFixed(1)
      : 0;
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      approved: approved.length,
      avgRating,
    };
  };

  const stats = getReviewStats();

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loader-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Reviews</h1>
          <p className="page-subtitle">Moderate and manage product reviews</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchReviews}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="review-stats">
        <div className="review-stat">
          <div className="stat-icon">
            <i className="fas fa-comments"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
        </div>
        <div className="review-stat pending">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending Approval</span>
          </div>
        </div>
        <div className="review-stat approved">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="review-stat rating">
          <div className="stat-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.avgRating}</span>
            <span className="stat-label">Avg. Rating</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.map((review) => {
          const productImage = review.products?.image_url 
            ? getImageUrl(review.products.image_url)
            : 'https://via.placeholder.com/60?text=No+Image';
          return (
            <div key={review.id} className={`review-card ${review.status}`}>
              <div className="review-header">
                <div className="review-product">
                  <img src={productImage} alt={review.products?.name || 'Product'} />
                  <div className="product-info">
                    <span className="product-name">{review.products?.name || 'Unknown Product'}</span>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <div className="review-meta">
                  <span className={`status-badge ${review.status}`}>{review.status}</span>
                  {review.is_verified_purchase && (
                    <span className="verified-badge">
                      <i className="fas fa-check-circle"></i> Verified Purchase
                    </span>
                  )}
                </div>
              </div>
              <div className="review-content">
                <h4 className="review-title">{review.title || 'No Title'}</h4>
                <p className="review-comment">{review.comment}</p>
              </div>
              <div className="review-footer">
                <div className="review-author">
                  <span className="author-name">{review.customers?.name || 'Anonymous'}</span>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
                <div className="review-actions">
                  <button
                    className="action-btn"
                    title="View"
                    onClick={() => handleViewReview(review)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  {review.status === 'pending' && (
                    <>
                      <button
                        className="action-btn approve"
                        title="Approve"
                        onClick={() => handleApprove(review.id)}
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        className="action-btn reject"
                        title="Reject"
                        onClick={() => handleReject(review.id)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn delete"
                    title="Delete"
                    onClick={() => handleDelete(review.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div className="no-results">
            <i className="fas fa-comments"></i>
            <p>No reviews found</p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-product-info">
                <img 
                  src={selectedReview.products?.image_url 
                    ? getImageUrl(selectedReview.products.image_url) 
                    : 'https://via.placeholder.com/60?text=No+Image'
                  } 
                  alt={selectedReview.products?.name || 'Product'} 
                />
                <div>
                  <h4>{selectedReview.products?.name || 'Unknown Product'}</h4>
                  <div className="modal-rating">{renderStars(selectedReview.rating)}</div>
                </div>
              </div>

              <div className="modal-review-content">
                <div className="review-badges">
                  <span className={`status-badge ${selectedReview.status}`}>
                    {selectedReview.status}
                  </span>
                  {selectedReview.is_verified_purchase && (
                    <span className="verified-badge">
                      <i className="fas fa-check-circle"></i> Verified Purchase
                    </span>
                  )}
                </div>
                <h4>{selectedReview.title || 'No Title'}</h4>
                <p>{selectedReview.comment}</p>
              </div>

              <div className="modal-author-info">
                <div className="info-row">
                  <span className="label">Customer:</span>
                  <span className="value">{selectedReview.customers?.name || 'Anonymous'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedReview.customers?.email || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(selectedReview.created_at)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Helpful votes:</span>
                  <span className="value">{selectedReview.helpful_count || 0}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedReview.status === 'pending' && (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(selectedReview.id)}
                  >
                    <i className="fas fa-times"></i> Reject
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(selectedReview.id)}
                  >
                    <i className="fas fa-check"></i> Approve
                  </button>
                </>
              )}
              {selectedReview.status !== 'pending' && (
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
