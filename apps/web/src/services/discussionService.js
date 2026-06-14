import { supabase } from '../lib/supabaseClient';
import { getLocalData, setLocalData } from './mockDb';

export const discussionService = {
  async getDiscussionsByLessonId(lessonId) {
    const lId = parseInt(lessonId, 10);
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('course_discussions')
          .select('*')
          .eq('lesson_id', lId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[discussionService] Supabase error, falling back to local database:', err);
      }
    }
    
    const discussions = getLocalData('supabase_mock_discussions');
    return discussions.filter(d => d.lesson_id === lId);
  },

  async createDiscussion(lessonId, userId, userName, userAvatar, content, parentId = null) {
    const lId = parseInt(lessonId, 10);
    const uId = parseInt(userId, 10);
    const pId = parentId ? parseInt(parentId, 10) : null;
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('course_discussions')
          .insert({
            lesson_id: lId,
            user_id: uId,
            user_name: userName,
            user_avatar: userAvatar,
            content: content,
            parent_id: pId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[discussionService] Supabase error, falling back to local database:', err);
      }
    }
    
    const discussions = getLocalData('supabase_mock_discussions');
    const newComment = {
      id: discussions.length + 1,
      lesson_id: lId,
      user_id: uId,
      user_name: userName,
      user_avatar: userAvatar,
      content: content,
      parent_id: pId,
      created_at: new Date().toISOString()
    };
    
    discussions.push(newComment);
    setLocalData('supabase_mock_discussions', discussions);
    return newComment;
  }
};
