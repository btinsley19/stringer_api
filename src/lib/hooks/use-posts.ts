import { useState, useEffect, useCallback } from 'react';
import { Post, ParsedPost, DataState } from '../types';
import { fetchPosts, PostsParams } from '../api/posts';
import { sanitizeApiResponse, sanitizePost } from '../utils/validation';

export function usePosts(initialParams: PostsParams = {}) {
  const [state, setState] = useState<DataState<ParsedPost>>({
    data: [],
    loading: true,
    error: null,
    hasMore: false,
    nextCursor: null,
  });

  const [params, setParams] = useState<PostsParams>(initialParams);

  const parsePost = useCallback((post: Post): ParsedPost => {
    return {
      ...post,
      hasMedia: !!(post.media && post.media_type),
      isLinked: !!post.event,
    };
  }, []);

  const loadPosts = useCallback(async (loadParams: PostsParams = {}, append: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchPosts(loadParams);
      
      // TEMPORARY: Skip validation for debugging
      console.log('Raw response data count:', response.data?.length || 0);
      
      // Bypass validation and use raw data
      const rawPosts = response.data || [];
      console.log('Raw posts count:', rawPosts.length);
      
      const parsedPosts = rawPosts.map((post: any) => ({
        ...post,
        hasMedia: !!(post.media && post.media_type),
        isLinked: !!post.event,
      }));
      console.log('Parsed posts count:', parsedPosts.length);

      setState(prev => ({
        data: append ? [...prev.data, ...parsedPosts] : parsedPosts,
        loading: false,
        error: null,
        hasMore: response.hasMore || false,
        nextCursor: response.nextCursor || null,
      }));
    } catch (error) {
      console.error('Error loading posts:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load posts',
      }));
    }
  }, [parsePost]);

  const loadMore = useCallback(() => {
    if (state.hasMore && state.nextCursor && !state.loading) {
      loadPosts({ ...params, cursor: state.nextCursor }, true);
    }
  }, [state.hasMore, state.nextCursor, state.loading, params, loadPosts]);

  const refresh = useCallback(() => {
    loadPosts(params, false);
  }, [params, loadPosts]);

  const updateParams = useCallback((newParams: Partial<PostsParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    loadPosts(updatedParams, false);
  }, [params, loadPosts]);

  useEffect(() => {
    loadPosts(params, false);
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
    updateParams,
    params,
  };
}

export function usePostById(id: string) {
  const [post, setPost] = useState<ParsedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPost(null);
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, we'll fetch from the posts list and find by ID
        // In a real implementation, you might have a dedicated endpoint
        const response = await fetchPosts({ limit: 1000 }); // Get more posts to find the one we need
        const parsedPosts = response.data.map(p => ({
          ...p,
          hasMedia: !!(p.media && p.media_type),
          isLinked: !!p.event,
        }));
        const foundPost = parsedPosts.find(p => p.id === id);
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  return { post, loading, error };
}

export function usePostsByEvent(eventId: string) {
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchPosts({ event: eventId, limit: 100 });
        const parsedPosts = response.data.map(p => ({
          ...p,
          hasMedia: !!(p.media && p.media_type),
          isLinked: !!p.event,
        }));
        
        setPosts(parsedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [eventId]);

  return { posts, loading, error };
}
