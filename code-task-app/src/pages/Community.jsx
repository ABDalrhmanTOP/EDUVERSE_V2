import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiMessageCircle, FiUser, FiEdit3, FiTrash2 } from "react-icons/fi";
import axios from "../api/axios";
import "./Community.css";
import { useAuth } from '../context/AuthContext';

function Avatar({ name, src }) {
  if (src) return (
    <img src={src} alt={name} className="avatar-img animated-avatar" />
  );
  return (
    <div className="avatar-circle animated-avatar">{name ? name[0].toUpperCase() : "?"}</div>
  );
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editPostId, setEditPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get("/community/posts")
      .then(res => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (post, e) => {
    e.stopPropagation();
    setEditPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditPostId(null);
    setEditTitle("");
    setEditContent("");
  };
  const handleSaveEdit = async (post, e) => {
    e.stopPropagation();
    setSaving(true);
    try {
      const res = await axios.put(`/community/posts/${post.id}`, { title: editTitle, content: editContent });
      setPosts(posts.map(p => p.id === post.id ? { ...p, ...res.data } : p));
      setEditPostId(null);
      setEditTitle("");
      setEditContent("");
    } catch (err) {
      alert("Failed to update post.");
    }
    setSaving(false);
  };
  const handleDelete = (post, e) => {
    e.stopPropagation();
    // TODO: Show confirmation modal then delete
    if(window.confirm("Are you sure you want to delete this post?")) {
      // Call API to delete
      axios.delete(`/community/posts/${post.id}`)
        .then(() => setPosts(posts.filter(p => p.id !== post.id)));
    }
  };

  // Helper to safely render text
  const safeText = (value) => (typeof value === 'string' || typeof value === 'number') ? value : '[Invalid Data]';

  return (
    <div className="community-bg">
      <div className="community-main-card">
        <div className="community-header">
          <h2>Community</h2>
          <Link to="/community/new" className="add-post-btn gradient-btn">
            <FiPlus /> New Post
          </Link>
        </div>
        <div className="community-posts-list horizontal-list">
          {loading ? (
            <div className="empty-msg">
              <span className="loader"></span>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-msg">
              <img src="/empty-community.svg" alt="No posts" style={{width: 120, opacity: 0.5}} />
              <div>No posts yet.</div>
            </div>
          ) : (
            posts.map(post => {
              const isOwner = user && post.user && user.id === post.user.id;
              const isAdmin = user && user.role === "admin";
              return (
                <div
                  className="community-post-card glass-card horizontal-card modern-community-card"
                  key={post.id}
                  onClick={() => navigate(`/community/posts/${post.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar name={post.user?.name} src={post.user?.avatar} />
                  <div className="horizontal-card-content">
                    {editPostId === post.id ? (
                      <>
                        <input
                          className="edit-post-title-input"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          maxLength={120}
                          style={{marginBottom: 6, fontWeight: 'bold', fontSize: '1.1rem'}}
                          onClick={e => e.stopPropagation()}
                        />
                        <textarea
                          className="edit-post-content-input"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          rows={3}
                          maxLength={1000}
                          style={{marginBottom: 8, fontSize: '1.05rem'}}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="edit-actions-row">
                          <button className="gradient-btn save-btn" disabled={saving || !editTitle.trim() || !editContent.trim()} onClick={e => handleSaveEdit(post, e)}>
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button className="gradient-btn cancel-btn" onClick={handleCancelEdit} style={{marginLeft: 8}}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="post-title gradient-text">{safeText(post.title)}</div>
                        <div className="post-meta">
                          <span className="post-author">
                            <FiUser /> {safeText(post.user?.name) || "User"}
                          </span>
                          <span className="post-comments">
                            <FiMessageCircle /> {typeof post.comments_count === 'number' ? (post.comments_count === 0 ? 'No comments' : post.comments_count === 1 ? '1 comment' : `${post.comments_count} comments`) : '[Invalid Data]'}
                          </span>
                        </div>
                        <div className="post-snippet">
                          {safeText(post.content).length > 60 ? safeText(post.content).slice(0, 60) + "..." : safeText(post.content)}
                        </div>
                      </>
                    )}
                  </div>
                  {(isOwner || isAdmin) && !editPostId && (
                    <div className="post-actions">
                      <button className="icon-btn edit-btn" title="Edit" onClick={e => handleEdit(post, e)}><FiEdit3 /></button>
                      <button className="icon-btn delete-btn" title="Delete" onClick={e => handleDelete(post, e)}><FiTrash2 /></button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 