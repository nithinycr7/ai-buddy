import { Routes, Route, Navigate } from "react-router-dom";
import TwoPageShell from "./components/Layout/TwoPageShell";
import SingleCardShell from "./components/Layout/SingleCardShell";
import BottomNav from "./components/BottomNav";

// Student
import StudentHome from "./pages/Student/Home";
import LectureReplay from "./pages/Student/LectureReplay";
import Quiz from "./pages/Student/Quiz";
import Journal from "./pages/Student/Journal";
import Header from "./components/Header";
import PersonalityHome from "./pages/Student/personality/PersonalityHome";
import Communication from "./pages/Student/personality/Communication";
import Hobby from "./pages/Student/personality/Hobby";
import Grievance from "./pages/Student/personality/Grievance";
import HomeAssignments from "./pages/Student/assignment/HomeAssignments";
import Administration from "./pages/Administration/Administration";

// Teacher
import TeacherDashboard from "./pages/Teacher/Dashboard";
import MockLectureFeedback from "./pages/Teacher/MockLectureFeedback";
import FeedbackInsights from "./pages/Teacher/FeedbackInsights";

// Parent
import ParentDashboard from "./pages/Parent/Dashboard";
import WeeklyDigest from "./pages/Parent/WeeklyDigest";

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pt-3"></main>
      <div className="pt-2 md:pt-3">
        <Routes>
          {/* Student */}
          <Route
            path="/"
            element={<TwoPageShell left={<StudentHome.Left />} right={<StudentHome.Right />} />}
          />
          <Route
            path="/student/replay"
            element={<TwoPageShell left={<LectureReplay.Left />} right={<LectureReplay.Right />} />}
          />
          <Route
            path="/student/quiz"
            element={
              <SingleCardShell>
                <Quiz />
              </SingleCardShell>
            }
          />
          <Route
            path="/student/journal"
            element={<TwoPageShell left={<Journal.Left />} right={<Journal.Right />} />}
          />

          {/* Teacher */}
          <Route
            path="/teacher"
            element={
              <TwoPageShell left={<TeacherDashboard.Left />} right={<TeacherDashboard.Right />} />
            }
          />
          <Route
            path="/teacher/mock-feedback"
            element={
              <TwoPageShell
                left={<MockLectureFeedback.Left />}
                right={<MockLectureFeedback.Right />}
              />
            }
          />
          <Route
            path="/teacher/feedback-insights"
            element={
              <TwoPageShell left={<FeedbackInsights.Left />} right={<FeedbackInsights.Right />} />
            }
          />

          {/* Parent */}
          <Route path="/parent" element={<ParentDashboard />} />

          <Route
            path="/parent/weekly-digest"
            element={<TwoPageShell left={<WeeklyDigest.Left />} right={<WeeklyDigest.Right />} />}
          />
          <Route path="/student/personality" element={<PersonalityHome />} />
          <Route path="/student/personality/communication" element={<Communication />} />
          <Route path="/student/personality/hobby" element={<Hobby />} />
          <Route path="/administration" element={<Administration />} />

          <Route path="/student/assignments" element={<HomeAssignments />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  );
}
