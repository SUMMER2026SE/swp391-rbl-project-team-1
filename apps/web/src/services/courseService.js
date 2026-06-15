import { supabase } from '../lib/supabaseClient';
import { getLocalData } from './mockDb';

export const courseService = {
  async getCourses() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, subject_id, teacher_profile_id')
          .eq('is_published', true);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('[courseService] Supabase error, falling back to local database:', err);
      }
    }
    return getLocalData('supabase_mock_courses');
  },

  async getCourseById(id) {
    const courseId = parseInt(id, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, subject_id, teacher_profile_id')
          .eq('id', courseId)
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[courseService] Supabase error, falling back to local database:', err);
      }
    }
    const courses = getLocalData('supabase_mock_courses');
    return courses.find(c => c.id === courseId) || null;
  },

  async getChaptersByCourseId(courseId) {
    const cId = parseInt(courseId, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('course_id', cId)
          .order('order', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('[courseService] Supabase error, falling back to local database:', err);
      }
    }
    const chapters = getLocalData('supabase_mock_chapters');
    return chapters.filter(chap => chap.course_id === cId) || [];
  },

  async getLessonsByCourseId(courseId) {
    const cId = parseInt(courseId, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', cId)
          .order('order', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('[courseService] Supabase error, falling back to local database:', err);
      }
    }
    const lessons = getLocalData('supabase_mock_lessons');
    return lessons.filter(l => l.course_id === cId) || [];
  },

  async getMaterialsByLessonId(lessonId) {
    const lId = parseInt(lessonId, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('course_materials')
          .select('*')
          .eq('lesson_id', lId);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('[courseService] Supabase error, falling back to local database:', err);
      }
    }
    const materials = getLocalData('supabase_mock_materials');
    return materials.filter(m => m.lesson_id === lId) || [];
  }
};
