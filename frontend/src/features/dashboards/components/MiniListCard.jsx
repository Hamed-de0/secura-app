import * as React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';

export default function MiniListCard({ title, items = [], onItemClick, emptyText = 'Nothing here' } , sx) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1">{title}</Typography>
        {(!items || items.length === 0) ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{emptyText}</Typography>
        ) : (
          <List dense sx={{ mt: 1, overflow: 'auto', flexGrow: 1 }}>
            {items.map(it => (
              <ListItem key={it.id} button onClick={()=> onItemClick?.(it)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItemText
                  primary={it.primary}
                  secondary={it.secondary}
                  primaryTypographyProps={{ noWrap: true }}
                  secondaryTypographyProps={{ noWrap: true }}
                />
                {typeof it.metric !== 'undefined' && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={it.metric} />
                  </Stack>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
