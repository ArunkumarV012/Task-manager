
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const TaskForm = ({ taskToEdit }) => {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [status, setStatus] = useState(taskToEdit?.status || 'pending');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setStatus(taskToEdit.status);
    }
  }, [taskToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const taskData = { title, description, status };
    
    try {
      if (taskToEdit) {
        
        await API.put(`/tasks/${taskToEdit.id}`, taskData);
        alert('Task updated successfully!');
      } else {
        
        await API.post('/tasks', taskData);
        alert('Task created successfully!');
      }
      
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <h3>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h3>
      <form onSubmit={handleSubmit} className="task-form">
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isLoading}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
        </button>
      </form>
      <Link to="/" className="btn-secondary">Back to Dashboard</Link>
    </div>
  );
};

export default TaskForm;