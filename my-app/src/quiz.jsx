"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  LinearProgress, 
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert
} from "@mui/material";
import { Timer, Calculate, Refresh } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { initDB, useIndexedDB } from "react-indexed-db-hook";

// Database configuration
const dbConfig = {
  name: "QuizDatabase",
  version: 1,
  objectStoresMeta: [
    {
      store: "quizAttempts",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "score", keypath: "score", options: { unique: false } },
        { name: "timestamp", keypath: "timestamp", options: { unique: false } },
        { name: "totalQuestions", keypath: "totalQuestions", options: { unique: false } }
      ],
    },
  ],
};

// Initialize DB
(async () => {
  try {
    await initDB(dbConfig);
    console.log("IndexedDB Initialized");
  } catch (error) {
    console.error("Error initializing IndexedDB:", error);
  }
})();

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)',
}));

const OptionButton = styled(FormControlLabel)(({ theme, isSelected, isCorrect }) => ({
  width: '100%',
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '& .MuiRadio-root': {
    color: isSelected 
      ? (isCorrect ? theme.palette.success.main : theme.palette.error.main)
      : theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Quiz data
const quizData = [
  { type: "mcq", question: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], answer: 1 },
  { type: "mcq", question: "Which data structure organizes items in a FIFO manner?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1 },
  { type: "mcq", question: "Which of the following is primarily used for structuring web pages?", options: ["Python", "Java", "HTML", "C++"], answer: 2 },
  { type: "mcq", question: "Which chemical symbol stands for Gold?", options: ["Au", "Gd", "Ag", "Pt"], answer: 0 },
  { type: "mcq", question: "Which of these processes is not typically involved in refining petroleum?", options: ["Fractional distillation", "Cracking", "Polymerization", "Filtration"], answer: 3 },
  { type: "integer", question: "What is the value of 12 + 28?", answer: 40 },
  { type: "integer", question: "How many states are there in the United States?", answer: 50 },
  { type: "integer", question: "In which year was the Declaration of Independence signed?", answer: 1776 },
  { type: "integer", question: "What is the value of pi rounded to the nearest integer?", answer: 3 },
  { type: "integer", question: "If a car travels at 60 mph for 2 hours, how many miles does it travel?", answer: 120 }
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const { add, getAll } = useIndexedDB("quizAttempts");

  useEffect(() => {
    const loadScoreHistory = async () => {
      try {
        const attempts = await getAll();
        setScoreHistory(attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (error) {
        console.error("Error loading score history:", error);
      }
    };
    loadScoreHistory();
  }, [getAll, quizCompleted]);

  const handleIntegerSubmit = useCallback(() => {
    const correctAnswer = quizData[currentQuestion].answer;
    if (parseInt(userInput, 10) === correctAnswer) {
      setScore((prev) => prev + 1);
    }
  }, [currentQuestion, userInput]);

  const moveToNextQuestion = useCallback(async () => {
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
      try {
        const finalScore = score + (quizData[currentQuestion].type === "integer" ? 
          (parseInt(userInput, 10) === quizData[currentQuestion].answer ? 1 : 0) : 
          (selectedAnswer === quizData[currentQuestion].answer ? 1 : 0));
        
        await add({ 
          score: finalScore,
          timestamp: new Date().toISOString(),
          totalQuestions: quizData.length
        });
        
        const attempts = await getAll();
        setScoreHistory(attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (error) {
        console.error("Error saving quiz attempt:", error);
      }
    }
  }, [currentQuestion, handleIntegerSubmit, score, userInput, selectedAnswer, add, getAll]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      moveToNextQuestion();
    }
  }, [timeLeft, quizStarted, quizCompleted, moveToNextQuestion]);

  const handleAnswerClick = (index) => {
    setSelectedAnswer(index);
  };

  if (quizCompleted) {
    const finalScore = score + (quizData[currentQuestion].type === "integer" ? 
      (parseInt(userInput, 10) === quizData[currentQuestion].answer ? 1 : 0) : 
      (selectedAnswer === quizData[currentQuestion].answer ? 1 : 0));
      
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Quiz Completed!
            </Typography>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Your Score: {finalScore}/{quizData.length}
            </Typography>
            <Button 
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                setQuizCompleted(false);
                setQuizStarted(false);
                setCurrentQuestion(0);
                setScore(0);
                setSelectedAnswer(null);
                setUserInput("");
                setTimeLeft(30);
              }}
              startIcon={<Refresh />}
              sx={{ 
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Take Quiz Again
            </Button>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Score History
            </Typography>
            <List>
              {scoreHistory.map((attempt) => (
                <ListItem 
                  key={attempt.id}
                  sx={{
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <ListItemText 
                    primary={`Score: ${attempt.score}/${attempt.totalQuestions}`}
                    secondary={new Date(attempt.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Welcome to the Quiz
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Instructions:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="For multiple-choice questions, select the one best answer (A, B, C, or D)"
                  secondary="You can change your answer within the time limit"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="For integer-type questions, write your numerical answer clearly"
                  secondary="Enter only whole numbers"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Each question has a 30-second time limit"
                  secondary="Question will automatically advance when time expires"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="No calculators unless specified"
                  secondary="Use mental math for calculations"
                />
              </ListItem>
            </List>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => setQuizStarted(true)}
              sx={{ 
                mt: 3, 
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Start Quiz
            </Button>
          </CardContent>
        </StyledCard>

        {scoreHistory.length > 0 && (
          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Score History
              </Typography>
              <List>
                {scoreHistory.map((attempt) => (
                  <ListItem 
                    key={attempt.id}
                    sx={{
                      mb: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <ListItemText 
                      primary={`Score: ${attempt.score}/${attempt.totalQuestions}`}
                      secondary={new Date(attempt.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <Typography variant="h6" color="primary">
              Question {currentQuestion + 1}/{quizData.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Timer sx={{ mr: 1, color: timeLeft < 10 ? 'error.main' : 'primary.main' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'monospace',
                  color: timeLeft < 10 ? 'error.main' : 'primary.main'
                }}
              >
                {timeLeft}s
              </Typography>
            </Box>
          </Box>

          <LinearProgress 
            variant="determinate" 
            value={(timeLeft / 30) * 100} 
            sx={{ 
              mb: 3, 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              }
            }}
          />

          <Typography variant="h5" sx={{ mb: 3, color: 'text.primary' }}>
            {quizData[currentQuestion].question}
          </Typography>

          {quizData[currentQuestion].type === "mcq" ? (
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => handleAnswerClick(parseInt(e.target.value))}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quizData[currentQuestion].options.map((option, index) => (
                  <OptionButton
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={`${String.fromCharCode(65 + index)}. ${option}`}
                    isSelected={selectedAnswer === index}
                    isCorrect={index === quizData[currentQuestion].answer}
                  />
                ))}
              </Box>
            </RadioGroup>
          ) : (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Your Answer"
                variant="outlined"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Alert 
                severity="info" 
                icon={<Calculate />}
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: 'primary.main',
                  },
                }}
              >
                No calculator allowed for this question
              </Alert>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={moveToNextQuestion}
            sx={{ 
              mt: 2,
              py: 1.5,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            {currentQuestion === quizData.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default Quiz;