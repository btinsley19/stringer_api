import { useState, useEffect, useCallback } from 'react';
import { Event, ParsedEvent, DataState } from '../types';
import { fetchEvents, EventsParams } from '../api/events';
import { parseEvents } from '../utils/tag-parser';
import { sanitizeApiResponse, sanitizeEvent } from '../utils/validation';

export function useEvents(initialParams: EventsParams = {}) {
  const [state, setState] = useState<DataState<ParsedEvent>>({
    data: [],
    loading: true,
    error: null,
    hasMore: false,
    nextCursor: null,
  });

  const [params, setParams] = useState<EventsParams>(initialParams);

  const loadEvents = useCallback(async (loadParams: EventsParams = {}, append: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchEvents(loadParams);
      
      // Validate and sanitize the response
      const sanitizedResponse = sanitizeApiResponse(response, sanitizeEvent);
      
      if (!sanitizedResponse) {
        throw new Error('Invalid response format from API');
      }

      const parsedEvents = parseEvents(sanitizedResponse.data);

      setState(prev => ({
        data: append ? [...prev.data, ...parsedEvents] : parsedEvents,
        loading: false,
        error: null,
        hasMore: sanitizedResponse.hasMore,
        nextCursor: sanitizedResponse.nextCursor,
      }));
    } catch (error) {
      console.error('Error loading events:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load events',
      }));
    }
  }, []);

  const loadMore = useCallback(() => {
    if (state.hasMore && state.nextCursor && !state.loading) {
      loadEvents({ ...params, cursor: state.nextCursor }, true);
    }
  }, [state.hasMore, state.nextCursor, state.loading, params, loadEvents]);

  const refresh = useCallback(() => {
    loadEvents(params, false);
  }, [params, loadEvents]);

  const updateParams = useCallback((newParams: Partial<EventsParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    loadEvents(updatedParams, false);
  }, [params, loadEvents]);

  useEffect(() => {
    loadEvents(params, false);
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
    updateParams,
    params,
  };
}

export function useEventById(id: string) {
  const [event, setEvent] = useState<ParsedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setEvent(null);
      setLoading(false);
      return;
    }

    const loadEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, we'll fetch from the events list and find by ID
        // In a real implementation, you might have a dedicated endpoint
        const response = await fetchEvents({ limit: 500 }); // Get more events to find the one we need
        const parsedEvents = parseEvents(response.data);
        const foundEvent = parsedEvents.find(e => e.id === id);
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  return { event, loading, error };
}
