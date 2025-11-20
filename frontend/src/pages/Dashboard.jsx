
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  
  const { isAdmin } = useAuth();
  
 
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
    
      const params = {
        limit,
        offset,
        ...(filterStatus && { status: filterStatus }),
        ...(searchTitle && { title: searchTitle }),
      };

      const res = await API.get('/tasks', { params });
      setTasks(res.data);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTitle, limit, offset]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/tasks/${taskId}`);
      alert('Task deleted successfully!');
     
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="page-container">
      <h2>{isAdmin ? 'Admin Dashboard (All Tasks)' : 'My Tasks Dashboard'}</h2>
      
      <div className="dashboard-controls">
        <Link to="/task/create" className="btn-primary">
          + Create New Task
        </Link>
        <div className="filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Filter by Status (All)</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="text"
            placeholder="Search by Title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={handleDelete} />
          ))
        ) : (
          <p className="empty-message">No tasks found. Create one to get started!</p>
        )}
      </div>
      
      <div className="pagination">
        <button 
          onClick={() => setOffset(prev => Math.max(0, prev - limit))} 
          disabled={offset === 0}
          className="btn-secondary"
        >
          Previous
        </button>
        <span>Page {Math.floor(offset / limit) + 1}</span>
       
        <button 
          onClick={() => setOffset(prev => prev + limit)}
          disabled={tasks.length < limit}
          className="btn-secondary"
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default Dashboard;