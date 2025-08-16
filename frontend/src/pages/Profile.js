import React, { useState, useEffect, useContext } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase'; // Import Firebase storage
import { API_CONFIG } from '../config/api';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Upload, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Edit3,
  Image as ImageIcon,
  UserCircle
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');
  const [error, setError] = useState('');
  const { auth } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalUserInfo, setOriginalUserInfo] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(API_CONFIG.AUTH.PROFILE, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setUserInfo(res.data);
        setOriginalUserInfo(res.data);
        if (res.data.profilePicUrl) {
          setDownloadURL(res.data.profilePicUrl);
        }
      } catch (err) {
        setError('Error fetching user info');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (auth.token) {
      fetchUserInfo();
    }
  }, [auth.token]);

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    setError(''); // Clear errors when user starts typing
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const preview = URL.createObjectURL(droppedFile);
      setPreviewUrl(preview);
      setError('');
    } else {
      setError('Please drop a valid image file');
    }
  };

  const validateForm = () => {
    if (!userInfo.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!userInfo.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file first!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const storageRef = ref(storage, `profile-photos/${auth.user.id}-${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setError('Error uploading the file: ' + error.message);
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);
          setError('');
          setSuccessMessage('Photo uploaded successfully!');
          setIsUploading(false);
          setUploadProgress(0);
          setFile(null);
          setPreviewUrl('');
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const updatedProfile = { ...userInfo, profilePicUrl: downloadURL };
      const res = await axios.put(API_CONFIG.AUTH.PROFILE, updatedProfile, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setSuccessMessage('Profile updated successfully!');
      setOriginalUserInfo(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUserInfo(originalUserInfo);
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const hasChanges = () => {
    return JSON.stringify(userInfo) !== JSON.stringify(originalUserInfo);
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">Manage your account information and preferences</p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert" aria-live="polite">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="profile-content">
          
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="picture-card">
              <div className="picture-header">
                <h3>Profile Picture</h3>
                <p>Upload a photo to personalize your account</p>
              </div>
              
              <div className="picture-content">
                <div className="current-picture">
                  {downloadURL || previewUrl ? (
                    <img
                      src={previewUrl || downloadURL}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <div className="placeholder-image">
                      <UserCircle size={80} />
                    </div>
                  )}
                </div>

                <div 
                  className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="upload-content">
                    <Camera size={40} />
                    <h4>Drop your photo here</h4>
                    <p>or click to browse</p>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      accept="image/*"
                      className="file-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="file-label">
                      Choose File
                    </label>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && isUploading && (
                  <div className="upload-progress">
                    <div className="progress-info">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {file && !isUploading && (
                  <button 
                    className="upload-button"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    <Upload size={18} />
                    Upload Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="profile-info-section">
            <div className="info-card">
              <div className="info-header">
                <div className="header-left">
                  <h3>Personal Information</h3>
                  <p>Update your personal details below</p>
                </div>
                <div className="header-right">
                  {!isEditing && (
                    <button 
                      className="edit-button"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                
                <div className="form-grid">
                  
                  <div className="input-group">
                    <label className="input-label" htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} />
                      <input 
                        id="name"
                        type="text" 
                        name="name" 
                        value={userInfo.name || ''} 
                        onChange={handleInputChange} 
                        placeholder="Enter your full name" 
                        required 
                        className="input-field"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={18} />
                      <input 
                        id="email"
                        type="email" 
                        name="email" 
                        value={userInfo.email || ''} 
                        onChange={handleInputChange} 
                        placeholder="Enter your email" 
                        required 
                        className="input-field"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="phoneNumber">Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={18} />
                      <input 
                        id="phoneNumber"
                        type="tel" 
                        name="phoneNumber" 
                        value={userInfo.phoneNumber || ''} 
                        onChange={handleInputChange} 
                        placeholder="Enter your phone number" 
                        className="input-field"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="form-actions">
                    <button 
                      type="button"
                      className="cancel-button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={`save-button ${isLoading ? 'loading' : ''}`}
                      disabled={isLoading || !hasChanges()}
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner-large"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
