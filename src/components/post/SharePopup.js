import { useRef, useState } from "react";
import "./style.css";
import useClickOutside from "../../helpers/clickOutside";

export default function SharePopup({ postLink, visible, setVisible, onShare }) {
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => {
    setVisible(false);
  });

  if (!visible) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
      alert("Không sao chép được liên kết. Vui lòng thử lại.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chia sẻ bài viết",
          text: "Xem bài viết này",
          url: postLink,
        });
      } catch (e) {
        console.error("Share cancelled or failed", e);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="share_popup_menu" ref={menuRef}>
      <div className="share_popup_title">Chia sẻ bài viết</div>
      <button
        className="share_popup_item"
        onClick={() => {
          setVisible(false);
          onShare && onShare();
        }}
      >
        Chia sẻ lên trang cá nhân
      </button>
      <button className="share_popup_item" onClick={handleNativeShare}>
        Chia sẻ qua ứng dụng khác
      </button>
      <button className="share_popup_item" onClick={handleCopyLink}>
        {copied ? "Đã sao chép liên kết" : "Sao chép liên kết bài viết"}
      </button>
    </div>
  );
}

