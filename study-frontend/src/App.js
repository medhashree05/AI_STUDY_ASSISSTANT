import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

const parseQuiz = (text) => {
  const blocks = text.split("Q:");

  return blocks.slice(1).map((block, index) => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

    const question = lines[0];

    const options = lines.filter(l =>
      l.startsWith("A:") ||
      l.startsWith("B:") ||
      l.startsWith("C:") ||
      l.startsWith("D:")
    );

    const answerLine = lines.find(l => l.startsWith("ANSWER"));

    const answer = answerLine ? answerLine.split(":")[1].trim() : "";

    return {
      id: index,
      question,
      options,
      answer
    };
  });
};

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/study", {
        task: "summarize, explain and quiz",
        content: topic,
      });

      setResult(res.data);

      if (res.data.quiz) {
        setQuizData(parseQuiz(res.data.quiz));
      }

      setScore(null);
      setSelected({});
    } catch (err) {
      alert("Error");
    }

    setLoading(false);
  };

  const selectOption = (qid, option) => {
    if (score !== null) return; // prevent change after submission
    setSelected({ ...selected, [qid]: option });
  };

  const calculateScore = () => {
    let correct = 0;

    quizData.forEach((q) => {
      if (
        q.answer &&
        selected[q.id] &&
        q.answer === selected[q.id][0]
      ) {
        correct++;
      }
    });

    setScore(correct);
  };

  const getOptionClass = (q, opt) => {
    if (score === null) return "";

    const correctLetter = q.answer?.match(/[A-D]/i)?.[0];

    const selectedLetter = opt[0];

    if (correctLetter === selectedLetter) return "correct";

    if (selected[q.id] === opt && correctLetter !== selectedLetter)
      return "wrong";

    return "";
  };

  return (
    <div className="container">
      <h1 className="title">📚 AI Study Assistant</h1>

      <textarea
        className="textarea"
        rows="5"
        placeholder="Enter topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button
        className={`button ${loading ? "disabled-btn" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {loading && <p className="loader">⏳ AI is thinking...</p>}

      {result && (
        <>
          {result.summarize && (
            <div className="card">
              <h2 className="section-title">Summary</h2>
              {result.summarize.split("\n").map((line, i) => (
  <p key={i}>• {line}</p>
))}
            </div>
          )}

          {result.explain && (
            <div className="card">
              <h2 className="section-title">Explanation</h2>
              {result.explain.split("\n").map((line, i) => (
  <p key={i}>{line}</p>
))}
            </div>
          )}

          {quizData.length > 0 && (
            <div className="card">
              <h2 className="section-title">Quiz</h2>

              {quizData.map((q) => (
                <div key={q.id} className="quiz-question">
                  <p>{q.question}</p>

                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`option ${getOptionClass(q, opt)} ${
                        selected[q.id] === opt ? "selected" : ""
                      }`}
                      onClick={() => selectOption(q.id, opt)}
                    >
                      {opt}
                    </div>
                  ))}

                  {/* Show correct answer */}
                  {score !== null && (
                    <p style={{ fontSize: "0.9rem", color: "#38bdf8" }}>
                      Correct: {q.answer}
                    </p>
                  )}
                </div>
              ))}

              <button className="submit-btn" onClick={calculateScore}>
                Submit Quiz
              </button>

              {score !== null && (
                <h3>
                  🎯 Score: {score} / {quizData.length}
                </h3>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;