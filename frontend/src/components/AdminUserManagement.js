import React, { useContext, useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../styles/AdminUserManagement.css'; // Link to the new CSS file

const AdminUserManagement = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState({});

  useEffect(() => {
    const fetchUsersAndCollectors = async () => {
      try {
        const [usersRes, collectorsRes] = await Promise.all([
          axios.get(API_CONFIG.ADMIN.USERS, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(API_CONFIG.AUTH.GARBAGE_COLLECTORS, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);

        setUsers(usersRes.data);
        setCollectors(collectorsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchUsersAndCollectors();
  }, [auth.token]);

  const assignCollector = async (userId) => {
    try {
      await axios.put(
        API_CONFIG.ADMIN.ASSIGN_COLLECTOR,
        {
          userId,
          collectorId: selectedCollector[userId],
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, assignedCollector: collectors.find((c) => c._id === selectedCollector[userId]) }
            : user
        )
      );
      setSelectedCollector({ ...selectedCollector, [userId]: '' });
    } catch (err) {
      console.error('Error assigning collector:', err);
    }
  };

  const generateInvoice = async (userId) => {
    try {
      await axios.post(
        `http://localhost:3001/api/admin/generate-invoice/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      alert('Invoice generated successfully');
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert(err.response?.data?.message || 'Error generating invoice');
    }
  };

  return (
    <div className="user-management-container">
      <h2 className="user-management-header">Admin - User Management</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Assigned Collector</th>
              <th>Assign Collector</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.assignedCollector ? user.assignedCollector.name : 'Not Assigned'}</td>
                <td>
                  <select
                    className="select-collector"
                    value={selectedCollector[user._id] || ''}
                    onChange={(e) => setSelectedCollector({ ...selectedCollector, [user._id]: e.target.value })}
                  >
                    <option value="">Select Collector</option>
                    {collectors.map((collector) => (
                      <option key={collector._id} value={collector._id}>
                        {collector.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="assign-btn"
                    onClick={() => assignCollector(user._id)}
                    disabled={!selectedCollector[user._id]}
                  >
                    Assign
                  </button>
                </td>
                <td>
                  <button className="invoice-btn" onClick={() => generateInvoice(user._id)}>
                    Generate Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
