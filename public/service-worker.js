const API_URL = "https://api.cloud.cbh.kth.se/deploy/v2";
const FETCH_INTERVAL = 5000;
let jwt = "";
let shown = [];

const strings = {
  resourceTransfer: "Resource transfer",
  teamInvite: "Team invite",
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  setInterval(fetchNotifications, FETCH_INTERVAL);
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "JWT") {
    jwt = event.data.jwt;
  }
});

async function fetchNotifications() {
  if (!Notification.permission === "granted") return;

  try {
    const api_notifications = await fetch(API_URL + "/notifications", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const notifications = await api_notifications.json();
    if (notifications.length > 0) {
      notifications.forEach(async (notification) => {
        if (notification.readAt) return;
        if (shown.includes(notification.id)) return;

        self.registration.showNotification(strings[notification.type], {
          body: "You have a new message on kthcloud",
          icon: "/favicon/android-chrome-192x192.png",
          data: {
            url: "https://cloud.cbh.kth.se/inbox",
          },
        });

        shown.push(notification.id);

        fetch(API_URL + "/notifications/" + notification.id, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          method: "POST",
          body: JSON.stringify({
            read: true,
          }),
        });
      });
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}
