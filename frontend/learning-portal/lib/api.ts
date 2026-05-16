import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Injecte le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Types
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  is_free: boolean;
  category: string;
  level: string;
  thumbnail_url?: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  video_url?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Enrollment {
  id: number;
  user_id: string;
  course_id: number;
  enrolled_at: string;
  progress: number;
  completed_at?: string;
  course?: Course;
}

export interface DashboardStats {
  total_events: number;
  total_views: number;
  top_courses: { course_id: number; views: number }[];
  enrollments_by_day: { day: string; count: number }[];
  completions_by_day: { day: string; count: number }[];
}

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: "student" | "instructor" | "admin" }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  getMe: () => api.get("/api/auth/me"),
};

// Courses
export const coursesAPI = {
  getAll: (params?: { search?: string; category?: string; level?: string; is_free?: boolean }) =>
    api.get<Course[]>("/api/courses/", { params }),
  getById: (id: number) => api.get<Course>(`/api/courses/${id}`),
  create: (data: Partial<Course>) => api.post<Course>("/api/courses/", data),
  update: (courseId: number, data: Partial<Course>) => api.put<Course>(`/api/courses/${courseId}`, data),
  delete: (courseId: number) => api.delete(`/api/courses/${courseId}`),
  enroll: (userId: string, courseId: number) =>
    api.post("/api/enrollments/", { user_id: userId, course_id: courseId }),
  getUserEnrollments: (userId: string) =>
    api.get<Enrollment[]>(`/api/enrollments/user/${userId}`),
  updateEnrollmentProgress: (enrollmentId: number, progress: number) =>
    api.patch<Enrollment>(`/api/enrollments/${enrollmentId}/progress`, { progress }),
  getInstructorCourses: (instructorId: string) =>
    api.get<Course[]>(`/api/courses/instructor/${instructorId}`),
  getLessons: (courseId: number) =>
    api.get<Lesson[]>(`/api/courses/${courseId}/lessons/`),
  addLesson: (courseId: number, data: {
    title: string;
    content?: string;
    video_url?: string;
    duration_minutes: number;
    order_index: number;
  }) => api.post<Lesson>(`/api/courses/${courseId}/lessons/`, data),
  updateLesson: (courseId: number, lessonId: number, data: {
    title?: string;
    content?: string;
    video_url?: string;
    duration_minutes?: number;
    order_index?: number;
  }) => api.put<Lesson>(`/api/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId: number, lessonId: number) => api.delete(`/api/courses/${courseId}/lessons/${lessonId}`),
  uploadMedia: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ url: string }>("/api/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get<DashboardStats>("/api/dashboard/stats"),
  trackEvent: (data: { event_type: string; user_id?: string; course_id?: number }) =>
    api.post("/api/events/", data),
  trackView: (courseId: number, userId?: string) =>
    api.post("/api/events/views", { course_id: courseId, user_id: userId }),
};

// AI Tutor
export const aiAPI = {
  chat: (data: {
    course_id: number;
    course_title: string;
    course_description?: string;
    user_question: string;
    conversation_history?: { role: string; content: string }[];
  }) => api.post("/api/chat/", data),
  generateQuiz: (data: {
    course_id: number;
    course_title: string;
    lesson_content: string;
    num_questions?: number;
    difficulty?: string;
  }) => api.post("/api/quiz/generate", data),
  getRecommendations: (data: {
    user_id: string;
    interests?: string[];
    current_level?: string;
  }) => api.post("/api/recommendations/", data),
};

// Feedback
export const feedbackAPI = {
  submit: (data: {
    user_id: string;
    course_id: number;
    course_title: string;
    rating: number;
    comment?: string;
  }) => api.post("/api/feedback", data),
  getCourse: (courseId: number) => api.get(`/api/feedback/course/${courseId}`),
};

export default api;