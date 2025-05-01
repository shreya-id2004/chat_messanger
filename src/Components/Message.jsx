import React from 'react';
// Message.jsx
import { Box } from '@mui/material';

function Message({ text, position }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 4,
          backgroundColor: position === 'right' ? '#1976d2' : '#e0e0e0',
          color: position === 'right' ? '#ffffff' : '#000000',
          maxWidth: '70%',
          wordWrap: 'break-word',
        }}
      >
        {text}
      </Box>
    </Box>
  );
}

export default Message;