import { useRef, useState } from "react";
import "../createPostPopup/style.css";
import "./style.css";
import useClickOutside from "../../helpers/clickOutside";
import { sharePost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";

export default function ShareCreatePostPopup({ user, post, setVisible }) {
  const popup = useRef(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useClickOutside(popup, () => {
    setVisible(false);
  });

  if (!post) return null;

  const handleSubmit = async () => {
    if (!post?._id || !user?.token) return;
    setLoading(true);
    const res = await sharePost(post._id, text, user.token);
    setLoading(false);
    if (res?.status === "ok") {
      setVisible(false);
      setText("");
    } else {
      setError(res || "Chia sẻ thất bại.");
    }
  };

  return (
    <div className="blur1">
      <div className="blur2">
      <div className="postBox overflow_a" ref={popup}>
        {error && (
          <div className="postError" onClick={() => setError("")}>
            <div className="postError_error">{error}</div>
          </div>
        )}
        <div className="box_header">
          <div
            className="small_circle"
            onClick={() => {
              setVisible(false);
            }}
          >
            <i className="exit_icon"></i>
          </div>
          <span>Chia sẻ bài viết</span>
        </div>
        <div className="box_profile">
          <img src={user.picture} alt="" className="box_profile_img" />
          <div className="box_col">
            <div className="box_profile_name">
              {user.first_name} {user.last_name}
            </div>
            <div className="box_privacy">
              <img src="../../../icons/public.png" alt="" />
              <span>Public</span>
              <i className="arrowDown_icon"></i>
            </div>
          </div>
        </div>

        <div className="flex_center">
          <textarea
            className="post_input input2"
            placeholder={`Hãy nói gì đó về bài viết này, ${user.first_name}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="shared_post_preview">
          <div className="shared_post_header">
            <img
              src={post.user?.picture}
              alt=""
              className="shared_post_avatar"
            />
            <div className="shared_post_meta">
              <div className="shared_post_name">
                {post.user?.first_name} {post.user?.last_name}
              </div>
            </div>
          </div>
          {post.text && <div className="shared_post_text">{post.text}</div>}
          {post.images && post.images.length > 0 && (
            <div className="shared_post_images">
              <img src={post.images[0].url} alt="" />
            </div>
          )}
        </div>

        <button
          className="post_submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <PulseLoader color="#fff" size={5} /> : "Post"}
        </button>
      </div>
    </div>
    </div>
  );
}

