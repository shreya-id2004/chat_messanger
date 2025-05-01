import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

function MessageForm({ onSend, onTyping }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        padding: 2,
        display: 'flex',
        gap: 1,
        bgcolor: '#fff',
        borderTop: '1px solidrgb(254, 0, 0)',
      }}
    >
      <TextField
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          onTyping(e.target.value);
        }}
        placeholder="Type a message..."
        variant="outlined"
        size="small"
        fullWidth
      />
      <Button type="submit" variant="contained" color="primary">
        Send
      </Button>
    </Box>
  );
}

export default MessageForm;