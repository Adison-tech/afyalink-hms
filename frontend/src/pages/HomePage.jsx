import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import patientDataImage from '../assets/patientdata.webp';
import dataSecurityImage from '../assets/data-security.webp';
import auditTrailsImage from '../assets/audit-trails.webp';
import appointmentSchedulingImage from '../assets/appointment -scheduling.webp';
import billingInvoicingImage from '../assets/billing-&-invoicing.webp';
import digitalPatientRecordsImage from '../assets/digital-patient-records.webp';
import afyalinkLogo from '../assets/afyalink-logo.svg';
import '/src/footer.css';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const heroTextVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 10,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeIn",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
};

const iconCircleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 10,
      delay: 0.1,
    },
  },
};


function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for scrolling to sections
  const featuresRef = useRef(null);
  const contactRef = useRef(null);

  // Scroll animations for hero background shapes
  const { scrollYProgress } = useScroll();
  const shapeY1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const shapeY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const shapeScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);


  const handleGetStartedClick = () => {
    navigate('/login');
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // toggle mobile menu
  const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // State to manage sticky navbar
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        setIsSticky(window.scrollY > navRef.current.offsetHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <AnimatePresence>
      <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
        {/* Sticky Navbar */}
        <nav
          ref={navRef}
          className={`w-full py-2 sm:py-0 z-50 transition-all duration-300 ${
            isSticky ? 'fixed top-0 bg-white shadow-lg' : 'relative bg-white shadow-md'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center">
            {/* Logo and Mobile Menu Button Container */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                  <img src={afyalinkLogo} alt="AfyaLink HMS Logo" className="h-20 sm:h-24 w-auto" />
              </Link>
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="sm:hidden text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  // Close Icon (X)
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                  // Hamburger Icon
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                )}
              </button>
            </div>

            {/* Navigation Links - Conditional Visibility */}
            <div
              className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 w-full sm:w-auto mt-4 sm:mt-0 py-2 sm:py-0 bg-white sm:bg-transparent shadow-md sm:shadow-none rounded-b-lg`}
            >
              <button onClick={() => { scrollToSection(featuresRef); setIsMobileMenuOpen(false); }} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-2 py-2 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base w-full text-center">Features</button>
              <button onClick={() => { scrollToSection(contactRef); setIsMobileMenuOpen(false); }} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-2 py-2 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base w-full text-center">Contact Us</button>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-2 py-2 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base w-full text-center">Login</Link>
              {user && (
                 <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-2 py-2 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base w-full text-center">Dashboard</Link>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.section
          className="relative bg-gradient-to-br from-blue-100 to-indigo-200 py-20 md:py-32 overflow-hidden flex items-center min-h-[70vh]" // Added min-h and flex for centering
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Background Shapes */}
          <motion.div
            className="absolute inset-0 z-0 opacity-20"
          >
            <motion.svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 1600 900"
              xmlns="http://www.w3.org/2000/svg"
              style={{ y: shapeY1, scale: shapeScale }}
            >
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c3dafe" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <circle cx="800" cy="450" r="300" fill="url(#gradient1)" opacity="0.5" />
            </motion.svg>
             <motion.svg
              className="absolute inset-0 w-full h-full"
              fill="none"
              viewBox="0 0 1600 900"
              xmlns="http://www.w3.org/2000/svg"
              style={{ y: shapeY2, scale: shapeScale }}
            >
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#81E6D9" /> {/* Teal-ish color */}
                  <stop offset="100%" stopColor="#7F9CF5" /> {/* Lighter blue */}
                </linearGradient>
              </defs>
              <circle cx="200" cy="700" r="150" fill="url(#gradient2)" opacity="0.4" />
              <circle cx="1400" cy="200" r="250" fill="url(#gradient2)" opacity="0.3" />
            </motion.svg>
          </motion.div>

          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-16 sm:py-20 md:py-24"> {/* Adjusted vertical padding */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 mb-4" // Adjusted font sizes
              variants={heroTextVariants}
            >
              Revolutionize Healthcare with
              <span className="text-blue-600 block md:inline-block"> AfyaLink HMS</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed px-2" // Added horizontal padding for small screens
              variants={heroTextVariants}
            >
              A cutting-edge Hospital Management System designed to streamline operations, enhance patient care, and ensure robust data security for modern healthcare facilities.
            </motion.p>
            <motion.button
              onClick={handleGetStartedClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 sm:px-10 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 relative overflow-hidden group w-full sm:w-auto" // Full width on small, auto on larger
              variants={heroTextVariants}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            </motion.button>
          </div>
        </motion.section>

        {/* Why Choose Us Section */}
        <motion.section
          className="py-16 md:py-24 bg-gray-100"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"> {/* Added more responsive padding */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 sm:mb-16"> {/* Adjusted margin-bottom */}
              Why Choose AfyaLink HMS?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"> {/* Adjusted gap for different screen sizes */}
              {/* Card 1: Efficiency */}
              <motion.div
                variants={cardVariants}
                className="flex flex-col items-center p-6 sm:p-8 bg-white rounded-xl shadow-lg border-b-4 border-teal-500 hover:shadow-xl transition-shadow duration-300" // Adjusted padding
              >
                <motion.div
                  className="bg-teal-100 text-teal-600 p-4 sm:p-5 rounded-full mb-4 sm:mb-6 shadow-md" // Adjusted padding
                  variants={iconCircleVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.6 }}
                >
                  {/* Placeholder icon: Replace with actual SVG or component */}
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Unmatched Efficiency</h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Streamline workflows, reduce administrative burden, and optimize resource allocation across all departments for peak performance.
                </p>
              </motion.div>

              {/* Card 2: Reliability */}
              <motion.div
                variants={cardVariants}
                className="flex flex-col items-center p-6 sm:p-8 bg-white rounded-xl shadow-lg border-b-4 border-orange-500 hover:shadow-xl transition-shadow duration-300"
              >
                <motion.div
                  className="bg-orange-100 text-orange-600 p-4 sm:p-5 rounded-full mb-4 sm:mb-6 shadow-md"
                  variants={iconCircleVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.6 }}
                >
                  {/* Placeholder icon: Replace with actual SVG or component */}
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.944 12c-.047.794.032 1.583.238 2.362a11.968 11.968 0 003.04 8.618 12.001 12.001 0 0017.034-17.034z"></path></svg>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Unwavering Reliability</h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Experience consistent, high-performance operation with near 100% uptime, ensuring your critical services are always available.
                </p>
              </motion.div>

              {/* Card 3: Security */}
              <motion.div
                variants={cardVariants}
                className="flex flex-col items-center p-6 sm:p-8 bg-white rounded-xl shadow-lg border-b-4 border-blue-500 hover:shadow-xl transition-shadow duration-300"
              >
                <motion.div
                  className="bg-blue-100 text-blue-600 p-4 sm:p-5 rounded-full mb-4 sm:mb-6 shadow-md"
                  variants={iconCircleVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.6 }}
                >
                  {/* Placeholder icon: Replace with actual SVG or component */}
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Top-tier Security</h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Safeguard sensitive patient data with state-of-the-art encryption, multi-factor authentication, and robust security protocols.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          ref={featuresRef}
          className="py-16 md:py-24 bg-white"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12 sm:mb-16"> {/* Adjusted margin-bottom */}
              Explore Our Comprehensive Features
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10" // Adjusted gap
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Feature 1: Digital Patient Records */}
              <motion.div
                className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-7 text-center border-t-4 border-blue-600 hover:shadow-xl transition-shadow duration-300 group" // Adjusted padding
                variants={cardVariants}
                whileHover={{ y: -5 }} // Subtle lift on hover
              >
                <img src={digitalPatientRecordsImage} alt="Digital Patient Records" className="w-full h-40 sm:h-48 object-cover rounded-md mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" /> {/* Adjusted height and margin */}
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-2">Digital Patient Records</h3>
                <p className="text-base sm:text-base text-gray-700 leading-relaxed">
                  Securely store and manage comprehensive patient medical history, diagnoses, treatments, and prescriptions in one centralized, accessible system.
                </p>
              </motion.div>

              {/* Feature 2: Appointment Scheduling */}
              <motion.div
                className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-7 text-center border-t-4 border-green-600 hover:shadow-xl transition-shadow duration-300 group"
                variants={cardVariants}
                whileHover={{ y: -5 }}
              >
                <img src={appointmentSchedulingImage} alt="Appointment Scheduling" className="w-full h-40 sm:h-48 object-cover rounded-md mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-2">Efficient Appointment Scheduling</h3>
                <p className="text-base sm:text-base text-gray-700 leading-relaxed">
                  Streamline appointment booking, rescheduling, and cancellations with an intuitive calendar and automated reminders for both staff and patients.
                </p>
              </motion.div>

              {/* Feature 3: Billing and Invoicing */}
              <motion.div
                className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-7 text-center border-t-4 border-purple-600 hover:shadow-xl transition-shadow duration-300 group"
                variants={cardVariants}
                whileHover={{ y: -5 }}
              >
                <img src={billingInvoicingImage} alt="Billing and Invoicing" className="w-full h-40 sm:h-48 object-cover rounded-md mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-2">Integrated Billing & Invoicing</h3>
                <p className="text-base sm:text-base text-gray-700 leading-relaxed">
                  Automate billing processes, generate accurate invoices, and manage payments with seamless integration for financial transparency.
                </p>
              </motion.div>

              {/* Feature 4: Data Security */}
              <motion.div
                className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-7 text-center border-t-4 border-red-600 hover:shadow-xl transition-shadow duration-300 group"
                variants={cardVariants}
                whileHover={{ y: -5 }}
              >
                <img src={dataSecurityImage} alt="Data Security" className="w-full h-40 sm:h-48 object-cover rounded-md mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-2">Robust Data Security</h3>
                <p className="text-base sm:text-base text-gray-700 leading-relaxed">
                  Protect sensitive patient information with advanced encryption, strict access controls, and regular backups, ensuring HIPAA compliance.
                </p>
              </motion.div>

              {/* Feature 5: Audit Trails */}
              <motion.div
                className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-7 text-center border-t-4 border-orange-600 hover:shadow-xl transition-shadow duration-300 group"
                variants={cardVariants}
                whileHover={{ y: -5 }}
              >
                <img src={auditTrailsImage} alt="Audit Trails" className="w-full h-40 sm:h-48 object-cover rounded-md mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-2">Comprehensive Audit Trails</h3>
                <p className="text-base sm:text-base text-gray-700 leading-relaxed">
                  Maintain detailed, immutable logs of all system activities, providing transparency and accountability for every action performed.
                </p>
              </motion.div>

              {/* Feature 6: Reporting and Analytics */}
              <motion.div
                className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-7 text-center border-t-4 border-indigo-700 hover:shadow-xl transition-shadow duration-300 group"
                variants={cardVariants}
                whileHover={{ y: -5 }}
              >
                <img src={patientDataImage} alt="Reporting and Analytics" className="w-full h-40 sm:h-48 object-cover rounded-md mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105" />
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 mb-2">Advanced Reporting & Analytics</h3>
                <p className="text-base sm:text-base text-gray-700 leading-relaxed">
                  Gain actionable insights into hospital performance, patient demographics, and financial trends with customizable reports and dashboards.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          className="py-16 md:py-24 bg-gradient-to-br from-blue-700 to-purple-800 text-white relative overflow-hidden"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="15" opacity="0.3"></circle>
                    <circle cx="80" cy="80" r="20" opacity="0.2"></circle>
                    <circle cx="50" cy="10" r="10" opacity="0.4"></circle>
                </svg>
            </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"> {/* Added responsive padding */}
            <h2 className="text-3xl md:text-4xl font-extrabold mb-10 sm:mb-12 text-white"> {/* Adjusted margin-bottom */}
              What Our Valued Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10"> {/* Adjusted gap */}
              <motion.div
                variants={cardVariants}
                className="bg-white text-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border-l-4 border-teal-400 transform transition-all duration-300 hover:scale-[1.02]" // Adjusted padding
              >
                <p className="text-base sm:text-lg italic mb-5 sm:mb-6 relative"> {/* Adjusted font size and margin */}
                    <span className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 text-5xl sm:text-6xl text-gray-300 opacity-75 font-serif">“</span> {/* Adjusted size and position */}
                  AfyaLink HMS has truly revolutionized our clinic's operations. The efficiency gains are tremendous, and patient management has never been smoother. Highly recommended!
                </p>
                <div className="text-right">
                    <p className="font-semibold text-blue-700 text-sm sm:text-base">- Dr. Emily White</p> {/* Adjusted font size */}
                    <p className="text-xs sm:text-sm text-gray-600">Chief Medical Officer, City General Hospital</p> {/* Adjusted font size */}
                </div>
              </motion.div>
              <motion.div
                variants={cardVariants}
                className="bg-white text-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border-l-4 border-orange-400 transform transition-all duration-300 hover:scale-[1.02]"
              >
                <p className="text-base sm:text-lg italic mb-5 sm:mb-6 relative">
                    <span className="absolute -top-3 -left-3 sm:-top-4 -sm:left-4 text-5xl sm:text-6xl text-gray-300 opacity-75 font-serif">“</span>
                  The robust security features of AfyaLink HMS give us peace of mind knowing our patient data is always protected. Their support team is also incredibly responsive and helpful.
                </p>
                <div className="text-right">
                    <p className="font-semibold text-blue-700 text-sm sm:text-base">- Mr. John Davis</p>
                    <p className="text-xs sm:text-sm text-gray-600">IT Director, Metro Healthcare Solutions</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Contact Us Section - NEW */}
        <motion.section
          ref={contactRef}
          className="py-16 md:py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-10 sm:mb-12"> {/* Adjusted margin-bottom */}
              Get in Touch
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2"> {/* Adjusted margin-bottom and added horizontal padding */}
              Have questions or want to request a demo? Fill out the form below, and our team will get back to you shortly.
            </p>

            <motion.form
              className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200" // Adjusted padding
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div variants={itemVariants} className="mb-4 sm:mb-6"> {/* Adjusted margin-bottom */}
                <label htmlFor="name" className="block text-gray-800 text-sm font-semibold mb-1 sm:mb-2">Your Name</label> {/* Adjusted margin-bottom */}
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base sm:text-base" // Adjusted padding and font size
                  placeholder="John Doe"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                <label htmlFor="email" className="block text-gray-800 text-sm font-semibold mb-1 sm:mb-2">Your Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base sm:text-base"
                  placeholder="john.doe@example.com"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                <label htmlFor="subject" className="block text-gray-800 text-sm font-semibold mb-1 sm:mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base sm:text-base"
                  placeholder="Inquiry about AfyaLink HMS"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="mb-6 sm:mb-8"> {/* Adjusted margin-bottom */}
                <label htmlFor="message" className="block text-gray-800 text-sm font-semibold mb-1 sm:mb-2">Your Message</label>
                <textarea
                  id="message"
                  rows="5"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out"
                  placeholder="Type your message here..."
                ></textarea>
              </motion.div>
              <motion.button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-md transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75" // Adjusted padding
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </motion.form>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-gray-800 py-8 sm:py-12 footer-text-visible"> {/* Adjusted vertical padding */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-6 text-center md:text-left"> {/* Adjusted padding and gap, added text alignment for small screens */}
            {/* Company Info */}
            <div className="col-span-full md:col-span-1"> {/* Take full width on small, then one column */}
              <h3 className="text-xl sm:text-2xl font-source-sans-pro-bold mb-3 sm:mb-4 footer-text-visible">AfyaLink HMS</h3> {/* Adjusted font size and margin */}
              <p className="text-sm leading-relaxed footer-text-visible mb-4">
                AfyaLink HMS is a comprehensive Hospital Management System designed to streamline healthcare operations.
              </p>
              <div className="flex justify-center md:justify-start space-x-4"> {/* Centered on small, left-aligned on medium+ */}
                {/* Social Media Icons */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="Facebook">
                  <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="Twitter">
                  <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="LinkedIn">
                  <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" ><path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2" stroke="none"></circle></svg>
                </a>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h3 className="text-lg sm:text-xl font-source-sans-pro-bold mb-3 sm:mb-4 footer-text-visible">Quick Links</h3> {/* Adjusted font size and margin */}
              <ul className="space-y-1.5 sm:space-y-2"> {/* Adjusted space-y */}
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">About Us</a></li> {/* Adjusted font size */}
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Terms of Service</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h3 className="text-lg sm:text-xl font-source-sans-pro-bold mb-3 sm:mb-4 footer-text-visible">Resources</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 footer-link-hover text-sm">Support</a></li>
              </ul>
            </div>
            {/* Contact Info (not the form) */}
            <div>
              <h3 className="text-lg sm:text-xl font-source-sans-pro-bold mb-3 sm:mb-4 footer-text-visible">Contact Info</h3>
              <p className="text-sm leading-relaxed text-gray-400">\
                123 Healthcare Avenue, Suite 400<br />
                MedCity, Healthland 90210<br />
                Email: info@afyalinkhms.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400"> {/* Adjusted padding and font size */}
            &copy; {new Date().getFullYear()} AfyaLink HMS. All rights reserved.
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
}

export default HomePage;