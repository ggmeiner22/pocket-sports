import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function PopUp({ actionType }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  // Determine the message based on actionType
  const message = actionType === 'login' 
    ? 'You have successfully logged in!' 
    : 'Your registration was successful!';

  return (
    <div>
      {/* Modal for the pop-up */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PopUp;
