import { ArrowRight, Plus } from "../../../svg";
import "./style.css";
import Story from "./Story";
import { useMediaQuery } from "react-responsive";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { getStories, createStory } from "../../../functions/story";
import { uploadImages } from "../../../functions/uploadImages";
import { uploadVideos } from "../../../functions/uploadVideos";

export default function Stories({ user }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewer, setViewer] = useState({ open: false, index: 0 });
  const [viewerVisible, setViewerVisible] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.token) return;
      const res = await getStories(user.token);
      if (Array.isArray(res)) setStories(res);
    };
    run();
  }, [user?.token]);

  const trayStories = useMemo(() => {
    const map = new Map();
    stories.forEach((s) => {
      const id = s?.user?._id || s?.user?.id || s?.user;
      if (!id) return;
      if (!map.has(id)) map.set(id, s);
    });
    return Array.from(map.values());
  }, [stories]);

  const currentStory = trayStories[viewer.index];

  const openViewer = (index) => {
    setViewer({ open: true, index });
    requestAnimationFrame(() => setViewerVisible(true));
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setTimeout(() => setViewer({ open: false, index: 0 }), 280);
  };

  const goPrev = () => {
    if (!trayStories.length) return;
    setViewer((v) => ({ ...v, index: (v.index - 1 + trayStories.length) % trayStories.length }));
  };

  const goNext = () => {
    if (!trayStories.length) return;
    setViewer((v) => ({ ...v, index: (v.index + 1) % trayStories.length }));
  };

  useEffect(() => {
    if (!viewer.open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [viewer.open, trayStories.length]);

  const query1175px = useMediaQuery({ query: "(max-width: 1175px)" });
  const query1030px = useMediaQuery({ query: "(max-width: 1030px)" });
  const query960px  = useMediaQuery({ query: "(max-width: 960px)" });
  const query885px  = useMediaQuery({ query: "(max-width: 885px)" });

  const max = query885px
    ? 5 : query960px
    ? 4 : query1030px
    ? 5 : query1175px
    ? 4 : trayStories.length;

  const handlePick = () => fileRef.current?.click();

  const handleCreateStory = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;
    setLoading(true);
    try {
      const path = `${user.id}/story_media`;
      const formData = new FormData();
      formData.append("path", path);
      formData.append("file", file);

      let uploaded, mediaType;
      if (file.type.startsWith("video/")) {
        uploaded = await uploadVideos(formData, path, user.token);
        mediaType = "video";
      } else {
        uploaded = await uploadImages(formData, path, user.token);
        mediaType = "image";
      }

      if (!Array.isArray(uploaded) || !uploaded[0]?.url)
        throw new Error(typeof uploaded === "string" ? uploaded : "Upload failed.");

      const created = await createStory("", { url: uploaded[0].url, type: mediaType }, user.token);
      if (created?.status === "ok") setStories((prev) => [created.data, ...prev]);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Đăng story thất bại.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="stories_scroll_wrapper">
        <div className="stories">
          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-matroska"
            onChange={handleCreateStory}
          />

          {/* Create story card */}
          <div
            className="create_story_card"
            onClick={handlePick}
            role="button"
            tabIndex={0}
            aria-label="Create a story"
          >
            <img
              src={user?.picture || "../../../images/default_pic.png"}
              alt=""
              className="create_story_img"
            />
            <div className="create_story_overlay" />
            <div className="plus_story">
              <Plus color="#fff" />
            </div>
            <div className="story_create_text">
              {loading ? (
                <span className="create_story_loading">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </span>
              ) : (
                "Create Story"
              )}
            </div>
          </div>

          {/* Story cards */}
          {trayStories.slice(0, max).map((story, i) => (
            <Story
              story={story}
              key={story._id || i}
              onClick={() => openViewer(i)}
            />
          ))}

          {/* Scroll arrow */}
          <div className="white_circle" aria-hidden="true">
            <ArrowRight color="#65676b" />
          </div>
        </div>
      </div>

      {/* Story viewer portal */}
      {viewer.open &&
        currentStory &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            className={`story_viewer_backdrop${viewerVisible ? " sv_visible" : ""}`}
            onClick={closeViewer}
          >
            <div
              className={`story_viewer${viewerVisible ? " sv_visible" : ""}`}
              onClick={(ev) => ev.stopPropagation()}
            >
              {/* Header */}
              <div className="story_viewer_header">
                <div className="story_viewer_avatar_ring">
                  <img
                    src={currentStory?.user?.picture}
                    alt=""
                    className="story_viewer_avatar"
                  />
                </div>
                <div className="story_viewer_meta">
                  <div className="story_viewer_name">
                    {currentStory?.user?.first_name} {currentStory?.user?.last_name}
                  </div>
                  <div className="story_viewer_time">Just now</div>
                </div>
                <button
                  className="story_viewer_close"
                  onClick={closeViewer}
                  aria-label="Close"
                >
                  <i className="exit_icon" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="story_viewer_progress_bar">
                <div className="story_viewer_progress_fill" />
              </div>

              {/* Body */}
              <div className="story_viewer_body">
                <button
                  className="story_viewer_nav story_viewer_prev"
                  onClick={goPrev}
                  aria-label="Previous story"
                >
                  ‹
                </button>
                <button
                  className="story_viewer_nav story_viewer_next"
                  onClick={goNext}
                  aria-label="Next story"
                >
                  ›
                </button>

                {currentStory?.media?.type === "video" ? (
                  <video
                    src={currentStory.media.url}
                    className="story_viewer_media"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={currentStory?.media?.url}
                    alt=""
                    className="story_viewer_media"
                  />
                )}
              </div>

              {/* Counter dots */}
              {trayStories.length > 1 && (
                <div className="story_viewer_dots">
                  {trayStories.map((_, i) => (
                    <button
                      key={i}
                      className={`story_dot${i === viewer.index ? " active" : ""}`}
                      onClick={() => setViewer((v) => ({ ...v, index: i }))}
                      aria-label={`Story ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}