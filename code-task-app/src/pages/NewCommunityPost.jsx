import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit3, FiCheckCircle, FiArrowLeft, FiImage } from "react-icons/fi";
import axios from "../api/axios";
import "./NewCommunityPost.css";

export default function NewCommunityPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef();

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) formData.append('image', image);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await axios.post("/community/posts", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      setSubmitting(false);
      setSuccess(true);
    } catch (error) {
      setSubmitting(false);
      alert(error.response?.data?.message || error.response?.data?.error || "Failed to publish post. Please try again.");
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
          <form className="new-community-form" onSubmit={handleSubmit} encType="multipart/form-data">
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
            <div className="form-group">
              <label htmlFor="image" className="form-label">Image (optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <label htmlFor="image" style={{
                  background: 'linear-gradient(90deg, #b5a079 0%, #e3cfa4 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: '1.01rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #e3cfa455',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background 0.2s',
                }}>
                  <FiImage style={{ fontSize: 20 }} />
                  {image ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                  id="image"
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                {image && <span style={{ color: '#7d6a4d', fontSize: '0.98rem' }}>{image.name}</span>}
              </div>
              {imagePreview && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: 160, maxHeight: 160, borderRadius: 16, boxShadow: '0 2px 8px #e3cfa455', border: '2.5px solid #e3cfa4', objectFit: 'cover' }} />
                </div>
              )}
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