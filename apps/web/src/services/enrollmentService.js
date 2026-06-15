import { supabase } from '../lib/supabaseClient';
import { getLocalData, setLocalData } from './mockDb';

export const enrollmentService = {
  async checkEnrollment(userId, courseId) {
    const uId = parseInt(userId, 10);
    const cId = parseInt(courseId, 10);
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('student_id', uId)
          .eq('course_id', cId)
          .eq('status', 'active')
          .maybeSingle();
        if (error) throw error;
        return !!data;
      } catch (err) {
        console.warn('[enrollmentService] Supabase error, falling back to local database:', err);
      }
    }
    
    const enrollments = getLocalData('supabase_mock_course_enrollments') || [];
    return enrollments.some(e => e.student_id === uId && e.course_id === cId && e.status === 'active');
  },

  async enrollCourse(userId, courseId, price = 0) {
    const uId = parseInt(userId, 10);
    const cId = parseInt(courseId, 10);
    const amountVal = parseFloat(price) || 499000;
    const transactionId = `EP${uId}C${cId}_${Date.now()}`;
    
    if (supabase) {
      try {
        // 1. Insert into payments table
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            student_id: uId,
            course_id: cId,
            amount: amountVal,
            transaction_id: transactionId,
            status: 'completed'
          })
          .select()
          .single();
        if (paymentError) throw paymentError;

        // 2. Insert into course_enrollments table
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('course_enrollments')
          .insert({
            student_id: uId,
            course_id: cId,
            payment_id: paymentData.id,
            status: 'active'
          })
          .select()
          .single();
        if (enrollmentError) throw enrollmentError;

        return enrollmentData;
      } catch (err) {
        console.warn('[enrollmentService] Supabase error, falling back to local database:', err);
      }
    }
    
    // Local fallback logic
    const payments = getLocalData('supabase_mock_payments') || [];
    const enrollments = getLocalData('supabase_mock_course_enrollments') || [];
    
    let payment = payments.find(p => p.student_id === uId && p.course_id === cId);
    if (!payment) {
      payment = {
        id: payments.length + 1,
        student_id: uId,
        course_id: cId,
        amount: amountVal,
        transaction_id: transactionId,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      payments.push(payment);
      setLocalData('supabase_mock_payments', payments);
    }

    let enrollment = enrollments.find(e => e.student_id === uId && e.course_id === cId);
    if (!enrollment) {
      enrollment = {
        id: enrollments.length + 1,
        student_id: uId,
        course_id: cId,
        payment_id: payment.id,
        status: 'active',
        enrolled_at: new Date().toISOString()
      };
      enrollments.push(enrollment);
      setLocalData('supabase_mock_course_enrollments', enrollments);
    }
    
    // Also unlock course in the local current_user settings if needed
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (currentUser && currentUser.id === uId) {
      const unlocked = currentUser.unlockedCourses || [];
      if (!unlocked.includes(cId)) {
        currentUser.unlockedCourses = [...unlocked, cId];
        localStorage.setItem('current_user', JSON.stringify(currentUser));
      }
    }
    
    return enrollment;
  },

  async getLessonProgress(userId, lessonId) {
    const uId = parseInt(userId, 10);
    const lId = parseInt(lessonId, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('student_id', uId)
          .eq('lesson_id', lId)
          .maybeSingle();
        if (error) throw error;
        return data ? data.is_completed : false;
      } catch (err) {
        console.warn('[enrollmentService] Supabase error, falling back to local database:', err);
      }
    }
    const progressList = getLocalData('supabase_mock_lesson_progress') || [];
    const entry = progressList.find(p => p.student_id === uId && p.lesson_id === lId);
    return entry ? entry.is_completed : false;
  },

  async getEnrolledCourseProgress(userId, courseId) {
    const uId = parseInt(userId, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('lesson_id, is_completed')
          .eq('student_id', uId)
          .eq('is_completed', true);
        if (error) throw error;
        return data.map(p => p.lesson_id);
      } catch (err) {
        console.warn('[enrollmentService] Supabase error, falling back to local database:', err);
      }
    }
    const progressList = getLocalData('supabase_mock_lesson_progress') || [];
    return progressList
      .filter(p => p.student_id === uId && p.is_completed)
      .map(p => p.lesson_id);
  },

  async updateLessonProgress(userId, lessonId, isCompleted = true) {
    const uId = parseInt(userId, 10);
    const lId = parseInt(lessonId, 10);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .upsert({
            student_id: uId,
            lesson_id: lId,
            is_completed: isCompleted,
            updated_at: new Date().toISOString()
          }, { onConflict: 'student_id, lesson_id' })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[enrollmentService] Supabase error, falling back to local database:', err);
      }
    }

    const progressList = getLocalData('supabase_mock_lesson_progress') || [];
    const index = progressList.findIndex(p => p.student_id === uId && p.lesson_id === lId);
    if (index >= 0) {
      progressList[index].is_completed = isCompleted;
      progressList[index].updated_at = new Date().toISOString();
    } else {
      progressList.push({
        id: progressList.length + 1,
        student_id: uId,
        lesson_id: lId,
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      });
    }
    setLocalData('supabase_mock_lesson_progress', progressList);
    return { student_id: uId, lesson_id: lId, is_completed: isCompleted };
  }
};
