import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ThreatsTableRow from './ThreatsTableRow';

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
      {data.map((threat) => (
        <ThreatsTableRow key={threat.id} threat={threat} onEdit={onEdit} />
      ))}
    </TableBody>
  </Table>
);

export default ThreatsTable;
