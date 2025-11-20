
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateEditTask = () => {
  const { id } = useParams(); 
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth(); 

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchTask = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await API.get(`/tasks/${id}`);
          setTask(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load task');
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [id, isEditMode]);

  if (loading) return <p>Loading task...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  if (isEditMode && !task) return <p>Task not found.</p>;
  
  const isOwnerOrAdmin = !isEditMode || (user.id === task.createdBy) || (user.role === 'admin');

  if (isEditMode && !isOwnerOrAdmin) {
    return <p className="error-message">You are not authorized to edit this task.</p>;
  }

  return (
    <div className="page-container">
      <TaskForm taskToEdit={task} />
    </div>
  );
};

export default CreateEditTask;