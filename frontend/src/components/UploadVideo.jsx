import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadVideo = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type.startsWith('video/')) {
            setFile(selected);
        } else {
            toast.error('Please select a valid video file');
            setFile(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            const initResponse = await api.post('/videos/upload/initiate', {
                fileName: file.name,
                fileType: file.type
            });

            const { uploadUrl, videoId } = initResponse.data;

            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            await api.post('/videos/upload/complete', { videoId });

            toast.success('Upload complete! Video is processing.');
            setFile(null);
            setProgress(0);
            
            navigate('/dashboard');

        } catch (error) {
            console.error(error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10">
            <h2 className="text-xl text-white font-bold mb-4">Upload New Video</h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700 transition cursor-pointer relative">
                    <input 
                        type="file" 
                        accept="video/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                        <p className="text-green-400 font-medium">{file.name}</p>
                    ) : (
                        <p className="text-slate-400">Click or Drag video here</p>
                    )}
                </div>

                {uploading && (
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        ></div>
                        <p className="text-right text-xs text-slate-400 mt-1">{progress}%</p>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={!file || uploading}
                    className={`w-full py-2 px-4 rounded font-bold text-white transition ${
                        !file || uploading 
                            ? 'bg-slate-600 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>
        </div>
    );
};

export default UploadVideo;