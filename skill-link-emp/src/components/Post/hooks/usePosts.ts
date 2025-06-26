import { useState, useEffect, useCallback } from 'react';
import type { Post, Comment, NotificationReaction } from '../types/post';

import { fetchPosts, fetchUserReaction, createComment } from './api/postsApi';
import { useWebSocket } from './websocket/useWebSocket';
import { useReactions } from './reactions/useReactions';
import { 
  parsePostDates, 
  updateCommentReactionsRecursive, 
  addCommentToPosts 
} from './utils/postUtils';

import { getUserAvatar } from '../utils/avatarUtils';
import { usePostsContext } from '../../../context/PostsContext';

interface UsePostsOptions {
  currentUserId: string | null;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  handleReaction: (postId: string, reactionType: string) => Promise<void>;
  handleCommentReaction: (commentId: string, reactionType: string) => Promise<void>;
  handleNewComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>;
}

export const usePosts = ({ currentUserId }: UsePostsOptions): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const { shouldRefresh, markAsRefreshed } = usePostsContext();
  const { handlePostReaction, handleCommentReaction } = useReactions({ currentUserId });

  // Función para asegurar que los usuarios tengan avatares
  const ensureUserHasAvatar = useCallback((user: any) => {
    if (!user.avatar || user.avatar === 'https://default-avatar.url/path') {
      return {
        ...user,
        avatar: getUserAvatar(user.id)
      };
    }
    return user;
  }, []);

  // Función para cargar posts
  const loadPosts = useCallback(async () => {
    if (!hasInitialLoad) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const data = await fetchPosts(currentUserId);
      const normalizedPosts: Post[] = data.map(post => {
        const parsedPost = parsePostDates(post);
        parsedPost.author = ensureUserHasAvatar(parsedPost.author);
        const ensureCommentAvatars = (comments: Comment[]): Comment[] => {
          return comments.map(comment => ({
            ...comment,
            author: ensureUserHasAvatar(comment.author),
            replies: comment.replies ? ensureCommentAvatars(comment.replies) : []
          }));
        };
        
        parsedPost.comments = ensureCommentAvatars(parsedPost.comments);
        
        return parsedPost;
      });
      setPosts(normalizedPosts);
      if (!hasInitialLoad) {
        setHasInitialLoad(true);
      }
      if (shouldRefresh) {
        markAsRefreshed();
      }
      
    } catch (err: any) {
      setError("No se pudieron cargar los posts. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, ensureUserHasAvatar, hasInitialLoad, shouldRefresh, markAsRefreshed]);

  const handleNewComment = useCallback(async (
    postId: string, 
    content: string, 
    parentCommentId?: string
  ) => {
    if (!currentUserId) {
      console.warn('No hay usuario logueado para crear comentario');
      throw new Error('Debes estar logueado para comentar');
    }

    try {
      const newCommentDTO = await createComment(content, postId, currentUserId, parentCommentId);
      const newComment: Comment = {
        id: newCommentDTO.id,
        author: ensureUserHasAvatar(newCommentDTO.author),
        content: newCommentDTO.content,
        createdAt: new Date(newCommentDTO.createdAt),
        reactions: newCommentDTO.reactions || {},
        userReaction: newCommentDTO.userReaction || null,
        replies: newCommentDTO.replies || []
      };
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.id === postId) {
            if (parentCommentId) {
              const updateRepliesRecursive = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                  if (comment.id === parentCommentId) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), newComment]
                    };
                  } else if (comment.replies && comment.replies.length > 0) {
                    return {
                      ...comment,
                      replies: updateRepliesRecursive(comment.replies)
                    };
                  }
                  return comment;
                });
              };
              
              return {
                ...post,
                comments: updateRepliesRecursive(post.comments)
              };
            } else {
              return {
                ...post,
                comments: [...post.comments, newComment]
              };
            }
          }
          return post;
        });
      });

    } catch (error) {
      throw error;
    }
  }, [currentUserId, ensureUserHasAvatar]);

  const handleNewCommentFromWS = useCallback((newComment: Comment) => {
    const commentWithAvatar = {
      ...newComment,
      author: ensureUserHasAvatar(newComment.author)
    };
    setPosts(prevPosts => addCommentToPosts(prevPosts, commentWithAvatar));
  }, [ensureUserHasAvatar]);

  const handleCommentUpdateFromWS = useCallback((updatedComment: Comment) => {
    const commentWithAvatar = {
      ...updatedComment,
      author: ensureUserHasAvatar(updatedComment.author)
    };
    
    setPosts(prevPosts => {
      return prevPosts.map(post => {
        const updateCommentsRecursive = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentWithAvatar.id) {
              return commentWithAvatar;
            } else if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentsRecursive(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return {
          ...post,
          comments: updateCommentsRecursive(post.comments)
        };
      });
    });
  }, [ensureUserHasAvatar]);

  const handleCommentDeleteFromWS = useCallback((deletedCommentId: string) => {
    setPosts(prevPosts => {
      return prevPosts.map(post => {
        const removeCommentsRecursive = (comments: Comment[]): Comment[] => {
          return comments
            .filter(comment => comment.id !== deletedCommentId)
            .map(comment => ({
              ...comment,
              replies: comment.replies ? removeCommentsRecursive(comment.replies) : []
            }));
        };
        
        return {
          ...post,
          comments: removeCommentsRecursive(post.comments)
        };
      });
    });
  }, []);

  const handlePostUpdateFromWS = useCallback((updatedPost: Post) => {
    const postWithAvatar = {
      ...updatedPost,
      author: ensureUserHasAvatar(updatedPost.author)
    };
    
    setPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post.id === postWithAvatar.id) {
          return {
            ...postWithAvatar,
            comments: post.comments,
            reactions: post.reactions,
            userReaction: post.userReaction
          };
        }
        return post;
      });
    });
  }, [ensureUserHasAvatar]);

  const handlePostDeleteFromWS = useCallback((deletedPostId: string) => {
    setPosts(prevPosts => {
      return prevPosts.filter(post => post.id !== deletedPostId);
    });
  }, []);

  const handleReactionChange = useCallback(async (reactionNotification: NotificationReaction) => {
    if (reactionNotification.targetType === 'POST') {
      let userReaction: string | null = null;
      
      if (currentUserId) {
        try {
          userReaction = await fetchUserReaction(currentUserId, reactionNotification.targetId, 'POST');
        } catch (error) {
          console.error('Error consultando userReaction de POST:', error);
        }
      }

      setPosts((prevPosts: Post[]) => {
        return prevPosts.map((post: Post) => {
          if (post.id === reactionNotification.targetId) {
            return {
              ...post,
              reactions: { ...reactionNotification.reactionCounts },
              userReaction: userReaction
            };
          }
          return post;
        });
      });

    } else if (reactionNotification.targetType === 'COMMENT') {
      let userReaction: string | null = null;
      
      if (currentUserId) {
        try {
          userReaction = await fetchUserReaction(currentUserId, reactionNotification.targetId, 'COMMENT');
        } catch (error) {
          console.error('Error consultando userReaction del comentario:', error);
        }
      }

      setPosts((prevPosts: Post[]) => {
        const timestamp = Date.now();
        return prevPosts.map((post: Post) => {
          const updatedPost = {
            ...post,
            comments: updateCommentReactionsRecursive(
              post.comments,
              reactionNotification,
              userReaction
            ),
            _lastUpdate: timestamp
          };
          
          return updatedPost;
        });
      });
    }
  }, [currentUserId]);

  useWebSocket({
    onNewComment: handleNewCommentFromWS,
    onReactionChange: handleReactionChange,
    onCommentUpdate: handleCommentUpdateFromWS,
    onCommentDelete: handleCommentDeleteFromWS,
    onPostUpdate: handlePostUpdateFromWS, 
    onPostDelete: handlePostDeleteFromWS  
  });

  useEffect(() => {
    if (!hasInitialLoad || shouldRefresh) {
      loadPosts();
    }
  }, [loadPosts, hasInitialLoad, shouldRefresh]);

  return { 
    posts, 
    loading, 
    error, 
    fetchPosts: loadPosts, 
    handleReaction: handlePostReaction,
    handleCommentReaction,
    handleNewComment
  };
};