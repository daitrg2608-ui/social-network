import { useEffect, useRef, useState } from "react";

export default function Contact({
  user,
  dataFriend,
  onlineUsers,
  openChatWindow,
  listMess,
}) {
  const onchat = (friend) => {
    openChatWindow(friend);
  };

  return (
    <>
      {dataFriend &&
        dataFriend.friends?.map((friend) => (
          <div
            key={friend._id}
            className="contact"
            onClick={() => onchat(friend)}
          >
            <div className="contact_img">
              <img src={friend?.picture} alt={friend?.first_name} />
              {onlineUsers.some((u) => u.userId === friend._id) && (
                <div className="state_active_user" />
              )}
            </div>
            <span>
              {friend?.first_name} {friend?.last_name}
            </span>
          </div>
        ))}
    </>
  );
}