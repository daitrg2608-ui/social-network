import { Dots, NewRoom, Search } from "../../../svg";
import Contact from "./Contact";
import FriendRequests from "./FriendRequests";
import NotifiBirth from "./NotifiBirth";
import InviteGroup from "./InviteGroup";
import "./style.css";
import RoomMess from "./RoomMess";

export default function RightHome({
  user,
  dataFriend,
  getDataFriend,
  setShowChat,
  socket,
  dataByBirthday,
  getDatafriendsByBirthday,
  dataRoomMess,
  setShowChatRoom,
  onlineUsers,
  getListMess,
  openChatWindow,
  listMess,
}) {
  const color = "#65676b";

  const hasFriendRequests = dataFriend?.requests?.length > 0;
  const hasGroupInvites = dataFriend?.requests_group?.length > 0;
  const hasBirthdays = dataByBirthday?.upcomingBirthdays?.length > 0;

  return (
    <div className="right_home">

      {/* ── Friend Requests ── */}
      {hasFriendRequests && (
        <div className="sidebar_section">
          <div className="heading">Friend Requests</div>
          <FriendRequests
            user={user}
            dataFriend={dataFriend}
            getDataFriend={getDataFriend}
            socket={socket}
          />
        </div>
      )}

      {hasFriendRequests && <div className="splitter1" />}

      {/* ── Group Invitations ── */}
      {hasGroupInvites && (
        <div className="sidebar_section">
          <div className="heading">Group Invitations</div>
          <InviteGroup
            user={user}
            dataFriend={dataFriend}
            getDataFriend={getDataFriend}
            socket={socket}
          />
        </div>
      )}

      {hasGroupInvites && <div className="splitter1" />}

      {/* ── Birthdays ── */}
      {hasBirthdays && (
        <div className="sidebar_section">
          <div className="heading">Birthdays</div>
          <NotifiBirth
            user={user}
            dataFriend={dataFriend}
            getDataFriend={getDataFriend}
            socket={socket}
            dataByBirthday={dataByBirthday}
            getDatafriendsByBirthday={getDatafriendsByBirthday}
          />
        </div>
      )}

      {hasBirthdays && <div className="splitter1" />}

      {/* ── Contacts ── */}
      <div className="contacts_wrap">
        <div className="contacts_header">
          <div className="contacts_header_left">Contacts</div>
          <div className="contacts_header_right">
            <div className="contact_circle hover1">
              <NewRoom color={color} />
            </div>
            <div className="contact_circle hover1">
              <Search color={color} />
            </div>
            <div className="contact_circle hover1">
              <Dots color={color} />
            </div>
          </div>
        </div>

        <div className="contacts_list">
          <Contact
            user={user}
            dataFriend={dataFriend}
            setShowChat={setShowChat}
            setShowChatRoom={setShowChatRoom}
            onlineUsers={onlineUsers}
            getListMess={getListMess}
            openChatWindow={openChatWindow}
            listMess={listMess}
          />
        </div>

        <div className="splitter1" />

        {/* ── Group Chats ── */}
        <div className="contacts_header">
          <div className="contacts_header_left">Community Chats</div>
        </div>
        <div className="contacts_list">
          <RoomMess
            user={user}
            dataRoomMess={dataRoomMess}
            setShowChatRoom={setShowChatRoom}
            setShowChat={setShowChat}
            onlineUsers={onlineUsers}
            openChatWindow={openChatWindow}
            getListMess={getListMess}
          />
        </div>
      </div>
    </div>
  );
}