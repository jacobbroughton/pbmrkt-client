import { supabase } from "../utils/supabase";

export function useNotification() {
  async function createNotification(
    actorId: number,
    notifierId: number,
    entityId: number,
    entityTypeId: number
  ) {
    try {
      const {
        error,
        data: [notificationObject],
      } = await supabase.rpc("add_notification_object", {
        p_entity_id: entityId,
        p_entity_type_id: entityTypeId,
      });

      if (error) throw error.message || error.toString();

      console.log("added notification object", notificationObject);

      const {
        error: error2,
        data: [notification],
      } = await supabase.rpc("add_notification", {
        p_notification_object_id: notificationObject.id,
        p_notifier_id: notifierId,
        p_actor_id: actorId,
      });

      if (error2) throw error2.message || error2.toString();

      console.log("added notification", notification);
    } catch (error) {
      console.error(error);
    }
  }

  return { createNotification };
}
