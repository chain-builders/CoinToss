import { useState, useEffect, useCallback } from "react";

export const useTimer = (initialTime: number, onTimerEnd?: () => void) => {
  const [timer, setTimer] = useState(initialTime);
  const [isTimerActive, setIsTimerActive] = useState(false);

 
  const startTimer = useCallback(() => {
    setIsTimerActive(true);
  }, []);

 
  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
  }, []);

 
  const resetTimer = useCallback((newTime: number) => {
    setTimer(newTime);
    setIsTimerActive(true);
  }, []);

  
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000); 
      return () => clearInterval(interval);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
      onTimerEnd?.();
    }
  }, [isTimerActive, timer, onTimerEnd]);

  return { timer, isTimerActive, startTimer, stopTimer, resetTimer };
};



// This should be inside your component
export const checkPreviousSubmission = useCallback((address,pool,setGameState,gameState,setHasLocalSubmission) => {
  if (!address || !pool?.id) return false;
  
  const storageKey = `cointoss_submission_${address}_${pool.id}_${gameState.round}`;
  const savedSubmission = localStorage.getItem(storageKey);
  
  if (savedSubmission) {
    try {
      const submission = JSON.parse(savedSubmission);
      if (submission.round === gameState.round) {
        setGameState((prevState) => ({
          ...prevState,
          selectedChoice: submission.choice,
          hasSubmitted: true
        }));
        setHasLocalSubmission(true);
        return true;
      }
    } catch (error) {
      console.error("Error parsing saved submission:", error);
    }
  }
  return false;
}, [address, pool?.id, gameState.round, setGameState, setHasLocalSubmission]);

// Function to save submission to local storage
exportconst saveSubmissionToLocalStorage = (choice: PlayerChoice) => {
  if (!address || !pool?.id) return;
  
  const storageKey = `cointoss_submission_${address}_${pool.id}_${gameState.round}`;
  const submission = {
    choice,
    round: gameState.round,
    timestamp: Date.now()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(submission));
  setHasLocalSubmission(true);
};