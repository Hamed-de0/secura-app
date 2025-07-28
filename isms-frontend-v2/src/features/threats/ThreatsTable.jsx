import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

const ThreatsTable = ({ data, onEdit }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Reference Code</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Source</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map(threat => (
        <TableRow key={threat.id}>
          <TableCell>{threat.reference_code}</TableCell>
          <TableCell>{threat.name}</TableCell>
          <TableCell>{threat.category}</TableCell>
          <TableCell>{threat.source}</TableCell>
          <TableCell>
            <IconButton onClick={() => onEdit(threat)}><EditIcon /></IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default ThreatsTable
