import React from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';
import { Recycle, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer-modern">
      {/* Newsletter Section */}
      <section className="newsletter-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="newsletter-content">
                <h3 className="newsletter-title">
                  <Mail className="me-2" size={28} />
                  Stay Updated with Smart Waste Solutions
                </h3>
                <p className="newsletter-subtitle">
                  Get the latest updates on eco-friendly waste management and sustainability tips.
                </p>
              </div>
            </Col>
            <Col lg={6}>
              <Form className="newsletter-form">
                <div className="input-group-modern">
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    className="newsletter-input"
                  />
                  <Button className="newsletter-btn">
                    Subscribe
                    <Mail size={16} className="ms-1" />
                  </Button>
                </div>
                <small className="newsletter-disclaimer">
                  By subscribing, you agree to our <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.
                </small>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main Footer Content */}
      <div className="footer-main">
        <Container>
          <Row>
            {/* Company Info */}
            <Col lg={4} md={6} className="mb-4">
              <div className="footer-brand">
                <div className="brand-logo-footer">
                  <div className="logo-icon-footer">
                    <Recycle size={24} />
                  </div>
                  <span className="brand-text-footer">TrashMate</span>
                </div>
                <p className="footer-description">
                  Revolutionizing waste management with smart technology. 
                  Creating cleaner, more efficient cities for a sustainable future.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="social-link">
                    <Twitter size={18} />
                  </a>
                  <a href="#" className="social-link">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="social-link">
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h5 className="footer-title">Services</h5>
                <Nav className="footer-nav flex-column">
                  <Nav.Link href="#" className="footer-link">Waste Collection</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Route Optimization</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Smart Bins</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Analytics</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Recycling</Nav.Link>
                </Nav>
              </div>
            </Col>

            {/* Company Links */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h5 className="footer-title">Company</h5>
                <Nav className="footer-nav flex-column">
                  <Nav.Link href="#" className="footer-link">About Us</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Careers</Nav.Link>
                  <Nav.Link href="#" className="footer-link">News</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Contact</Nav.Link>
                  <Nav.Link href="#" className="footer-link">Support</Nav.Link>
                </Nav>
              </div>
            </Col>

            {/* Contact Info */}
            <Col lg={4} md={6} className="mb-4">
              <div className="footer-section">
                <h5 className="footer-title">Contact Us</h5>
                <div className="contact-info">
                  <div className="contact-item">
                    <MapPin size={16} className="contact-icon" />
                    <span>123 Green Street, Eco City, EC 12345</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} className="contact-icon" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={16} className="contact-icon" />
                    <span>hello@trashmate.com</span>
                  </div>
                </div>
                <div className="business-hours">
                  <h6 className="hours-title">Business Hours</h6>
                  <p className="hours-text">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="hours-text">Saturday: 9:00 AM - 4:00 PM</p>
                  <p className="hours-text">Sunday: Closed</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="copyright-text">
                © 2024 TrashMate. All rights reserved. Made with <Heart size={14} className="heart-icon" /> for a cleaner planet.
              </p>
            </Col>
            <Col md={6}>
              <Nav className="footer-bottom-nav justify-content-md-end">
                <Nav.Link href="#" className="footer-bottom-link">Privacy Policy</Nav.Link>
                <Nav.Link href="#" className="footer-bottom-link">Terms of Service</Nav.Link>
                <Nav.Link href="#" className="footer-bottom-link">Cookie Policy</Nav.Link>
                <Nav.Link href="#" className="footer-bottom-link">Sitemap</Nav.Link>
              </Nav>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}
