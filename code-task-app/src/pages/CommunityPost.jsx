import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUser, FiMessageCircle, FiSend, FiClock, FiEdit3, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import axios from "../api/axios";
import "./CommunityPost.css";
import { useAuth } from '../context/AuthContext';

function Avatar({ name, src }) {
  if (src) return <img src={src} alt={name} className="avatar-img" />;
  return (
    <div className="avatar-circle">{name ? name[0].toUpperCase() : "?"}</div>
  );
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString();
}

export default function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef();
  const { user } = useAuth();
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/community/posts/${id}`)
      .then(res => {
        setPost(res.data);
        setComments(res.data.comments || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/community/posts/${id}/comments`, { content: comment });
      setComments([...comments, { ...res.data, user: { name: "You" }, created_at: new Date().toISOString() }]);
      setComment("");
      setSubmitting(false);
      textareaRef.current && textareaRef.current.focus();
    } catch (error) {
      setSubmitting(false);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleEditComment = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentContent(comment.content);
  };
  const handleCancelEditComment = () => {
    setEditCommentId(null);
    setEditCommentContent("");
  };
  const handleSaveEditComment = async (comment) => {
    setSavingComment(true);
    try {
      const res = await axios.put(`/community/comments/${comment.id}`, { content: editCommentContent });
      setComments(comments.map(c => c.id === comment.id ? { ...c, ...res.data } : c));
      setEditCommentId(null);
      setEditCommentContent("");
    } catch (err) {
      alert("Failed to update comment.");
    }
    setSavingComment(false);
  };
  const handleDeleteComment = (comment) => {
    // TODO: Show confirmation modal then delete
    if(window.confirm("Are you sure you want to delete this comment?")) {
      axios.delete(`/community/comments/${comment.id}`)
        .then(() => setComments(comments.filter(c => c.id !== comment.id)));
    }
  };

  const handleKeyDown = e => {
    if (e.ctrlKey && e.key === "Enter") {
      handleComment(e);
    }
  };

  if (loading) return (
    <div className="community-bg">
      <div className="community-main-card">
        <div className="empty-msg"><span className="loader"></span> Loading post...</div>
      </div>
    </div>
  );
  if (!post) return (
    <div className="community-bg">
      <div className="community-main-card">
        <div className="empty-msg">Post not found.</div>
      </div>
    </div>
  );

  return (
    <div className="community-bg">
      <div className="community-main-card post-details-card">
        <div className="post-header">
          <Avatar name={post.user?.name} src={post.user?.avatar} />
          <div className="header-info">
            <div className="author-name">{post.user?.name || "User"}</div>
            <div className="post-date"><FiClock /> {timeAgo(post.created_at)}</div>
          </div>
        </div>
        <div className="post-title-adv">{post.title}</div>
        <div className="post-content-adv">{post.content}</div>
        <div className="comments-section-adv">
          <h4><FiMessageCircle /> Comments ({comments.length})</h4>
          {comments.length === 0 && (
            <div className="empty-msg-adv">
              <img src="/empty-comments.svg" alt="No comments" style={{width: 80, opacity: 0.4}} />
              <div>No comments yet.</div>
            </div>
          )}
          <ul className="comments-list-adv">
            {comments.map((c, idx) => {
              const isOwner = user && c.user && user.id === c.user.id;
              const isAdmin = user && user.role === "admin";
              return (
                <li className={`comment-card-adv${c.user?.name === post.user?.name ? " author-comment" : ""}`} key={c.id || idx}>
                  <div className="comment-avatar">
                    <Avatar name={c.user?.name} src={c.user?.avatar} />
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{c.user?.name || "User"}</span>
                      <span className="comment-date">{timeAgo(c.created_at)}</span>
                      {c.user?.name === post.user?.name && <span className="author-badge"><FiEdit3 /> Author</span>}
                      {(isOwner || isAdmin) && (
                        <span className="comment-actions">
                          {editCommentId === c.id ? null : <button className="icon-btn edit-btn" title="Edit" onClick={() => handleEditComment(c)}><FiEdit3 /></button>}
                          {editCommentId === c.id ? null : <button className="icon-btn delete-btn" title="Delete" onClick={() => handleDeleteComment(c)}><FiTrash2 /></button>}
                        </span>
                      )}
                    </div>
                    <div className="comment-content">
                      {editCommentId === c.id ? (
                        <>
                          <textarea
                            className="edit-comment-content-input"
                            value={editCommentContent}
                            onChange={e => setEditCommentContent(e.target.value)}
                            rows={2}
                            maxLength={1000}
                            style={{marginBottom: 6, fontSize: '1.05rem', width: '100%'}}
                          />
                          <div className="edit-actions-row">
                            <button className="gradient-btn save-btn" disabled={savingComment || !editCommentContent.trim()} onClick={() => handleSaveEditComment(c)}>
                              {savingComment ? "Saving..." : "Save"}
                            </button>
                            <button className="gradient-btn cancel-btn" onClick={handleCancelEditComment} style={{marginLeft: 8}}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : c.content}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <form className="add-comment-form-adv" onSubmit={handleComment}>
            <textarea
              ref={textareaRef}
              className="comment-input-adv"
              placeholder="Add a comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              rows={2}
              style={{resize: 'vertical'}}
            />
            <div className="comment-form-actions-adv">
              <button type="submit" className="add-comment-btn-adv gradient-btn" disabled={submitting || !comment.trim()}>
                {submitting ? "Adding..." : "Add Comment"}
              </button>
              <button type="button" className="back-to-community-btn-adv gradient-btn" onClick={() => navigate('/community')} style={{marginLeft: 10}}>
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 