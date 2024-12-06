"use client"
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar'; // Import the Navbar component

const typingText = "Welcome to My App";

const HomePage = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [showTyping, setShowTyping] = useState(false); // State to control when to start typing animation

  useEffect(() => {
    // First, show "Hello All 👋"
    if (!showTyping) {
      setDisplayedText("Hello All 👋");
      setTimeout(() => {
        setShowTyping(true); // After "Hello All 👋", start typing animation
      }, 1500); // Adjust this time for how long the "Hello All 👋" message stays
    } else {
      // Start typing animation after "Hello All 👋"
      if (index < typingText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + typingText[index]);
          setIndex(index + 1);
        }, 150); // Adjust the typing speed here
        return () => clearTimeout(timeout);
      }
    }
  }, [index, showTyping]);

  return (
    <div style={{
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Navbar />  {/* Attach the Navbar */}
      <div style={{
        textAlign: 'center',
        position: 'relative',
        top: '50px', // Adjust to avoid overlap with the fixed navbar
      }}>
        <h1 style={{ fontSize: '3em' }}>
          {displayedText}
          <span style={{ opacity: index % 2 ? 1 : 0 }}>_</span>
        </h1>
      </div>
    </div>
  );
};

export default HomePage;

