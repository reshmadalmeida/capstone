import React, { useState } from "react";
import {
 Dialog,
 DialogTitle,
 DialogContent,
 DialogContentText,
 DialogActions,
 Button,
} from "@mui/material";
function ConfirmationDialog() {
 const [open, setOpen] = useState(false);
 const handleOpen = () => setOpen(true);
 const handleClose = () => setOpen(false);
 const handleConfirm = () => {
   console.log("Action Confirmed!");
   handleClose();
 };
 return (
   <>
     <Button variant="outlined" onClick={handleOpen}>
       Confirmation Dialog
     </Button>
     <Dialog
       open={open}
       onClose={handleClose}
       aria-labelledby="confirmation-dialog-title"
       aria-describedby="confirmation-dialog-description"
     >
       <DialogTitle id="confirmation-dialog-title">Confirm Action</DialogTitle>
       <DialogContent>
         <DialogContentText id="confirmation-dialog-description">
           Are you sure you want to proceed with this action?
         </DialogContentText>
       </DialogContent>
       <DialogActions>
         <Button onClick={handleClose} color="primary">
           Cancel
         </Button>
         <Button onClick={handleConfirm} color="primary" autoFocus>
           Confirm
         </Button>
       </DialogActions>
     </Dialog>
   </>
 );
}
export default ConfirmationDialog;