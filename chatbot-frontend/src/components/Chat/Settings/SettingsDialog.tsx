import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import { PRESET_COLORS } from '../../../themes/theme';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'light' | 'dark';
  primaryColor: string;
  onModeChange: (mode: 'light' | 'dark') => void;
  onColorChange: (color: string) => void;
  onLogout: () => void;
}

export default function SettingsDialog({
  open,
  onClose,
  mode,
  primaryColor,
  onModeChange,
  onColorChange,
  onLogout
}: SettingsDialogProps) {

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Configuración
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        
        {/* SECCIÓN APARIENCIA */}
        <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 1.2 }}>
          Apariencia
        </Typography>

        <Box sx={{ mb: 3, pl: 1, mt: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Tema</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={mode}
              onChange={(e) => onModeChange(e.target.value as 'light' | 'dark')}
            >
              <FormControlLabel value="light" control={<Radio />} label="Claro" />
              <FormControlLabel value="dark" control={<Radio />} label="Oscuro" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 4, pl: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary' }}>
            Acento
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Selector Personalizado">
                <Box sx={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', border: '2px solid', borderColor: 'divider', overflow: 'hidden', cursor: 'pointer' }}>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer', border: 'none' }}
                />
                </Box>
            </Tooltip>
            
            {PRESET_COLORS.map((color) => (
              <Tooltip title={color} key={color}>
                <Box
                  onClick={() => onColorChange(color)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: primaryColor === color ? '3px solid white' : '2px solid transparent',
                    boxShadow: primaryColor === color ? `0 0 10px ${color}` : 'none',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          <Alert severity="info" variant="outlined" sx={{ mt: 2, border: 'none', bgcolor: 'background.default' }}>
            Todo el entorno se adaptará a este color.
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SECCIÓN GENERAL */}
        <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 1.2 }}>
          Cuenta
        </Typography>

        <List>
          {/* Estos iconos ya salen coloreados gracias a theme.ts */}
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon><NotificationsIcon /></ListItemIcon>
              <ListItemText primary="Notificaciones" secondary="Alertas y sonidos" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText primary="Privacidad" secondary="Datos y seguridad" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ my: 3 }} />

        {/* SECCIÓN SESIÓN */}
        <List>
            <ListItemButton 
                onClick={onLogout}
                sx={{ 
                    border: '1px solid', 
                    borderColor: 'error.main', 
                    borderRadius: 2, 
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.dark', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } }
                }}
            >
                <ListItemIcon sx={{ color: 'error.main' }}>
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
            </ListItemButton>
        </List>

      </DialogContent>
    </Dialog>
  );
}