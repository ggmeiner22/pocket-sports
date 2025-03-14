import './drills.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Use Axios for HTTP requests
import { useNavigate, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Modal, Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as fabric from 'fabric';

// Import field images
import VolleyballField from '/Volleyball.jpg';
import LacrosseField from '/Lacrosse.jpg';
import BasketballField from '/Basketball.jpg';

function Drills() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [drillBank, addToDrillBank] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);
  const [drillName, setDrillName] = useState('');
  const [buttons, setButtons] = useState([
      { path: "/homepage", label: "Home" },
      { path: "/roster", label: "Roster" },
      { path: "/calendarpage", label: "Calendar" },
      { path: "/goalspage", label: "Goals" }
    ]);
  const navigate = useNavigate();
  const location = useLocation();
  const swiperRef = useRef(null);

  const getSport = (selectedTeam) => {
    axios.get('http://localhost:3001/teamsport/:teamId', { teamId: selectedTeam })
      .then(result => {
        console.log("Success:", result);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const handleCreateDrill = () => {
    if (swiperRef.current) {
      const activeIndex = swiperRef.current.swiper.activeIndex;
      const activeSlide = swiperRef.current.swiper.slides[activeIndex];
      const imgSrc = activeSlide.querySelector('img').src;
      console.log("Active Slide:", imgSrc);
      setModalImage(imgSrc);
      setShowModal(true);
    }
  }

  const saveDrill = () => {
    html2canvas(canvasRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.5);
      const pdf = new jsPDF('landscape');
      pdf.addImage(imgData, 'PNG', 10, 10, 280, 150); // Adjust the dimensions as needed
      const pdfBase64 = pdf.output('datauristring');
      
      axios.post('http://localhost:3001/drillbank', { pdfB64: pdfBase64, teamId: selectedTeam._id, drillName: drillName})
        .then(result => {
          console.log("Success:", result);
        })
        .catch(err => {
          console.log(err);
        });

    });
  };

  const fetchDrills = () => {
    axios.get(`http://localhost:3001/drillbank/team/${selectedTeam._id}`)
      .then(response => {
        addToDrillBank(response.data);
      })
      .catch(err => {
        console.error('Error fetching drills:', err);
      });
  };

  
  const fetchDrillPdf = (drillName) => {
    axios.get(`http://localhost:3001/drillbank/${drillName}`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${drillName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {
        console.error('Error fetching PDF:', err);
      });
  };

  const handleDrillBank = () => {
    console.log('Drill Bank button pressed!');
  };

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
    });
    setCanvas(fabricCanvas);
    if (modalImage) {
      const img = new Image();
      img.src = modalImage;
      console.log('Loading image from URL:', modalImage); // Log before loading the image
      img.onload = () => {
        const fabricImage = new fabric.Image(img, {
          left: 0,
          top: 0,
          scaleX: fabricCanvas.width / img.width,
          scaleY: fabricCanvas.height / img.height,
          selectable: false,
        });
        fabricCanvas.set('backgroundImage', fabricImage);
        fabricCanvas.renderAll();
      }

    }

    // Retrieve the selected team and role from localStorage
    const storedTeam = localStorage.getItem('selectedTeam');
    const storedRole = localStorage.getItem('role');

    console.log("Stored role:", storedRole); // Check role in localStorage

    if (storedTeam) {
      setSelectedTeam(JSON.parse(storedTeam)); // Update selected team if available
    }

    if (storedRole === "Owner") {
      setButtons((prevButtons) => {
        // Prevent adding the button twice
        if (!prevButtons.some(button => button.path === "/drills")) {
          return [
            ...prevButtons,
            { path: "/drills", label: "Drills" }
          ];
        }
        return prevButtons;
      });
    }

    // Fetch drills for the selected team
    if (selectedTeam) {
      fetchDrills();
    }

    // Cleanup function to dispose of the canvas
    return () => {
      console.log('dispose?', fabricCanvas.dispose());
    };
  }, [modalImage]);

  useEffect(() => {
    if (selectedTeam) {
      fetchDrills();
    }
  }, [selectedTeam]);

  
  const deleteSelectedElement = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    }
  }

  const addDraggableElement = (symbol, color) => {
    console.log(canvas);
    if (canvas) {
      const text = new fabric.FabricText(symbol, {
        left: 100,
        top: 100,
        fontSize: 30,
        fill: color,
        fontWeight: "bold",
        selectable: true,
      });
      canvas.add(text);
      canvas.bringObjectToFront(text); // Bring the new element to the front
      canvas.renderAll();
    }
  };

  const deleteDrill = (drillId) => {
    axios.delete(`http://localhost:3001/drillbank/${drillId}`)
      .then(response => {
        console.log(response.data.message);
        // Remove the deleted drill from the drillBank state
        addToDrillBank(drillBank.filter(drill => drill._id !== drillId));
      })
      .catch(err => {
        console.error('Error deleting drill:', err);
      });
  };

  const handleDrillLayoutClick = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  }

  return (
    <div className='App'>
      <header className="landing-page-header1">
        <div className="logo">
          <a href="/teams" style={{ textDecoration: 'none', color: 'black' }}>PocketSports</a>
        </div>
        <div className="headerButton-container">
          {buttons.map((button) => (
            <button
              key={button.path}
              className={`headerButton ${location.pathname === button.path ? "active" : ""}`}
              onClick={() => navigate(button.path)}
            >
              {button.label}
            </button>
          ))}
        </div>
        <div className="button-container">
          <button className="contactButton1">Contact Us</button>
        </div>
      </header>

      {/* Sliding Field View */}
      <div className="field-slider-container">
        <Swiper
          navigation
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
          className="field-slider"
          ref={swiperRef}
        >
          <SwiperSlide>
            <div className="field-container">
              <h2>Volleyball Court</h2>
              <img src="/Volleyball.jpg" alt="Volleyball Field" className="field-image" onClick={() => handleDrillLayoutClick("/Volleyball.jpg")} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="field-container">
              <h2>Lacrosse Field</h2>
              <img src="/Lacrosse.jpg" alt="Lacrosse Field" className="field-image" onClick={() => handleDrillLayoutClick("/Lacrosse.jpg")} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="field-container">
              <h2>Basketball Court</h2>
              <img src="/Basketball.jpg" alt="Basketball Field" className="field-image" onClick={() => handleDrillLayoutClick("/Basketball.jpg")} />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <Modal show={showModal} onHide={closeModal} dialogClassName="modal-dialog">
        <Modal.Body className="modal-content">
          <canvas id="practiceCanvas" ref={canvasRef} width="500" height="400"></canvas>
          <div className='dragNdrop'>
            <Button onClick={() => addDraggableElement("O", "blue")}>Add O</Button>
            <Button onClick={() => addDraggableElement("X", "red")}>Add X</Button>
            <Button onClick={() => addDraggableElement("→", "black")}>Add →</Button>
          </div>
          <Button onClick={deleteSelectedElement} className='deleteElement'>Delete Selected</Button>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <div>
            <label htmlFor="drillName">Drill Name:</label>
            <input
              type="text"
              id="drillName"
              value={drillName}
              onChange={(e) => setDrillName(e.target.value)}
            />
          </div>
          <Button onClick={saveDrill}> Save Drill</Button>
          <Button variant='secondary' onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
      <p>Choose a template then click the image or the button below to get started!</p>
      <button className="contactButton1" onClick={handleCreateDrill}>Create Drill</button>
      <button onClick={handleDrillBank}>Go to Drill Bank</button>

      <div className="drill-list">
      <h3>Drill Bank</h3>
      <ul>
        {drillBank.map((drill) => (
          <li key={drill._id}>
            {drill.drillName}
            <button onClick={() => fetchDrillPdf(drill.drillName)}>Download</button>
            <button onClick={() => deleteDrill(drill._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>

    <footer className="footer1" style={{backgroundColor: selectedTeam?.teamColors?.[0] || 'white', color: 'whitesmoke'}}>
        <div className="footer-container1">
          <div className="footer-column1">
            <h4>About Us</h4>
            <p>
              We are committed to empowering emerging sports by providing
              integrated platforms that streamline coaching and management tasks.
            </p>
          </div>
        </div>
        <div className="footer-bottom1">
          <p>&copy; 2024 PocketSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Drills
;