import { useEffect, useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import ThreatsTable from './ThreatsTable'
import ThreatForm from './ThreatForm'
import { getThreats } from './api'

const ThreatsPage = () => {
  const [threats, setThreats] = useState([])
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    const res = await getThreats()
    setThreats(res.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>Threats</Typography>
      <Button variant="contained" onClick={() => { setSelected(null); setOpen(true) }}>
        Add New Threat
      </Button>

      <ThreatsTable data={threats} onEdit={threat => { setSelected(threat); setOpen(true) }} />

      <ThreatForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={selected}
        onSuccess={() => { setOpen(false); loadData() }}
      />
    </Box>
  )
}

export default ThreatsPage
