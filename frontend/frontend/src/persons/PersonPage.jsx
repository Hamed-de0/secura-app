import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import axios from 'axios';
import configs from '../configs';
import PersonForm from './PersonForm';
import PersonTable from './PersonTable';

const PersonPage = () => {
  const [persons, setPersons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const fetchPersons = async () => {
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/persons`);
      setPersons(res.data);
    } catch (err) {
      console.error("Failed to fetch persons", err);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleFormSuccess = () => {
    fetchPersons();
    setShowForm(false);
    setSelectedPerson(null);
  };

  const handleEdit = (person) => {
    setSelectedPerson(person);
    setShowForm(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Person Management</Typography>
        <Button variant="contained" onClick={() => {
          setSelectedPerson(null);
          setShowForm(true);
        }}>
          {showForm ? 'Cancel' : 'Add Person'}
        </Button>
      </Box>

      {showForm ? (
        <PersonForm person={selectedPerson} onSuccess={handleFormSuccess} />
      ) : (
        <>
          <Divider sx={{ mb: 2 }} />
          <PersonTable persons={persons} onEdit={handleEdit} />
        </>
      )}
    </Box>
  );
};

export default PersonPage;
