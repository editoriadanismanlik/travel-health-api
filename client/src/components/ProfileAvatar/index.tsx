import { useState } from 'react';
import {
  Avatar,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

interface ProfileAvatarProps {
  src?: string;
  name: string;
  size?: number;
  onImageUpdate?: (file: File) => Promise<void>;
  showBadge?: boolean;
}

export const ProfileAvatar = ({
  src,
  name,
  size = 100,
  onImageUpdate,
  showBadge = false,
}: ProfileAvatarProps) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (selectedFile && onImageUpdate) {
      await onImageUpdate(selectedFile);
      setOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const AvatarComponent = (
    <Avatar
      src={src}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        bgcolor: 'primary.main',
      }}
    >
      {!src && name.charAt(0).toUpperCase()}
    </Avatar>
  );

  return (
    <>
      {onImageUpdate ? (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <label htmlFor="avatar-upload">
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <IconButton
                component="span"
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'background.paper' },
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </label>
          }
        >
          {showBadge ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              {AvatarComponent}
            </StyledBadge>
          ) : (
            AvatarComponent
          )}
        </Badge>
      ) : showBadge ? (
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {AvatarComponent}
        </StyledBadge>
      ) : (
        AvatarComponent
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Avatar
            src={previewUrl || undefined}
            alt="Preview"
            sx={{ width: 200, height: 200, margin: '20px auto' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
