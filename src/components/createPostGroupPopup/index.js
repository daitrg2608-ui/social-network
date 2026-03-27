import { useRef, useState } from "react";
import EmojiPickerBackgrounds from "./EmojiPickerBackgrounds";
import AddToYourPost from "./AddToYourPost";
import ImagePreview from "./ImagePreview";
import useClickOutside from "../../helpers/clickOutside";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import PostError from "./PostError";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { uploadImages } from "../../functions/uploadImages";
import { uploadVideos } from "../../functions/uploadVideos";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@400;500;600&display=swap');

  :root {
    --cp-cream:   #faf7f2;
    --cp-paper:   #ffffff;
    --cp-ink:     #1a1714;
    --cp-muted:   #7a736b;
    --cp-rule:    #e8e2d9;
    --cp-amber:   #d97706;
    --cp-amber-l: #fef3c7;
    --cp-amber-m: #fde68a;
    --cp-red:     #c0392b;
    --cp-shadow:  0 2px 4px rgba(26,23,20,.04), 0 12px 40px rgba(26,23,20,.12), 0 40px 80px rgba(26,23,20,.08);
    --cp-radius:  18px;
  }

  @keyframes cp-veil-in  { from { opacity:0 }                                         to { opacity:1 } }
  @keyframes cp-card-in  { from { opacity:0; transform:translateY(20px) scale(.98) }  to { opacity:1; transform:none } }
  @keyframes cp-shake    { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

  .cp-veil {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    background: rgba(26,23,20,.55);
    backdrop-filter: blur(10px) saturate(1.4);
    -webkit-backdrop-filter: blur(10px) saturate(1.4);
    animation: cp-veil-in .18s ease;
    font-family: 'Figtree', sans-serif;
  }

  .cp-card {
    width: 100%; max-width: 500px;
    background: var(--cp-paper);
    border-radius: var(--cp-radius);
    box-shadow: var(--cp-shadow);
    animation: cp-card-in .3s cubic-bezier(.16,1,.3,1);
    overflow: hidden;
    position: relative;
  }

  /* warm grain overlay */
  .cp-card::before {
    content: '';
    position: absolute; inset: 0;
    border-radius: var(--cp-radius);
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 10;
  }

  /* ── Amber accent stripe ── */
  .cp-stripe {
    height: 4px;
    background: linear-gradient(90deg, #d97706 0%, #f59e0b 55%, #fbbf24 100%);
  }

  /* ── Header ── */
  .cp-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 22px 0;
  }

  .cp-title {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    font-style: italic;
    color: var(--cp-ink);
    letter-spacing: -.02em;
    line-height: 1;
    margin: 0;
    font-weight: 400;
  }

  .cp-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--cp-cream);
    border: 1px solid var(--cp-rule);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .15s, transform .15s, border-color .15s;
    color: var(--cp-muted);
    flex-shrink: 0;
  }
  .cp-close:hover {
    background: #ede7dc; border-color: #d4ccc0;
    color: var(--cp-ink); transform: scale(1.08);
  }
  .cp-close svg {
    width: 12px; height: 12px;
    stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; fill: none;
  }

  /* ── Divider ── */
  .cp-rule-line { height: 1px; background: var(--cp-rule); margin: 16px 22px 0; }

  /* ── Author row ── */
  .cp-author {
    display: flex; align-items: center; gap: 11px;
    padding: 14px 22px 0;
  }

  .cp-avatar-wrap { position: relative; flex-shrink: 0; }
  .cp-avatar {
    width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--cp-rule);
    display: block;
  }
  .cp-online-dot {
    position: absolute; bottom: 1px; right: 1px;
    width: 10px; height: 10px; border-radius: 50%;
    background: #22c55e; border: 2px solid var(--cp-paper);
  }

  .cp-author-meta { display: flex; flex-direction: column; gap: 4px; }
  .cp-author-name {
    font-size: 14px; font-weight: 600;
    color: var(--cp-ink); line-height: 1;
    letter-spacing: -.01em;
  }
  .cp-privacy-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 9px 2px 6px; border-radius: 99px;
    background: var(--cp-amber-l); border: 1px solid var(--cp-amber-m);
    font-size: 11px; font-weight: 600; color: var(--cp-amber);
    cursor: pointer; width: fit-content;
    transition: background .15s;
    font-family: 'Figtree', sans-serif;
  }
  .cp-privacy-pill:hover { background: var(--cp-amber-m); }
  .cp-privacy-pill svg { width: 10px; height: 10px; fill: var(--cp-amber); }

  /* ── Pending notice ── */
  .cp-pending {
    margin: 12px 22px 0;
    padding: 9px 12px;
    border-radius: 10px;
    background: #fffbeb; border: 1px solid #fde68a;
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 12px; line-height: 1.5; color: #92400e; font-weight: 500;
  }
  .cp-pending svg { width: 13px; height: 13px; fill: #d97706; margin-top: 1px; flex-shrink: 0; }

  /* ── Error wrapper ── */
  .cp-error-wrap { padding: 12px 22px 0; animation: cp-shake .25s ease; }

  /* ── Composer body ── */
  .cp-body { padding: 10px 22px 4px; min-height: 110px; }

  /* ── Add-to-post tray ── */
  .cp-tray {
    margin: 6px 22px 0;
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--cp-cream);
    border: 1px solid var(--cp-rule);
  }
  .cp-tray-label {
    display: block;
    font-size: 10px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--cp-muted); margin-bottom: 6px;
  }

  /* ── Footer ── */
  .cp-footer {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 14px 22px 20px; gap: 10px;
  }

  .cp-char-hint {
    font-size: 12px; color: var(--cp-muted);
    font-variant-numeric: tabular-nums; flex-shrink: 0;
    transition: color .2s;
  }
  .cp-char-hint.warn { color: var(--cp-red); font-weight: 600; }

  .cp-submit {
    height: 44px; padding: 0 24px;
    border-radius: 10px; border: none;
    cursor: pointer;
    font-family: 'Figtree', sans-serif;
    font-size: 14px; font-weight: 600;
    letter-spacing: .01em;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: transform .15s, box-shadow .15s, background .2s;
    position: relative; overflow: hidden;
    min-width: 110px;
  }

  .cp-submit:not(:disabled) {
    background: var(--cp-ink); color: #fff;
    box-shadow: 0 2px 8px rgba(26,23,20,.2), 0 1px 2px rgba(26,23,20,.12);
  }
  .cp-submit:not(:disabled)::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(rgba(255,255,255,.07) 0%, transparent 60%);
    pointer-events: none;
  }
  .cp-submit:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 18px rgba(26,23,20,.26), 0 2px 4px rgba(26,23,20,.14);
  }
  .cp-submit:not(:disabled):active { transform: none; }

  .cp-submit:disabled {
    background: var(--cp-cream); color: #c4bbb1;
    border: 1px solid var(--cp-rule); cursor: not-allowed;
  }

  .cp-submit-star { font-size: 13px; opacity: .8; }
`;

export default function CreatePostGroupPopup({
  user,
  setVisible,
  posts,
  dispatch,
  idGroup,
  admin,
  approvePosts,
}) {
  const popup = useRef(null);
  const [text, setText]             = useState("");
  const [showPrev, setShowPrev]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [images, setImages]         = useState([]);
  const [videos, setVideos]         = useState([]);
  const [background, setBackground] = useState("");

  useClickOutside(popup, () => setVisible(false));

  const type    = (admin && approvePosts) || !approvePosts ? "group" : "pending";
  const canPost = !!(text || background || (images && images.length) || (videos && videos.length));
  const charLeft = 500 - text.length;

  const postSubmit = async () => {
    if (background) {
      setLoading(true);
      const response = await createPost(type, background, text, null, user.id, idGroup, null, user.token);
      setLoading(false);
      if (response.status === "ok") {
        if (type === "group") dispatch({ type: "PAGEGROUP_POSTS", payload: [response.data, ...posts] });
        setBackground(""); setText(""); setVisible(false);
      } else setError(response);

    } else if (images && images.length) {
      setLoading(true);
      const postImages = images.map(dataURItoBlob);
      const path = `${idGroup}/post_images`;
      const fd = new FormData();
      fd.append("path", path);
      postImages.forEach(img => fd.append("file", img));
      const response = await uploadImages(fd, path, user.token);
      const res = await createPost(type, null, text, response, user.id, idGroup, null, user.token);
      setLoading(false);
      if (res.status === "ok") {
        if (type === "group") dispatch({ type: "PAGEGROUP_POSTS", payload: [res.data, ...posts] });
        setText(""); setImages(""); setVisible(false);
      } else setError(res);

    } else if (videos && videos.length) {
      setLoading(true);
      const path = `${idGroup}/post_videos`;
      const fd = new FormData();
      fd.append("path", path);
      videos.forEach(v => fd.append("file", v.file));
      const response = await uploadVideos(fd, path, user.token);
      const res = await createPost(type, null, text, null, user.id, idGroup, response, user.token);
      setLoading(false);
      if (res.status === "ok") {
        if (type === "group") dispatch({ type: "PAGEGROUP_POSTS", payload: [res.data, ...posts] });
        setText(""); setVideos([]); setVisible(false);
      } else setError(res);

    } else if (text) {
      setLoading(true);
      const response = await createPost(type, null, text, null, user.id, idGroup, null, user.token);
      setLoading(false);
      if (response.status === "ok") {
        if (type === "group") dispatch({ type: "PAGEGROUP_POSTS", payload: [response.data, ...posts] });
        setBackground(""); setText(""); setVisible(false);
      } else setError(response);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="cp-veil">
        <div className="cp-card" ref={popup}>

          {/* Amber top stripe */}
          <div className="cp-stripe" />

          {/* Header */}
          <div className="cp-header">
            <h2 className="cp-title">New post</h2>
            <button className="cp-close" onClick={() => setVisible(false)} aria-label="Close">
              <svg viewBox="0 0 12 12">
                <line x1="1" y1="1" x2="11" y2="11"/>
                <line x1="11" y1="1" x2="1" y2="11"/>
              </svg>
            </button>
          </div>

          <div className="cp-rule-line" />

          {/* Error */}
          {error && (
            <div className="cp-error-wrap">
              <PostError error={error} setError={setError} />
            </div>
          )}

          {/* Author */}
          <div className="cp-author">
            <div className="cp-avatar-wrap">
              <img src={user.picture} alt={user.first_name} className="cp-avatar" />
              <div className="cp-online-dot" />
            </div>
            <div className="cp-author-meta">
              <span className="cp-author-name">{user.first_name} {user.last_name}</span>
              <div className="cp-privacy-pill">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm4.93 4.5h-2a9.7 9.7 0 00-1.22-2.7A5.51 5.51 0 0112.93 5.5zM8 2.53A8.7 8.7 0 019.47 5.5h-2.94A8.7 8.7 0 018 2.53zM2.18 9.5A5.5 5.5 0 012 8c0-.52.07-1.02.18-1.5h2.3c-.06.49-.1.99-.1 1.5 0 .51.04 1.01.1 1.5H2.18zm.89 1.5h2a9.7 9.7 0 001.22 2.7A5.51 5.51 0 013.07 11zm2-6h-2A5.51 5.51 0 016.29 2.8 9.7 9.7 0 005.07 5.5zM8 13.47A8.7 8.7 0 016.53 10.5h2.94A8.7 8.7 0 018 13.47zm1.77-4H6.23A8.76 8.76 0 016.1 8c0-.51.05-1.01.13-1.5h3.54c.08.49.13.99.13 1.5 0 .51-.05 1.01-.13 1.47zm.16 3.23A9.7 9.7 0 0011.14 10h2a5.51 5.51 0 01-3.22 2.7zm1.45-4.2c.06-.49.1-.99.1-1.5 0-.51-.04-1.01-.1-1.5h2.3c.11.48.18.98.18 1.5s-.07 1.02-.18 1.5h-2.3z"/>
                </svg>
                Public
              </div>
            </div>
          </div>

          {/* Pending approval notice */}
          {type === "pending" && (
            <div className="cp-pending">
              <svg viewBox="0 0 16 16">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.65 10.5h-1.3v-1.3h1.3v1.3zm0-2.8h-1.3V4.5h1.3v4.2z"/>
              </svg>
              Your post will be held for admin review before appearing in the group.
            </div>
          )}

          {/* Composer */}
          <div className="cp-body">
            {!showPrev ? (
              <EmojiPickerBackgrounds
                text={text} user={user} setText={setText}
                showPrev={showPrev} setBackground={setBackground} background={background}
              />
            ) : (
              <ImagePreview
                text={text} user={user} setText={setText} showPrev={showPrev}
                images={images} setImages={setImages}
                videos={videos} setVideos={setVideos}
                setShowPrev={setShowPrev} setError={setError}
              />
            )}
          </div>

          {/* Media add tray */}
          <div className="cp-tray">
            <span className="cp-tray-label">Add to your post</span>
            <AddToYourPost setShowPrev={setShowPrev} setBackground={setBackground} />
          </div>

          {/* Footer */}
          <div className="cp-footer">
            {text.length > 0 && (
              <span className={`cp-char-hint${charLeft < 60 ? " warn" : ""}`}>
                {charLeft}
              </span>
            )}
            <button
              className="cp-submit"
              onClick={postSubmit}
              disabled={loading || !canPost}
            >
              {loading
                ? <PulseLoader color={canPost ? "#ffffff" : "#c4bbb1"} size={5} />
                : <><span className="cp-submit-star">✦</span> Share</>
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
