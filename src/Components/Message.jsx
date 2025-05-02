import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';

function Message({ text, position, file}) {
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

        {text && <Typography>{text}</Typography>}
        {file && (
          <Box sx={{ mt: 1 }}>
            {file.fileType.startsWith('image/') ? (
              <img
                src={`http://localhost:8080${file.fileUrl}`}
                alt="Shared file"
                style={{ maxWidth: '200px', borderRadius: '8px' }}
                onError={(e) => console.error('Image load error:', file.fileUrl)}
              />
            ) : (
              <a
                href={`http://localhost:8080${file.fileUrl}`}
                download={file.fileUrl.split('/').pop()} // Use original filename
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: position === 'right' ? '#fff' : '#1976d2', textDecoration: 'underline' }}
              >
                Download {file.fileUrl.split('/').pop()}
              </a>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Message;