import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit3, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import axios from "../api/axios";
import "./NewCommunityPost.css";

export default function NewCommunityPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await axios.post("/community/posts", { title, content });
      setSubmitting(false);
      setSuccess(true);
    } catch (error) {
      setSubmitting(false);
      alert("Failed to publish post. Please try again.");
    }
  };

  // Support Ctrl+Enter to submit
  const handleKeyDown = e => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="community-bg">
      <div className="community-main-card horizontal-card new-post-horizontal-card">
        <div className="community-header">
          <h2>Add New Post</h2>
        </div>
        {success ? (
          <div className="success-message-card animate-success">
            <FiCheckCircle size={48} style={{color: '#b5a079', marginBottom: 12}} />
            <div className="success-title">Post published successfully!</div>
            <button className="gradient-btn" style={{marginTop: 18}} onClick={() => navigate('/community')}>
              Back 
            </button>
          </div>
        ) : (
          <form className="new-community-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                id="title"
                className="form-input large-input"
                type="text"
                placeholder="Enter post title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={120}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="content" className="form-label">Content</label>
              <textarea
                id="content"
                className="form-input large-input"
                placeholder="Write your post content..."
                value={content}
                onChange={e => setContent(e.target.value)}
                ref={contentRef}
                onKeyDown={handleKeyDown}
                rows={6}
                maxLength={1000}
                required
                style={{resize: 'vertical'}}
              />
            </div>
            <div className="form-actions-horizontal">
              <button type="submit" className="gradient-btn submit-btn" style={{marginRight: 4}}  disabled={submitting || !title.trim() || !content.trim()}>
                {submitting ? "Publishing..." : <><FiPlus style={{marginRight: 8}} /> Publish Post</>}
              </button>
              <button type="button" className="gradient-btn submit-btn" style={{marginLeft: 4}} onClick={() => navigate('/community')}>
                <FiArrowLeft style={{marginRight: 2}} /> Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 