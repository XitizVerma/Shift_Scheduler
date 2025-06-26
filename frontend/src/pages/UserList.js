import React, { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="main-content">
      <h1>Users</h1>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{new Date(user.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UserList; 