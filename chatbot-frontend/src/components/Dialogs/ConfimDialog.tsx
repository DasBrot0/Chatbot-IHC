import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  alpha
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean; 
}

export default function ConfirmDialog({
  open,
  title,
  content,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 320,
          p: 1,
          // Aseguramos el estilo visual del borde sutil
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          // Efecto de cristal sutil
          backdropFilter: 'blur(5px)',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          {content}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {/* BOTÓN CANCELAR (NEUTRO) */}
        <Button 
            onClick={onClose} 
            sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.primary', 
                '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.08)
                }
            }}
        >
          {cancelText}
        </Button>

        {/* BOTÓN DE ACCIÓN (PELIGRO O PRIMARIO) */}
        <Button 
            onClick={onConfirm} 
            variant="contained" 
            color={isDanger ? "error" : "primary"}
            autoFocus
            sx={{ 
                borderRadius: 2, 
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: isDanger ? 'none' : undefined
            }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}