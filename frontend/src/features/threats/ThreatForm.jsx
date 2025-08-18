import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material'
import { createThreat, updateThreat } from './api'

const ThreatForm = ({ open, onClose, initialData, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    source: '',
    reference_code: '',
    risk_source: []
  })

  useEffect(() => {
    if (initialData) setForm(initialData)
    else setForm({
      name: '', category: '', description: '',
      source: '', reference_code: '', risk_source: []
    })
  }, [initialData])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (form.id) await updateThreat(form.id, form)
    else await createThreat(form)
    onSuccess()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{form.id ? 'Edit Threat' : 'Add Threat'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth />
          <TextField name="category" label="Category" value={form.category} onChange={handleChange} fullWidth />
          <TextField name="description" label="Description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
          <TextField name="source" label="Source" value={form.source} onChange={handleChange} fullWidth />
          <TextField name="reference_code" label="Reference Code" value={form.reference_code} onChange={handleChange} fullWidth />
          <TextField name="risk_source" label="Risk Source (comma-separated)" value={form.risk_source.join(', ')} onChange={(e) =>
            setForm(prev => ({ ...prev, risk_source: e.target.value.split(',').map(s => s.trim()) }))
          } fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ThreatForm
