import * as React from 'react';
import { IconButton, Menu, MenuItem, ListItemText } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useI18n } from '../store/i18n/I18nProvider.jsx';

export default function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const [el, setEl] = React.useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e)=> setEl(e.currentTarget)} aria-label="Language">
        <TranslateIcon />
      </IconButton>
      <Menu anchorEl={el} open={!!el} onClose={()=> setEl(null)}>
        {['en','de'].map(l => (
          <MenuItem key={l} selected={l===locale} onClick={()=> { setLocale(l); setEl(null); }}>
            <ListItemText primary={l.toUpperCase()} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
