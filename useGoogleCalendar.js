// Googleカレンダーにイベントを追加するフック
export async function addToGoogleCalendar(accessToken, event) {
  const { title, date, description = "", location = "" } = event;
  if (!accessToken || !date) return { ok: false };

  const startDate = new Date(date);
  const endDate   = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  const body = {
    summary:     title,
    description: description,
    location:    location,
    start: { date: startDate.toISOString().slice(0, 10) },
    end:   { date: endDate.toISOString().slice(0, 10) },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 1440 },  // 前日
        { method: "popup", minutes: 60 },    // 1時間前
      ],
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method:  "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (res.ok) {
    const data = await res.json();
    return { ok: true, eventId: data.id, htmlLink: data.htmlLink };
  }
  return { ok: false, status: res.status };
}

// Googleカレンダーから予定を取得（逆連携）
export async function fetchCalendarEvents(accessToken, days = 30) {
  if (!accessToken) return [];
  const now  = new Date();
  const end  = new Date(); end.setDate(end.getDate() + days);
  const params = new URLSearchParams({
    timeMin:      now.toISOString(),
    timeMax:      end.toISOString(),
    singleEvents: "true",
    orderBy:      "startTime",
    maxResults:   "50",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}
