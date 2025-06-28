/* eslint-disable react/prop-types */
import React, { useEffect, useState, useCallback } from "react";
import { FaStar } from "react-icons/fa";
import { X } from "lucide-react";
import { createReview, updateReview } from "../../Service/reviewService";
import styles from "./ReviewModal.module.css";

const ReviewModal = React.memo(
  ({ isOpen, onClose, productId, existingReview, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
      if (isOpen) {
        setRating(existingReview?.rating || 0);
        setComment(existingReview?.comment || "");
        setError("");
      }
    }, [isOpen, existingReview]);

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();

        if (rating === 0) {
          setError("Please select a rating");
          return;
        }

        if (!comment.trim()) {
          setError("Please write a review comment");
          return;
        }

        setSubmitting(true);
        setError("");

        try {
          let result;
          if (existingReview) {
            result = await updateReview(existingReview.id, {
              rating,
              comment: comment.trim(),
            });
          } else {
            result = await createReview({
              productId,
              rating,
              comment: comment.trim(),
            });
          }

          if (result.success) {
            onReviewSubmitted();
            onClose();
          } else {
            setError(result.error || "Failed to submit review");
          }
        } catch (err) {
          setError("An error occurred while submitting your review");
        } finally {
          setSubmitting(false);
        }
      },
      [rating, comment, existingReview, productId, onReviewSubmitted, onClose]
    );

    const handleStarClick = useCallback((starRating) => {
      setRating(starRating);
    }, []);

    const handleCommentChange = useCallback((e) => {
      setComment(e.target.value);
    }, []);

    const handleClose = useCallback(() => {
      if (!submitting) {
        onClose();
      }
    }, [submitting, onClose]);

    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>{existingReview ? "Edit Review" : "Write a Review"}</h3>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              disabled={submitting}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.reviewForm}>
            <div className={styles.ratingSection}>
              <label className={styles.ratingLabel}>Rating *</label>
              <div className={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`${styles.star} ${
                      star <= rating ? styles.starFilled : styles.starEmpty
                    }`}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.commentSection}>
              <label className={styles.commentLabel} htmlFor="comment">
                Your Review *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                placeholder="Share your experience with this product..."
                className={styles.commentTextarea}
                rows={4}
                maxLength={500}
              />
              <div className={styles.characterCount}>{comment.length}/500</div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : existingReview
                  ? "Update Review"
                  : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

ReviewModal.displayName = "ReviewModal";

export default ReviewModal;
