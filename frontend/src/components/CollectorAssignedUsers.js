// components/CollectorAssignedUsers.js

import React, { useContext, useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import GarbageCollectionForm from '../pages/GarbageCollectionForm';

const CollectorAssignedUsers = () => {
  const { auth } = useContext(AuthContext);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const res = await axios.get(API_CONFIG.COLLECTOR.ASSIGNED_USERS, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAssignedUsers(res.data);
      } catch (err) {
        console.error('Error fetching assigned users:', err);
      }
    };

    fetchAssignedUsers();
  }, [auth.token]);

  const handleCollectGarbage = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  return (
    <div>
      <h2>Garbage Collector - Assigned Users</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignedUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>
                <Button variant="primary" onClick={() => handleCollectGarbage(user)}>
                  Collect Garbage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showForm && (
        <GarbageCollectionForm
          user={currentUser}
          onClose={() => {
            setShowForm(false);
            setCurrentUser(null);
          }}
        />
      )}
    </div>
  );
};

export default CollectorAssignedUsers;
