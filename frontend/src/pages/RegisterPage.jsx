import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const { register, handleSubmit } = useForm();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await registerUser(data.username, data.email, data.password);
            toast.success('Account created!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 mb-1">Username</label>
                        <input 
                            {...register('username')} 
                            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-1">Email</label>
                        <input 
                            {...register('email')} 
                            type="email" 
                            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-1">Password</label>
                        <input 
                            {...register('password')} 
                            type="password" 
                            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold transition">
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;