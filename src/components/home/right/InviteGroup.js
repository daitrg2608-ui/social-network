import { acceptInvite, deleteInvite } from "../../../functions/group";
import { Link } from "react-router-dom";
import { createNotification } from "../../../functions/notification";

export default function InviteGroup({
  user,
  dataFriend,
  getDataFriend,
  socket,
}) {
  const confirmHandler = async (idgroup, requestId, userId) => {
    const res = await acceptInvite(idgroup, requestId, user.token);
    if (res === "ok") {
      getDataFriend();
    }
    const newNotification = await createNotification(
      userId,
      "acceptRequest",
      null,
      null,
      `/profile/${user.id}`,
      ` <b>${user.first_name} ${user.last_name}</b> accepted your invite to group.`,
      user.token,
      null
    );

    socket.emit("sendNotification", {
      senderId: user.id,
      sender_first_name: user.first_name,
      sender_last_name: user.last_name,
      sender_picture: user.picture,
      receiverId: userId,
      type: "acceptRequest",
      postId: "",
      commentId: "",
      link: `/profile/${user.id}`,
      description: ` <b>${user.first_name} ${user.last_name}</b> accepted your invite to group.`,
      id: newNotification.newnotification._id,
      createdAt: newNotification.newnotification.createdAt,
      groupId: "",
    });
  };

  const deleteHandler = async (requestId) => {
    const res = await deleteInvite(requestId, user.token);
    if (res === "ok") {
      getDataFriend();
    }
  };

  const req = dataFriend.requests_group?.[0];

  return (
    <>
      {dataFriend.requests_group?.length > 0 && req && (
        <div className="contact request_card">
          {/* Group cover + sender avatar overlay */}
          <div className="circle_icon_notification">
            <div className="req_card_pagegroup">
              <div className="content_head_pagegroup">
                <Link to={`/group/${req.groupRef._id}`}>
                  <img src={req.groupRef.cover} alt={req.groupRef.group_name} />
                </Link>
              </div>
            </div>
            <div className="right_bottom_notification_group">
              <img src={req.senderRef.picture} alt={req.senderRef.first_name} />
            </div>
          </div>

          {/* Info + buttons */}
          <div className="body_requests">
            <div className="name_requests">
              <p>
                <Link
                  to={`/profile/${req.senderRef._id}`}
                  className="hover6"
                >
                  {req.senderRef.first_name} {req.senderRef.last_name}
                </Link>
                <span style={{ fontWeight: 400, color: "var(--color-secondary)", fontSize: "13px" }}>
                  {" "}invited you to{" "}
                </span>
                <Link to={`/group/${req.groupRef._id}`} className="hover6">
                  {req.groupRef.group_name}
                </Link>
              </p>
            </div>

            <div className="button_requests">
              <button
                className="blue_btn_requests"
                onClick={() =>
                  confirmHandler(req.groupRef._id, req._id, req.senderRef._id)
                }
              >
                Join
              </button>
              <button
                className="gray_btn_requests"
                onClick={() => deleteHandler(req._id)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}