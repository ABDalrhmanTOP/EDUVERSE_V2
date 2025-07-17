import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaUserCircle, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import './CommentSection.css';

const CommentSection = ({
  comments,
  setComments,
  user,
  onLike,
  onDislike,
  onReply,
  onEdit,
  onDelete,
  onAddComment,
}) => {
  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const modalRef = useRef();

  // ESC key and overlay click to close modal
  useEffect(() => {
    if (deleteId !== null) {
      const handleEsc = (e) => {
        if (e.key === 'Escape') setDeleteId(null);
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [deleteId]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && e.target === modalRef.current) {
      setDeleteId(null);
    }
  };

  const renderComment = (comment, isReply = false) => {
    const isOwn = user && comment.user_id === user.id;
    return (
      <motion.div
        className={`comment-card${isOwn ? ' own' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        key={comment.id}
        style={isReply ? { marginLeft: 32, marginBottom: 10 } : {}}
      >
        <div className="comment-header">
          <div className="comment-user">
            {comment.user?.profile_image ? (
              <img src={comment.user.profile_image} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e3cfa4' }} />
            ) : (
              <FaUserCircle size={32} color="#b5a079" style={{ borderRadius: '50%', border: '2px solid #e3cfa4', background: '#f5f1eb' }} />
            )}
            <span style={{ fontWeight: 600, color: '#b5a079' }}>{comment.user?.username || comment.user?.name || 'User'}</span>
            {isOwn && <span className="you-badge">You</span>}
          </div>
          <span style={{ fontSize: 13, color: '#b5a079', fontWeight: 500 }}>{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        {editId === comment.id ? (
          <div>
            <textarea
              className="comment-textarea"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={3}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="gradient-btn" onClick={() => { onEdit(comment.id, editContent); setEditId(null); }}>Save</button>
              <button className="secondary-action-btn" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="comment-content">{comment.content}</div>
        )}
        <div className="comment-actions">
          <button className="icon-btn like" title="Like" onClick={() => handleLikeOptimistic(comment.id, 'like')}>
            <FaThumbsUp className="icon" />
            <span className="icon-count">{comment.likes?.filter(l => l.type === 'like').length || 0}</span>
          </button>
          <button className="icon-btn dislike" title="Dislike" onClick={() => handleLikeOptimistic(comment.id, 'dislike')}>
            <FaThumbsDown className="icon" />
            <span className="icon-count">{comment.likes?.filter(l => l.type === 'dislike').length || 0}</span>
          </button>
          <button className="icon-btn reply" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>
            <FaReply className="icon" />
            <FaArrowRight className="icon icon-arrow" />
            Reply
          </button>
          {isOwn && (
            <>
              <button className="icon-btn edit" onClick={() => {
                if (editId === comment.id) { setEditId(null); } else { setEditId(comment.id); setEditContent(comment.content); }
              }} onDoubleClick={() => setEditId(null)}><FaEdit className="icon" />Edit</button>
              <button className="icon-btn delete" onClick={() => setDeleteId(comment.id)}><FaTrash className="icon" /><span>Delete</span></button>
            </>
          )}
        </div>
        {/* Reply input */}
        <AnimatePresence>
          {replyTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.32, ease: 'easeInOut' }}
              style={{ marginTop: 12 }}
            >
              <textarea
                className="comment-textarea"
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                rows={3}
                placeholder="Write a reply..."
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="gradient-btn" onClick={() => { handleReplyOptimistic(comment.id, replyContent); setReplyContent(''); setReplyTo(null); }}>Reply</button>
                <button className="secondary-action-btn" onClick={() => setReplyTo(null)}>Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Delete modal */}
        <AnimatePresence>
          {deleteId === comment.id && (
            <motion.div
              className="modal-overlay"
              ref={modalRef}
              onClick={handleOverlayClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content delete-modal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <div className="modal-title">
                  <FaExclamationTriangle className="modal-warning-icon" /> Delete Comment?
                </div>
                <div className="modal-message">Are you sure you want to delete this comment?</div>
                <div className="modal-actions">
                  <button className="gradient-btn" onClick={() => { onDelete(comment.id); setDeleteId(null); }}>Delete</button>
                  <button className="secondary-action-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Replies */}
        <div>
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Optimistic like/dislike handler
  const handleLikeOptimistic = (commentId, type) => {
    // Update local state instantly
    setEditId(null); // close edit if open
    setReplyTo(null); // close reply if open
    if (!comments) return;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        let likes = c.likes || [];
        const userId = user?.id;
        if (!userId) return c;
        const existing = likes.find(l => l.user_id === userId);
        if (existing) {
          if (existing.type === type) {
            likes = likes.filter(l => l.user_id !== userId); // toggle off
          } else {
            likes = likes.map(l => l.user_id === userId ? { ...l, type } : l); // switch
          }
        } else {
          likes = [...likes, { user_id: userId, type }];
        }
        return { ...c, likes };
      }
      if (c.replies) {
        return { ...c, replies: c.replies.map(r => {
          if (r.id === commentId) {
            let likes = r.likes || [];
            const userId = user?.id;
            if (!userId) return r;
            const existing = likes.find(l => l.user_id === userId);
            if (existing) {
              if (existing.type === type) {
                likes = likes.filter(l => l.user_id !== userId);
              } else {
                likes = likes.map(l => l.user_id === userId ? { ...l, type } : l);
              }
            } else {
              likes = [...likes, { user_id: userId, type }];
            }
            return { ...r, likes };
          }
          return r;
        }) };
      }
      return c;
    }));
    // Backend sync
    if (type === 'like') onLike(commentId);
    else onDislike(commentId);
  };

  // Optimistic add comment
  const handleAddCommentOptimistic = (content) => {
    if (!content.trim()) return;
    // Add to local state instantly
    setComments(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        user: user,
        user_id: user?.id,
        content,
        created_at: new Date().toISOString(),
        likes: [],
        replies: [],
      },
      ...prev,
    ]);
    onAddComment(content);
  };

  // Optimistic add reply
  const handleReplyOptimistic = (parentId, content) => {
    if (!content.trim()) return;
    setComments(prev => prev.map(c => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [
            ...c.replies,
            {
              id: Math.random().toString(36).substr(2, 9),
              user: user,
              user_id: user?.id,
              content,
              created_at: new Date().toISOString(),
              likes: [],
            },
          ],
        };
      }
      return c;
    }));
    onReply(parentId, content);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <textarea
          className="comment-textarea"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={3}
          placeholder="Write a comment..."
        />
        <button className="gradient-btn" onClick={() => { handleAddCommentOptimistic(newComment); setNewComment(''); }}>Post</button>
      </div>
      <div>
        <AnimatePresence>
          {comments && comments.length > 0 ? (
            comments.map(c => renderComment(c))
          ) : (
            <div style={{ color: '#7d6a4d', textAlign: 'center', margin: '2rem 0' }}>No comments yet. Be the first to comment!</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  comments: PropTypes.array.isRequired,
  setComments: PropTypes.func.isRequired,
  user: PropTypes.object,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
  onReply: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddComment: PropTypes.func.isRequired,
};

export default CommentSection; 