export default function Story({ story, onClick }) {
  return (
    <div className="story" onClick={onClick} tabIndex={0} role="button" aria-label="View story">
      <div className="story_media_wrap">
        {story?.media?.type === "video" ? (
          <video
            src={story?.media?.url}
            className="story_img"
            muted
            playsInline
          />
        ) : (
          <img
            src={story?.media?.url || story?.image}
            alt=""
            className="story_img"
          />
        )}
        <div className="story_gradient" />
      </div>

      <div className="story_profile_pic">
        <img src={story?.user?.picture || story.profile_picture} alt="" />
      </div>

      <div className="story_profile_name">
        {story?.user
          ? `${story.user.first_name} ${story.user.last_name}`
          : story.profile_name}
      </div>
    </div>
  );
}