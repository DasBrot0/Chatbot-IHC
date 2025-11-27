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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slider,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { PRESET_COLORS } from '../../../themes/theme';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'light' | 'dark';
  primaryColor: string;
  onModeChange: (mode: 'light' | 'dark') => void;
  onColorChange: (color: string) => void;
  onLogout: () => void;
  preferredName: string;
  onNameChange: (name: string) => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
}

export default function SettingsDialog({
  open,
  onClose,
  mode,
  primaryColor,
  onModeChange,
  onColorChange,
  onLogout,
  preferredName,
  onNameChange,
  fontScale,
  onFontScaleChange
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

        {/* --- SECCIÓN TAMAÑO LETRA --- */}
        <Box sx={{ mb: 3 }}>
            <Typography variant="body2">Tamaño de Texto</Typography>
            <Box sx={{ px: 2 }}>
                <Slider 
                    value={fontScale} min={0.8} max={1.4} step={0.1}
                    marks={[{value: 0.8, label: 'A-'}, {value: 1.0, label: 'A'}, {value: 1.4, label: 'A+'}]}
                    onChange={(_, v) => onFontScaleChange(v as number)}
                />
            </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 2, mb: 3 }}>
            <TextField 
                fullWidth label="¿Cómo te gustaría que te llame?"
                value={preferredName} onChange={(e) => onNameChange(e.target.value)}
            />
        </Box>

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