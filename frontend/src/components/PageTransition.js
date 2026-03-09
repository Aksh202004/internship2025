import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fade-in');

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage('fade-out');
    }
  }, [children, displayChildren]);

  const handleAnimationEnd = () => {
    if (transitionStage === 'fade-out') {
      setDisplayChildren(children);
      setTransitionStage('fade-in');
    }
  };

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
      key={location.pathname}
    >
      {transitionStage === 'fade-out' ? displayChildren : children}
    </div>
  );
};

export default PageTransition;
