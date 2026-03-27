import { Link } from "react-router-dom";
import "./style.css";
import Moment from "react-moment";
import { Dots, Public } from "../../svg";
import ReactsPopup from "./ReactsPopup";
import SharePopup from "./SharePopup";
import ShareCreatePostPopup from "./ShareCreatePostPopup";
import { useEffect, useRef, useState } from "react";
import CreateComment from "./CreateComment";
import PostMenu from "./PostMenu";
import { getReactsPost, getShareCount, reactPost } from "../../functions/post";
import { createNotification } from "../../functions/notification";
import Comment from "./Comment";
import { getComment, getCountCommentInPost } from "../../functions/comment";

export default function Post({
  post,
  user,
  profile,
  socket,
  visiblePost,
  setVisiblePost,
  setVisibleReact,
  commentId,
  postId,
  setVisibleReactComment,
  visibleReactComment,
  setVisiblePhoto,
  page,
  setReport,
  setReportGroup,
}) {
  const [visible, setVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reacts, setReacts] = useState();
  const [check, setCheck] = useState();
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(1);
  const [totalComment, setTotalComment] = useState(0);
  const [comment, setComment] = useState("");
  const [checkSaved, setCheckSaved] = useState();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showShareCreate, setShowShareCreate] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const group = ["coverPictureGroup", "group"];
  const textRef = useRef(null);
  const postRef = useRef(null);
  const carouselRef = useRef(null);
  const pointerIdRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragDxRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDx, setDragDx] = useState(0);
  useEffect(() => {
    getPostReacts();
  }, [post?._id]);

  useEffect(() => {
    setCarouselIndex(0);
    dragDxRef.current = 0;
    setDragDx(0);
    setIsDragging(false);
  }, [post?._id]);

  useEffect(() => {
    const run = async () => {
      if (!post?._id || !user?.token) return;
      const res = await getShareCount(post._id, user.token);
      if (typeof res?.count === "number") setShareCount(res.count);
    };
    run();
  }, [post?._id, user?.token]);

  const handleComment = () => {
    // Gọi phương thức focus() trên đối tượng DOM của input
    textRef.current.focus();
  };

  useEffect(() => {
    getPostComments();
    getCountCommentPost();
  }, [post?._id, comment]);

  const getCountCommentPost = async () => {
    const res = await getCountCommentInPost(post?._id, user.token);
    setTotalComment(res);
  };

  const getPostComments = async () => {
    const res = await getComment(post?._id, user.token);
    setComments(res);
  };
  const getPostReacts = async () => {
    const res = await getReactsPost(post?._id, user.token);
    setReacts(res.reacts);
    setCheck(res.check);
    setTotal(res.total);
    setCheckSaved(res.checkSaved);
  };
  const reactHandler = async (type) => {
    reactPost(post?._id, type, user.token);
    if (check == type) {
      setCheck();
      let index = reacts.findIndex((x) => x.react == check);
      if (index !== -1) {
        setReacts([...reacts, (reacts[index].count = --reacts[index].count)]);
        setTotal((prev) => --prev);
      }
    } else {
      setCheck(type);
      let index = reacts.findIndex((x) => x.react == type);
      let index1 = reacts.findIndex((x) => x.react == check);
      if (index !== -1) {
        setReacts([...reacts, (reacts[index].count = ++reacts[index].count)]);

        setTotal((prev) => ++prev);
        if (user.id !== post.user._id) {
          if (!group.includes(post.type)) {
            const newNotification = await createNotification(
              post.user._id,
              type,
              post?._id,
              null,
              `/profile/${post.user._id}?post_id=${post?._id}`,
              ` <b>${user.first_name} ${user.last_name}</b> drop emotions into your post.`,
              user.token,
              null
            );

            socket.emit("sendNotification", {
              senderId: user.id,
              sender_first_name: user.first_name,
              sender_last_name: user.last_name,
              sender_picture: user.picture,
              receiverId: post.user._id,
              type: type,
              postId: post?._id,
              commentId: "",
              link: `/profile/${post.user._id}?post_id=${post?._id}`,
              description: ` <b>${user.first_name} ${user.last_name}</b> drop emotions into your post.`,
              id: newNotification.newnotification._id,
              createdAt: newNotification.newnotification.createdAt,
              groupId: "",
            });
          } else {
            const newNotification = await createNotification(
              post.user._id,
              type,
              post?._id,
              null,
              `/group/${post?.group._id}?post_id=${post?._id}`,
              ` <b>${user.first_name} ${user.last_name}</b> drop emotions into your post in group <b>${post?.group.group_name}</b>.`,
              user.token,
              post?.group._id
            );

            socket.emit("sendNotification", {
              senderId: user.id,
              sender_first_name: user.first_name,
              sender_last_name: user.last_name,
              sender_picture: user.picture,
              receiverId: post.user._id,
              type: type,
              postId: post?._id,
              commentId: "",
              link: `/group/${post?.group._id}?post_id=${post?._id}`,
              description: ` <b>${user.first_name} ${user.last_name}</b> drop emotions into your post in group <b>${post?.group.group_name}</b>.`,
              id: newNotification.newnotification._id,
              createdAt: newNotification.newnotification.createdAt,
              groupId: post?.group._id,
            });
          }
        }
      }
      if (index1 !== -1) {
        // const newReacts = [...reacts]; // Tạo một bản sao của mảng reacts
        // newReacts[index1] = {
        //   ...newReacts[index1],
        //   count: newReacts[index1].count - 1,
        // }; // Cập nhật giá trị count trong bản sao
        // setReacts(newReacts); // Cập nhật mảng reacts với bản sao đã cập nhật
        // setTotal((prev) => --prev);
        setReacts([...reacts, (reacts[index1].count = --reacts[index1].count)]);
        setTotal((prev) => --prev);
      }
    }
  };
  const showMore = () => {
    setVisiblePost({ post: post, commentId: commentId, page: page });
  };

  const imagesCount = post?.images?.length || 0;
  const canCarousel = (post?.type === null || post?.type === "group") && imagesCount > 1;

  const clampIndex = (i) => {
    if (imagesCount <= 0) return 0;
    return Math.max(0, Math.min(i, imagesCount - 1));
  };

  const goTo = (i) => setCarouselIndex(clampIndex(i));
  const prev = () => goTo(carouselIndex - 1);
  const next = () => goTo(carouselIndex + 1);

  const setDrag = (dx) => {
    dragDxRef.current = dx;
    setDragDx(dx);
  };

  const onPointerDown = (e) => {
    if (!canCarousel) return;
    // Only primary button for mouse, but allow touch/pen.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerIdRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    setDrag(0);
    isDraggingRef.current = true;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e) => {
    if (!canCarousel) return;
    if (!isDraggingRef.current) return;
    if (pointerIdRef.current !== e.pointerId) return;
    setDrag(e.clientX - dragStartXRef.current);
  };

  const endDrag = (e) => {
    if (!canCarousel) return;
    if (!isDraggingRef.current) return;
    if (pointerIdRef.current !== e.pointerId) return;

    const dx = dragDxRef.current;
    const width = carouselRef.current?.clientWidth || 1;
    const threshold = Math.min(90, Math.max(45, width * 0.12));

    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();

    isDraggingRef.current = false;
    pointerIdRef.current = null;
    setDrag(0);
    setIsDragging(false);
  };

  const postLink = group.includes(post?.type)
    ? `${window.location.origin}/group/${post?.group?._id}?post_id=${post?._id}`
    : `${window.location.origin}/profile/${post.user._id}?post_id=${post?._id}`;

  return (
    <div
      className={`${postId === post?._id ? "post_active" : "post"}`}
      style={{ width: `${profile && "100%"}` }}
      ref={postRef}
    >
      <div className="post_header" id={`post-${post?._id}`}>
        <div className="post_header_left">
          {group.includes(post?.type) && page === "home" ? (
            <>
              {" "}
              <div className="circle_icon_notification">
                <div className="req_card_pagegroup">
                  <div className="content_head_pagegroup">
                    <Link to={`/group/${post.group._id}`}>
                      <img src={post.group.cover} alt="" />
                    </Link>
                  </div>
                </div>
                <div className="right_bottom_notification_group">
                  <Link to={`/profile/${post.user._id}`}>
                    <img src={post.user.picture} alt="" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to={`/profile/${post.user._id}`}>
                <img src={post.user.picture} alt="" />
              </Link>
            </>
          )}

          <div className="header_col">
            <div className="post_profile_name">
              {group.includes(post.type) && page === "home" ? (
                <>
                  <Link to={`/group/${post.group._id}`} className="hover6">
                    {post.group.group_name}
                  </Link>
                </>
              ) : (
                <>
                  <Link to={`/profile/${post.user._id}`} className="hover6">
                    {post.user.first_name} {post.user.last_name}
                  </Link>
                </>
              )}

              <div className="updated_p">
                {post.type == "profilePicture" &&
                  `updated ${
                    post.user.gender === "male" ? "his" : "her"
                  } profile picture`}
                {post.type == "coverPicture" &&
                  `updated ${
                    post.user.gender === "male" ? "his" : "her"
                  } cover picture`}
                {post.type == "coverPictureGroup" &&
                  `updated the group cover photo.`}
              </div>
            </div>
            <div className="post_profile_privacy_date">
              {group.includes(post.type) && page === "home" && (
                <>
                  <Link
                    to={`/profile/${post.user._id}`}
                    className="userPostGroup hover6"
                    style={{
                      color: "#67696D",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                  >
                    {post.user.first_name} {post.user.last_name}
                  </Link>
                  .
                </>
              )}
              <Moment fromNow interval={30}>
                {post.createdAt}
              </Moment>
              . <Public color="#828387" />
            </div>
          </div>
        </div>
        <div
          className="post_header_right hover1"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <Dots color="#828387" />
        </div>
      </div>
      {post.background && post.type !== "share" ? (
        <div
          className="post_bg"
          style={{ backgroundImage: `url(${post.background})` }}
        >
          <div className="post_bg_text">{post.text}</div>
        </div>
      ) : post.type === "share" ? (
        <>
          {post.text && <div className="post_text">{post.text}</div>}
          {post.sharedPost && post.sharedPost.user && (
            <div className="shared_post_preview">
              <div className="shared_post_header">
                <img
                  src={post.sharedPost?.user?.picture}
                  alt=""
                  className="shared_post_avatar"
                />
                <div className="shared_post_meta">
                  <div className="shared_post_name">
                    {post.sharedPost?.user?.first_name}{" "}
                    {post.sharedPost?.user?.last_name}
                  </div>
                </div>
              </div>
              {post.sharedPost?.text && (
                <div className="shared_post_text">
                  {post.sharedPost.text}
                </div>
              )}
              {post.sharedPost?.images && post.sharedPost.images.length > 0 && (
                <div className="shared_post_images">
                  <img src={post.sharedPost.images[0].url} alt="" />
                </div>
              )}
              {post.sharedPost?.videos && post.sharedPost.videos.length > 0 && (
                <div className="shared_post_images">
                  <video
                    src={post.sharedPost.videos[0].url}
                    controls
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>
              )}
            </div>
          )}
        </>
      ) : post.type === null || post.type === "group" ? (
        <>
          <div className="post_text">{post.text}</div>
          {post.videos && post.videos.length > 0 && (
            <div className="shared_post_images">
              {post.videos.slice(0, 1).map((v, i) => (
                <video
                  key={i}
                  src={v.url}
                  controls
                  style={{ width: "100%", borderRadius: "10px" }}
                />
              ))}
            </div>
          )}
          {post.images && post.images.length > 0 && (
            <>
              {canCarousel ? (
                <div
                  className="post_carousel"
                  ref={carouselRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") endDrag(e);
                  }}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                >
                  {carouselIndex > 0 && (
                    <button
                      type="button"
                      className="post_carousel_arrow post_carousel_arrow_left"
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                  )}
                  {carouselIndex < imagesCount - 1 && (
                    <button
                      type="button"
                      className="post_carousel_arrow post_carousel_arrow_right"
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  )}

                  <div
                    className={`post_carousel_inner ${
                      isDragging ? "post_carousel_inner_dragging" : ""
                    }`}
                    style={{
                      transform: `translateX(calc(${-carouselIndex * 100}% + ${
                        (dragDx / (carouselRef.current?.clientWidth || 1)) *
                        100
                      }%))`,
                    }}
                  >
                    {post.images.map((image, i) => (
                      <div
                        key={image?.url || i}
                        className="post_carousel_item"
                        onClick={() => {
                          // Prevent "click" when it was a drag.
                          if (Math.abs(dragDx) > 6) return;
                          setVisiblePhoto({ url: image.url, type: "post" });
                        }}
                      >
                        <img
                          className="post_carousel_image"
                          src={image.url}
                          alt=""
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="post_carousel_dots" onClick={(e) => e.stopPropagation()}>
                    {post.images.map((_, i) => (
                      <div
                        key={i}
                        className={`post_carousel_dot ${
                          i === carouselIndex ? "post_carousel_dot_active" : ""
                        }`}
                        onClick={() => goTo(i)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{ cursor: "pointer" }}
                  className={
                    post.images.length === 1
                      ? "grid_1"
                      : post.images.length === 2
                      ? "grid_2"
                      : post.images.length === 3
                      ? "grid_3"
                      : post.images.length === 4
                      ? "grid_4"
                      : post.images.length >= 5 && "grid_5"
                  }
                >
                  {post.images.slice(0, 5).map((image, i) => (
                    <div
                      key={image?.url || i}
                      onClick={() => setVisiblePhoto({ url: image.url, type: "post" })}
                    >
                      <img src={image.url} alt="" />
                    </div>
                    // className={`img-${i}`}
                  ))}
                  {post.images.length > 5 && (
                    <div className="more-pics-shadow">+{post.images.length - 5}</div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : post.type === "profilePicture" ? (
        <>
          <div className="post_text">{post.text}</div>
          <div className="post_profile_wrap" style={{ cursor: "pointer" }}>
            <div className="post_updated_bg">
              <img src={post.user.cover} alt="" />
            </div>
            <img
              src={post.images[0].url}
              alt=""
              className="post_updated_picture"
              onClick={() =>
                setVisiblePhoto({ url: post.images[0].url, type: "profile" })
              }
            />
          </div>
        </>
      ) : (
        <div
          className="post_cover_wrap"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setVisiblePhoto({ url: post.images[0].url, type: "cover" })
          }
        >
          <img src={post.images[0].url} alt="" />
        </div>
      )}

      <div className="post_infos">
        <div
          className="reacts_count"
          onClick={() => setVisibleReact(post?._id)}
        >
          <div className="reacts_count_imgs">
            {reacts &&
              reacts
                .sort((a, b) => {
                  return b.count - a.count;
                })
                .slice(0, 3)
                .map(
                  (react, i) =>
                    react.count > 0 && (
                      <img
                        src={`../../../reacts/${react.react}.svg`}
                        alt=""
                        key={i}
                      />
                    )
                )}
          </div>
          <div className="reacts_count_num">{total > 0 && total}</div>
        </div>
        <div className="to_right">
          <div className="comments_count">{totalComment} comments</div>
          <div className="share_count">{shareCount} share</div>
        </div>
      </div>
      <div className="post_actions">
        <ReactsPopup
          visible={visible}
          setVisible={setVisible}
          reactHandler={reactHandler}
        />
        <div
          className="post_action hover1"
          onMouseOver={() => {
            setTimeout(() => {
              setVisible(true);
            }, 500);
          }}
          onMouseLeave={() => {
            setTimeout(() => {
              setVisible(false);
            }, 500);
          }}
          onClick={() => reactHandler(check ? check : "Like")}
        >
          {check ? (
            <img
              src={`../../../reacts/${check}.svg`}
              alt=""
              className="small_react"
              style={{ width: "18px" }}
            />
          ) : (
            <i className="like_icon"></i>
          )}
          <span
            style={{
              color: `
          
          ${
            check === "Like"
              ? "#4267b2"
              : check === "Love"
              ? "#f63459"
              : check === "Haha"
              ? "#f7b125"
              : check === "Sad"
              ? "#f7b125"
              : check === "Wow"
              ? "#f7b125"
              : check === "Angry"
              ? "#e4605a"
              : ""
          }
          `,
            }}
          >
            {check ? check : "Like"}
          </span>
        </div>
        <div className="post_action hover1" onClick={handleComment}>
          <i className="comment_post_icon"></i>
          <span>Comment</span>
        </div>
        <div
          className="post_action hover1"
          onClick={() => setShowShare((prev) => !prev)}
        >
          <i className="share_icon"></i>
          <span>Share</span>
          <SharePopup
            postLink={postLink}
            visible={showShare}
            setVisible={setShowShare}
            onShare={() => setShowShareCreate(true)}
          />
        </div>
      </div>
      {showShareCreate && (
        <ShareCreatePostPopup
          user={user}
          post={post}
          setVisible={setShowShareCreate}
        />
      )}
      <div className="comments_wrap">
        <div className="comments_order"></div>
        <CreateComment
          textRef={textRef}
          group={group}
          user={user}
          post={post}
          setComments={setComments}
          setCount={setCount}
          setLoading={setLoading}
          loading={loading}
          socket={socket}
          setComment={setComment}
        />
        {!loading && (
          <>
            {comments &&
              comments
                .sort((a, b) => {
                  return new Date(b.commentAt) - new Date(a.commentAt);
                })
                .slice(0, count)
                .map((comment, i) => (
                  <Comment
                    group={group}
                    comment={comment}
                    user={user}
                    key={i}
                    socket={socket}
                    post={post}
                    setVisiblePost={setVisiblePost}
                    visiblePost={visiblePost}
                    commentId={commentId}
                    setVisibleReact={setVisibleReact}
                    setVisibleReactComment={setVisibleReactComment}
                    visibleReactComment={visibleReactComment}
                    page={page}
                    idgroup={post?.group?._id}
                    setReportGroup={setReportGroup}
                    setReport={setReport}
                  />
                ))}
            {count < comments.length && (
              <div className="view_comments_post" onClick={() => showMore()}>
                View more comments
              </div>
            )}
          </>
        )}
      </div>
      {showMenu && (
        <PostMenu
          userId={user.id}
          postUserId={post.user._id}
          imagesLength={post?.images?.length}
          setShowMenu={setShowMenu}
          postId={post?._id}
          token={user.token}
          checkSaved={checkSaved}
          setCheckSaved={setCheckSaved}
          images={post.images}
          postRef={postRef}
          postType={post.type}
          group={group}
          setReport={setReport}
          setReportGroup={setReportGroup}
          groupId={post?.group?._id}
        />
      )}
    </div>
  );
}
