
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ task, onDelete }) => {
  const { user, isAdmin } = useAuth();

  const isOwner = user?.id === task.createdBy;
  
  const canDelete = isOwner || isAdmin;
  
  const canEdit = isOwner; 

  return (
    <div className={`task-card status-${task.status}`}>
      <h4>{task.title}</h4>
      <p>Status: **{task.status.toUpperCase()}**</p>
      {isAdmin && <p className="admin-info">Created By User ID: **{task.createdBy}**</p>}
      <p className="description">{task.description}</p>
      <div className="card-actions">
        {canEdit && (
          <Link to={`/task/edit/${task.id}`} className="btn-action edit">
            Edit
          </Link>
        )}
        {canDelete && (
          <button onClick={() => onDelete(task.id)} className="btn-action delete">
            Delete
          </button>
        )}
        {!canEdit && !canDelete && <span className="no-action">View Only</span>}
      </div>
    </div>
  );
};

export default TaskCard;