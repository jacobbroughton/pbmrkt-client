
export function useNotification() {
  async function createNotification(
    actorId: number,
    notifierId: number,
    entityId: string,
    entityTypeId: number
  ) {
    try {
      const response = await fetch("http://localhost:4000/add-notification-object", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          entity_type_id: entityTypeId,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-notification-object");

      const data = await response.json();

      console.log("response2 data", data)

      const response2 = await fetch("http://localhost:4000/add-notification", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          notification_object_id: data.id,
          notifier_id: notifierId,
          actor_id: actorId,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-notification");

      const data2 = await response2.json();

      console.log("response2 data", data2)
    } catch (error) {
      console.error(error);
    }
  }

  return { createNotification };
}
