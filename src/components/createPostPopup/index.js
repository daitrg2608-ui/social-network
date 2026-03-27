import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";
import useClickOutside from "../../helpers/clickOutside";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import PostError from "./PostError";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { uploadImages } from "../../functions/uploadImages";
import { uploadVideos } from "../../functions/uploadVideos";
import EmojiPickerBackgrounds from "./EmojiPickerBackgrounds";
import ImagePreview from "./ImagePreview";
import AddToYourPost from "./AddToYourPost";

export default function CreatePostPopup({
  user,
  setVisible,
  posts,
  dispatch,
  profile,
}) {
  const popup = useRef(null);
  const [text, setText] = useState("");
  const [showPrev, setShowPrev] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [background, setBackground] = useState("");

  useClickOutside(popup, () => setVisible(false));

  const postSubmit = async () => {
    if (background) {
      setLoading(true);
      const response = await createPost(null, background, text, null, user.id, null, null, user.token);
      setLoading(false);
      if (response.status === "ok") {
        dispatch({ type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS", payload: [response.data, ...posts] });
        setBackground(""); setText(""); setVisible(false);
      } else { setError(response); }
    } else if (images && images.length) {
      setLoading(true);
      const postImages = images.map((img) => dataURItoBlob(img));
      const path = `${user.id}/post_images`;
      let formData = new FormData();
      formData.append("path", path);
      postImages.forEach((image) => formData.append("file", image));
      const response = await uploadImages(formData, path, user.token);
      const res = await createPost(null, null, text, response, user.id, null, null, user.token);
      setLoading(false);
      if (res.status === "ok") {
        dispatch({ type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS", payload: [res.data, ...posts] });
        setText(""); setImages(""); setVisible(false);
      } else { setError(res); }
    } else if (videos && videos.length) {
      setLoading(true);
      const path = `${user.id}/post_videos`;
      let formData = new FormData();
      formData.append("path", path);
      videos.forEach((v) => formData.append("file", v.file));
      const response = await uploadVideos(formData, path, user.token);
      const res = await createPost(null, null, text, null, user.id, null, response, user.token);
      setLoading(false);
      if (res.status === "ok") {
        dispatch({ type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS", payload: [res.data, ...posts] });
        setText(""); setVideos([]); setVisible(false);
      } else { setError(res); }
    } else if (text) {
      setLoading(true);
      const response = await createPost(null, null, text, null, user.id, null, null, user.token);
      setLoading(false);
      if (response.status === "ok") {
        dispatch({ type: profile ? "PROFILE_POSTS" : "POSTS_SUCCESS", payload: [response.data, ...posts] });
        setBackground(""); setText(""); setVisible(false);
      } else { setError(response); }
    }
  };

  const canPost = text.trim() || images.length || videos.length || background;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:wght@400;500&display=swap');

        .cp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 18, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: cpFadeIn 0.2s ease;
        }

        @keyframes cpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cpSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cp-box {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 520px;
          max-width: 96vw;
          background: #ffffff;
          border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.06),
            0 24px 60px rgba(0,0,0,0.18),
            0 8px 20px rgba(0,0,0,0.1);
          animation: cpSlideUp 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }

        /* Decorative top bar */
        .cp-topbar {
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);
          background-size: 200% 100%;
          animation: cpBarSlide 3s linear infinite;
        }

        @keyframes cpBarSlide {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .cp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 16px;
          border-bottom: 1px solid #f0f0f5;
        }

        .cp-title {
          font-family: 'Playfair Display', serif;
          font-size: 19px;
          font-weight: 500;
          color: #111827;
          letter-spacing: -0.3px;
        }

        .cp-close {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f3f4f6;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }

        .cp-close:hover {
          background: #e5e7eb;
          transform: scale(1.08);
        }

        .cp-close svg {
          width: 16px;
          height: 16px;
          stroke: #374151;
          stroke-width: 2.2;
          fill: none;
        }

        .cp-profile-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px 8px;
        }

        .cp-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .cp-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e5e7eb;
        }

        .cp-avatar-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          z-index: -1;
        }

        .cp-user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cp-username {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          line-height: 1;
        }

        .cp-privacy-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f0f0ff;
          color: #6366f1;
          border: 1px solid #e0e0ff;
          border-radius: 20px;
          padding: 3px 10px 3px 7px;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
          width: fit-content;
        }

        .cp-privacy-pill:hover {
          background: #e0e0ff;
        }

        .cp-privacy-pill svg {
          width: 12px;
          height: 12px;
          fill: none;
          stroke: #6366f1;
          stroke-width: 2;
        }

        .cp-body {
          padding: 4px 20px 12px;
          min-height: 100px;
        }

        .cp-textarea {
          width: 100%;
          min-height: 90px;
          border: none;
          outline: none;
          resize: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #111827;
          background: transparent;
          caret-color: #6366f1;
          padding: 8px 0;
        }

        .cp-textarea::placeholder {
          color: #9ca3af;
          font-weight: 300;
        }

        .cp-char-count {
          display: flex;
          justify-content: flex-end;
          padding: 0 0 6px;
        }

        .cp-char-num {
          font-size: 11px;
          color: #d1d5db;
          transition: color 0.2s;
        }

        .cp-char-num.warn { color: #f59e0b; }
        .cp-char-num.danger { color: #ef4444; }

        /* Background section */
        .cp-bg-section {
          /* handled by EmojiPickerBackgrounds child */
        }

        /* Image preview area */
        .cp-image-preview {
          /* handled by ImagePreview child */
        }

        /* Divider */
        .cp-divider {
          height: 1px;
          background: #f0f0f5;
          margin: 0 20px;
        }

        /* Add to post row */
        .cp-addto-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
        }

        .cp-addto-label {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
        }

        .cp-addto-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cp-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.12s;
          color: #6b7280;
        }

        .cp-icon-btn:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
        }

        .cp-icon-btn svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
        }

        .cp-icon-btn.green { color: #22c55e; }
        .cp-icon-btn.blue { color: #3b82f6; }
        .cp-icon-btn.orange { color: #f97316; }
        .cp-icon-btn.purple { color: #8b5cf6; }
        .cp-icon-btn.red { color: #ef4444; }

        /* Footer */
        .cp-footer {
          padding: 12px 20px 18px;
        }

        .cp-submit {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          letter-spacing: 0.2px;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
          position: relative;
          overflow: hidden;
        }

        .cp-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .cp-submit:hover::after {
          opacity: 1;
        }

        .cp-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .cp-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .cp-submit:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
        }

        .cp-submit.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        @media (max-width: 550px) {
          .cp-box { width: 96vw; border-radius: 16px; }
        }
      `}</style>

      <div className="cp-overlay">
        <div className="cp-box" ref={popup}>
          {error && <PostError error={error} setError={setError} />}

          {/* Animated gradient top bar */}
          <div className="cp-topbar" />

          {/* Header */}
          <div className="cp-header">
            <span className="cp-title">Create Post</span>
            <button className="cp-close" onClick={() => setVisible(false)} aria-label="Close">
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Profile row */}
          <div className="cp-profile-row">
            <div className="cp-avatar-wrap">
              <div className="cp-avatar-ring" />
              <img src={user.picture} alt={user.first_name} className="cp-avatar" />
            </div>
            <div className="cp-user-info">
              <span className="cp-username">{user.first_name} {user.last_name}</span>
              <div className="cp-privacy-pill">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Public
                <svg viewBox="0 0 24 24" style={{width:10,height:10}}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="cp-body">
            {!showPrev ? (
              <EmojiPickerBackgrounds
                text={text}
                user={user}
                setText={setText}
                showPrev={showPrev}
                setBackground={setBackground}
                background={background}
              />
            ) : (
              <ImagePreview
                text={text}
                user={user}
                setText={setText}
                showPrev={showPrev}
                images={images}
                setImages={setImages}
                videos={videos}
                setVideos={setVideos}
                setShowPrev={setShowPrev}
                setError={setError}
              />
            )}
          </div>

          <div className="cp-divider" />

          {/* Add to your post */}
          <AddToYourPost setShowPrev={setShowPrev} setBackground={setBackground} />

          <div className="cp-divider" />

          {/* Submit footer */}
          <div className="cp-footer">
            <button
              className={`cp-submit${canPost ? " active" : ""}`}
              onClick={postSubmit}
              disabled={loading || !canPost}
            >
              {loading ? <PulseLoader color="#fff" size={5} /> : "Share Post"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
