import { Autocomplete, TextField, Chip, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchTags } from './tagApi';

export default function TagSelector({ selectedTagIds, onChange }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags().then((res) => {
      setTags(res.data);
      setLoading(false);
    });
  }, []);

  const selectedTags = tags.filter(tag => selectedTagIds?.includes(tag.id));

  const handleChange = (_, newValue) => {
    onChange(newValue.map(t => t.id));
  };

  return (
    <Autocomplete
      multiple
      options={tags}
      getOptionLabel={(option) => option.name}
      value={selectedTags}
      onChange={handleChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          placeholder="Select tags"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
        ))
      }
    />
  );
}
