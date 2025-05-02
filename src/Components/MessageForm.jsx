import React ,{ useState } from 'react';
import { Box, TextField, IconButton, InputAdornment ,Typography} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function MessageForm({ onSend, onTyping }) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    let fileData = null;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:8080/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.error) {
          alert(data.error);
          return;
        }
        fileData = { fileUrl: data.fileUrl, fileType: file.type };
      } catch (err) {
        alert('Error uploading file');
        console.log(err);
        return;
      }
    }

    onSend(message, fileData);
    setMessage('');
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        bgcolor: '#fff',
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping(e.target.value);
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton component="label" title="Attach file">
                <AttachFileIcon />
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
              </IconButton>
              <IconButton type="submit" disabled={!message.trim() && !file}>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {file && (
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Attached: {file.name}
        </Typography>
      )}
    </Box>
  );
}

export default MessageForm;