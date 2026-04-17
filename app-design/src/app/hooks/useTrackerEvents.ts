import { useState, useEffect, useCallback } from "react";
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type ApiEvent,
  type EventIncomingPayload,
} from "@/api/client";

interface UseTrackerEventsOptions {
  eventType: string;
  babyId: string | null;
  caregiverId: string | null;
  canPersist: boolean;
}

interface UseTrackerEventsResult {
  apiEvents: ApiEvent[];
  loading: boolean;
  refresh: () => Promise<void>;
  create: (payload: Omit<EventIncomingPayload, "baby_id" | "caregiver_id">) => Promise<ApiEvent | null>;
  update: (id: string, payload: Partial<EventIncomingPayload>) => Promise<ApiEvent | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useTrackerEvents({
  eventType,
  babyId,
  caregiverId,
  canPersist,
}: UseTrackerEventsOptions): UseTrackerEventsResult {
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!canPersist || !babyId) return;
    setLoading(true);
    try {
      const evs = await listEvents({ baby_id: babyId, event_type: eventType });
      setApiEvents(evs);
    } finally {
      setLoading(false);
    }
  }, [babyId, canPersist, eventType]);

  useEffect(() => {
    if (canPersist && babyId) {
      void refresh();
    }
  }, [canPersist, babyId, refresh]);

  const create = useCallback(
    async (payload: Omit<EventIncomingPayload, "baby_id" | "caregiver_id">) => {
      if (!canPersist || !babyId || !caregiverId) return null;
      const full: EventIncomingPayload = {
        ...payload,
        baby_id: babyId,
        caregiver_id: caregiverId,
      };
      const created = await createEvent(full);
      await refresh();
      return created;
    },
    [babyId, caregiverId, canPersist, refresh],
  );

  const update = useCallback(
    async (id: string, payload: Partial<EventIncomingPayload>) => {
      const updated = await updateEvent(id, payload);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteEvent(id);
      await refresh();
      return true;
    },
    [refresh],
  );

  return { apiEvents, loading, refresh, create, update, remove };
}
