export default function NotifiBirth({
  user,
  dataFriend,
  getDataFriend,
  socket,
  dataByBirthday,
}) {
  return (
    <>
      {dataByBirthday.upcomingBirthdays?.length > 0 && (
        <div className="contact birthday_card">
          <span className="birth_emoji">🎂</span>
          <p>
            <b>
              {dataByBirthday.upcomingBirthdays[0]?.first_name}{" "}
              {dataByBirthday.upcomingBirthdays[0]?.last_name}
            </b>{" "}
            {dataByBirthday.upcomingBirthdays[0]?.daysToBirthdayMessage}.
          </p>
        </div>
      )}
    </>
  );
}