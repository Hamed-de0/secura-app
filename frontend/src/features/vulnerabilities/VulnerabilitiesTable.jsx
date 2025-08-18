import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

const VulnerabilitiesTable = ({ data, onEdit }) => (
  <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
    <TableHead>
        <TableRow>
            <TableCell>Reference Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Source</TableCell>
            <TableCell align="right">Actions</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {data.map(vul => (
            <TableRow key={vul.id}>
            <TableCell>{vul.reference_code}</TableCell>
            <TableCell>{vul.name}</TableCell>
            <TableCell>{vul.category}</TableCell>
            <TableCell>{vul.source}</TableCell>
            <TableCell align="right">
                <IconButton onClick={() => onEdit(vul)}><EditIcon /></IconButton>
            </TableCell>
            </TableRow>
        ))}
        </TableBody>

  </Table>
)

export default VulnerabilitiesTable
