import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import ParticleCanvas from '../components/ui/ParticleCanvas';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0A0F1E' }}>
      <ParticleCanvas />
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-9xl mb-6"
        >
          🤖
        </motion.div>

        <div className="glass rounded-3xl p-12 max-w-lg mx-auto">
          <h1 className="font-display text-7xl font-bold gradient-text mb-4">404</h1>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Page Not Found</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Looks like this page went AWOL. Our campus robot is searching every corner but can't find it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-primary" onClick={() => navigate('/')}>
              <Home size={16} />
              Back to Home
            </button>
            <button className="btn-ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
