import { TableRow, TableCell, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';

const ThreatsTableRow = ({ threat, onEdit }) => {
  const navigate = useNavigate();

  const handleManageLinks = () => {
    console.log(`Managing links for threat ID: ${threat.id}`);
    navigate(`/relationships/threat-vulnerability?threatId=${threat.id}`);
  };

  return (
    <TableRow key={threat.id}>
      <TableCell>{threat.reference_code}</TableCell>
      <TableCell>{threat.name}</TableCell>
      <TableCell>{threat.category}</TableCell>
      <TableCell>{threat.source}</TableCell>
      <TableCell>
        <IconButton onClick={() => onEdit(threat)} title="Edit Threat">
          <EditIcon />
        </IconButton>
        <IconButton onClick={handleManageLinks} title="Manage Linked Vulnerabilities">
          <LinkIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ThreatsTableRow;
