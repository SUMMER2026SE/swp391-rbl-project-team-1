import { supabase } from '../lib/supabaseClient';
import { getLocalData, setLocalData } from './mockDb';

export const messageService = {
  async getTeacherMessages(userId, teacherId) {
    const uId = parseInt(userId, 10);
    const tId = parseInt(teacherId, 10);
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teacher_messages')
          .select('*')
          .or(`and(sender_id.eq.${uId},receiver_id.eq.${tId}),and(sender_id.eq.${tId},receiver_id.eq.${uId})`)
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[messageService] Supabase error, falling back to local database:', err);
      }
    }
    
    const messages = getLocalData('supabase_mock_teacher_messages');
    return messages.filter(
      m => (m.sender_id === uId && m.receiver_id === tId) || 
           (m.sender_id === tId && m.receiver_id === uId)
    );
  },

  async sendTeacherMessage(senderId, receiverId, content) {
    const sId = parseInt(senderId, 10);
    const rId = parseInt(receiverId, 10);
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teacher_messages')
          .insert({
            sender_id: sId,
            receiver_id: rId,
            content: content,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[messageService] Supabase error, falling back to local database:', err);
      }
    }
    
    const messages = getLocalData('supabase_mock_teacher_messages');
    const newMsg = {
      id: messages.length + 1,
      sender_id: sId,
      receiver_id: rId,
      content: content,
      created_at: new Date().toISOString()
    };
    
    messages.push(newMsg);
    setLocalData('supabase_mock_teacher_messages', messages);
    return newMsg;
  }
};
