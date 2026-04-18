// pages/MentorshipDashboard.js - WITH IMPROVED MEETINGS UI & FEEDBACK MANAGEMENT PHASE FILTER
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './MentorshippDashboard1.css';

// Add API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function MentorshipDashboard() {
  const [activeTab, setActiveTab] = useState('mentors');
  const [stats, setStats] = useState({
    totalMentees: 0,
    totalMentors: 0,
    newMenteesThisWeek: 0,
    newMentorsThisWeek: 0,
    phaseStats: []
  });
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingFilters, setMeetingFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Feedback Management State
  const [feedbackSettings, setFeedbackSettings] = useState([]);
  const [feedbackManagementPhaseFilter, setFeedbackManagementPhaseFilter] = useState('all');
  const [feedbackSettingsLoading, setFeedbackSettingsLoading] = useState(false);
  
  // Add form states
  const [showAddMentorForm, setShowAddMentorForm] = useState(false);
  const [showAddMenteeForm, setShowAddMenteeForm] = useState(false);
  const [addMentorData, setAddMentorData] = useState({
    email: '',
    areas_of_interest: [],
    description: '',
    phaseId: null
  });
  const [addMenteeData, setAddMenteeData] = useState({
    email: '',
    area_of_interest: '',
    description: '',
    phaseId: null
  });
  const [addLoading, setAddLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [currentPhaseId, setCurrentPhaseId] = useState(null);
  const [allPhases, setAllPhases] = useState([]);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // Filters for mentors and mentees
  const [mentorFilters, setMentorFilters] = useState({
    search: '',
    phase: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  const [menteeFilters, setMenteeFilters] = useState({
    search: '',
    areaOfInterest: '',
    phase: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [assignmentFilters, setAssignmentFilters] = useState({
    mentorEmail: '',
    menteeEmail: '',
    phase: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Feedback filters - only email and phase
  const [feedbackFilters, setFeedbackFilters] = useState({
    email: '',
    phase: 'all'
  });
  
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [filteredMentees, setFilteredMentees] = useState([]);
  
  const navigate = useNavigate();

  // Check if user is coordinator
  const isCoordinator = true;

  // Fetch all phases and current phase
  const fetchCurrentPhase = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/phase`);
      const phases = res.data.phases || [];
      
      setAllPhases(phases);
      
      const activePhase = phases.find(
        (p) => new Date(p.startDate) <= new Date() && new Date() <= new Date(p.endDate)
      );
      if (activePhase) {
        setCurrentPhase(activePhase);
        setCurrentPhaseId(activePhase.phaseId);
        setAddMentorData(prev => ({ ...prev, phaseId: activePhase.phaseId }));
        setAddMenteeData(prev => ({ ...prev, phaseId: activePhase.phaseId }));
      }
    } catch (err) {
      console.error("Error fetching phases:", err);
    }
  };

  // Fetch feedback settings
  const fetchFeedbackSettings = async () => {
    try {
      setFeedbackSettingsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/feedback-settings/`);
      
      if (res.data && res.data.success) {
        setFeedbackSettings(res.data.settings || []);
      } else if (res.data.settings) {
        setFeedbackSettings(res.data.settings);
      } else {
        setFeedbackSettings([]);
      }
    } catch (err) {
      console.error("Error fetching feedback settings:", err);
      setFeedbackSettings([]);
    } finally {
      setFeedbackSettingsLoading(false);
    }
  };

  // Toggle feedback for a phase
  const toggleFeedbackForPhase = async (phaseId, currentStatus) => {
    try {
      setFeedbackSettingsLoading(true);
      const res = await axios.put(`${API_BASE_URL}/api/feedback-settings/${phaseId}`, {
        enableFeedback: !currentStatus
      });
      
      if (res.data && res.data.success) {
        setFeedbackSettings(prev => {
          const existing = prev.find(s => s.phaseId === phaseId);
          if (existing) {
            return prev.map(s => 
              s.phaseId === phaseId 
                ? { ...s, enableFeedback: !currentStatus, updatedAt: new Date() }
                : s
            );
          } else {
            return [...prev, {
              phaseId: phaseId,
              enableFeedback: !currentStatus,
              createdAt: new Date(),
              updatedAt: new Date()
            }];
          }
        });
        
        alert(`Feedback ${!currentStatus ? 'enabled' : 'disabled'} for Phase ${phaseId}`);
      } else {
        alert(res.data?.message || "Failed to update feedback settings");
      }
    } catch (err) {
      console.error("Error toggling feedback:", err);
      alert(err.response?.data?.message || "Error updating feedback settings");
    } finally {
      setFeedbackSettingsLoading(false);
    }
  };

  // Get feedback status for a phase
  const getFeedbackStatusForPhase = (phaseId) => {
    const setting = feedbackSettings.find(s => s.phaseId === phaseId);
    return setting ? setting.enableFeedback : false;
  };

  // Filter phases for feedback management
  const getFilteredPhasesForManagement = () => {
    if (feedbackManagementPhaseFilter === 'all') {
      return allPhases;
    }
    return allPhases.filter(phase => phase.phaseId.toString() === feedbackManagementPhaseFilter);
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
      if (res.data && res.data.success) {
        const statsData = res.data.stats || res.data;
        setStats({
          totalMentees: statsData.totalMentees || 0,
          totalMentors: statsData.totalMentors || 0,
          newMenteesThisWeek: statsData.newMenteesThisWeek || 0,
          newMentorsThisWeek: statsData.newMentorsThisWeek || 0,
          phaseStats: statsData.phaseStats || []
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  // Get unique phases from all phases (for filter dropdown)
  const getUniquePhasesForFilter = () => {
    return allPhases.map(phase => phase.phaseId.toString()).sort();
  };

  // Add Mentor
  const handleAddMentor = async () => {
    if (!addMentorData.email) {
      alert("Please enter mentor email");
      return;
    }
    if (!addMentorData.description) {
      alert("Please enter mentor description");
      return;
    }
    if (addMentorData.areas_of_interest.length === 0) {
      alert("Please enter at least one area of interest");
      return;
    }

    setAddLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mentor/register`, {
        email: addMentorData.email,
        areaOfInterest: addMentorData.areas_of_interest,
        supportDescription: addMentorData.description,
        phaseId: addMentorData.phaseId || currentPhaseId
      });

      if (response.data.success) {
        alert("Mentor added successfully!");
        setShowAddMentorForm(false);
        setAddMentorData({
          email: '',
          areas_of_interest: [],
          description: '',
          phaseId: currentPhaseId
        });
        await fetchMentors();
        await fetchDashboardStats();
      } else {
        alert(response.data.message || "Failed to add mentor");
      }
    } catch (err) {
      console.error("Error adding mentor:", err);
      alert(err.response?.data?.message || "Error adding mentor");
    } finally {
      setAddLoading(false);
    }
  };

  // Add Mentee
  const handleAddMentee = async () => {
    if (!addMenteeData.email) {
      alert("Please enter mentee email");
      return;
    }
    if (!addMenteeData.area_of_interest) {
      alert("Please enter area of interest");
      return;
    }
    if (!addMenteeData.description) {
      alert("Please enter description");
      return;
    }

    setAddLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mentee/requests/mentee`, {
        email: addMenteeData.email,
        area_of_interest: addMenteeData.area_of_interest,
        description: addMenteeData.description,
        phaseId: addMenteeData.phaseId || currentPhaseId
      });

      if (response.data.success || response.status === 201) {
        alert("Mentee added successfully!");
        setShowAddMenteeForm(false);
        setAddMenteeData({
          email: '',
          area_of_interest: '',
          description: '',
          phaseId: currentPhaseId
        });
        await fetchMentees();
        await fetchDashboardStats();
      } else {
        alert(response.data.message || "Failed to add mentee");
      }
    } catch (err) {
      console.error("Error adding mentee:", err);
      let errorMessage = "Error adding mentee";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`Failed to add mentee: ${errorMessage}`);
    } finally {
      setAddLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (type, item) => {
    setDeleteType(type);
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    
    try {
      let response;
      switch (deleteType) {
        case 'mentor':
          response = await axios.delete(`${API_BASE_URL}/api/dashboard/mentor/${deleteTarget._id}`);
          if (response.data.success) {
            alert('Mentor deleted successfully');
            await fetchMentors();
            await fetchDashboardStats();
          }
          break;
        case 'mentee':
          response = await axios.delete(`${API_BASE_URL}/api/dashboard/mentee/${deleteTarget._id}`);
          if (response.data.success) {
            alert('Mentee deleted successfully');
            await fetchMentees();
            await fetchDashboardStats();
          }
          break;
        case 'assignment':
          response = await axios.delete(`${API_BASE_URL}/api/dashboard/assignment/${deleteTarget._id}`);
          if (response.data.success) {
            alert('Assignment deleted successfully');
            await fetchAssignments();
            await fetchMentors();
            await fetchMentees();
            await fetchDashboardStats();
          }
          break;
        default:
          break;
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setDeleteType('');
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Error deleting item');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    setDeleteType('');
  };

  // Fetch all mentors
  const fetchMentors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/mentors`);
      if (res.data && res.data.success) {
        const mentorsData = res.data.mentors || [];
        const mentorsWithDetails = mentorsData.map(mentor => ({
          ...mentor,
          description: mentor.description || 'No description',
          status: mentor.status || 'pending'
        }));
        setMentors(mentorsWithDetails);
        applyMentorFilters(mentorsWithDetails, mentorFilters);
        setStats(prev => ({ ...prev, totalMentors: mentorsWithDetails.length }));
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setMentors([]);
      setFilteredMentors([]);
    }
  };

  // Fetch all mentees
  const fetchMentees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/mentees`);
      if (res.data && res.data.success) {
        const menteesData = res.data.mentees || [];
        const menteesWithStatus = menteesData.map(mentee => ({
          ...mentee,
          status: mentee.status || 'pending'
        }));
        setMentees(menteesWithStatus);
        applyMenteeFilters(menteesWithStatus, menteeFilters);
        setStats(prev => ({ ...prev, totalMentees: menteesWithStatus.length }));
      }
    } catch (err) {
      console.error("Error fetching mentees:", err);
      setMentees([]);
      setFilteredMentees([]);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/assignments`);
      if (res.data && res.data.success) {
        const assignmentsData = res.data.assignments || [];
        setAssignments(assignmentsData);
        applyAssignmentFilters(assignmentsData, assignmentFilters);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
      setFilteredAssignments([]);
    }
  };

  // Fetch meetings with filters
  const fetchMeetings = async () => {
    try {
      const params = {};
      if (meetingFilters.dateFrom) params.dateFrom = meetingFilters.dateFrom;
      if (meetingFilters.dateTo) params.dateTo = meetingFilters.dateTo;
      if (meetingFilters.status !== 'all') params.status = meetingFilters.status;
      
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/meetings`, { params });
      if (res.data && res.data.success) {
        setMeetings(res.data.meetings || []);
        if (res.data.stats) {
          setMeetingStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setMeetings([]);
      setMeetingStats({ total: 0, scheduled: 0, completed: 0, cancelled: 0 });
    }
  };

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/feedbacks`);
      if (res.data && res.data.success) {
        const feedbacksData = res.data.feedbacks || [];
        setFeedbacks(feedbacksData);
        applyFeedbackFilters(feedbacksData, feedbackFilters);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    }
  };

  // Apply feedback filters - only email and phase
  const applyFeedbackFilters = (feedbacksData, filters) => {
    let filtered = [...feedbacksData];
    
    if (filters.email) {
      const emailLower = filters.email.toLowerCase();
      filtered = filtered.filter(feedback => {
        const userEmail = (feedback.userDetails?.email || '').toLowerCase();
        return userEmail.includes(emailLower);
      });
    }
    
    if (filters.phase !== 'all') {
      filtered = filtered.filter(feedback => {
        const phaseId = feedback.phaseId;
        return phaseId === parseInt(filters.phase) || 
               phaseId?.toString() === filters.phase;
      });
    }
    
    setFilteredFeedbacks(filtered);
  };

  // Apply mentor filters
  const applyMentorFilters = (mentorsData, filters) => {
    let filtered = [...mentorsData];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(mentor => {
        const name = (mentor.name || getNameFromEmail(mentor.email) || '').toLowerCase();
        const email = (mentor.email || '').toLowerCase();
        const description = (mentor.description || '').toLowerCase();
        return name.includes(searchLower) || email.includes(searchLower) || description.includes(searchLower);
      });
    }
    
    if (filters.phase !== 'all') {
      filtered = filtered.filter(mentor => 
        mentor.phaseId === parseInt(filters.phase) || 
        mentor.phaseId?.toString() === filters.phase
      );
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = (a.name || getNameFromEmail(a.email) || '').toLowerCase();
          bValue = (b.name || getNameFromEmail(b.email) || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'joined':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'phase':
          aValue = a.phaseId || 0;
          bValue = b.phaseId || 0;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredMentors(filtered);
  };

  // Apply mentee filters
  const applyMenteeFilters = (menteesData, filters) => {
    let filtered = [...menteesData];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(mentee => {
        const email = (mentee.email || '').toLowerCase();
        const area = (mentee.area_of_interest || '').toLowerCase();
        const description = (mentee.description || '').toLowerCase();
        return email.includes(searchLower) || 
               area.includes(searchLower) || 
               description.includes(searchLower);
      });
    }
    
    if (filters.areaOfInterest) {
      const areaLower = filters.areaOfInterest.toLowerCase();
      filtered = filtered.filter(mentee => {
        const area = (mentee.area_of_interest || '').toLowerCase();
        return area.includes(areaLower);
      });
    }
    
    if (filters.phase !== 'all') {
      filtered = filtered.filter(mentee => 
        mentee.phaseId === parseInt(filters.phase) || 
        mentee.phaseId?.toString() === filters.phase
      );
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'area_of_interest':
          aValue = (a.area_of_interest || '').toLowerCase();
          bValue = (b.area_of_interest || '').toLowerCase();
          break;
        case 'phase':
          aValue = a.phaseId || 0;
          bValue = b.phaseId || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    setFilteredMentees(filtered);
  };

  // Apply assignment filters
  const applyAssignmentFilters = (assignmentsData, filters) => {
    let filtered = [...assignmentsData];
    
    if (filters.mentorEmail) {
      const mentorEmailLower = filters.mentorEmail.toLowerCase();
      filtered = filtered.filter(assignment => {
        const mentorEmail = (assignment.mentorDetails?.email || '').toLowerCase();
        return mentorEmail.includes(mentorEmailLower);
      });
    }
    
    if (filters.menteeEmail) {
      const menteeEmailLower = filters.menteeEmail.toLowerCase();
      filtered = filtered.filter(assignment => {
        if (!assignment.mentees || assignment.mentees.length === 0) return false;
        return assignment.mentees.some(mentee => {
          const menteeEmail = (mentee.email || '').toLowerCase();
          return menteeEmail.includes(menteeEmailLower);
        });
      });
    }
    
    if (filters.phase !== 'all') {
      filtered = filtered.filter(assignment => {
        const phaseId = assignment.phaseId || assignment.mentorDetails?.phaseId;
        return phaseId === parseInt(filters.phase) || 
               phaseId?.toString() === filters.phase;
      });
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'mentorName':
          aValue = (a.mentorDetails?.name || getNameFromEmail(a.mentorDetails?.email) || '').toLowerCase();
          bValue = (b.mentorDetails?.name || getNameFromEmail(b.mentorDetails?.email) || '').toLowerCase();
          break;
        case 'mentorEmail':
          aValue = (a.mentorDetails?.email || '').toLowerCase();
          bValue = (b.mentorDetails?.email || '').toLowerCase();
          break;
        case 'menteeCount':
          aValue = a.mentees?.length || 0;
          bValue = b.mentees?.length || 0;
          break;
        case 'phase':
          aValue = a.phaseId || a.mentorDetails?.phaseId || 0;
          bValue = b.phaseId || b.mentorDetails?.phaseId || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    setFilteredAssignments(filtered);
  };

  const handleMentorFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...mentorFilters,
      [name]: value
    };
    setMentorFilters(updatedFilters);
    applyMentorFilters(mentors, updatedFilters);
  };

  const handleMenteeFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...menteeFilters,
      [name]: value
    };
    setMenteeFilters(updatedFilters);
    applyMenteeFilters(mentees, updatedFilters);
  };

  const handleAssignmentFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...assignmentFilters,
      [name]: value
    };
    setAssignmentFilters(updatedFilters);
    applyAssignmentFilters(assignments, updatedFilters);
  };

  const handleFeedbackFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...feedbackFilters,
      [name]: value
    };
    setFeedbackFilters(updatedFilters);
    applyFeedbackFilters(feedbacks, updatedFilters);
  };

  const resetMentorFilters = () => {
    const resetFilters = {
      search: '',
      phase: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setMentorFilters(resetFilters);
    applyMentorFilters(mentors, resetFilters);
  };

  const resetMenteeFilters = () => {
    const resetFilters = {
      search: '',
      areaOfInterest: '',
      phase: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setMenteeFilters(resetFilters);
    applyMenteeFilters(mentees, resetFilters);
  };

  const resetAssignmentFilters = () => {
    const resetFilters = {
      mentorEmail: '',
      menteeEmail: '',
      phase: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setAssignmentFilters(resetFilters);
    applyAssignmentFilters(assignments, resetFilters);
  };

  const resetFeedbackFilters = () => {
    const resetFilters = {
      email: '',
      phase: 'all'
    };
    setFeedbackFilters(resetFilters);
    applyFeedbackFilters(feedbacks, resetFilters);
  };

  // Load data based on active tab
  useEffect(() => {
    setLoading(true);
    fetchCurrentPhase();
    fetchDashboardStats();
    fetchMentors();
    fetchMentees();
    fetchFeedbackSettings();
    
    switch (activeTab) {
      case 'assignments':
        fetchAssignments();
        break;
      case 'meetings':
        fetchMeetings();
        break;
      case 'feedback':
        fetchFeedbacks();
        break;
      case 'feedback-management':
        break;
      default:
        break;
    }
    
    setTimeout(() => setLoading(false), 500);
  }, [activeTab]);

  const handleRefresh = () => {
    switch (activeTab) {
      case 'mentors':
        fetchMentors();
        break;
      case 'mentees':
        fetchMentees();
        break;
      case 'assignments':
        fetchAssignments();
        break;
      case 'meetings':
        fetchMeetings();
        break;
      case 'feedback':
        fetchFeedbacks();
        break;
      case 'feedback-management':
        fetchFeedbackSettings();
        break;
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setMeetingFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyMeetingFilters = () => {
    fetchMeetings();
  };

  const resetMeetingFilters = () => {
    setMeetingFilters({
      dateFrom: '',
      dateTo: '',
      status: 'all'
    });
    setTimeout(() => fetchMeetings(), 100);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleBackToHome = () => {
    navigate("/14");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      if (timeString) {
        return `${dateStr} at ${formatTime(timeString)}`;
      }
      return dateStr;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  const getNameFromEmail = (email) => {
    if (!email || email === 'N/A') return 'User';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const getDateStatus = (dateObj) => {
    if (dateObj.status) {
      return dateObj.status.toLowerCase();
    }
    if (!dateObj.date) return 'scheduled';
    const date = new Date(dateObj.date);
    const now = new Date();
    if (date < now) return 'completed';
    return 'scheduled';
  };

  const getDateStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    switch(statusLower) {
      case 'completed': return 'md-date-status-badge md-completed';
      case 'scheduled': return 'md-date-status-badge md-scheduled';
      case 'cancelled': return 'md-date-status-badge md-cancelled';
      case 'postponed': return 'md-date-status-badge md-postponed';
      case 'ongoing': return 'md-date-status-badge md-ongoing';
      default: return 'md-date-status-badge md-scheduled';
    }
  };

  const getRatingStars = (rating) => {
    if (!rating || isNaN(rating)) return 'N/A';
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getUniqueMentorEmails = () => {
    const emails = new Set();
    assignments.forEach(assignment => {
      if (assignment.mentorDetails?.email) {
        emails.add(assignment.mentorDetails.email);
      }
    });
    return Array.from(emails).sort();
  };

  const getUniqueAreasOfInterest = () => {
    const areas = new Set();
    mentees.forEach(mentee => {
      if (mentee.area_of_interest) {
        areas.add(mentee.area_of_interest);
      }
    });
    return Array.from(areas).sort();
  };

  const getUniqueFeedbackEmails = () => {
    const emails = new Set();
    feedbacks.forEach(feedback => {
      if (feedback.userDetails?.email) {
        emails.add(feedback.userDetails.email);
      }
    });
    return Array.from(emails).sort();
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'assigned':
        return 'md-status-assigned';
      case 'pending':
        return 'md-status-pending';
      case 'completed':
        return 'md-status-completed';
      case 'cancelled':
        return 'md-status-cancelled';
      default:
        return 'md-status-pending';
    }
  };

  const totalMentors = mentors.length;
  const totalMentees = mentees.length;
  const totalAssignments = assignments.length;
  const totalMeetings = meetingStats.total;

  if (loading && activeTab === 'mentors') {
    return (
      <div className="md-dashboard-wrapper">
        <div className="md-loading-container">
          <div className="md-spinner"></div>
          <p>Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md-dashboard-wrapper">
      <div className="md-animated-bg">
        <div className="md-gradient-orb md-orb-1"></div>
        <div className="md-gradient-orb md-orb-2"></div>
        <div className="md-gradient-orb md-orb-3"></div>
      </div>

      <button className="md-mobile-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`md-sidebar ${sidebarOpen ? 'md-sidebar-open' : ''}`}>
        <div className="md-sidebar-header">
          <h2>Mentorship</h2>
          <button className="md-sidebar-close" onClick={toggleSidebar}>✕</button>
        </div>
        
        <div className="md-sidebar-stats">
          <div className="md-sidebar-stat">
            <div className="md-stat-value">{totalMentors}</div>
            <div className="md-stat-label">Mentors</div>
          </div>
          <div className="md-sidebar-stat">
            <div className="md-stat-value">{totalMentees}</div>
            <div className="md-stat-label">Mentees</div>
          </div>
          <div className="md-sidebar-stat">
            <div className="md-stat-value">{totalAssignments}</div>
            <div className="md-stat-label">Assignments</div>
          </div>
          <div className="md-sidebar-stat">
            <div className="md-stat-value">{totalMeetings}</div>
            <div className="md-stat-label">Meetings</div>
          </div>
        </div>
        
        <nav className="md-sidebar-nav">
          <button 
            className={`md-nav-item ${activeTab === 'mentors' ? 'md-active' : ''}`}
            onClick={() => handleNavClick('mentors')}
          >
            Mentors
            <span className="md-nav-count">{totalMentors}</span>
          </button>
          
          <button 
            className={`md-nav-item ${activeTab === 'mentees' ? 'md-active' : ''}`}
            onClick={() => handleNavClick('mentees')}
          >
            Mentees
            <span className="md-nav-count">{totalMentees}</span>
          </button>
          
          <button 
            className={`md-nav-item ${activeTab === 'assignments' ? 'md-active' : ''}`}
            onClick={() => handleNavClick('assignments')}
          >
            Assignments
            <span className="md-nav-count">{totalAssignments}</span>
          </button>
          
          <button 
            className={`md-nav-item ${activeTab === 'meetings' ? 'md-active' : ''}`}
            onClick={() => handleNavClick('meetings')}
          >
            Meetings
            <span className="md-nav-count">{totalMeetings}</span>
          </button>
          
          <button 
            className={`md-nav-item ${activeTab === 'feedback' ? 'md-active' : ''}`}
            onClick={() => handleNavClick('feedback')}
          >
            Feedback
            <span className="md-nav-count">{feedbacks.length}</span>
          </button>

          <button 
            className={`md-nav-item ${activeTab === 'feedback-management' ? 'md-active' : ''}`}
            onClick={() => handleNavClick('feedback-management')}
          >
            ⚙️ Feedback Management
            <span className="md-nav-count">{allPhases.length}</span>
          </button>
        </nav>
        
        <div className="md-sidebar-footer">
          <button className="md-back-home-btn" onClick={handleBackToHome}>
            ← Back to Home
          </button>
        </div>
      </div>

      {sidebarOpen && <div className="md-overlay" onClick={toggleSidebar}></div>}

      <div className="md-main-content">
        <div className="md-content-header">
          <h1>Mentorship Program Dashboard</h1>
          <p>View mentors, mentees, meetings, and feedback</p>
        </div>

        {loading ? (
          <div className="md-loading-container">
            <div className="md-spinner"></div>
            <p>Loading {activeTab} data...</p>
          </div>
        ) : (
          <>
            {/* MENTORS TAB */}
            {activeTab === 'mentors' && (
              <div className="md-mentors-tab">
                <div className="md-section-header-with-filters">
                  <h2 className="md-section-title">All Mentors ({filteredMentors.length})</h2>
                  
                  {isCoordinator && (
                    <button 
                      className="md-add-btn"
                      onClick={() => setShowAddMentorForm(true)}
                    >
                      + Add Mentor
                    </button>
                  )}
                  
                  <div className="md-filters-container md-glass-card">
                    <div className="md-filter-row">
                      <div className="md-filter-group">
                        <label>Search</label>
                        <input
                          type="text"
                          name="search"
                          placeholder="Search by name, email or description..."
                          value={mentorFilters.search}
                          onChange={handleMentorFilterChange}
                          className="md-filter-input"
                        />
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Phase</label>
                        <select
                          name="phase"
                          value={mentorFilters.phase}
                          onChange={handleMentorFilterChange}
                          className="md-filter-select"
                        >
                          <option value="all">All Phases</option>
                          {getUniquePhasesForFilter().map(phase => (
                            <option key={phase} value={phase}>Phase {phase}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Sort By</label>
                        <select
                          name="sortBy"
                          value={mentorFilters.sortBy}
                          onChange={handleMentorFilterChange}
                          className="md-filter-select"
                        >
                          <option value="name">Name</option>
                          <option value="email">Email</option>
                          <option value="phase">Phase</option>
                          <option value="joined">Join Date</option>
                        </select>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Order</label>
                        <select
                          name="sortOrder"
                          value={mentorFilters.sortOrder}
                          onChange={handleMentorFilterChange}
                          className="md-filter-select"
                        >
                          <option value="asc">Ascending</option>
                          <option value="desc">Descending</option>
                        </select>
                      </div>
                      
                      <div className="md-filter-actions">
                        <button 
                          className="md-apply-btn"
                          onClick={() => applyMentorFilters(mentors, mentorFilters)}
                        >
                          Apply
                        </button>
                        <button 
                          className="md-reset-btn"
                          onClick={resetMentorFilters}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {filteredMentors.length === 0 ? (
                  <div className="md-empty-state md-glass-card">
                    <p>No mentors found with current filters</p>
                  </div>
                ) : (
                  <div className="md-data-table-container">
                    <div className="md-data-table md-glass-card">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Description</th>
                            <th>Phase</th>
                            <th>Joined</th>
                            <th>Status</th>
                            {isCoordinator && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMentors.map((mentor) => {
                            const displayName = mentor.name && mentor.name !== 'N/A' 
                              ? mentor.name 
                              : mentor.email && mentor.email !== 'N/A'
                                ? getNameFromEmail(mentor.email)
                                : 'Unknown Mentor';
                            
                            const displayEmail = mentor.email && mentor.email !== 'N/A' 
                              ? mentor.email 
                              : 'No email';
                            
                            const displayPhase = mentor.phaseId && mentor.phaseId !== 'N/A'
                              ? `Phase ${mentor.phaseId}`
                              : 'N/A';
                            
                            const displayDescription = mentor.description && mentor.description !== 'N/A' && mentor.description !== 'No description'
                              ? mentor.description.length > 100 
                                ? mentor.description.substring(0, 100) + '...' 
                                : mentor.description
                              : '—';
                            
                            const displayStatus = mentor.status || 'pending';
                            const statusClass = getStatusClass(displayStatus);

                            return (
                              <tr key={mentor._id}>
                                <td className="md-id-cell">M{(mentor._id?.toString() || '').slice(-6)}</td>
                                <td className="md-name-cell">{displayName}</td>
                                <td className="md-email-cell">{displayEmail}</td>
                                <td className="md-description-cell" title={mentor.description || ''}>
                                  {displayDescription}
                                </td>
                                <td><span className="md-phase-badge">{displayPhase}</span></td>
                                <td className="md-date-cell">{formatDate(mentor.createdAt)}</td>
                                <td>
                                  <span className={`md-status-badge ${statusClass}`}>
                                    {displayStatus}
                                  </span>
                                </td>
                                {isCoordinator && (
                                  <td className="md-actions-cell">
                                    <button 
                                      className="md-delete-btn"
                                      onClick={() => handleDeleteClick('mentor', mentor)}
                                      title="Delete Mentor"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MENTEES TAB */}
            {activeTab === 'mentees' && (
              <div className="md-mentees-tab">
                <div className="md-section-header-with-filters">
                  <h2 className="md-section-title">All Mentees ({filteredMentees.length})</h2>
                  
                  {isCoordinator && (
                    <button 
                      className="md-add-btn"
                      onClick={() => setShowAddMenteeForm(true)}
                    >
                      + Add Mentee
                    </button>
                  )}
                  
                  <div className="md-filters-container md-glass-card">
                    <div className="md-filter-row">
                      <div className="md-filter-group">
                        <label>Search</label>
                        <input
                          type="text"
                          name="search"
                          placeholder="Search by email, area of interest, or description..."
                          value={menteeFilters.search}
                          onChange={handleMenteeFilterChange}
                          className="md-filter-input"
                        />
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Area of Interest</label>
                        <input
                          type="text"
                          name="areaOfInterest"
                          placeholder="Filter by area of interest..."
                          value={menteeFilters.areaOfInterest}
                          onChange={handleMenteeFilterChange}
                          className="md-filter-input"
                          list="areaOfInterestSuggestions"
                        />
                        <datalist id="areaOfInterestSuggestions">
                          {getUniqueAreasOfInterest().map(area => (
                            <option key={area} value={area} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Phase</label>
                        <select
                          name="phase"
                          value={menteeFilters.phase}
                          onChange={handleMenteeFilterChange}
                          className="md-filter-select"
                        >
                          <option value="all">All Phases</option>
                          {getUniquePhasesForFilter().map(phase => (
                            <option key={phase} value={phase}>Phase {phase}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Sort By</label>
                        <select
                          name="sortBy"
                          value={menteeFilters.sortBy}
                          onChange={handleMenteeFilterChange}
                          className="md-filter-select"
                        >
                          <option value="email">Email</option>
                          <option value="area_of_interest">Area of Interest</option>
                          <option value="phase">Phase</option>
                          <option value="createdAt">Request Date</option>
                        </select>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Order</label>
                        <select
                          name="sortOrder"
                          value={menteeFilters.sortOrder}
                          onChange={handleMenteeFilterChange}
                          className="md-filter-select"
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                      
                      <div className="md-filter-actions">
                        <button 
                          className="md-apply-btn"
                          onClick={() => applyMenteeFilters(mentees, menteeFilters)}
                        >
                          Apply
                        </button>
                        <button 
                          className="md-reset-btn"
                          onClick={resetMenteeFilters}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {filteredMentees.length === 0 ? (
                  <div className="md-empty-state md-glass-card">
                    <p>No mentees found with current filters</p>
                  </div>
                ) : (
                  <div className="md-data-table-container">
                    <div className="md-data-table md-glass-card">
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Area of Interest</th>
                            <th>Description</th>
                            <th>Phase</th>
                            <th>Requested</th>
                            <th>Status</th>
                            {isCoordinator && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMentees.map((mentee) => {
                            const displayEmail = mentee.email && mentee.email !== 'N/A' ? mentee.email : 'No email';
                            const displayArea = mentee.area_of_interest && mentee.area_of_interest !== 'N/A' ? mentee.area_of_interest : 'Not specified';
                            const displayDescription = mentee.description && mentee.description !== 'N/A'
                              ? mentee.description.length > 80 
                                ? mentee.description.substring(0, 80) + '...' 
                                : mentee.description
                              : '—';
                            const displayPhase = mentee.phaseId && mentee.phaseId !== 'N/A' ? `Phase ${mentee.phaseId}` : 'N/A';
                            const displayStatus = mentee.status || 'pending';
                            const statusClass = getStatusClass(displayStatus);

                            return (
                              <tr key={mentee._id}>
                                <td className="md-id-cell">MT{(mentee._id?.toString() || '').slice(-6)}</td>
                                <td className="md-email-cell">{displayEmail}</td>
                                <td className="md-interest-cell">{displayArea}</td>
                                <td className="md-description-cell" title={mentee.description || ''}>{displayDescription}</td>
                                <td><span className="md-phase-badge">{displayPhase}</span></td>
                                <td className="md-date-cell">{formatDate(mentee.createdAt)}</td>
                                <td>
                                  <span className={`md-status-badge ${statusClass}`}>
                                    {displayStatus}
                                  </span>
                                </td>
                                {isCoordinator && (
                                  <td className="md-actions-cell">
                                    <button 
                                      className="md-delete-btn"
                                      onClick={() => handleDeleteClick('mentee', mentee)}
                                      title="Delete Mentee"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <div className="md-assignments-tab">
                <div className="md-section-header-with-filters">
                  <h2 className="md-section-title">Mentor-Mentee Assignments ({filteredAssignments.length})</h2>
                  
                  <div className="md-filters-container md-glass-card">
                    <div className="md-filter-row">
                      <div className="md-filter-group">
                        <label>Mentor Email</label>
                        <input
                          type="text"
                          name="mentorEmail"
                          placeholder="Filter by mentor email..."
                          value={assignmentFilters.mentorEmail}
                          onChange={handleAssignmentFilterChange}
                          className="md-filter-input"
                          list="mentorEmailSuggestions"
                        />
                        <datalist id="mentorEmailSuggestions">
                          {getUniqueMentorEmails().map(email => (
                            <option key={email} value={email} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Mentee Email</label>
                        <input
                          type="text"
                          name="menteeEmail"
                          placeholder="Filter by mentee email..."
                          value={assignmentFilters.menteeEmail}
                          onChange={handleAssignmentFilterChange}
                          className="md-filter-input"
                        />
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Phase</label>
                        <select
                          name="phase"
                          value={assignmentFilters.phase}
                          onChange={handleAssignmentFilterChange}
                          className="md-filter-select"
                        >
                          <option value="all">All Phases</option>
                          {getUniquePhasesForFilter().map(phase => (
                            <option key={phase} value={phase}>Phase {phase}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md-filter-actions">
                        <button 
                          className="md-apply-btn"
                          onClick={() => applyAssignmentFilters(assignments, assignmentFilters)}
                        >
                          Apply
                        </button>
                        <button 
                          className="md-reset-btn"
                          onClick={resetAssignmentFilters}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {filteredAssignments.length === 0 ? (
                  <div className="md-empty-state md-glass-card">
                    <p>No assignments found with current filters</p>
                  </div>
                ) : (
                  <div className="md-assignments-grid">
                    {filteredAssignments.map((assignment) => (
                      <div key={assignment._id} className="md-assignment-card md-glass-card">
                        <div className="md-assignment-header">
                          <div className="md-mentor-info">
                            <h4 className="md-mentor-name">{assignment.mentorDetails?.name || 'Mentor'}</h4>
                            <p className="md-email md-mentor-email">{assignment.mentorDetails?.email || 'No email'}</p>
                          </div>
                          <div className="md-mentee-count">
                            <span className="md-count-number">{assignment.mentees?.length || 0}</span>
                            <small>mentees</small>
                          </div>
                        </div>
                        
                        <div className="md-assignment-mentees">
                          <h5>Assigned Mentees ({assignment.mentees?.length || 0}):</h5>
                          {assignment.mentees && assignment.mentees.length > 0 ? (
                            <div className="md-mentee-list-full">
                              {assignment.mentees.map((mentee, idx) => (
                                <div key={idx} className="md-mentee-item-full">
                                  <div className="md-mentee-details-full">
                                    <div><strong>Name:</strong> {mentee.name || 'Mentee'}</div>
                                    <div><strong>Email:</strong> {mentee.email || 'No email'}</div>
                                    {mentee.area_of_interest && (
                                      <div><strong>Area of Interest:</strong> {mentee.area_of_interest}</div>
                                    )}
                                    {mentee.description && (
                                      <div><strong>Description:</strong> {mentee.description}</div>
                                    )}
                                    {mentee.phaseId && (
                                      <div><strong>Phase:</strong> {mentee.phaseId}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No mentees assigned</p>
                          )}
                        </div>
                        
                        <div className="md-assignment-footer">
                          <span>Assigned: {formatDate(assignment.createdAt)}</span>
                          <div className="md-footer-actions">
                            {assignment.phaseId && (
                              <span className="md-phase-tag">Phase {assignment.phaseId}</span>
                            )}
                            {isCoordinator && (
                              <button 
                                className="md-delete-btn-small"
                                onClick={() => handleDeleteClick('assignment', assignment)}
                                title="Delete Assignment"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MEETINGS TAB - IMPROVED UI */}
            {activeTab === 'meetings' && (
              <div className="md-meetings-tab">
                <div className="md-meetings-header">
                  <div className="md-meetings-title-section">
                    <h2 className="md-section-title">Meetings Overview</h2>
                    <p className="md-section-subtitle">Track and manage all mentorship meetings</p>
                  </div>
                  
                  <div className="md-meeting-stats-row">
                    <div className="md-meeting-stat-card">
                      <div className="md-stat-icon"></div>
                      <div className="md-stat-info">
                        <div className="md-stat-number">{meetingStats.total}</div>
                        <div className="md-stat-label">Total Meetings</div>
                      </div>
                    </div>
                    <div className="md-meeting-stat-card success">
                      <div className="md-stat-icon"></div>
                      <div className="md-stat-info">
                        <div className="md-stat-number">{meetingStats.completed}</div>
                        <div className="md-stat-label">Completed</div>
                      </div>
                    </div>
                    <div className="md-meeting-stat-card warning">
                      <div className="md-stat-icon"></div>
                      <div className="md-stat-info">
                        <div className="md-stat-number">{meetingStats.scheduled}</div>
                        <div className="md-stat-label">Scheduled</div>
                      </div>
                    </div>
                    <div className="md-meeting-stat-card danger">
                      <div className="md-stat-icon"></div>
                      <div className="md-stat-info">
                        <div className="md-stat-number">{meetingStats.cancelled || 0}</div>
                        <div className="md-stat-label">Cancelled</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md-meeting-filters md-glass-card">
                    <div className="md-filter-row">
                      <div className="md-filter-group">
                        <label>From Date</label>
                        <input
                          type="date"
                          name="dateFrom"
                          value={meetingFilters.dateFrom}
                          onChange={handleFilterChange}
                          className="md-filter-input"
                        />
                      </div>
                      
                      <div className="md-filter-group">
                        <label>To Date</label>
                        <input
                          type="date"
                          name="dateTo"
                          value={meetingFilters.dateTo}
                          onChange={handleFilterChange}
                          className="md-filter-input"
                        />
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={meetingFilters.status}
                          onChange={handleFilterChange}
                          className="md-filter-select"
                        >
                          <option value="all">All Status</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      <div className="md-filter-actions">
                        <button className="md-apply-btn" onClick={applyMeetingFilters}>Apply Filters</button>
                        <button className="md-reset-btn" onClick={resetMeetingFilters}>Reset</button>
                      </div>
                    </div>
                  </div>
                </div>

                {meetings.length === 0 ? (
                  <div className="md-empty-state md-glass-card">
                    <div className="md-empty-icon"></div>
                    <p>No meetings found</p>
                    <small>Try adjusting your filters or check back later</small>
                  </div>
                ) : (
                  <div className="md-meetings-list">
                    {meetings.map((meeting) => (
                      <div key={meeting._id} className="md-meeting-item md-glass-card">
                        {/* Mentor Header */}
                        <div className="md-meeting-item-header">
                          <div className="md-mentor-avatar">
                            <span className="md-avatar-text">
                              {meeting.mentorDetails?.name?.charAt(0) || 'M'}
                            </span>
                          </div>
                          <div className="md-mentor-details">
                            <h3 className="md-mentor-name">{meeting.mentorDetails?.name || 'Mentor'}</h3>
                            <p className="md-mentor-email">{meeting.mentorDetails?.email || 'No email'}</p>
                          </div>
                          <div className="md-meeting-badge">
                            <span className={`md-badge ${meeting.meeting_dates?.some(d => d.status === 'completed') ? 'completed' : 'scheduled'}`}>
                              {meeting.meeting_dates?.some(d => d.status === 'completed') ? 'In Progress' : 'Active'}
                            </span>
                          </div>
                        </div>

                        {/* Meeting Info */}
                        <div className="md-meeting-info-grid">
                          <div className="md-info-item">
                            <span className="md-info-icon"></span>
                            <div className="md-info-content">
                              <label>Time</label>
                              <p>{formatTime(meeting.meeting_time)}</p>
                            </div>
                          </div>
                          <div className="md-info-item">
                            <span className="md-info-icon"></span>
                            <div className="md-info-content">
                              <label>Duration</label>
                              <p>{meeting.duration_minutes || 30} minutes</p>
                            </div>
                          </div>
                          <div className="md-info-item">
                            <span className="md-info-icon"></span>
                            <div className="md-info-content">
                              <label>Sessions</label>
                              <p>{meeting.meeting_dates?.length || 0} meetings</p>
                            </div>
                          </div>
                          <div className="md-info-item">
                            <span className="md-info-icon"></span>
                            <div className="md-info-content">
                              <label>Mentees</label>
                              <p>{meeting.mentees?.length || 0} assigned</p>
                            </div>
                          </div>
                        </div>

                        {/* Agenda */}
                        {meeting.agenda && (
                          <div className="md-meeting-agenda">
                            <div className="md-agenda-header">
                              <span className="md-agenda-icon"></span>
                              <strong>Agenda</strong>
                            </div>
                            <p className="md-agenda-text">{meeting.agenda}</p>
                          </div>
                        )}

                        {/* Platform */}
                        {meeting.platform && (
                          <div className="md-meeting-platform">
                            <span className="md-platform-icon"></span>
                            <span className="md-platform-name">Platform: {meeting.platform}</span>
                            {meeting.meeting_link && (
                              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="md-meeting-link">
                                Join Meeting →
                              </a>
                            )}
                          </div>
                        )}

                        {/* Sessions Section */}
                        <div className="md-meeting-sessions">
                          <div className="md-sessions-header">
                            <h4>Meeting Sessions</h4>
                            <span className="md-sessions-count">{meeting.meeting_dates?.length || 0} sessions</span>
                          </div>
                          <div className="md-sessions-list">
                            {meeting.meeting_dates && meeting.meeting_dates.length > 0 ? (
                              meeting.meeting_dates.map((dateObj, index) => {
                                const dateStatus = getDateStatus(dateObj);
                                const statusClass = dateStatus === 'completed' ? 'completed' : 'scheduled';
                                
                                return (
                                  <div key={dateObj._id || index} className={`md-session-card ${statusClass}`}>
                                    <div className="md-session-number">Session #{index + 1}</div>
                                    <div className="md-session-date">
                                      <span className="md-session-icon"></span>
                                      {formatDateTime(dateObj.date, meeting.meeting_time)}
                                    </div>
                                    <div className={`md-session-status ${statusClass}`}>
                                      {dateStatus === 'completed' ? '✓ Completed' : ' Scheduled'}
                                    </div>
                                    {dateObj.notes && (
                                      <div className="md-session-notes">
                                        <span className="md-notes-icon">📌</span>
                                        {dateObj.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="md-no-sessions">No sessions scheduled</p>
                            )}
                          </div>
                        </div>

                        {/* Mentees List */}
                        {meeting.mentees && meeting.mentees.length > 0 && (
                          <div className="md-meeting-mentees">
                            <div className="md-mentees-header">
                              <span className="md-mentees-icon"></span>
                              <strong>Assigned Mentees ({meeting.mentees.length})</strong>
                            </div>
                            <div className="md-mentees-tags">
                              {meeting.mentees.map((mentee, idx) => (
                                <span key={idx} className="md-mentee-tag" title={mentee.email}>
                                  {mentee.name || mentee.email?.split('@')[0] || 'Mentee'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
              <div className="md-feedback-tab">
                <div className="md-section-header-with-filters">
                  <h2 className="md-section-title">Program Feedback ({filteredFeedbacks.length})</h2>
                  
                  <div className="md-filters-container md-glass-card">
                    <div className="md-filter-row">
                      <div className="md-filter-group">
                        <label>Email</label>
                        <input
                          type="text"
                          name="email"
                          placeholder="Filter by email..."
                          value={feedbackFilters.email}
                          onChange={handleFeedbackFilterChange}
                          className="md-filter-input"
                          list="feedbackEmailSuggestions"
                        />
                        <datalist id="feedbackEmailSuggestions">
                          {getUniqueFeedbackEmails().map(email => (
                            <option key={email} value={email} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div className="md-filter-group">
                        <label>Phase</label>
                        <select
                          name="phase"
                          value={feedbackFilters.phase}
                          onChange={handleFeedbackFilterChange}
                          className="md-filter-select"
                        >
                          <option value="all">All Phases</option>
                          {getUniquePhasesForFilter().map(phase => (
                            <option key={phase} value={phase}>Phase {phase}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md-filter-actions">
                        <button 
                          className="md-apply-btn"
                          onClick={() => applyFeedbackFilters(feedbacks, feedbackFilters)}
                        >
                          Apply
                        </button>
                        <button 
                          className="md-reset-btn"
                          onClick={resetFeedbackFilters}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {filteredFeedbacks.length === 0 ? (
                  <div className="md-empty-state md-glass-card">
                    <p>No feedback submissions found with current filters</p>
                  </div>
                ) : (
                  <div className="md-feedback-grid">
                    {filteredFeedbacks.map((feedback) => {
                      const userEmail = feedback.userDetails?.email || 'No email';
                      const userName = userEmail !== 'No email' ? userEmail.split('@')[0] : 'Anonymous';
                      const displayName = <strong>{userName}</strong>;
                      
                      return (
                        <div key={feedback._id} className="md-feedback-card md-glass-card">
                          <div className="md-feedback-header">
                            <div>
                              <h4>{displayName}</h4>
                              <p>{userEmail} • {feedback.role || 'Not specified'}</p>
                              {feedback.phaseId && <p className="md-feedback-phase">Phase {feedback.phaseId}</p>}
                            </div>
                            <span>{formatDate(feedback.createdAt)}</span>
                          </div>
                          
                          <div className="md-feedback-ratings-grid">
                            <div><strong>Overall Satisfaction:</strong> {getRatingStars(feedback.overallSatisfaction)} ({feedback.overallSatisfaction || 'N/A'}/5)</div>
                            <div><strong>Program Organization:</strong> {getRatingStars(feedback.programOrganization)} ({feedback.programOrganization || 'N/A'}/5)</div>
                            <div><strong>Matching Process:</strong> {getRatingStars(feedback.matchingProcess)} ({feedback.matchingProcess || 'N/A'}/5)</div>
                            <div><strong>Support Provided:</strong> {getRatingStars(feedback.supportProvided)} ({feedback.supportProvided || 'N/A'}/5)</div>
                          </div>
                          
                          {feedback.generalFeedback && (
                            <div><strong>General Feedback:</strong> {feedback.generalFeedback}</div>
                          )}
                          
                          {feedback.suggestions && (
                            <div><strong>Suggestions:</strong> {feedback.suggestions}</div>
                          )}
                          
                          <div>
                            <strong>Participate again:</strong> {feedback.participateAgain || 'Not specified'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FEEDBACK MANAGEMENT TAB - WITH PHASE FILTER */}
            {activeTab === 'feedback-management' && (
              <div className="md-feedback-management-tab">
                <div className="md-fm-header">
                  <div className="md-fm-header-content">
                    <h2 className="md-fm-title">Feedback Management</h2>
                    <p className="md-fm-subtitle">Control feedback visibility for each program phase</p>
                  </div>
                </div>

                {/* Phase Filter for Feedback Management */}
                <div className="md-fm-filter-container md-glass-card">
                  <div className="md-filter-row">
                    <div className="md-filter-group">
                      <label>Filter by Phase</label>
                      <select
                        value={feedbackManagementPhaseFilter}
                        onChange={(e) => setFeedbackManagementPhaseFilter(e.target.value)}
                        className="md-filter-select"
                      >
                        <option value="all">All Phases</option>
                        {getUniquePhasesForFilter().map(phase => (
                          <option key={phase} value={phase}>Phase {phase}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md-filter-actions">
                      <button 
                        className="md-reset-btn" 
                        onClick={() => setFeedbackManagementPhaseFilter('all')}
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                </div>

                {feedbackSettingsLoading && allPhases.length === 0 ? (
                  <div className="md-fm-loading">
                    <div className="md-fm-spinner"></div>
                    <p>Loading phases...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="md-fm-stats-grid">
                      <div className="md-fm-stat-card">
                        <div className="md-fm-stat-icon">📋</div>
                        <div className="md-fm-stat-info">
                          <div className="md-fm-stat-number">{getFilteredPhasesForManagement().length}</div>
                          <div className="md-fm-stat-label">Showing Phases</div>
                        </div>
                      </div>
                      <div className="md-fm-stat-card success">
                        <div className="md-fm-stat-icon">✅</div>
                        <div className="md-fm-stat-info">
                          <div className="md-fm-stat-number">
                            {getFilteredPhasesForManagement().filter(p => getFeedbackStatusForPhase(p.phaseId)).length}
                          </div>
                          <div className="md-fm-stat-label">Feedback Enabled</div>
                        </div>
                      </div>
                      <div className="md-fm-stat-card warning">
                        <div className="md-fm-stat-icon">🔒</div>
                        <div className="md-fm-stat-info">
                          <div className="md-fm-stat-number">
                            {getFilteredPhasesForManagement().filter(p => !getFeedbackStatusForPhase(p.phaseId)).length}
                          </div>
                          <div className="md-fm-stat-label">Feedback Disabled</div>
                        </div>
                      </div>
                    </div>

                    {/* Phases Grid */}
                    <div className="md-fm-phases-grid">
                      {getFilteredPhasesForManagement().map((phase) => {
                        const isEnabled = getFeedbackStatusForPhase(phase.phaseId);
                        const setting = feedbackSettings.find(s => s.phaseId === phase.phaseId);
                        
                        return (
                          <div key={phase.phaseId} className={`md-fm-phase-card ${isEnabled ? 'enabled' : 'disabled'}`}>
                            <div className="md-fm-card-header">
                              <div className="md-fm-phase-badge">
                                <span className="md-fm-phase-number">Phase {phase.phaseId}</span>
                                <span className={`md-fm-status-badge ${isEnabled ? 'status-enabled' : 'status-disabled'}`}>
                                  {isEnabled ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              </div>
                              <button
                                className={`md-fm-toggle-btn ${isEnabled ? 'btn-disable' : 'btn-enable'}`}
                                onClick={() => toggleFeedbackForPhase(phase.phaseId, isEnabled)}
                                disabled={feedbackSettingsLoading}
                              >
                                {isEnabled ? (
                                  <>
                                    <span>🔒</span>
                                    Disable Feedback
                                  </>
                                ) : (
                                  <>
                                    <span>✅</span>
                                    Enable Feedback
                                  </>
                                )}
                              </button>
                            </div>
                            
                            <div className="md-fm-card-body">
                              <h3 className="md-fm-phase-name">{phase.name}</h3>
                              <div className="md-fm-phase-dates">
                                <span>📅</span>
                                {new Date(phase.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })} - {new Date(phase.endDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              
                              <div className="md-fm-info-message">
                                {isEnabled ? (
                                  <>
                                    <span className="info-icon">✅</span>
                                    <span>Feedback is visible to all mentors and mentees in this phase</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="info-icon">🔒</span>
                                    <span>Feedback is hidden. Enable to allow users to view and submit feedback</span>
                                  </>
                                )}
                              </div>
                              
                              {setting && setting.updatedAt && isEnabled && (
                                <div className="md-fm-updated">
                                  <span>🕒</span>
                                  Last updated: {new Date(setting.updatedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {getFilteredPhasesForManagement().length === 0 && !feedbackSettingsLoading && (
                      <div className="md-fm-empty-state">
                        <div className="md-fm-empty-icon">📋</div>
                        <p>No phases found for the selected filter</p>
                        <small>Try changing the phase filter or create new phases</small>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Mentor Modal */}
      {showAddMentorForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Add New Mentor</h3>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="mentor@example.com"
                value={addMentorData.email}
                onChange={(e) => setAddMentorData({...addMentorData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Areas of Interest * (comma separated)</label>
              <input
                type="text"
                placeholder="Web Development, Data Science, Cloud Computing"
                value={addMentorData.areas_of_interest.join(', ')}
                onChange={(e) => setAddMentorData({
                  ...addMentorData, 
                  areas_of_interest: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows="3"
                placeholder="Describe mentor's experience and expertise"
                value={addMentorData.description}
                onChange={(e) => setAddMentorData({...addMentorData, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Phase</label>
              <input type="text" value={currentPhaseId ? `Phase ${currentPhaseId}` : 'Loading...'} disabled className="phase-input" />
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowAddMentorForm(false)}>Cancel</button>
              <button className="modal-submit" onClick={handleAddMentor} disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Mentee Modal */}
      {showAddMenteeForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Add New Mentee</h3>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="mentee@example.com"
                value={addMenteeData.email}
                onChange={(e) => setAddMenteeData({...addMenteeData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Area of Interest *</label>
              <select
                value={addMenteeData.area_of_interest}
                onChange={(e) => setAddMenteeData({...addMenteeData, area_of_interest: e.target.value})}
              >
                <option value="">Select Area</option>
                <option value="web-development">Web Development</option>
                <option value="data-science">Data Science</option>
                <option value="machine-learning">Machine Learning</option>
                <option value="cloud-computing">Cloud Computing</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="app-development">App Development</option>
                <option value="devops">DevOps</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows="3"
                placeholder="What does the mentee want to learn?"
                value={addMenteeData.description}
                onChange={(e) => setAddMenteeData({...addMenteeData, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Phase</label>
              <input type="text" value={currentPhaseId ? `Phase ${currentPhaseId}` : 'Loading...'} disabled className="phase-input" />
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowAddMenteeForm(false)}>Cancel</button>
              <button className="modal-submit" onClick={handleAddMentee} disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Mentee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this {deleteType}?
              {deleteType === 'assignment' && ' This will also reset mentor and mentee status to pending.'}
            </p>
            <div className="delete-confirm-actions">
              <button className="delete-confirm-yes" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button className="delete-confirm-no" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}