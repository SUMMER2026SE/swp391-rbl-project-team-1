import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LearningPath from './components/LearningPath';
import Recommendations from './components/Recommendations';
import ProgressChart from './components/ProgressChart';
import StreakCard from './components/StreakCard';
import PerformanceCard from './components/PerformanceCard';
import UpcomingTests from './components/UpcomingTests';
import ChatbotCard from './components/ChatbotCard';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <Header />
          <LearningPath />
          <Recommendations />
          <ProgressChart />
        </main>
        <aside className="right-sidebar">
          <StreakCard />
          <PerformanceCard />
          <UpcomingTests />
          <ChatbotCard />
        </aside>
      </div>
    </div>
  );
}
