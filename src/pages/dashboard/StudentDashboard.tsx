import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteAccountModal from '../../components/DeleteAccountModal';

export default function StudentDashboard() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'student') {
      navigate('/');
    }
  }, [navigate]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axios.delete('/api/user/delete', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      localStorage.clear();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Welcome Back</h2>
            <p className="text-gray-600">Access your student resources and track your progress.</p>
          </div>
          {/* Add more dashboard widgets here */}
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-red-600 hover:text-red-700 hover:underline"
          >
            Delete Account
          </button>
        </div>

        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
