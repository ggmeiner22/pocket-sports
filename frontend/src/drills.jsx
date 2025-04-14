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

function Drills() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [drillBank, addToDrillBank] = useState([]);
  const [allTags, setAllTags] = useState([]); // All available tags
  const [drillTags, setDrillTags] = useState([]); // Selected tags for this drill
  const [newTag, setNewTag] = useState(""); // Input value for new tag
  const [dropdownTag, setDropdownTag] = useState("");
  const [inputTag, setInputTag] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);
  const [drillName, setDrillName] = useState('');
  const [buttons, setButtons] = useState([
      { path: "/homepage", label: "Home" },
      { path: "/roster", label: "Roster" },
      { path: "/calendarpage", label: "Calendar" },
      { path: "/goalspage", label: "Goals" },
      { path: "/drills", label: "Drills"}
    ]);
  const navigate = useNavigate();
  const location = useLocation();
  const swiperRef = useRef(null);
  const [isDrillMenuOpen, setIsDrillMenuOpen] = useState(false);
  const [allStats, setAllStats] = useState([]); // All available stats
  const [drillStats, setDrillStats] = useState([]); // Selected stats for this drill
  const [newStat, setNewStat] = useState(""); // Input value for new stat
  const [dropdownStat, setDropdownStat] = useState("");
  const [inputStat, setInputStat] = useState("");

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
      handleDrillLayoutClick(imgSrc)
    }
  };
  
  useEffect(() => {
    if (selectedTeam && selectedTeam._id && showModal) {
      axios.get(`http://localhost:3001/drilltags/team/${selectedTeam._id}`)
        .then(response => {
          console.log("Fetched tags in useEffect:", response.data);
          setAllTags(response.data);
        })
        .catch(err => {
          console.error("Error fetching tags in useEffect:", err);
        });
        axios.get(`http://localhost:3001/drillStats/team/${selectedTeam._id}`)
        .then(response => {
          setAllStats(response.data);
        })
        .catch(err => {
          console.error("Error fetching drill stats:", err);
        });
    }
  }, [selectedTeam, showModal]);
  
  const saveDrill = () => {
    html2canvas(canvasRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.5);
        const pdf = new jsPDF('landscape');
        pdf.addImage(imgData, 'PNG', 10, 10, 280, 150); // Adjust dimensions as needed
        const pdfBase64 = pdf.output('datauristring');
        
        // Map drillStats array (assumed to be an array of stat objects) to an array of ObjectIds.
        const statsToSave = drillStats.map(stat => stat._id);

        axios.post('http://localhost:3001/drillbank', { 
            pdfB64: pdfBase64, 
            teamId: selectedTeam._id, 
            drillName: drillName, 
            tags: drillTags,
            stats: statsToSave
        })
        .then(result => {
            console.log("Success:", result);
            // Close the modal and clear fields after saving
            setIsDrillMenuOpen(false);  // If applicable
            setShowModal(false);        // Close the modal
            setDrillName("");           // Clear drill name
            setDrillTags([]);           // Clear selected drill tags
            setDrillStats([]);
            setNewTag("");              // Clear the manual tag input
            // Optionally, clear the canvas (if needed)
            if (canvas) {
              canvas.clear();
            }
        })
        .catch(err => {
            console.log(err);
        });
    });
  };

  const handleTagSelection = async (tag) => {
    if (!tag || !selectedTeam) return; // Ensure the tag and team are valid

    try {
      const response = await axios.get(`http://localhost:3001/drilltags/${tag}`);
      if (response.data.exists) {
        console.log("Tag already exists in the database:", tag);
      } else {
        // If the tag does not exist, create a new one
        const result = await axios.post('http://localhost:3001/drilltags', { tagName: tag, teamId: selectedTeam._id });
        console.log("Tag created successfully:", result.data);
        // Update allTags with the new tag
        setAllTags((prevTags) => [...prevTags, tag]);
      }

      // Add to selected tags if not already present
      setDrillTags((prevTags) => {
        if (!prevTags.includes(tag)) {
          const newTags = [...prevTags, tag];
          console.log("Updated drillTags:", newTags);
          return newTags;
        }
        return prevTags;
      });
    } catch (err) {
      console.error("Error checking or creating tag:", err);
    }
    setNewTag(""); // Clear input field after adding
  };

  const handleStatSelection = async (stat) => {
    if (!stat || !selectedTeam) return; // Ensure the stat and team are valid
    try {
      const response = await axios.get(`http://localhost:3001/drillStats/${stat}`);

      if (response.data.exists) {
        console.log("Stat already exists in the database:", stat);
      } else {
        // If the stat does not exist, create a new one
        const result = await axios.post('http://localhost:3001/drillStats', { statName: stat, teamId: selectedTeam._id });
        console.log("Stat created successfully:", result.data);
        // Update allStats with the new Stat
        setAllStats((prevStats) => [...prevStats, stat]);
      }

      // Add to selected stats if not already present
      setDrillStats((prevStats) => {
        if (!prevStats.includes(stat)) {
          const newStat = [...prevStats, stat];
          console.log("Updated drillTags:", newStat);
          return newStat;
        }
        return prevStats;
      });
    } catch (err) {
      console.error("Error checking or creating stat:", err);
    }
    setNewStat(""); // Clear input field after adding
  };
  
  const removeStat = (statIdToRemove) => {
    setDrillStats(prev => prev.filter(stat => stat._id !== statIdToRemove));
  };
  
  const removeTag = (tagToRemove) => {
    setDrillTags(drillTags.filter(tag => tag !== tagToRemove)); // Remove tag
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

  const renderFieldSlide = () => {
    if (!selectedTeam || !selectedTeam.selectedSport) return null;
    
    const sport = selectedTeam.selectedSport;
    
    switch (sport) {
      case "Volleyball":
        return (
          <SwiperSlide>
            <div className="field-container">
              <h2>Volleyball Court</h2>
              <img 
                src="/Volleyball.jpg" 
                alt="Volleyball Field" 
                className="field-image" 
                onClick={() => handleDrillLayoutClick("/Volleyball.jpg")} 
              />
            </div>
          </SwiperSlide>
        );
      case "Lacrosse":
        return (
          <SwiperSlide>
            <div className="field-container">
              <h2>Lacrosse Field</h2>
              <img 
                src="/Lacrosse.jpg" 
                alt="Lacrosse Field" 
                className="field-image" 
                onClick={() => handleDrillLayoutClick("/Lacrosse.jpg")} 
              />
            </div>
          </SwiperSlide>
        );
      case "Basketball":
        return (
          <SwiperSlide>
            <div className="field-container">
              <h2>Basketball Court</h2>
              <img 
                src="/Basketball.jpg" 
                alt="Basketball Field" 
                className="field-image" 
                onClick={() => handleDrillLayoutClick("/Basketball.jpg")} 
              />
            </div>
          </SwiperSlide>
        );
      default:
        return null;
    }
  };
  

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
          <button className="contactButton1" onClick={() => navigate('/contactpage')}>
            Contact Us
          </button>
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
          {renderFieldSlide()}
        </Swiper>
      </div>

      <Modal 
        show={showModal} 
        onHide={closeModal} 
        size="lg"  // or "xl" if you want an even wider modal
        dialogClassName="drill-modal" // custom class for additional styling
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Drill</Modal.Title>
        </Modal.Header>
      
        <Modal.Body>
          {/* Use a container that can flex or grid */}
          <div className="drill-modal-content">
      
            {/* Left side: the canvas and draggable element controls */}
            <div className="canvas-section">
              <canvas id="practiceCanvas" ref={canvasRef} width="900" height="500"></canvas>
              <div className='dragNdrop'>
                <Button onClick={() => addDraggableElement("O", "blue")}>Add O</Button>
                <Button onClick={() => addDraggableElement("X", "red")}>Add X</Button>
                <Button onClick={() => addDraggableElement("→", "black")}>Add →</Button>
              </div>
              <Button onClick={deleteSelectedElement} className='deleteElement'>Delete Selected</Button>
            </div>
      
            {/* Right side: the form inputs for drill name, tags, and stats */}
            <div className="form-section">
              {/* Drill Name */}
              <div className="form-group">
                <label htmlFor="drillName">Drill Name:</label>
                <input
                  type="text"
                  placeholder="Enter the drill's name"
                  id="drillName"
                  className="form-control"
                  value={drillName}
                  onChange={(e) => setDrillName(e.target.value)}
                />
              </div>
              {/* Drill Tags */}
              <div className="form-group">
                <label htmlFor="drillTags" style={{ color: 'black' }}>Drill Tags:</label>
                <div className="tag-inputs">
                  <select onChange={(e) => setDropdownTag(e.target.value)} value={dropdownTag}>
                    <option value="">-- Select an Existing Tag --</option>
                    {allTags.length > 0 ? (
                      allTags.map((tag, index) => (
                        <option key={index} value={tag}>{tag}</option>
                      ))
                    ) : (
                      <option disabled>No tags found</option>
                    )}
                  </select>
      
                  <input
                    type="text"
                    placeholder="Enter a new tag"
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                  />
      
                  <Button onClick={() => {
                    const tagToAdd = dropdownTag || inputTag;
                    handleTagSelection(tagToAdd);
                    setDropdownTag("");
                    setInputTag("");
                  }}>
                    Add Drill Tag
                  </Button>
                </div>
                <div style={{ color: 'black' }} className="selected-tags">
                  <h5 >Selected Tags:</h5>
                  {drillTags.length > 0 ? (
                    drillTags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag} <button onClick={() => removeTag(tag)}>x</button>
                      </span>
                    ))
                  ) : (
                    <p>No tags selected.</p>
                  )}
                </div>
              </div>
              
              {/* Drill Stats */}
              <div className="form-group">
                <label htmlFor="drillStats" style={{ color: 'black' }}>Statistics:</label>
                <div className="stat-inputs">
                  <select
                    onChange={(e) => setDropdownStat(e.target.value)}
                    value={dropdownStat}
                    style={{ color: 'white' }}
                  >
                    <option style={{ color: 'white' }} value="">-- Select an Existing Stat --</option>
                    {allStats.length > 0 ? (
                      allStats.map((stat, index) => (
                        <option key={index} value={stat._id} style={{ color: 'white' }}>
                          {stat.statName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No stats found</option>
                    )}
                  </select>
              
                  <input
                    type="text"
                    placeholder="Enter a new stat"
                    value={inputStat}
                    onChange={(e) => setInputStat(e.target.value)}
                    style={{ color: 'black' }}
                  />
              
                  <Button onClick={async () => {
                    // If a stat is selected from the dropdown, add it
                    if (dropdownStat) {
                      const selectedStatObj = allStats.find(s => s._id === dropdownStat);
                      if (selectedStatObj) {
                        setDrillStats(prev => {
                          if (!prev.some(s => s._id === selectedStatObj._id)) {
                            return [...prev, selectedStatObj];
                          }
                          return prev;
                        });
                      }
                      setDropdownStat("");
                    } else if (inputStat.trim()) {
                      // If a new stat is typed in, create it
                      try {
                        const result = await axios.post('http://localhost:3001/drillStats', {
                          statName: inputStat,
                          teamId: selectedTeam._id
                        });
                        console.log("Stat created successfully:", result.data);
                        // Assuming the backend returns the new stat object as result.data.stat
                        const newStatObj = result.data.stat;
                        setAllStats(prev => [...prev, newStatObj]);
                        setDrillStats(prev => [...prev, newStatObj]);
                      } catch (err) {
                        console.error("Error creating new drill stat:", err);
                      }
                      setInputStat("");
                    }
                  }}>
                    Add Drill Statistic
                  </Button>
                </div>
                <div className="selected-stats" style={{ color: 'black' }}>
                  <h5>Selected Stats:</h5>
                  {drillStats.length > 0 ? (
                    drillStats.map((stat, index) => (
                      <span key={index} className="stat" style={{ marginRight: '5px' }}>
                        {stat.statName} <button onClick={() => removeStat(stat._id)}>x</button>
                      </span>
                    ))
                  ) : (
                    <p>No statistics selected.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </Modal.Body>
      
        <Modal.Footer>
          <Button onClick={saveDrill} variant="primary">Save Drill</Button>
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