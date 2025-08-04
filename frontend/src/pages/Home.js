// frontend/src/pages/Home.js
import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Recycle, Truck, BarChart3, Leaf, ArrowRight, Users, MapPin, TrendingUp } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background"></div>
          <Container className="hero-content">
            <Row className="align-items-center min-vh-100">
              <Col lg={6}>
                <div className="hero-text">
                  <h1 className="hero-title">
                    Smart Waste Management
                    <span className="text-gradient"> for Tomorrow's Cities</span>
                  </h1>
                  <p className="hero-subtitle">
                    Revolutionize your city's waste management with our IoT-powered smart solutions. 
                    Reduce costs by 30%, improve efficiency, and create a cleaner, more sustainable urban environment.
                  </p>
                  <div className="hero-buttons">
                    <Button className="btn-primary-custom me-3" size="lg">
                      <Users className="me-2" size={20} />
                      Get Started Today
                    </Button>
                    <Button variant="outline-light" size="lg">
                      <ArrowRight className="me-2" size={20} />
                      Watch Demo
                    </Button>
                  </div>
                  <div className="hero-stats mt-4">
                    <div className="stat-item">
                      <span className="stat-number">500+</span>
                      <span className="stat-label">Cities</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">1M+</span>
                      <span className="stat-label">Bins Monitored</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">30%</span>
                      <span className="stat-label">Cost Reduction</span>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="hero-image">
                  <div className="floating-card">
                    <Recycle size={40} className="text-success mb-2" />
                    <h6>Smart Collection</h6>
                    <p className="small text-muted">Real-time monitoring</p>
                  </div>
                  <div className="floating-card delay-1">
                    <BarChart3 size={40} className="text-info mb-2" />
                    <h6>Analytics</h6>
                    <p className="small text-muted">Data-driven insights</p>
                  </div>
                  <div className="floating-card delay-2">
                    <Leaf size={40} className="text-warning mb-2" />
                    <h6>Eco-Friendly</h6>
                    <p className="small text-muted">Sustainable solutions</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Key Features */}
        <section className="features-section py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="section-title">Powerful Features</h2>
              <p className="section-subtitle">
                Comprehensive solutions for modern waste management challenges
              </p>
            </div>
            <Row>
              <Col lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center p-4">
                    <div className="feature-icon mb-3">
                      <Truck size={48} />
                    </div>
                    <h4>Smart Collection Routes</h4>
                    <p className="text-muted">
                      AI-powered route optimization reduces fuel consumption and collection time by up to 40%.
                    </p>
                    <div className="feature-highlight">
                      <TrendingUp size={20} className="me-2" />
                      40% Efficiency Boost
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center p-4">
                    <div className="feature-icon mb-3">
                      <BarChart3 size={48} />
                    </div>
                    <h4>Real-time Analytics</h4>
                    <p className="text-muted">
                      Advanced dashboards provide actionable insights for better decision-making and city planning.
                    </p>
                    <div className="feature-highlight">
                      <MapPin size={20} className="me-2" />
                      Live Monitoring
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center p-4">
                    <div className="feature-icon mb-3">
                      <Leaf size={48} />
                    </div>
                    <h4>Sustainability Focus</h4>
                    <p className="text-muted">
                      Promote recycling, reduce carbon footprint, and support environmental conservation goals.
                    </p>
                    <div className="feature-highlight">
                      <Recycle size={20} className="me-2" />
                      Green Initiative
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Statistics Section */}
        <section className="stats-section py-5">
          <Container>
            <Row className="text-center">
              <Col lg={3} md={6} className="mb-4">
                <div className="stat-card">
                  <h3 className="stat-number">98%</h3>
                  <p className="stat-label">Uptime Guarantee</p>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <div className="stat-card">
                  <h3 className="stat-number">2.5M</h3>
                  <p className="stat-label">Tons Recycled</p>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <div className="stat-card">
                  <h3 className="stat-number">150+</h3>
                  <p className="stat-label">Partner Cities</p>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <div className="stat-card">
                  <h3 className="stat-number">24/7</h3>
                  <p className="stat-label">Support Available</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Benefits */}
        <section className="benefits-section py-5">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4">
                <h2 className="section-title">Why Choose Our Platform?</h2>
                <p className="section-subtitle mb-4">
                  Transform your city's waste management with proven results and cutting-edge technology.
                </p>
                <div className="benefit-list">
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <ArrowRight size={20} />
                    </div>
                    <div className="benefit-content">
                      <h5>Reduce Operational Costs</h5>
                      <p className="text-muted">
                        Cut expenses by 30% with optimized routes and predictive maintenance.
                      </p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <ArrowRight size={20} />
                    </div>
                    <div className="benefit-content">
                      <h5>Improve City Cleanliness</h5>
                      <p className="text-muted">
                        Prevent overflowing bins and maintain pristine urban environments.
                      </p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <ArrowRight size={20} />
                    </div>
                    <div className="benefit-content">
                      <h5>Environmental Impact</h5>
                      <p className="text-muted">
                        Significantly reduce carbon emissions and promote recycling initiatives.
                      </p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <ArrowRight size={20} />
                    </div>
                    <div className="benefit-content">
                      <h5>Smart City Integration</h5>
                      <p className="text-muted">
                        Seamlessly integrate with existing smart city infrastructure and systems.
                      </p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="benefits-visual">
                  <div className="benefit-card primary">
                    <Truck size={30} className="mb-2" />
                    <h6>Smart Routes</h6>
                    <p>AI-optimized collection</p>
                  </div>
                  <div className="benefit-card secondary">
                    <BarChart3 size={30} className="mb-2" />
                    <h6>Live Data</h6>
                    <p>Real-time monitoring</p>
                  </div>
                  <div className="benefit-card tertiary">
                    <Leaf size={30} className="mb-2" />
                    <h6>Eco-Friendly</h6>
                    <p>Sustainable practices</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Call to Action */}
        <section className="cta-section py-5">
          <Container>
            <div className="cta-content text-center">
              <h2 className="cta-title">Ready to Transform Your City?</h2>
              <p className="cta-subtitle">
                Join hundreds of cities already benefiting from our smart waste management solutions.
                Start your journey towards a cleaner, more efficient future today.
              </p>
              <div className="cta-buttons">
                <Button className="btn-primary-custom me-3" size="lg">
                  <Users className="me-2" size={20} />
                  Start Free Trial
                </Button>
                <Button variant="outline-primary" size="lg">
                  <ArrowRight className="me-2" size={20} />
                  Schedule Demo
                </Button>
              </div>
            </div>
          </Container>
        </section>        
      </main>
    </div>
  );
};

export default Home;
