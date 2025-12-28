import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchVideos = useCallback(async (signal = null, isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const config = signal ? { signal } : {};
            const { data } = await api.get('/videos', config);
            setVideos(data);
        } catch (error) {
            if (error.name !== 'CanceledError') {
                console.error(error);
                if (!isBackground) toast.error("Failed to load videos");
            }
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController(); // Create controller

        fetchVideos(controller.signal, false);

        const interval = setInterval(() => {
            fetchVideos(controller.signal, true); 
        }, 5000);

        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [fetchVideos]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePlay = async (videoId) => {
        try {
            const { data } = await api.get(`/videos/${videoId}`);
            const newWindow = window.open(data.videoUrl, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        } catch (error) {
            toast.error("Could not play video");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <nav className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-400">Sensitive Video App</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-300">Hello, {user?.username}</span>
                        <button 
                            onClick={handleLogout}
                            className="text-sm bg-red-600/20 text-red-400 px-3 py-1 rounded hover:bg-red-600/30 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Your Videos</h2>
                    <Link 
                        to="/upload" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                    >
                        + Upload New
                    </Link>
                </div>
                {loading ? (
                    <div className="text-center text-slate-400 mt-20">Loading your content...</div>
                ) : videos.length === 0 ? (
                    <div className="text-center bg-slate-800/50 rounded-lg p-12 border-2 border-dashed border-slate-700">
                        <p className="text-slate-400 mb-4">No videos found</p>
                        <Link to="/upload" className="text-blue-400 hover:underline">Upload your first video</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div key={video._id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition shadow-lg">
                                <div className="h-40 bg-slate-900 flex items-center justify-center relative group">
                                    <div className="text-4xl">🎬</div>
                                    {video.status === 'completed' && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer" onClick={() => handlePlay(video._id)}>
                                            <button className="bg-white text-black rounded-full p-3 font-bold">▶ Play</button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg truncate mb-1" title={video.title}>
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mb-4">
                                        Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <StatusBadge status={video.status} sensitivity={video.sensitivity} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const StatusBadge = ({ status, sensitivity }) => {
    if (status === 'processing' || status === 'queued' || status === 'pending_upload') {
        return (
            <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-1 rounded border border-yellow-500/20 animate-pulse">
                ⏳ Processing...
            </span>
        );
    }

    if (status === 'failed') {
        return <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20">❌ Failed</span>;
    }

    if (status === 'completed') {
        if (sensitivity?.isSafe === false) {
             return (
                <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/20">
                    ⚠️ Flagged Content
                </span>
            );
        }
        return (
            <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20">
                ✅ Safe
            </span>
        );
    }

    return null;
};

export default Dashboard;