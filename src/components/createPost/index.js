import { Feeling, LiveVideo, Photo } from "../../svg";
import UserMenu from "../header/userMenu";
import "./style.css";
export default function CreatePost({ user, setVisible, profile, page }) {
  return (
    <div className={`createPost ${page === "home" ? "home-variant" : "profile-variant"}`}>
      {/* Decorative top gradient bar */}
      <div className="createPost_accent_bar" />

      {/* Header: avatar + input trigger */}
      <div className="createPost_header">
        <div className="avatar_wrapper">
          <img src={user?.picture} alt={user?.first_name} />
          <span className="avatar_status" />
        </div>

        <button
          className="open_post"
          onClick={() => setVisible(true)}
          aria-label="Create a new post"
        >
          <span className="open_post_text">
            What's on your mind,{" "}
            <strong>{user?.first_name}</strong>?
          </span>
          <span className="open_post_cta">Post</span>
        </button>
      </div>

      {/* Decorative divider */}
      <div className="create_splitter">
        <span className="splitter_dot" />
        <span className="splitter_line" />
        <span className="splitter_dot" />
      </div>

      {/* Action buttons */}
      <div className="createPost_body">
        <button className="createPost_icon" data-type="live">
          <span className="icon_bg live_bg">
            <LiveVideo color="#fff" />
          </span>
          <span className="icon_label">Live Video</span>
        </button>

        <button className="createPost_icon" data-type="photo">
          <span className="icon_bg photo_bg">
            <Photo color="#fff" />
          </span>
          <span className="icon_label">Photo / Video</span>
        </button>

        {profile ? (
          <button className="createPost_icon" data-type="life">
            <span className="icon_bg life_bg">
              <i className="lifeEvent_icon" />
            </span>
            <span className="icon_label">Life Event</span>
          </button>
        ) : (
          <button className="createPost_icon" data-type="feeling">
            <span className="icon_bg feeling_bg">
              <Feeling color="#fff" />
            </span>
            <span className="icon_label">Feeling</span>
          </button>
        )}
      </div>
    </div>
  );
}
