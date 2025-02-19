"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, CardContent, Typography, TextField, LinearProgress, Box } from "@mui/material";
import { useIndexedDB } from "react-indexed-db-hook";


const quizData = [
  {
    type: "mcq",
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Earth", "Mars"],
    answer: 1,
  },
  {
    type: "mcq",
    question: "Which data structure organizes items in a FIFO manner?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    answer: 1,
  },
  {
    type: "mcq",
    question: "Which of the following is primarily used for structuring web pages?",
    options: ["Python", "Java", "HTML", "C++"],
    answer: 2,
  },
  {
    type: "mcq",
    question: "Which chemical symbol stands for Gold?",
    options: ["Au", "Gd", "Ag", "Pt"],
    answer: 0,
  },
  {
    type: "mcq",
    question: "Which of these processes is not typically involved in refining petroleum?",
    options: ["Fractional distillation", "Cracking", "Polymerization", "Filtration"],
    answer: 3,
  },
  {
    type: "integer",
    question: "What is the value of 12 + 28?",
    answer: 40,
  },
  {
    type: "integer",
    question: "How many states are there in the United States?",
    answer: 50,
  },
  {
    type: "integer",
    question: "In which year was the Declaration of Independence signed?",
    answer: 1776,
  },
  {
    type: "integer",
    question: "What is the value of pi rounded to the nearest integer?",
    answer: 3,
  },
  {
    type: "integer",
    question: "If a car travels at 60 mph for 2 hours, how many miles does it travel?",
    answer: 120,
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { add } = useIndexedDB("quizAttempts");

  const handleIntegerSubmit = useCallback(() => {
    const correctAnswer = quizData[currentQuestion].answer;
    if (parseInt(userInput, 10) === correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  }, [currentQuestion, userInput]);

  const handleNext = useCallback(() => {
    if (quizData[currentQuestion].type === "integer") {
      handleIntegerSubmit();
    }

    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setUserInput("");
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
      add({ score: score });
    }
  }, [currentQuestion, handleIntegerSubmit, add, score]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleNext();
    }
  }, [timeLeft, handleNext]);

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 3 }}>
      {!quizCompleted ? (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Question {currentQuestion + 1}
            </Typography>
            <Typography variant="body1">{quizData[currentQuestion].question}</Typography>

            {quizData[currentQuestion].type === "mcq" ? (
              <Box mt={2}>
                {quizData[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "contained" : "outlined"}
                    color={selectedAnswer === index ? "primary" : "inherit"}
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => setSelectedAnswer(index)}
                    disabled={selectedAnswer !== null}
                  >
                    {option}
                  </Button>
                ))}
              </Box>
            ) : (
              <Box mt={2}>
                <TextField
                  fullWidth
                  label="Your Answer"
                  variant="outlined"
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </Box>
            )}

            <LinearProgress variant="determinate" value={(timeLeft / 30) * 100} sx={{ mt: 3 }} />
            <Typography variant="body2" align="right" mt={1}>
              Time Left: {timeLeft}s
            </Typography>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleNext}
              disabled={quizData[currentQuestion].type === "mcq" && selectedAnswer === null}
            >
              Next
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Quiz Completed!
            </Typography>
            <Typography variant="h6">
              Your Score: {score}/{quizData.length}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Quiz;