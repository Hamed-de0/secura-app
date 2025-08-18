import { useEffect, useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import VulnerabilitiesTable from './VulnerabilitiesTable'
import VulnerabilityForm from './VulnerabilityForm'
import { getVulnerabilities } from './api'

const VulnerabilitiesPage = () => {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    const res = await getVulnerabilities()
    setData(res.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>Vulnerabilities</Typography>
      <Button variant="contained" onClick={() => { setSelected(null); setOpen(true) }}>
        Add New Vulnerability
      </Button>

      <VulnerabilitiesTable data={data} onEdit={item => { setSelected(item); setOpen(true) }} />

      <VulnerabilityForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={selected}
        onSuccess={() => { setOpen(false); loadData() }}
      />
    </Box>
  )
}

export default VulnerabilitiesPage
