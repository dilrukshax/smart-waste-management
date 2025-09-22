// src/components/Header.js

import React, { useContext, useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, User, LogOut, Settings, Bell, Menu } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem('authData');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar expand="lg" className="navbar-custom" fixed="top" variant="dark">
      <Container>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/" onClick={closeMobileMenu} className="brand-logo">
          <div className="logo-container">
            <Recycle size={28} className="logo-icon" />
            <span className="brand-text">TrashMate</span>
          </div>
        </Navbar.Brand>

        {/* Mobile Menu Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={toggleMobileMenu} className="custom-toggler">
          <Menu size={24} />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {auth.user ? (
              <>
                {/* Navigation Links */}
                <div className="nav-links-container">
                  {auth.user.role === 'admin' && (
                    <>
                      <Nav.Link
                        as={Link}
                        to="/admin-dashboard"
                        className={`nav-link-custom ${isActive('/admin-dashboard') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/admin/users"
                        className={`nav-link-custom ${isActive('/admin/users') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        Users
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/admin/charts"
                        className={`nav-link-custom ${isActive('/admin/charts') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        Analytics
                      </Nav.Link>
                    </>
                  )}
                  {auth.user.role === 'garbageCollector' && (
                    <>
                      <Nav.Link
                        as={Link}
                        to="/garbage-collector-dashboard"
                        className={`nav-link-custom ${isActive('/garbage-collector-dashboard') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/collector/assigned-users"
                        className={`nav-link-custom ${isActive('/collector/assigned-users') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        Assigned Users
                      </Nav.Link>
                    </>
                  )}
                  {auth.user.role === 'user' && (
                    <>
                      <Nav.Link
                        as={Link}
                        to="/user/invoices"
                        className={`nav-link-custom ${isActive('/user/invoices') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        View Invoices
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/create-request"
                        className={`nav-link-custom ${isActive('/create-request') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        Request Waste Collection
                      </Nav.Link>
                    </>
                  )}
                </div>

                {/* User Actions */}
                <div className="user-actions">
                  {/* Notifications */}
                  <Button variant="link" className="notification-btn">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                  </Button>

                  {/* User Profile Dropdown */}
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="user-dropdown" id="user-dropdown">
                      <div className="user-avatar">
                        <User size={20} />
                      </div>
                      <span className="user-name">{auth.user.name || auth.user.email}</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="user-dropdown-menu">
                      <Dropdown.Item as={Link} to="/profile" onClick={closeMobileMenu}>
                        <User size={16} className="me-2" />
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <Settings size={16} className="me-2" />
                        Settings
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => { logout(); closeMobileMenu(); }} className="logout-item">
                        <LogOut size={16} className="me-2" />
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </>
            ) : (
              /* Guest Navigation */
              <div className="guest-actions">
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={`nav-link-custom ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline-light"
                  className="register-btn"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
