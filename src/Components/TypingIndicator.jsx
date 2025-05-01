import React from 'react';
import { Box, Typography } from '@mui/material';

function TypingIndicator({ typingUser }) {
  return (
    <Box
      sx={{
        padding: 1,
        color: '#555',
        display: typingUser ? 'block' : 'none',
      }}
    >
      <Typography variant="caption">
        {typingUser && `${typingUser} is typing...`}
      </Typography>
    </Box>
  );
}

export default TypingIndicator;