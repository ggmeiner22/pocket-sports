import './goals-page.css';
import './SlidingWindow.css'; // Import the sliding window styles
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { useTimer } from 'react-timer-hook';

function PracticePlans() {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [practicePlans, setPracticePlans] = useState([]);
    const [drills, setDrills] = useState([]);
    const [planDate, setPlanDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [selectedDrills, setSelectedDrills] = useState([]);
    const [planType, setPlanType] = useState('Offensive');
    const [showSlidingWindow, setShowSlidingWindow] = useState(false);
    const [currentDrills, setCurrentDrills] = useState([]);
    const swiperRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const [buttons, setButtons] = useState([
        { path: "/homepage", label: "Home" },
        { path: "/roster", label: "Roster" },
        { path: "/calendarpage", label: "Calendar" },
        { path: "/goalspage", label: "Goals" },
        { path: "/drills", label: "Drills" },
        { path: "/practiceplans", label: "Practice Plans" }
    ]);

    useEffect(() => {
        const storedTeam = localStorage.getItem('selectedTeam');
        if (storedTeam) {
            setSelectedTeam(JSON.parse(storedTeam));
        }
    }, []);

    useEffect(() => {
        if (selectedTeam && selectedTeam._id) {
            fetchPracticePlans();
            fetchDrills();
        }
    }, [selectedTeam]);

    const fetchPracticePlans = async () => {
        try {
            const response = await axios.get('http://localhost:3001/practiceplans', {
                params: { teamId: selectedTeam._id }
            });
            setPracticePlans(response.data);
        } catch (error) {
            console.error('Error fetching practice plans:', error);
        }
    };

    const fetchDrills = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/drillbank/team/${selectedTeam._id}`);
            setDrills(response.data);
        } catch (error) {
            console.error('Error fetching drills:', error);
        }
    };

    const handleCreatePlan = async () => {
        try {
            await axios.post('http://localhost:3001/practiceplans', {
                planName: newPlanName,
                planDate: planDate,
                teamId: selectedTeam._id,
                drills: selectedDrills,
                type: planType
            });
            fetchPracticePlans();
            setShowModal(false);
            setSelectedDrills([]); // Reset selectedDrills after creating a new plan
        } catch (error) {
            console.error('Error creating practice plan:', error);
        }
    };

    const handleDeletePlan = async (planId) => {
        try {
            await axios.delete(`http://localhost:3001/practiceplans/${planId}`);
            fetchPracticePlans();
            const updatedDrills = selectedDrills.filter(drillId => {
                const plan = practicePlans.find(plan => plan._id === planId);
                return !plan.drills.some(drill => drill._id === drillId);
            });
            setSelectedDrills(updatedDrills);
        } catch (error) {
            console.error('Error deleting practice plan:', error);
        }
    };

    const handleExecutePlan = (drills) => {
        const drillDetails = drills.map(drill => {
            const pdfB64 = drill.drillId?.pdfB64;
            console.log('PDF Base64:', pdfB64); // Print the pdfB64 variable
            return {
                id: drill.drillId?._id,
                name: drill.drillId?.drillName,
                pdfB64: pdfB64
            };
        }).filter(drill => drill.id);
        setCurrentDrills(drillDetails);
        setShowSlidingWindow(true);
    };

    const Timer = ({ expiryTimestamp }) => {
        const {
            seconds,
            minutes,
            isRunning,
            start,
            pause,
            resume,
            restart,
        } = useTimer({ expiryTimestamp, autoStart: false, onExpire: () => console.warn('Timer expired') });

        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px' }}>
                    <span>{minutes}</span>:<span>{seconds}</span>
                </div>
                {!isRunning ? (
                    <button onClick={start}>Start</button>
                ) : (
                    <>
                        <button onClick={pause}>Pause</button>
                        <button onClick={resume}>Resume</button>
                    </>
                )}
                <button onClick={() => {
                    const time = new Date();
                    time.setSeconds(time.getSeconds() + 900); // 15 minutes timer
                    restart(time, false);
                }}>Restart</button>
            </div>
        );
    }

    return (
        <div className='App1'>
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
            <h2 className="homepage-headers">Practice Plans</h2>
            <div className="practiceplans-container">
                {practicePlans.length === 0 ? (
                    <h3>No current practice plans</h3>
                ) : (
                    practicePlans.map((plan) => (
                        <Card key={plan._id} className='card-events'>
                            <Card.Header as='h5'>{plan.planName}</Card.Header>
                            <Card.Body>
                                <Card.Text>Type: {plan.type}</Card.Text>
                                {/* <Card.Text>Drills: {plan.drills.map(drill => drill.drillId.drillName).join(', ')}</Card.Text> */}
                                <Card.Text>Plan Date: {new Date(plan.planDate).toLocaleDateString()}</Card.Text>
                                <Button variant="danger" onClick={() => handleDeletePlan(plan._id)}>Delete</Button>
                                <Button variant="primary" onClick={() => handleExecutePlan(plan.drills)}>Execute</Button>
                            </Card.Body>
                        </Card>
                    ))
                )}
                <Button variant="primary" onClick={() => setShowModal(true)}>Create Practice Plan</Button>
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>Create Practice Plan</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-content">
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group controlId="planName">
                                    <Form.Label>Plan Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newPlanName}
                                        onChange={(e) => setNewPlanName(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="planType">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={planType}
                                        onChange={(e) => setPlanType(e.target.value)}
                                    >
                                        <option value="Offensive">Offensive</option>
                                        <option value="Defensive">Defensive</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="planDate">
                                    <Form.Label>Plan Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={planDate.toISOString().split('T')[0]}
                                        onChange={(e) => setPlanDate(new Date(e.target.value))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group controlId="drills">
                            <Form.Label>Drills</Form.Label>
                            {drills.map((drill) => (
                                <Form.Check
                                    key={drill._id}
                                    type="checkbox"
                                    label={drill.drillName}
                                    value={drill._id}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedDrills([...selectedDrills, drill._id]);
                                        } else {
                                            setSelectedDrills(selectedDrills.filter(id => id !== drill._id));
                                        }
                                    }}
                                />
                            ))}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleCreatePlan}>Create Plan</Button>
                </Modal.Footer>
            </Modal>
            {showSlidingWindow && (
                <div className="sliding-window open">
                    <div className="sliding-window-content">
                        <button className="close-button" onClick={() => setShowSlidingWindow(false)}>Close</button>
                        <h3>Drills</h3>
                        <Swiper
                            navigation
                            pagination={{ clickable: true }}
                            modules={[Navigation, Pagination]}
                            className="drill-slider"
                            ref={swiperRef}
                        >
                            {currentDrills.length === 0 ? (
                                <p>No drills available</p>
                            ) : (
                                currentDrills.map((drill, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="drill-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                            {drill.pdfB64 ? (
                                                <embed
                                                    src={drill.pdfB64 + '#toolbar=0&view=FitV'}
                                                    type="application/pdf"
                                                    className="pdf-embed"
                                                />
                                            ) : (
                                                <p>No PDF available</p>
                                            )}
                                            <h4 style={{ marginTop: '1rem', textAlign: 'center' }}>{drill.name}</h4>
                                            <div className="timer-container">
                                                <Timer expiryTimestamp={new Date(new Date().getTime() + 15 * 60 * 1000)} />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))
                            )}
                        </Swiper>
                    </div>
                </div>
            )}
            <footer className="footer1" style={{ backgroundColor: selectedTeam?.teamColors?.[0] || 'white', color: 'whitesmoke' }}>
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

export default PracticePlans;