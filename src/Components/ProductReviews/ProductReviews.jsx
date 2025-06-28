/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Star, User, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import styles from "./ProductReviews.module.css";
import { getReviewsByProductId } from "../../Service/reviewService";

const StarRating = ({ rating, maxRating = 5, size = "small" }) => {
  const getStarClass = (starValue) => {
    const baseClass = size === "large" ? styles.starLarge : styles.starSmall;

    if (starValue <= rating) {
      return `${baseClass} ${styles.starFilled}`;
    }
    return `${baseClass} ${styles.starEmpty}`;
  };

  return (
    <div className={`${styles.starRating} ${styles.starRatingReadonly}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={starValue}
            className={getStarClass(starValue)}
            style={{ cursor: "default" }}
          />
        );
      })}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const [helpful, setHelpful] = useState(false);
  const [notHelpful, setNotHelpful] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleHelpfulClick = () => {
    setHelpful(!helpful);
    if (notHelpful) setNotHelpful(false);
  };

  const handleNotHelpfulClick = () => {
    setNotHelpful(!notHelpful);
    if (helpful) setHelpful(false);
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewerInfo}>
          <div className={styles.avatarContainer}>
            <User className={styles.avatarIcon} />
          </div>
          <div className={styles.reviewerDetails}>
            <h4 className={styles.reviewerName}>User #{review.userId}</h4>
            <p className={styles.reviewDate}>
              {review.reviewedAt ? formatDate(review.reviewedAt) : "Recently"}
            </p>
            {review.lastModifiedAt &&
              review.lastModifiedAt !== review.reviewedAt && (
                <p className={styles.modifiedDate}>
                  (Edited: {formatDate(review.lastModifiedAt)})
                </p>
              )}
          </div>
        </div>
        <div className={styles.reviewRating}>
          <StarRating rating={review.rating} size="small" />
        </div>
      </div>

      <div className={styles.reviewContent}>
        <p
          className={`${styles.reviewText} ${
            isExpanded ? styles.expanded : ""
          }`}
        >
          {review.comment}
        </p>
        {review.comment.length > 100 && (
          <button onClick={toggleExpanded} className={styles.toggleButton}>
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className={styles.reviewActions}>
        <button
          className={`${styles.helpfulButton} ${helpful ? styles.active : ""}`}
          onClick={handleHelpfulClick}
        >
          <ThumbsUp className={styles.actionIcon} />
          <span>Helpful</span>
        </button>
        <button
          className={`${styles.helpfulButton} ${
            notHelpful ? styles.active : ""
          }`}
          onClick={handleNotHelpfulClick}
        >
          <ThumbsDown className={styles.actionIcon} />
          <span>Not Helpful</span>
        </button>
      </div>
    </div>
  );
};

const RatingSummary = ({ reviews }) => {
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (rating) => reviews.filter((review) => review.rating === rating).length
  );

  const getPercentage = (count) =>
    totalReviews > 0 ? (count / totalReviews) * 100 : 0;

  return (
    <div className={styles.ratingSummary}>
      <div className={styles.overallRating}>
        <div className={styles.ratingScore}>
          <span className={styles.averageNumber}>
            {averageRating.toFixed(1)}
          </span>
          <StarRating rating={Math.round(averageRating)} size="large" />
        </div>
        <p className={styles.reviewCount}>
          Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </p>
      </div>

      <div className={styles.ratingBreakdown}>
        {[5, 4, 3, 2, 1].map((rating, index) => (
          <div key={rating} className={styles.ratingRow}>
            <span className={styles.ratingLabel}>{rating}</span>
            <Star className={styles.ratingRowStar} />
            <div className={styles.ratingBar}>
              <div
                className={styles.ratingBarFill}
                style={{ width: `${getPercentage(ratingCounts[index])}%` }}
              ></div>
            </div>
            <span className={styles.ratingCount}>({ratingCounts[index]})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FilterSort = ({ sortBy, setSortBy, filterBy, setFilterBy }) => {
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Rating" },
    { value: "lowest", label: "Lowest Rating" },
  ];

  const filterOptions = [
    { value: "all", label: "All Reviews" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" },
  ];

  return (
    <div className={styles.filterSort}>
      <div className={styles.filterGroup}>
        <label htmlFor="sort-select" className={styles.filterLabel}>
          Sort by:
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.filterSelect}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-select" className={styles.filterLabel}>
          Filter:
        </label>
        <select
          id="filter-select"
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className={styles.filterSelect}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const LoadingReviews = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner}></div>
    <p>Loading reviews...</p>
  </div>
);

const EmptyReviews = () => (
  <div className={styles.emptyState}>
    <MessageCircle className={styles.emptyIcon} />
    <h3>No Reviews Yet</h3>
    <p>Be the first to share your thoughts about this product!</p>
  </div>
);

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getReviewsByProductId(productId);
        if (response && response.data) {
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  useEffect(() => {
    let filtered = [...reviews];

    if (filterBy !== "all") {
      const rating = parseInt(filterBy);
      filtered = filtered.filter((review) => review.rating === rating);
    }

    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.reviewedAt) - new Date(b.reviewedAt)
        );
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, sortBy, filterBy]);

  if (loading) {
    return (
      <div className={styles.reviewsContainer}>
        <h2 className={styles.sectionTitle}>Product Ratings & Reviews</h2>
        <LoadingReviews />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.reviewsContainer}>
        <h2 className={styles.sectionTitle}>Product Ratings & Reviews</h2>
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reviewsContainer} id="reviews-section">
      <h2 className={styles.sectionTitle}>Product Ratings & Reviews</h2>

      {reviews.length > 0 ? (
        <>
          <RatingSummary reviews={reviews} />
          <FilterSort
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
          />
          <div className={styles.reviewsList}>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className={styles.noFilterResults}>
                <p>No reviews match the selected filter.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyReviews />
      )}
    </div>
  );
};

export default ProductReviews;
