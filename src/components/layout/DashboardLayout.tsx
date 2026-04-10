import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PrimeBot from '@/components/PrimeBot';
import { useUIStore } from '@/stores/useUIStore';

export default function DashboardLayout() {
  const { sidebarExpanded } = useUIStore();

  return (
    <div className="min-h-screen bg-decorative" style={{ background: 'var(--color-bg-dark)' }}>
      <Topbar />
      <Sidebar />
      <motion.main
        className="relative z-10 min-h-[calc(100vh-64px)]"
        animate={{ marginLeft: sidebarExpanded ? 240 : 72 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="p-8 max-w-[1400px] mx-auto lg:p-8 md:p-5 sm:p-4">
          <Outlet />
        </div>
      </motion.main>
      <PrimeBot />
    </div>
  );
}
